package com.queueless.dto;

import com.queueless.model.ServiceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TokenRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    private String customerPhone;

    @NotNull(message = "Service category is required")
    private ServiceCategory serviceCategory;

    public TokenRequest() {}

    public TokenRequest(String customerName, String customerPhone, ServiceCategory serviceCategory) {
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.serviceCategory = serviceCategory;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public ServiceCategory getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(ServiceCategory serviceCategory) {
        this.serviceCategory = serviceCategory;
    }
}
