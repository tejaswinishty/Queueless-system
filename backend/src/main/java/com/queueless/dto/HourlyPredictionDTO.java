package com.queueless.dto;

public class HourlyPredictionDTO {
    private int hour; // 9, 10, 11, etc.
    private String timeLabel; // "9:00 AM", "10:00 AM"
    private int predictedFootfall;
    private int predictedWaitMinutes;
    private String crowdLevel; // "LOW", "MODERATE", "HIGH", "PEAK"
    private String statusColor; // "green", "blue", "yellow", "red"

    public HourlyPredictionDTO() {}

    public HourlyPredictionDTO(int hour, String timeLabel, int predictedFootfall, int predictedWaitMinutes, String crowdLevel, String statusColor) {
        this.hour = hour;
        this.timeLabel = timeLabel;
        this.predictedFootfall = predictedFootfall;
        this.predictedWaitMinutes = predictedWaitMinutes;
        this.crowdLevel = crowdLevel;
        this.statusColor = statusColor;
    }

    public int getHour() { return hour; }
    public void setHour(int hour) { this.hour = hour; }

    public String getTimeLabel() { return timeLabel; }
    public void setTimeLabel(String timeLabel) { this.timeLabel = timeLabel; }

    public int getPredictedFootfall() { return predictedFootfall; }
    public void setPredictedFootfall(int predictedFootfall) { this.predictedFootfall = predictedFootfall; }

    public int getPredictedWaitMinutes() { return predictedWaitMinutes; }
    public void setPredictedWaitMinutes(int predictedWaitMinutes) { this.predictedWaitMinutes = predictedWaitMinutes; }

    public String getCrowdLevel() { return crowdLevel; }
    public void setCrowdLevel(String crowdLevel) { this.crowdLevel = crowdLevel; }

    public String getStatusColor() { return statusColor; }
    public void setStatusColor(String statusColor) { this.statusColor = statusColor; }
}
