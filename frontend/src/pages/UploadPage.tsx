import { useEffect, useState, useRef } from "react";
import { Upload, FileUp, CheckCircle, Clock, Loader2 } from "lucide-react";
import { getUploadHistory, uploadFile } from "../services/uploadApi";
import type { UploadRecord } from "../services/uploadApi";

const UploadPage = () => {
  const [history, setHistory] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lastUploadMsg, setLastUploadMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = () => {
    getUploadHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const res = await uploadFile(file);
        setLastUploadMsg(res.message);
        fetchHistory();
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Data Import</h1>
          <p className="text-gray-500 mt-2">Upload GIS files and tabular data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 min-w-0">
          {/* Drag & Drop Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-12 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".geojson,.csv,.zip"
            />
            {uploading ? (
              <>
                <Loader2 className="w-16 h-16 text-blue-500 mb-4 animate-spin" />
                <h2 className="text-2xl font-bold mb-2">Uploading...</h2>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Drag & Drop Files Here</h2>
                <p className="text-gray-500 mb-6">Supported formats: GeoJSON, Shapefile (.zip), CSV</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2">
                  <FileUp className="w-5 h-5" />
                  Browse Files
                </button>
              </>
            )}
          </div>
          
          {lastUploadMsg && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{lastUploadMsg}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 min-w-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">Upload Status</h3>
            <ul className="space-y-4">
              {loading ? (
                <li className="text-sm text-gray-500">Loading history...</li>
              ) : history.length === 0 ? (
                <li className="text-sm text-gray-500">No recent uploads</li>
              ) : (
                history.map((record) => (
                  <li key={record.id} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {record.status === "Done" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="break-words text-sm font-medium">{record.filename}</span>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">{record.status}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
