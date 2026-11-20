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

export async function fetchCategories(): Promise<ServiceCategoryInfo[]> {
  const res = await fetch(`${API_BASE}/tokens/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function issueToken(data: { customerName: string; customerPhone?: string; serviceCategory: string }): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to generate token");
  return res.json();
}

export async function fetchTokenDetails(tokenNumber: string): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/tokens/${tokenNumber}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Token not found");
  return res.json();
}

export async function fetchLiveQueue(): Promise<LiveQueueStatus> {
  const res = await fetch(`${API_BASE}/queue/live`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch live queue");
  return res.json();
}

export async function fetchCounters(): Promise<CounterInfo[]> {
  const res = await fetch(`${API_BASE}/counters`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch counters");
  return res.json();
}

export async function callNextToken(counterNumber: number): Promise<CounterInfo> {
  const res = await fetch(`${API_BASE}/counters/${counterNumber}/call-next`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to call next token");
  return res.json();
}

export async function completeCurrentToken(counterNumber: number): Promise<CounterInfo> {
  const res = await fetch(`${API_BASE}/counters/${counterNumber}/complete`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to complete token");
  return res.json();
}

export async function skipCurrentToken(counterNumber: number): Promise<CounterInfo> {
  const res = await fetch(`${API_BASE}/counters/${counterNumber}/skip`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to skip token");
  return res.json();
}

export async function fetchCrowdOverview(): Promise<CrowdOverview> {
  const res = await fetch(`${API_BASE}/predictions/overview`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch crowd overview");
  return res.json();
}
