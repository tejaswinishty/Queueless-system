package com.queueless.model;

public enum ServiceCategory {
    BANKING("BNK", "Banking & Cash Transactions", 6),       // 6 mins avg
    BILLING("BIL", "Billing & Account Services", 4),        // 4 mins avg
    SUPPORT("SUP", "Customer Support & Inquiries", 8),      // 8 mins avg
    DOCUMENT("DOC", "Document & ID Verification", 10);     // 10 mins avg

    private final String prefix;
    private final String displayName;
    private final int estimatedMinutesPerPerson;

    ServiceCategory(String prefix, String displayName, int estimatedMinutesPerPerson) {
        this.prefix = prefix;
        this.displayName = displayName;
        this.estimatedMinutesPerPerson = estimatedMinutesPerPerson;
    }

    public String getPrefix() {
        return prefix;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getEstimatedMinutesPerPerson() {
        return estimatedMinutesPerPerson;
    }
}
