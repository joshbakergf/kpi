
import React from 'react';
import { Kpi, ActionItem } from '../types';
import { LogoIcon } from './Icons';

interface ReportData {
    metKpis: Kpi[];
    missedKpis: Kpi[];
    actionItems: ActionItem[];
}

interface PdfReportProps {
    report: ReportData;
}

const PdfReport = React.forwardRef<HTMLDivElement, PdfReportProps>(({ report }, ref) => {
    const { metKpis, missedKpis, actionItems } = report;
    const reportDate = new Date().toLocaleDateString();

    return (
        <div ref={ref} className="p-10 font-sans" style={{ backgroundColor: 'white' }}>
            <header className="flex items-center justify-between pb-4 border-b-2 border-gray-200">
                <div className="flex items-center gap-3">
                    <LogoIcon className="h-10 w-10 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">
                        KPI Performance Report
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Go-Forth Pest Control</p>
                    <p className="text-sm text-gray-600">Report Date: {reportDate}</p>
                </div>
            </header>

            <main className="mt-8">
                <section>
                    <h2 className="text-2xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">Action Plan for Next Period</h2>
                    {actionItems.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b-2 p-2 bg-gray-100 text-sm font-bold text-gray-600 w-1/3">Missed KPI</th>
                                    <th className="border-b-2 p-2 bg-gray-100 text-sm font-bold text-gray-600">Action Item</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actionItems.map((item, index) => (
                                    <tr key={`action-${index}`}>
                                        <td className="border-b p-2 text-sm text-gray-700 align-top">{item.kpiName}</td>
                                        <td className="border-b p-2 text-sm text-gray-800">{item.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-gray-500 italic">No action items were generated for missed KPIs.</p>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">KPIs Not Met</h2>
                    {missedKpis.length > 0 ? (
                         <div className="space-y-3">
                            {missedKpis.map(kpi => (
                                <div key={`missed-${kpi.id}`} className="p-3 bg-red-50 border border-red-200 rounded">
                                    <p className="font-bold text-red-800">{kpi.name}</p>
                                    <p className="text-sm text-red-700">Goal: {kpi.goal}{kpi.unit} | Actual: {kpi.actual}{kpi.unit}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-700">All KPIs were met or exceeded. Great work!</p>
                        </div>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="text-2xl font-semibold text-gray-700 border-b border-gray-200 pb-2 mb-4">KPIs Met or Exceeded</h2>
                    {metKpis.length > 0 ? (
                        <div className="space-y-3">
                            {metKpis.map(kpi => (
                                <div key={`met-${kpi.id}`} className="p-3 bg-green-50 border border-green-200 rounded">
                                    <p className="font-bold text-green-800">{kpi.name}</p>
                                    <p className="text-sm text-green-700">Goal: {kpi.goal}{kpi.unit} | Actual: {kpi.actual}{kpi.unit}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-700">No KPIs met their goals.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
});

export default PdfReport;
