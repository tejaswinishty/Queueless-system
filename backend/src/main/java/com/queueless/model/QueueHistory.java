package com.queueless.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "queue_history")
public class QueueHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate recordDate;

    private Integer hourOfDay; // 9, 10, 11, etc.

    private String dayOfWeek;  // MONDAY, TUESDAY, etc.

    @Enumerated(EnumType.STRING)
    private ServiceCategory serviceCategory;

    private Integer footfallCount; // number of people who arrived

    private Integer averageWaitMinutes;

    private Integer averageServeMinutes;

    public QueueHistory() {}

    public QueueHistory(LocalDate recordDate, Integer hourOfDay, String dayOfWeek, ServiceCategory serviceCategory, Integer footfallCount, Integer averageWaitMinutes, Integer averageServeMinutes) {
        this.recordDate = recordDate;
        this.hourOfDay = hourOfDay;
        this.dayOfWeek = dayOfWeek;
        this.serviceCategory = serviceCategory;
        this.footfallCount = footfallCount;
        this.averageWaitMinutes = averageWaitMinutes;
        this.averageServeMinutes = averageServeMinutes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }

    public Integer getHourOfDay() {
        return hourOfDay;
    }

    public void setHourOfDay(Integer hourOfDay) {
        this.hourOfDay = hourOfDay;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public ServiceCategory getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(ServiceCategory serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public Integer getFootfallCount() {
        return footfallCount;
    }

    public void setFootfallCount(Integer footfallCount) {
        this.footfallCount = footfallCount;
    }

    public Integer getAverageWaitMinutes() {
        return averageWaitMinutes;
    }

    public void setAverageWaitMinutes(Integer averageWaitMinutes) {
        this.averageWaitMinutes = averageWaitMinutes;
    }

    public Integer getAverageServeMinutes() {
        return averageServeMinutes;
    }

    public void setAverageServeMinutes(Integer averageServeMinutes) {
        this.averageServeMinutes = averageServeMinutes;
    }
}
