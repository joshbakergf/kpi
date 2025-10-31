
import { Kpi } from './types';

export const INITIAL_KPIS: Kpi[] = [
  {
    id: 'retention',
    name: 'Customer Retention Rate',
    description: 'Percentage of customers retained over the period.',
    goal: '',
    actual: '',
    unit: '%',
  },
  {
    id: 'sales',
    name: 'New Sales Growth',
    description: 'Percentage increase in new customer contracts.',
    goal: '',
    actual: '',
    unit: '%',
  },
  {
    id: 'productivity',
    name: 'Technician Productivity',
    description: 'Average number of jobs completed per technician per day.',
    goal: '',
    actual: '',
    unit: 'jobs/day',
  },
  {
    id: 'safety',
    name: 'Safety Incidents',
    description: 'Number of reportable safety incidents (lower is better).',
    goal: '',
    actual: '',
    unit: 'incidents',
  },
  {
    id: 'satisfaction',
    name: 'Customer Satisfaction',
    description: 'Average score from customer feedback surveys (1-5).',
    goal: '',
    actual: '',
    unit: 'score',
  },
  {
    id: 'receivables',
    name: 'Days Sales Outstanding',
    description: 'Average number of days to collect payment (lower is better).',
    goal: '',
    actual: '',
    unit: 'days',
  },
];
