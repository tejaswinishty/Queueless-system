package com.queueless.service;

import com.queueless.dto.CrowdOverviewDTO;
import com.queueless.dto.HourlyPredictionDTO;
import com.queueless.model.CounterStatus;
import com.queueless.model.ServiceCategory;
import com.queueless.model.TokenStatus;
import com.queueless.repository.CounterRepository;
import com.queueless.repository.QueueHistoryRepository;
import com.queueless.repository.TokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
public class PredictionService {

    private final QueueHistoryRepository historyRepository;
    private final TokenRepository tokenRepository;
    private final CounterRepository counterRepository;

    public PredictionService(QueueHistoryRepository historyRepository,
                             TokenRepository tokenRepository,
                             CounterRepository counterRepository) {
        this.historyRepository = historyRepository;
        this.tokenRepository = tokenRepository;
        this.counterRepository = counterRepository;
    }

    public CrowdOverviewDTO getCrowdOverview() {
        CrowdOverviewDTO overview = new CrowdOverviewDTO();

        long waiting = tokenRepository.countByStatus(TokenStatus.WAITING);
        long serving = tokenRepository.countByStatus(TokenStatus.SERVING);
        long activeCounters = counterRepository.countByStatus(CounterStatus.BUSY)
                            + counterRepository.countByStatus(CounterStatus.AVAILABLE);
        if (activeCounters == 0) activeCounters = 1;

        overview.setActiveWaitingCount((int) waiting);
        overview.setActiveServingCount((int) serving);
        overview.setAvailableCountersCount((int) counterRepository.countByStatus(CounterStatus.AVAILABLE));

        // Calculate dynamic current crowd status
        double congestionRatio = (double) waiting / (activeCounters * 3.0);
        String crowdStatus;
        int currentWaitEst;

        if (congestionRatio < 0.5) {
            crowdStatus = "LOW";
            currentWaitEst = (int) Math.max(3, waiting * 3 / activeCounters);
        } else if (congestionRatio < 1.0) {
            crowdStatus = "MODERATE";
            currentWaitEst = (int) Math.max(8, waiting * 5 / activeCounters);
        } else if (congestionRatio < 1.8) {
            crowdStatus = "HIGH";
            currentWaitEst = (int) Math.max(18, waiting * 7 / activeCounters);
        } else {
            crowdStatus = "PEAK";
            currentWaitEst = (int) Math.max(30, waiting * 9 / activeCounters);
        }

        overview.setCurrentCrowdStatus(crowdStatus);
        overview.setCurrentEstimatedWaitMinutes(currentWaitEst);

        // Hourly forecast from historical aggregates or simulation
        List<HourlyPredictionDTO> forecast = generateHourlyForecast();
        overview.setHourlyForecast(forecast);

        // Best recommended visit window
        String bestWindow = findBestVisitWindow(forecast);
        overview.setRecommendedVisitWindow(bestWindow);

        // Average wait by category
        Map<String, Integer> avgWait = new LinkedHashMap<>();
        for (ServiceCategory cat : ServiceCategory.values()) {
            avgWait.put(cat.getDisplayName(), cat.getEstimatedMinutesPerPerson());
        }
        overview.setAvgWaitByCategory(avgWait);

        return overview;
    }

    public List<HourlyPredictionDTO> generateHourlyForecast() {
        List<HourlyPredictionDTO> list = new ArrayList<>();
        List<Object[]> rawStats = historyRepository.findAverageCrowdByHour();

        Map<Integer, int[]> hourData = new HashMap<>();
        for (Object[] row : rawStats) {
            int h = ((Number) row[0]).intValue();
            int footfall = ((Number) row[1]).intValue();
            int wait = ((Number) row[2]).intValue();
            hourData.put(h, new int[]{footfall, wait});
        }

        // Standard operating hours: 9 AM to 6 PM (18)
        for (int hour = 9; hour <= 18; hour++) {
            String label = formatHour(hour);
            int footfall;
            int waitMinutes;

            if (hourData.containsKey(hour)) {
                footfall = hourData.get(hour)[0];
                waitMinutes = hourData.get(hour)[1];
            } else {
                // Heuristic curve if DB lacks data:
                // Peak morning 10-12, quiet lunch 13-14, afternoon surge 15-17
                if (hour == 9) { footfall = 18; waitMinutes = 8; }
                else if (hour == 10) { footfall = 38; waitMinutes = 22; }
                else if (hour == 11) { footfall = 45; waitMinutes = 28; }
                else if (hour == 12) { footfall = 32; waitMinutes = 18; }
                else if (hour == 13) { footfall = 14; waitMinutes = 6; }
                else if (hour == 14) { footfall = 20; waitMinutes = 10; }
                else if (hour == 15) { footfall = 39; waitMinutes = 24; }
                else if (hour == 16) { footfall = 42; waitMinutes = 26; }
                else if (hour == 17) { footfall = 28; waitMinutes = 15; }
                else { footfall = 12; waitMinutes = 5; }
            }

            String level;
            String color;
            if (waitMinutes <= 8) {
                level = "LOW";
                color = "green";
            } else if (waitMinutes <= 16) {
                level = "MODERATE";
                color = "blue";
            } else if (waitMinutes <= 24) {
                level = "HIGH";
                color = "yellow";
            } else {
                level = "PEAK";
                color = "red";
            }

            list.add(new HourlyPredictionDTO(hour, label, footfall, waitMinutes, level, color));
        }

        return list;
    }

    private String findBestVisitWindow(List<HourlyPredictionDTO> forecast) {
        HourlyPredictionDTO lowest = forecast.stream()
                .filter(f -> f.getHour() >= 10 && f.getHour() <= 17) // within regular visiting hours
                .min(Comparator.comparingInt(HourlyPredictionDTO::getPredictedWaitMinutes))
                .orElse(null);

        if (lowest != null) {
            int h = lowest.getHour();
            return formatHour(h) + " - " + formatHour(h + 1) + " (Est. wait ~" + lowest.getPredictedWaitMinutes() + " mins)";
        }
        return "1:00 PM - 2:30 PM (Est. wait ~5 mins)";
    }

    private String formatHour(int hour) {
        if (hour == 12) return "12:00 PM";
        if (hour > 12) return (hour - 12) + ":00 PM";
        return hour + ":00 AM";
    }
}
