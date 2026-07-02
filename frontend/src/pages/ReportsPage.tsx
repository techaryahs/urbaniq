import { useEffect, useState } from "react";
import { FileText, Download, FileSpreadsheet, Map } from "lucide-react";
import { getReportHistory, getReportSummary } from "../services/reportApi";
import type { Report, ReportSummary } from "../services/reportApi";

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getReportHistory(),
      getReportSummary(),
    ])
      .then(([historyData, summaryData]) => {
        setReports(historyData);
        setSummary(summaryData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return <div className="p-8 text-center">Loading reports...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold">GIS Reports</h1>
          <p className="text-gray-500 mt-2">Generate and download spatial analysis reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Generate New Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 transition-colors group">
                <FileText className="w-10 h-10 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-800">Export PDF</span>
                <span className="text-xs text-gray-500 mt-1">Executive Summary</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-colors group">
                <FileSpreadsheet className="w-10 h-10 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-800">Export Excel</span>
                <span className="text-xs text-gray-500 mt-1">Tabular Data</span>
              </button>

              <button className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                <Map className="w-10 h-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-gray-800">Export GeoJSON</span>
                <span className="text-xs text-gray-500 mt-1">Spatial Features</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-4">Spatial Summary</h2>
            <p className="text-gray-600 leading-relaxed">
              {summary.summary}
            </p>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-4">Download History</h3>
            <ul className="space-y-4">
              {reports.map((report) => (
                <li key={report.id} className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{report.filename}</span>
                    <span className="text-xs text-gray-500">{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Download className="w-4 h-4 text-blue-600" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
