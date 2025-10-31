
export type KpiUnit = '%' | 'jobs/day' | 'incidents' | 'score' | 'days';

export interface Kpi {
  id: string;
  name: string;
  description: string;
  goal: string;
  actual: string;
  unit: KpiUnit;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ActionItem {
  kpiName: string;
  action: string;
}
