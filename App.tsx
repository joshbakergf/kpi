
import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Kpi, ActionItem } from './types';
import KpiForm from './components/KpiForm';
import Chatbot from './components/Chatbot';
import { LogoIcon } from './components/Icons';
import PdfReport from './components/PdfReport';

const App: React.FC = () => {
  const [submittedKpis, setSubmittedKpis] = useState<Kpi[] | null>(null);
  const [finalActionItems, setFinalActionItems] = useState<ActionItem[] | null>(null);
  const [isReportReadyForPdf, setIsReportReadyForPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = (kpis: Kpi[]) => {
    setSubmittedKpis(kpis);
  };

  const kpiReport = useMemo(() => {
    if (!submittedKpis) {
      return null;
    }
    const met: Kpi[] = [];
    const missed: Kpi[] = [];

    submittedKpis.forEach(kpi => {
      const goal = parseFloat(kpi.goal);
      const actual = parseFloat(kpi.actual);
      if (isNaN(goal) || isNaN(actual) || kpi.goal === '' || kpi.actual === '') return;

      let success = false;
      if (kpi.id === 'safety' || kpi.id === 'receivables') {
        success = actual <= goal;
      } else {
        success = actual >= goal;
      }

      if (success) {
        met.push(kpi);
      } else {
        missed.push(kpi);
      }
    });

    return { met, missed };
  }, [submittedKpis]);

  const onReportReady = (actionItems: ActionItem[]) => {
    setFinalActionItems(actionItems);
    setIsReportReadyForPdf(true);
  };

  const generatePdf = () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4',
    });

    doc.html(reportElement, {
      callback: function (doc) {
        doc.save(`kpi-report-${new Date().toISOString().split('T')[0]}.pdf`);
        setIsReportReadyForPdf(false);
      },
      x: 0,
      y: 0,
      html2canvas: {
        scale: 0.7, // Adjust scale to fit content on A4 page
        useCORS: true,
      },
    });
  };

  useEffect(() => {
    if (isReportReadyForPdf && finalActionItems && kpiReport) {
      generatePdf();
    }
  }, [isReportReadyForPdf, finalActionItems, kpiReport]);

  return (
    <div className="min-h-screen bg-gray-900 text-slate-300">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg border-b border-slate-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Go-Forth KPI Review
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <KpiForm onSubmit={handleFormSubmit} isSubmitted={!!submittedKpis} />
          <Chatbot kpiReport={kpiReport} onReportReady={onReportReady} />
        </div>
      </main>
      {kpiReport && finalActionItems && (
        <div style={{ position: 'absolute', left: '-9999px', width: '800px' }}>
            <PdfReport
                ref={reportRef}
                report={{
                    metKpis: kpiReport.met,
                    missedKpis: kpiReport.missed,
                    actionItems: finalActionItems,
                }}
            />
        </div>
      )}
    </div>
  );
};

export default App;
