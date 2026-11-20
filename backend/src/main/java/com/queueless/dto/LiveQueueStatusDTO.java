package com.queueless.dto;

import com.queueless.model.Counter;
import java.util.List;
import java.util.Map;

public class LiveQueueStatusDTO {
    private long totalWaiting;
    private long totalServing;
    private long totalCompletedToday;
    private List<TokenResponse> currentServingTokens;
    private List<TokenResponse> upcomingTokens;
    private List<Counter> counters;
    private Map<String, Long> waitingByCategory;

    public LiveQueueStatusDTO() {}

    public long getTotalWaiting() { return totalWaiting; }
    public void setTotalWaiting(long totalWaiting) { this.totalWaiting = totalWaiting; }

    public long getTotalServing() { return totalServing; }
    public void setTotalServing(long totalServing) { this.totalServing = totalServing; }

    public long getTotalCompletedToday() { return totalCompletedToday; }
    public void setTotalCompletedToday(long totalCompletedToday) { this.totalCompletedToday = totalCompletedToday; }

    public List<TokenResponse> getCurrentServingTokens() { return currentServingTokens; }
    public void setCurrentServingTokens(List<TokenResponse> currentServingTokens) { this.currentServingTokens = currentServingTokens; }

    public List<TokenResponse> getUpcomingTokens() { return upcomingTokens; }
    public void setUpcomingTokens(List<TokenResponse> upcomingTokens) { this.upcomingTokens = upcomingTokens; }

    public List<Counter> getCounters() { return counters; }
    public void setCounters(List<Counter> counters) { this.counters = counters; }

    public Map<String, Long> getWaitingByCategory() { return waitingByCategory; }
    public void setWaitingByCategory(Map<String, Long> waitingByCategory) { this.waitingByCategory = waitingByCategory; }
}
