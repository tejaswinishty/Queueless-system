package com.queueless.config;

import com.queueless.model.*;
import com.queueless.repository.CounterRepository;
import com.queueless.repository.QueueHistoryRepository;
import com.queueless.repository.TokenRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CounterRepository counterRepository;
    private final TokenRepository tokenRepository;
    private final QueueHistoryRepository historyRepository;

    public DataInitializer(CounterRepository counterRepository,
                           TokenRepository tokenRepository,
                           QueueHistoryRepository historyRepository) {
        this.counterRepository = counterRepository;
        this.tokenRepository = tokenRepository;
        this.historyRepository = historyRepository;
    }

    @Override
    public void run(String... args) {
        seedCounters();
        seedInitialTokens();
        seedHistoricalQueueData();
    }

    private void seedCounters() {
        if (counterRepository.count() == 0) {
            counterRepository.save(new Counter(1, "Alice Smith", ServiceCategory.BANKING));
            counterRepository.save(new Counter(2, "Bob Jenkins", ServiceCategory.BILLING));
            counterRepository.save(new Counter(3, "Carol Danvers", ServiceCategory.SUPPORT));
            counterRepository.save(new Counter(4, "David Miller", ServiceCategory.DOCUMENT));
        }
    }

    private void seedInitialTokens() {
        if (tokenRepository.count() == 0) {
            LocalDateTime now = LocalDateTime.now();

            // Active Serving tokens
            Token t1 = new Token("BNK-101", "Emma Watson", "+1-555-0101", ServiceCategory.BANKING);
            t1.setStatus(TokenStatus.SERVING);
            t1.setAssignedCounterNumber(1);
            t1.setIssuedAt(now.minusMinutes(12));
            t1.setCalledAt(now.minusMinutes(4));
            tokenRepository.save(t1);

            Token t2 = new Token("BIL-101", "Liam Neeson", "+1-555-0102", ServiceCategory.BILLING);
            t2.setStatus(TokenStatus.SERVING);
            t2.setAssignedCounterNumber(2);
            t2.setIssuedAt(now.minusMinutes(10));
            t2.setCalledAt(now.minusMinutes(2));
            tokenRepository.save(t2);

            // Update Counter 1 & 2 status
            counterRepository.findByCounterNumber(1).ifPresent(c -> {
                c.setStatus(CounterStatus.BUSY);
                c.setCurrentServingToken("BNK-101");
                c.setTotalServedToday(8L);
                counterRepository.save(c);
            });
            counterRepository.findByCounterNumber(2).ifPresent(c -> {
                c.setStatus(CounterStatus.BUSY);
                c.setCurrentServingToken("BIL-101");
                c.setTotalServedToday(12L);
                counterRepository.save(c);
            });
            counterRepository.findByCounterNumber(3).ifPresent(c -> {
                c.setTotalServedToday(6L);
                counterRepository.save(c);
            });
            counterRepository.findByCounterNumber(4).ifPresent(c -> {
                c.setTotalServedToday(5L);
                counterRepository.save(c);
            });

            // Waiting tokens
            Token t3 = new Token("BNK-102", "Sophia Clark", "+1-555-0103", ServiceCategory.BANKING);
            t3.setIssuedAt(now.minusMinutes(6));
            t3.setQueuePosition(1);
            t3.setEstimatedWaitMinutes(6);
            tokenRepository.save(t3);

            Token t4 = new Token("SUP-101", "Noah Taylor", "+1-555-0104", ServiceCategory.SUPPORT);
            t4.setIssuedAt(now.minusMinutes(5));
            t4.setQueuePosition(1);
            t4.setEstimatedWaitMinutes(8);
            tokenRepository.save(t4);

            Token t5 = new Token("DOC-101", "Olivia Martin", "+1-555-0105", ServiceCategory.DOCUMENT);
            t5.setIssuedAt(now.minusMinutes(3));
            t5.setQueuePosition(1);
            t5.setEstimatedWaitMinutes(10);
            tokenRepository.save(t5);

            Token t6 = new Token("BIL-102", "James Anderson", "+1-555-0106", ServiceCategory.BILLING);
            t6.setIssuedAt(now.minusMinutes(1));
            t6.setQueuePosition(1);
            t6.setEstimatedWaitMinutes(4);
            tokenRepository.save(t6);
        }
    }

    private void seedHistoricalQueueData() {
        if (historyRepository.count() > 0) return;

        List<QueueHistory> histories = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random random = new Random(42); // deterministic seed

        ServiceCategory[] categories = ServiceCategory.values();

        // Seed 14 days of history
        for (int dayOffset = 1; dayOffset <= 14; dayOffset++) {
            LocalDate date = today.minusDays(dayOffset);
            String dayOfWeek = date.getDayOfWeek().name();
            // Skip weekends for multi-service office
            if (dayOfWeek.equals("SATURDAY") || dayOfWeek.equals("SUNDAY")) {
                continue;
            }

            for (int hour = 9; hour <= 18; hour++) {
                int baseFootfall;
                int baseWait;

                // Rush patterns
                if (hour == 9) {
                    baseFootfall = 16 + random.nextInt(6);
                    baseWait = 7 + random.nextInt(4);
                } else if (hour == 10 || hour == 11) {
                    // Morning Peak
                    baseFootfall = 35 + random.nextInt(15);
                    baseWait = 22 + random.nextInt(9);
                } else if (hour == 12) {
                    baseFootfall = 28 + random.nextInt(8);
                    baseWait = 16 + random.nextInt(5);
                } else if (hour == 13 || hour == 14) {
                    // Lunch Lull
                    baseFootfall = 12 + random.nextInt(6);
                    baseWait = 5 + random.nextInt(4);
                } else if (hour == 15 || hour == 16) {
                    // Afternoon Rush
                    baseFootfall = 36 + random.nextInt(12);
                    baseWait = 24 + random.nextInt(8);
                } else if (hour == 17) {
                    baseFootfall = 24 + random.nextInt(8);
                    baseWait = 14 + random.nextInt(5);
                } else {
                    baseFootfall = 10 + random.nextInt(5);
                    baseWait = 5 + random.nextInt(3);
                }

                ServiceCategory cat = categories[random.nextInt(categories.length)];
                histories.add(new QueueHistory(
                        date,
                        hour,
                        dayOfWeek,
                        cat,
                        baseFootfall,
                        baseWait,
                        cat.getEstimatedMinutesPerPerson()
                ));
            }
        }

        historyRepository.saveAll(histories);
    }
}
