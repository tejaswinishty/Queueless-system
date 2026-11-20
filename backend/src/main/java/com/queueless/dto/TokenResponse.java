package com.queueless.dto;

import com.queueless.model.ServiceCategory;
import com.queueless.model.Token;
import com.queueless.model.TokenStatus;
import java.time.LocalDateTime;

public class TokenResponse {
    private Long id;
    private String tokenNumber;
    private String customerName;
    private String customerPhone;
    private ServiceCategory serviceCategory;
    private String serviceCategoryName;
    private TokenStatus status;
    private Integer queuePosition;
    private Integer estimatedWaitMinutes;
    private Integer assignedCounterNumber;
    private LocalDateTime issuedAt;
    private LocalDateTime calledAt;
    private LocalDateTime completedAt;

    public TokenResponse() {}

    public static TokenResponse fromEntity(Token token, int queuePosition, int dynamicWaitMinutes) {
        TokenResponse res = new TokenResponse();
        res.setId(token.getId());
        res.setTokenNumber(token.getTokenNumber());
        res.setCustomerName(token.getCustomerName());
        res.setCustomerPhone(token.getCustomerPhone());
        res.setServiceCategory(token.getServiceCategory());
        res.setServiceCategoryName(token.getServiceCategory() != null ? token.getServiceCategory().getDisplayName() : null);
        res.setStatus(token.getStatus());
        res.setQueuePosition(queuePosition);
        res.setEstimatedWaitMinutes(dynamicWaitMinutes);
        res.setAssignedCounterNumber(token.getAssignedCounterNumber());
        res.setIssuedAt(token.getIssuedAt());
        res.setCalledAt(token.getCalledAt());
        res.setCompletedAt(token.getCompletedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public ServiceCategory getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(ServiceCategory serviceCategory) { this.serviceCategory = serviceCategory; }

    public String getServiceCategoryName() { return serviceCategoryName; }
    public void setServiceCategoryName(String serviceCategoryName) { this.serviceCategoryName = serviceCategoryName; }

    public TokenStatus getStatus() { return status; }
    public void setStatus(TokenStatus status) { this.status = status; }

    public Integer getQueuePosition() { return queuePosition; }
    public void setQueuePosition(Integer queuePosition) { this.queuePosition = queuePosition; }

    public Integer getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
    public void setEstimatedWaitMinutes(Integer estimatedWaitMinutes) { this.estimatedWaitMinutes = estimatedWaitMinutes; }

    public Integer getAssignedCounterNumber() { return assignedCounterNumber; }
    public void setAssignedCounterNumber(Integer assignedCounterNumber) { this.assignedCounterNumber = assignedCounterNumber; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getCalledAt() { return calledAt; }
    public void setCalledAt(LocalDateTime calledAt) { this.calledAt = calledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
