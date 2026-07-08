import React, { useState } from "react";
import { 
  X, 
  Plus, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { createSurvey, uploadPhotos } from "../../services/surveyApi";
import type { SurveyCondition } from "../../services/surveyApi";

interface Props {
  parkId: number;
  parkName: string;
  onClose: () => void;
  onSave: () => void;
}

const CONDITIONS: SurveyCondition[] = ["Excellent", "Good", "Average", "Poor", "Very Poor"];

const AddSurveyModal = ({ parkId, parkName, onClose, onSave }: Props) => {
  const [condition, setCondition] = useState<SurveyCondition>("Good");
  const [score, setScore] = useState<string>("8");
  const [remarks, setRemarks] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 16));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle files selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 5) {
      setFormError("A maximum of 5 photos can be uploaded.");
      return;
    }

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setFormError(`File "${f.name}" exceeds the 5MB size limit.`);
        return;
      }
    }

    setFormError("");
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...previews]);
  };

  const removeSelectedFile = (index: number) => {
    const files = [...selectedFiles];
    files.splice(index, 1);
    setSelectedFiles(files);

    const previews = [...photoPreviews];
    URL.revokeObjectURL(previews[index]);
    previews.splice(index, 1);
    setPhotoPreviews(previews);
  };

  // Submit handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreVal = parseFloat(score);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 10) {
      setFormError("Score must be between 1 and 10.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      // 1. Upload files first
      let uploadedFilenames: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedFilenames = await uploadPhotos(selectedFiles);
      }

      // 2. Submit survey
      await createSurvey({
        public_space_id: parkId,
        condition,
        score: scoreVal,
        remarks: remarks || undefined,
        survey_date: new Date(date).toISOString(),
        photos: uploadedFilenames
      });

      onSave();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to submit survey.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center gap-3 p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-800">
              <Plus className="w-5 h-5 text-blue-500" />
              Add Inspection Survey
            </h2>
            <p className="text-xs text-gray-500 mt-1">For park: <span className="font-semibold text-gray-700">{parkName}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as SurveyCondition)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 text-sm"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Score (1–10) *</label>
              <input
                type="number"
                required
                min="1"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Survey Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Remarks / Checklist notes</label>
            <textarea
              rows={3}
              placeholder="Describe public space assets quality, damages, or notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Upload Photos (Max 5, &lt;= 5MB each)</label>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {/* Previews */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
              {photoPreviews.map((p, idx) => (
                <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group">
                  <img src={p} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="absolute right-1 top-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-650 transition-all opacity-90"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-150">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSurveyModal;
