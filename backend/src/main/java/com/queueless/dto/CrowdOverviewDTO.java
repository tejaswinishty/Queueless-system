package com.queueless.dto;

import java.util.List;
import java.util.Map;

public class CrowdOverviewDTO {
    private String currentCrowdStatus; // "LOW", "MODERATE", "HIGH", "PEAK"
    private int currentEstimatedWaitMinutes;
    private int activeWaitingCount;
    private int activeServingCount;
    private int availableCountersCount;
    private String recommendedVisitWindow; // e.g. "2:00 PM - 3:30 PM"
    private List<HourlyPredictionDTO> hourlyForecast;
    private Map<String, Integer> avgWaitByCategory;

    public CrowdOverviewDTO() {}

    public String getCurrentCrowdStatus() { return currentCrowdStatus; }
    public void setCurrentCrowdStatus(String currentCrowdStatus) { this.currentCrowdStatus = currentCrowdStatus; }

    public int getCurrentEstimatedWaitMinutes() { return currentEstimatedWaitMinutes; }
    public void setCurrentEstimatedWaitMinutes(int currentEstimatedWaitMinutes) { this.currentEstimatedWaitMinutes = currentEstimatedWaitMinutes; }

    public int getActiveWaitingCount() { return activeWaitingCount; }
    public void setActiveWaitingCount(int activeWaitingCount) { this.activeWaitingCount = activeWaitingCount; }

    public int getActiveServingCount() { return activeServingCount; }
    public void setActiveServingCount(int activeServingCount) { this.activeServingCount = activeServingCount; }

    public int getAvailableCountersCount() { return availableCountersCount; }
    public void setAvailableCountersCount(int availableCountersCount) { this.availableCountersCount = availableCountersCount; }

    public String getRecommendedVisitWindow() { return recommendedVisitWindow; }
    public void setRecommendedVisitWindow(String recommendedVisitWindow) { this.recommendedVisitWindow = recommendedVisitWindow; }

    public List<HourlyPredictionDTO> getHourlyForecast() { return hourlyForecast; }
    public void setHourlyForecast(List<HourlyPredictionDTO> hourlyForecast) { this.hourlyForecast = hourlyForecast; }

    public Map<String, Integer> getAvgWaitByCategory() { return avgWaitByCategory; }
    public void setAvgWaitByCategory(Map<String, Integer> avgWaitByCategory) { this.avgWaitByCategory = avgWaitByCategory; }
}
