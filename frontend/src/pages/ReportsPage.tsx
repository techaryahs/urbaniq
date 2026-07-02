import { useEffect, useState } from "react";
import { FileText, Download, FileSpreadsheet, Map } from "lucide-react";

import {
  getReportHistory,
  getReportSummary,
  generatePDF,
  generateExcel,
  generateGeoJSON,
} from "../services/reportApi";

import type { Report, ReportSummary } from "../services/reportApi";

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [historyData, summaryData] = await Promise.all([
        getReportHistory(),
        getReportSummary(),
      ]);

      setReports(historyData);
      setSummary(summaryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePDF = async () => {
    try {
      await generatePDF();
      await loadData();
      alert("PDF report generated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF.");
    }
  };

  const handleGenerateExcel = async () => {
    try {
      await generateExcel();
      await loadData();
      alert("Excel report generated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to generate Excel.");
    }
  };

  const handleGenerateGeoJSON = async () => {
    try {
      await generateGeoJSON();
      await loadData();
      alert("GeoJSON exported successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to export GeoJSON.");
    }
  };

  if (loading || !summary) {
    return <div className="p-8 text-center text-lg">Loading reports...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold">GIS Reports</h1>
          <p className="text-gray-500 mt-2">
            Generate and download spatial analysis reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold mb-6">Generate New Report</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleGeneratePDF}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
              >
                <FileText className="w-10 h-10 text-red-500 mb-3" />
                <span className="font-bold">Export PDF</span>
                <span className="text-xs text-gray-500">Executive Summary</span>
              </button>

              <button
                onClick={handleGenerateExcel}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all"
              >
                <FileSpreadsheet className="w-10 h-10 text-green-600 mb-3" />
                <span className="font-bold">Export Excel</span>
                <span className="text-xs text-gray-500">Tabular Data</span>
              </button>

              <button
                onClick={handleGenerateGeoJSON}
                className="flex flex-col items-center justify-center p-6 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <Map className="w-10 h-10 text-blue-500 mb-3" />
                <span className="font-bold">Export GeoJSON</span>
                <span className="text-xs text-gray-500">Spatial Features</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-xl font-bold mb-4">Spatial Summary</h2>

            <p className="text-gray-600 leading-8">{summary.summary}</p>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-5">Download History</h3>

            <ul className="space-y-4">
              {reports.length === 0 && (
                <li className="text-gray-500 text-sm">
                  No reports generated yet.
                </li>
              )}

              {reports.map((report) => (
                <li
                  key={report.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium text-sm">{report.filename}</p>

                    <p className="text-xs text-gray-500">
                      {report.format} •{" "}
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>

                  <Download className="w-4 h-4 text-blue-600 cursor-pointer" />
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
