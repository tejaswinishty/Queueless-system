package com.queueless.service;

import com.queueless.dto.LiveQueueStatusDTO;
import com.queueless.dto.TokenRequest;
import com.queueless.dto.TokenResponse;
import com.queueless.model.*;
import com.queueless.repository.CounterRepository;
import com.queueless.repository.TokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class QueueService {

    private final TokenRepository tokenRepository;
    private final CounterRepository counterRepository;
    private final Map<ServiceCategory, AtomicInteger> categoryCounters = new EnumMap<>(ServiceCategory.class);

    public QueueService(TokenRepository tokenRepository, CounterRepository counterRepository) {
        this.tokenRepository = tokenRepository;
        this.counterRepository = counterRepository;
        for (ServiceCategory cat : ServiceCategory.values()) {
            categoryCounters.put(cat, new AtomicInteger(100));
        }
    }

    @Transactional
    public TokenResponse issueToken(TokenRequest request) {
        ServiceCategory category = request.getServiceCategory();
        int nextSeq = categoryCounters.get(category).incrementAndGet();
        String tokenNum = category.getPrefix() + "-" + nextSeq;

        Token token = new Token(tokenNum, request.getCustomerName(), request.getCustomerPhone(), category);
        
        long waitingAhead = tokenRepository.countAheadInCategory(category, LocalDateTime.now());
        int estWait = calculateEstimatedWait(category, (int) waitingAhead);
        
        token.setQueuePosition((int) waitingAhead + 1);
        token.setEstimatedWaitMinutes(estWait);
        
        Token saved = tokenRepository.save(token);
        return TokenResponse.fromEntity(saved, (int) waitingAhead + 1, estWait);
    }

    public TokenResponse getTokenDetails(String tokenNumber) {
        Token token = tokenRepository.findByTokenNumber(tokenNumber)
                .orElseThrow(() -> new IllegalArgumentException("Token not found: " + tokenNumber));

        int position = 0;
        int dynamicWait = 0;

        if (token.getStatus() == TokenStatus.WAITING) {
            long ahead = tokenRepository.countAheadInCategory(token.getServiceCategory(), token.getIssuedAt());
            position = (int) ahead + 1;
            dynamicWait = calculateEstimatedWait(token.getServiceCategory(), (int) ahead);
        } else if (token.getStatus() == TokenStatus.SERVING) {
            position = 0;
            dynamicWait = 0;
        }

        return TokenResponse.fromEntity(token, position, dynamicWait);
    }

    public LiveQueueStatusDTO getLiveStatus() {
        LiveQueueStatusDTO dto = new LiveQueueStatusDTO();
        
        dto.setTotalWaiting(tokenRepository.countByStatus(TokenStatus.WAITING));
        dto.setTotalServing(tokenRepository.countByStatus(TokenStatus.SERVING));
        dto.setTotalCompletedToday(tokenRepository.countByStatus(TokenStatus.COMPLETED));

        List<Token> servingTokens = tokenRepository.findByStatusOrderByIssuedAtAsc(TokenStatus.SERVING);
        dto.setCurrentServingTokens(servingTokens.stream()
                .map(t -> TokenResponse.fromEntity(t, 0, 0))
                .collect(Collectors.toList()));

        List<Token> waitingTokens = tokenRepository.findByStatusOrderByIssuedAtAsc(TokenStatus.WAITING);
        dto.setUpcomingTokens(waitingTokens.stream().limit(8)
                .map(t -> {
                    long ahead = tokenRepository.countAheadInCategory(t.getServiceCategory(), t.getIssuedAt());
                    int wait = calculateEstimatedWait(t.getServiceCategory(), (int) ahead);
                    return TokenResponse.fromEntity(t, (int) ahead + 1, wait);
                })
                .collect(Collectors.toList()));

        dto.setCounters(counterRepository.findAllByOrderByCounterNumberAsc());

        Map<String, Long> categoryWaiting = new HashMap<>();
        for (ServiceCategory cat : ServiceCategory.values()) {
            long count = tokenRepository.findByServiceCategoryAndStatusOrderByIssuedAtAsc(cat, TokenStatus.WAITING).size();
            categoryWaiting.put(cat.name(), count);
        }
        dto.setWaitingByCategory(categoryWaiting);

        return dto;
    }

    @Transactional
    public Counter callNext(Integer counterNumber) {
        Counter counter = counterRepository.findByCounterNumber(counterNumber)
                .orElseThrow(() -> new IllegalArgumentException("Counter " + counterNumber + " not found"));

        // If counter already has a serving token, complete it first
        if (counter.getCurrentServingToken() != null && counter.getStatus() == CounterStatus.BUSY) {
            tokenRepository.findByTokenNumber(counter.getCurrentServingToken()).ifPresent(t -> {
                t.setStatus(TokenStatus.COMPLETED);
                t.setCompletedAt(LocalDateTime.now());
                tokenRepository.save(t);
            });
            counter.setTotalServedToday(counter.getTotalServedToday() + 1);
        }

        // Find next eligible waiting token: First check primary service category of this counter
        List<Token> eligibleTokens = Collections.emptyList();
        if (counter.getPrimaryService() != null) {
            eligibleTokens = tokenRepository.findByServiceCategoryAndStatusOrderByIssuedAtAsc(counter.getPrimaryService(), TokenStatus.WAITING);
        }
        
        // If none in primary category, pick from any category (FCFS)
        if (eligibleTokens.isEmpty()) {
            eligibleTokens = tokenRepository.findByStatusOrderByIssuedAtAsc(TokenStatus.WAITING);
        }

        if (eligibleTokens.isEmpty()) {
            counter.setCurrentServingToken(null);
            counter.setStatus(CounterStatus.AVAILABLE);
            return counterRepository.save(counter);
        }

        Token nextToken = eligibleTokens.get(0);
        nextToken.setStatus(TokenStatus.SERVING);
        nextToken.setCalledAt(LocalDateTime.now());
        nextToken.setAssignedCounterNumber(counterNumber);
        tokenRepository.save(nextToken);

        counter.setStatus(CounterStatus.BUSY);
        counter.setCurrentServingToken(nextToken.getTokenNumber());
        return counterRepository.save(counter);
    }

    @Transactional
    public Counter completeCurrent(Integer counterNumber) {
        Counter counter = counterRepository.findByCounterNumber(counterNumber)
                .orElseThrow(() -> new IllegalArgumentException("Counter " + counterNumber + " not found"));

        if (counter.getCurrentServingToken() != null) {
            tokenRepository.findByTokenNumber(counter.getCurrentServingToken()).ifPresent(t -> {
                t.setStatus(TokenStatus.COMPLETED);
                t.setCompletedAt(LocalDateTime.now());
                tokenRepository.save(t);
            });
            counter.setTotalServedToday(counter.getTotalServedToday() + 1);
        }

        counter.setCurrentServingToken(null);
        counter.setStatus(CounterStatus.AVAILABLE);
        return counterRepository.save(counter);
    }

    @Transactional
    public Counter skipCurrent(Integer counterNumber) {
        Counter counter = counterRepository.findByCounterNumber(counterNumber)
                .orElseThrow(() -> new IllegalArgumentException("Counter " + counterNumber + " not found"));

        if (counter.getCurrentServingToken() != null) {
            tokenRepository.findByTokenNumber(counter.getCurrentServingToken()).ifPresent(t -> {
                t.setStatus(TokenStatus.SKIPPED);
                t.setCompletedAt(LocalDateTime.now());
                tokenRepository.save(t);
            });
        }

        counter.setCurrentServingToken(null);
        counter.setStatus(CounterStatus.AVAILABLE);
        return counterRepository.save(counter);
    }

    public List<Counter> getAllCounters() {
        return counterRepository.findAllByOrderByCounterNumberAsc();
    }

    public List<Token> getAllWaitingTokens() {
        return tokenRepository.findByStatusOrderByIssuedAtAsc(TokenStatus.WAITING);
    }

    private int calculateEstimatedWait(ServiceCategory category, int waitingAheadCount) {
        long availableCounters = counterRepository.countByStatus(CounterStatus.AVAILABLE)
                               + counterRepository.countByStatus(CounterStatus.BUSY);
        if (availableCounters <= 0) availableCounters = 1;

        int avgServiceTime = category.getEstimatedMinutesPerPerson();
        // Dynamic formula: (Ahead * AvgServiceTime) / ActiveCounters
        int wait = (int) Math.ceil((double) (waitingAheadCount * avgServiceTime) / availableCounters);
        return Math.max(1, wait);
    }
}
