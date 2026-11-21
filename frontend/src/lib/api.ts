const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ServiceCategoryInfo {
  code: string;
  prefix: string;
  displayName: string;
  estimatedMinutesPerPerson: number;
}

export interface TokenResponse {
  id: number;
  tokenNumber: string;
  customerName: string;
  customerPhone?: string;
  serviceCategory: string;
  serviceCategoryName: string;
  status: "WAITING" | "SERVING" | "COMPLETED" | "SKIPPED" | "CANCELLED";
  queuePosition: number;
  estimatedWaitMinutes: number;
  assignedCounterNumber?: number;
  issuedAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface CounterInfo {
  id: number;
  counterNumber: number;
  operatorName: string;
  status: "AVAILABLE" | "BUSY" | "PAUSED" | "OFFLINE";
  primaryService?: string;
  currentServingToken?: string;
  totalServedToday: number;
}

export interface LiveQueueStatus {
  totalWaiting: number;
  totalServing: number;
  totalCompletedToday: number;
  currentServingTokens: TokenResponse[];
  upcomingTokens: TokenResponse[];
  counters: CounterInfo[];
  waitingByCategory: Record<string, number>;
}

export interface HourlyPrediction {
  hour: number;
  timeLabel: string;
  predictedFootfall: number;
  predictedWaitMinutes: number;
  crowdLevel: "LOW" | "MODERATE" | "HIGH" | "PEAK";
  statusColor: string;
}

export interface CrowdOverview {
  currentCrowdStatus: "LOW" | "MODERATE" | "HIGH" | "PEAK";
  currentEstimatedWaitMinutes: number;
  activeWaitingCount: number;
  activeServingCount: number;
  availableCountersCount: number;
  recommendedVisitWindow: string;
  hourlyForecast: HourlyPrediction[];
  avgWaitByCategory: Record<string, number>;
}

// ----------------- Fallback Simulation Engine (for Cloud / Vercel Demos) -----------------
const FALLBACK_CATEGORIES: ServiceCategoryInfo[] = [
  { code: "BANKING", prefix: "BNK", displayName: "Banking & Cash Transactions", estimatedMinutesPerPerson: 6 },
  { code: "BILLING", prefix: "BIL", displayName: "Billing & Account Services", estimatedMinutesPerPerson: 4 },
  { code: "SUPPORT", prefix: "SUP", displayName: "Customer Support & Inquiries", estimatedMinutesPerPerson: 8 },
  { code: "DOCUMENT", prefix: "DOC", displayName: "Document & ID Verification", estimatedMinutesPerPerson: 10 },
];

let mockCounters: CounterInfo[] = [
  { id: 1, counterNumber: 1, operatorName: "Alice Smith", status: "BUSY", primaryService: "BANKING", currentServingToken: "BNK-101", totalServedToday: 8 },
  { id: 2, counterNumber: 2, operatorName: "Bob Jenkins", status: "BUSY", primaryService: "BILLING", currentServingToken: "BIL-101", totalServedToday: 12 },
  { id: 3, counterNumber: 3, operatorName: "Carol Danvers", status: "AVAILABLE", primaryService: "SUPPORT", currentServingToken: undefined, totalServedToday: 6 },
  { id: 4, counterNumber: 4, operatorName: "David Miller", status: "AVAILABLE", primaryService: "DOCUMENT", currentServingToken: undefined, totalServedToday: 5 },
];

let mockTokens: TokenResponse[] = [
  { id: 1, tokenNumber: "BNK-101", customerName: "Emma Watson", customerPhone: "+1-555-0101", serviceCategory: "BANKING", serviceCategoryName: "Banking & Cash Transactions", status: "SERVING", queuePosition: 0, estimatedWaitMinutes: 0, assignedCounterNumber: 1, issuedAt: new Date(Date.now() - 600000).toISOString(), calledAt: new Date(Date.now() - 180000).toISOString() },
  { id: 2, tokenNumber: "BIL-101", customerName: "Liam Neeson", customerPhone: "+1-555-0102", serviceCategory: "BILLING", serviceCategoryName: "Billing & Account Services", status: "SERVING", queuePosition: 0, estimatedWaitMinutes: 0, assignedCounterNumber: 2, issuedAt: new Date(Date.now() - 480000).toISOString(), calledAt: new Date(Date.now() - 120000).toISOString() },
  { id: 3, tokenNumber: "BNK-102", customerName: "Sophia Clark", customerPhone: "+1-555-0103", serviceCategory: "BANKING", serviceCategoryName: "Banking & Cash Transactions", status: "WAITING", queuePosition: 1, estimatedWaitMinutes: 4, assignedCounterNumber: undefined, issuedAt: new Date(Date.now() - 300000).toISOString() },
  { id: 4, tokenNumber: "SUP-101", customerName: "Noah Taylor", customerPhone: "+1-555-0104", serviceCategory: "SUPPORT", serviceCategoryName: "Customer Support & Inquiries", status: "WAITING", queuePosition: 1, estimatedWaitMinutes: 8, assignedCounterNumber: undefined, issuedAt: new Date(Date.now() - 240000).toISOString() },
  { id: 5, tokenNumber: "DOC-101", customerName: "Olivia Martin", customerPhone: "+1-555-0105", serviceCategory: "DOCUMENT", serviceCategoryName: "Document & ID Verification", status: "WAITING", queuePosition: 1, estimatedWaitMinutes: 10, assignedCounterNumber: undefined, issuedAt: new Date(Date.now() - 180000).toISOString() },
  { id: 6, tokenNumber: "BIL-102", customerName: "James Anderson", customerPhone: "+1-555-0106", serviceCategory: "BILLING", serviceCategoryName: "Billing & Account Services", status: "WAITING", queuePosition: 1, estimatedWaitMinutes: 4, assignedCounterNumber: undefined, issuedAt: new Date(Date.now() - 60000).toISOString() },
];

let nextTokenId = 7;
let seqCount = 103;

// Helper to fetch with timeout and fallback
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallbackSupplier?: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    if (fallbackSupplier) {
      return fallbackSupplier();
    }
    throw err;
  }
}

// ----------------- Public API Functions -----------------

export async function fetchCategories(): Promise<ServiceCategoryInfo[]> {
  return fetchWithFallback<ServiceCategoryInfo[]>(`${API_BASE}/tokens/categories`, undefined, () => FALLBACK_CATEGORIES);
}

export async function issueToken(data: { customerName: string; customerPhone?: string; serviceCategory: string }): Promise<TokenResponse> {
  return fetchWithFallback<TokenResponse>(`${API_BASE}/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }, () => {
    const cat = FALLBACK_CATEGORIES.find(c => c.code === data.serviceCategory) || FALLBACK_CATEGORIES[0];
    const tokenNum = `${cat.prefix}-${seqCount++}`;
    const waitingAhead = mockTokens.filter(t => t.status === "WAITING" && t.serviceCategory === cat.code).length;
    const estWait = Math.max(2, waitingAhead * cat.estimatedMinutesPerPerson);

    const newToken: TokenResponse = {
      id: nextTokenId++,
      tokenNumber: tokenNum,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      serviceCategory: cat.code,
      serviceCategoryName: cat.displayName,
      status: "WAITING",
      queuePosition: waitingAhead + 1,
      estimatedWaitMinutes: estWait,
      issuedAt: new Date().toISOString(),
    };
    mockTokens.push(newToken);
    return newToken;
  });
}

export async function fetchTokenDetails(tokenNumber: string): Promise<TokenResponse> {
  return fetchWithFallback<TokenResponse>(`${API_BASE}/tokens/${tokenNumber}`, undefined, () => {
    const found = mockTokens.find(t => t.tokenNumber === tokenNumber);
    if (!found) throw new Error("Token not found: " + tokenNumber);
    if (found.status === "WAITING") {
      const ahead = mockTokens.filter(t => t.status === "WAITING" && t.serviceCategory === found.serviceCategory && new Date(t.issuedAt) < new Date(found.issuedAt)).length;
      found.queuePosition = ahead + 1;
      found.estimatedWaitMinutes = (ahead + 1) * 4;
    }
    return found;
  });
}

export async function fetchLiveQueue(): Promise<LiveQueueStatus> {
  return fetchWithFallback<LiveQueueStatus>(`${API_BASE}/queue/live`, undefined, () => {
    const serving = mockTokens.filter(t => t.status === "SERVING");
    const waiting = mockTokens.filter(t => t.status === "WAITING");
    const completed = mockTokens.filter(t => t.status === "COMPLETED").length;

    const byCat: Record<string, number> = {};
    for (const cat of FALLBACK_CATEGORIES) {
      byCat[cat.code] = waiting.filter(t => t.serviceCategory === cat.code).length;
    }

    return {
      totalWaiting: waiting.length,
      totalServing: serving.length,
      totalCompletedToday: completed,
      currentServingTokens: serving,
      upcomingTokens: waiting.slice(0, 8),
      counters: mockCounters,
      waitingByCategory: byCat,
    };
  });
}

export async function fetchCounters(): Promise<CounterInfo[]> {
  return fetchWithFallback<CounterInfo[]>(`${API_BASE}/counters`, undefined, () => mockCounters);
}

export async function callNextToken(counterNumber: number): Promise<CounterInfo> {
  return fetchWithFallback<CounterInfo>(`${API_BASE}/counters/${counterNumber}/call-next`, { method: "POST" }, () => {
    const counter = mockCounters.find(c => c.counterNumber === counterNumber);
    if (!counter) throw new Error("Counter not found");

    // Complete current token if busy
    if (counter.currentServingToken) {
      const prev = mockTokens.find(t => t.tokenNumber === counter.currentServingToken);
      if (prev) {
        prev.status = "COMPLETED";
        prev.completedAt = new Date().toISOString();
      }
      counter.totalServedToday += 1;
    }

    // Find next eligible waiting token
    let nextToken = mockTokens.find(t => t.status === "WAITING" && t.serviceCategory === counter.primaryService);
    if (!nextToken) {
      nextToken = mockTokens.find(t => t.status === "WAITING");
    }

    if (nextToken) {
      nextToken.status = "SERVING";
      nextToken.assignedCounterNumber = counterNumber;
      nextToken.calledAt = new Date().toISOString();
      counter.status = "BUSY";
      counter.currentServingToken = nextToken.tokenNumber;
    } else {
      counter.status = "AVAILABLE";
      counter.currentServingToken = undefined;
    }

    return counter;
  });
}

export async function completeCurrentToken(counterNumber: number): Promise<CounterInfo> {
  return fetchWithFallback<CounterInfo>(`${API_BASE}/counters/${counterNumber}/complete`, { method: "POST" }, () => {
    const counter = mockCounters.find(c => c.counterNumber === counterNumber);
    if (!counter) throw new Error("Counter not found");

    if (counter.currentServingToken) {
      const prev = mockTokens.find(t => t.tokenNumber === counter.currentServingToken);
      if (prev) {
        prev.status = "COMPLETED";
        prev.completedAt = new Date().toISOString();
      }
      counter.totalServedToday += 1;
    }
    counter.status = "AVAILABLE";
    counter.currentServingToken = undefined;
    return counter;
  });
}

export async function skipCurrentToken(counterNumber: number): Promise<CounterInfo> {
  return fetchWithFallback<CounterInfo>(`${API_BASE}/counters/${counterNumber}/skip`, { method: "POST" }, () => {
    const counter = mockCounters.find(c => c.counterNumber === counterNumber);
    if (!counter) throw new Error("Counter not found");

    if (counter.currentServingToken) {
      const prev = mockTokens.find(t => t.tokenNumber === counter.currentServingToken);
      if (prev) {
        prev.status = "SKIPPED";
        prev.completedAt = new Date().toISOString();
      }
    }
    counter.status = "AVAILABLE";
    counter.currentServingToken = undefined;
    return counter;
  });
}

export async function fetchCrowdOverview(): Promise<CrowdOverview> {
  return fetchWithFallback<CrowdOverview>(`${API_BASE}/predictions/overview`, undefined, () => {
    const hours = [
      { hour: 9, timeLabel: "9:00 AM", predictedFootfall: 18, predictedWaitMinutes: 8, crowdLevel: "LOW" as const, statusColor: "green" },
      { hour: 10, timeLabel: "10:00 AM", predictedFootfall: 38, predictedWaitMinutes: 22, crowdLevel: "HIGH" as const, statusColor: "amber" },
      { hour: 11, timeLabel: "11:00 AM", predictedFootfall: 45, predictedWaitMinutes: 28, crowdLevel: "PEAK" as const, statusColor: "red" },
      { hour: 12, timeLabel: "12:00 PM", predictedFootfall: 32, predictedWaitMinutes: 18, crowdLevel: "HIGH" as const, statusColor: "amber" },
      { hour: 13, timeLabel: "1:00 PM", predictedFootfall: 14, predictedWaitMinutes: 6, crowdLevel: "LOW" as const, statusColor: "green" },
      { hour: 14, timeLabel: "2:00 PM", predictedFootfall: 20, predictedWaitMinutes: 10, crowdLevel: "MODERATE" as const, statusColor: "blue" },
      { hour: 15, timeLabel: "3:00 PM", predictedFootfall: 39, predictedWaitMinutes: 24, crowdLevel: "HIGH" as const, statusColor: "amber" },
      { hour: 16, timeLabel: "4:00 PM", predictedFootfall: 42, predictedWaitMinutes: 26, crowdLevel: "PEAK" as const, statusColor: "red" },
      { hour: 17, timeLabel: "5:00 PM", predictedFootfall: 28, predictedWaitMinutes: 15, crowdLevel: "MODERATE" as const, statusColor: "blue" },
      { hour: 18, timeLabel: "6:00 PM", predictedFootfall: 12, predictedWaitMinutes: 5, crowdLevel: "LOW" as const, statusColor: "green" },
    ];

    const waiting = mockTokens.filter(t => t.status === "WAITING").length;

    return {
      currentCrowdStatus: waiting > 6 ? "HIGH" : waiting > 3 ? "MODERATE" : "LOW",
      currentEstimatedWaitMinutes: Math.max(4, waiting * 4),
      activeWaitingCount: waiting,
      activeServingCount: mockCounters.filter(c => c.status === "BUSY").length,
      availableCountersCount: mockCounters.filter(c => c.status === "AVAILABLE").length,
      recommendedVisitWindow: "1:00 PM - 2:30 PM (Est. wait ~6 mins)",
      hourlyForecast: hours,
      avgWaitByCategory: {
        "Banking & Cash Transactions": 6,
        "Billing & Account Services": 4,
        "Customer Support & Inquiries": 8,
        "Document & ID Verification": 10,
      },
    };
  });
}
