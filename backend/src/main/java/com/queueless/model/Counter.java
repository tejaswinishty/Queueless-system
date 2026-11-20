package com.queueless.model;

import jakarta.persistence.*;

@Entity
@Table(name = "counters")
public class Counter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer counterNumber; // e.g. 1, 2, 3, 4

    @Column(nullable = false)
    private String operatorName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CounterStatus status;

    @Enumerated(EnumType.STRING)
    private ServiceCategory primaryService;

    private String currentServingToken; // e.g. "BNK-102"

    private Long totalServedToday;

    public Counter() {
        this.status = CounterStatus.AVAILABLE;
        this.totalServedToday = 0L;
    }

    public Counter(Integer counterNumber, String operatorName, ServiceCategory primaryService) {
        this.counterNumber = counterNumber;
        this.operatorName = operatorName;
        this.primaryService = primaryService;
        this.status = CounterStatus.AVAILABLE;
        this.totalServedToday = 0L;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getCounterNumber() {
        return counterNumber;
    }

    public void setCounterNumber(Integer counterNumber) {
        this.counterNumber = counterNumber;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public CounterStatus getStatus() {
        return status;
    }

    public void setStatus(CounterStatus status) {
        this.status = status;
    }

    public ServiceCategory getPrimaryService() {
        return primaryService;
    }

    public void setPrimaryService(ServiceCategory primaryService) {
        this.primaryService = primaryService;
    }

    public String getCurrentServingToken() {
        return currentServingToken;
    }

    public void setCurrentServingToken(String currentServingToken) {
        this.currentServingToken = currentServingToken;
    }

    public Long getTotalServedToday() {
        return totalServedToday;
    }

    public void setTotalServedToday(Long totalServedToday) {
        this.totalServedToday = totalServedToday;
    }
}
