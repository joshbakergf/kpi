
import React, { useState } from 'react';
import { Kpi } from '../types';
import { INITIAL_KPIS } from '../constants';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface KpiFormProps {
  onSubmit: (kpis: Kpi[]) => void;
  isSubmitted: boolean;
}

type KpiStatus = 'pending' | 'success' | 'failure';

const KpiInputRow: React.FC<{
    kpi: Kpi;
    onChange: (id: string, field: 'goal' | 'actual', value: string) => void;
    status: KpiStatus;
    isSubmitted: boolean;
}> = ({ kpi, onChange, status, isSubmitted }) => {
    const statusIcon = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
        failure: <XCircleIcon className="w-6 h-6 text-red-400" />,
        pending: <div className="w-6 h-6" />
    };

    const statusBorderColor = {
        success: 'border-green-500/30 focus-within:border-green-400',
        failure: 'border-red-500/30 focus-within:border-red-400',
        pending: 'border-slate-700 focus-within:border-blue-500'
    };

    return (
        <div className={`transition-all bg-slate-800 p-4 rounded-lg border ${statusBorderColor[status]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-slate-100">{kpi.name}</h3>
                    <p className="text-sm text-slate-400">{kpi.description}</p>
                </div>
                <div className="flex-shrink-0 ml-4 pt-1">
                    {statusIcon[status]}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`${kpi.id}-goal`} className="block text-sm font-medium text-slate-300">
                        Goal ({kpi.unit})
                    </label>
                    <input
                        type="number"
                        id={`${kpi.id}-goal`}
                        value={kpi.goal}
                        onChange={(e) => onChange(kpi.id, 'goal', e.target.value)}
                        disabled={isSubmitted}
                        className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed placeholder:text-slate-500"
                        placeholder="e.g. 95"
                        aria-label={`Goal for ${kpi.name}`}
                    />
                </div>
                <div>
                    <label htmlFor={`${kpi.id}-actual`} className="block text-sm font-medium text-slate-300">
                        Actual ({kpi.unit})
                    </label>
                    <input
                        type="number"
                        id={`${kpi.id}-actual`}
                        value={kpi.actual}
                        onChange={(e) => onChange(kpi.id, 'actual', e.target.value)}
                        disabled={isSubmitted}
                        className="mt-1 block w-full rounded-md bg-slate-900 border-slate-700 text-slate-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed placeholder:text-slate-500"
                        placeholder="e.g. 92"
                        aria-label={`Actual for ${kpi.name}`}
                    />
                </div>
            </div>
        </div>
    );
};


const KpiForm: React.FC<KpiFormProps> = ({ onSubmit, isSubmitted }) => {
  const [kpis, setKpis] = useState<Kpi[]>(INITIAL_KPIS);

  const handleInputChange = (id: string, field: 'goal' | 'actual', value: string) => {
    setKpis(prevKpis =>
      prevKpis.map(kpi =>
        kpi.id === id ? { ...kpi, [field]: value } : kpi
      )
    );
  };

  const getKpiStatus = (kpi: Kpi): KpiStatus => {
    if (kpi.goal === '' || kpi.actual === '') return 'pending';
    const goal = parseFloat(kpi.goal);
    const actual = parseFloat(kpi.actual);
    if (isNaN(goal) || isNaN(actual)) return 'pending';

    // Lower is better for these KPIs
    if (kpi.id === 'safety' || kpi.id === 'receivables') {
        return actual <= goal ? 'success' : 'failure';
    }
    
    return actual >= goal ? 'success' : 'failure';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(kpis);
  };

  return (
    <section aria-labelledby="kpi-form-title">
      <div className="bg-slate-800 shadow-lg rounded-xl p-6 border border-slate-700">
        <h2 id="kpi-form-title" className="text-xl font-bold text-slate-100 mb-1">KPI Entry Form</h2>
        <p className="text-slate-400 mb-6">Enter the goal and actual values for each KPI.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {kpis.map(kpi => (
            <KpiInputRow
              key={kpi.id}
              kpi={kpi}
              onChange={handleInputChange}
              status={getKpiStatus(kpi)}
              isSubmitted={isSubmitted}
            />
          ))}
          <button
            type="submit"
            disabled={isSubmitted}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {isSubmitted ? 'Report Submitted' : 'Review Performance'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default KpiForm;
