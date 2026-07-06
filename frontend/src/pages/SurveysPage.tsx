import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  FileDown,
  Layers,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getParks } from "../services/parkService";
import type { Park } from "../services/parkService";
import { 
  getSurveys, 
  createSurvey, 
  updateSurvey, 
  deleteSurvey, 
  uploadPhotos,
  exportSurveyPdf,
  exportSurveyExcel,
  exportSurveyCsv
} from "../services/surveyApi";
import type { 
  Survey, 
  SurveyCondition 
} from "../services/surveyApi";

const ITEMS_PER_PAGE = 8;
const CONDITIONS: SurveyCondition[] = ["Excellent", "Good", "Average", "Poor", "Very Poor"];

const SurveysPage = () => {
  const { user, isCityPlanner } = useAuth();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [selectedParkId, setSelectedParkId] = useState<number | undefined>(undefined);
  const [selectedCondition, setSelectedCondition] = useState<SurveyCondition | undefined>(undefined);
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [maxScore, setMaxScore] = useState<number | undefined>(undefined);

  // Modals state
  const [activeModal, setActiveModal] = useState<"add" | "edit" | "delete" | "details" | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  // Form fields
  const [formParkId, setFormParkId] = useState<string>("");
  const [formCondition, setFormCondition] = useState<SurveyCondition>("Good");
  const [formScore, setFormScore] = useState<string>("8");
  const [formRemarks, setFormRemarks] = useState<string>("");
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().substring(0, 16));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    getParks()
      .then((data) => setParks(data))
      .catch((err) => console.error("Error loading parks:", err));
  }, []);

  const fetchSurveysList = () => {
    setLoading(true);
    const skip = (page - 1) * ITEMS_PER_PAGE;
    getSurveys({
      park_id: selectedParkId,
      condition: selectedCondition,
      min_score: minScore,
      max_score: maxScore,
      skip,
      limit: ITEMS_PER_PAGE
    })
      .then((res) => {
        setSurveys(res.items);
        setTotal(res.total);
      })
      .catch((err) => console.error("Error loading surveys:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSurveysList();
  }, [page, selectedParkId, selectedCondition, minScore, maxScore]);

  // Open modals
  const handleOpenAdd = () => {
    setFormParkId(parks[0]?.id?.toString() || "");
    setFormCondition("Good");
    setFormScore("8");
    setFormRemarks("");
    setFormDate(new Date().toISOString().substring(0, 16));
    setSelectedFiles([]);
    setPhotoPreviews([]);
    setExistingPhotos([]);
    setFormError("");
    setActiveModal("add");
  };

  const handleOpenEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    setFormParkId(survey.park_id.toString());
    setFormCondition(survey.condition);
    setFormScore(survey.score.toString());
    setFormRemarks(survey.remarks || "");
    setFormDate(new Date(survey.survey_date).toISOString().substring(0, 16));
    setSelectedFiles([]);
    setPhotoPreviews([]);
    setExistingPhotos(survey.photos || []);
    setFormError("");
    setActiveModal("edit");
  };

  const handleOpenDelete = (survey: Survey) => {
    setSelectedSurvey(survey);
    setActiveModal("delete");
  };

  const handleOpenDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setActiveModal("details");
  };

  // Files select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Check total count
    if (selectedFiles.length + files.length + existingPhotos.length > 5) {
      setFormError("A maximum of 5 photos can be uploaded.");
      return;
    }

    // Check size limit: 5MB
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setFormError(`File "${f.name}" exceeds the 5MB size limit.`);
        return;
      }
    }

    setFormError("");
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Previews
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

  const removeExistingPhoto = (index: number) => {
    const photos = [...existingPhotos];
    photos.splice(index, 1);
    setExistingPhotos(photos);
  };

  // Submit handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formParkId) {
      setFormError("Please select a park.");
      return;
    }
    const scoreVal = parseFloat(formScore);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 10) {
      setFormError("Score must be between 1 and 10.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      // 1. Upload files first
      let uploadedFilenames: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedFilenames = await uploadPhotos(selectedFiles);
      }

      // 2. Submit survey
      await createSurvey({
        park_id: parseInt(formParkId),
        condition: formCondition,
        score: scoreVal,
        remarks: formRemarks || undefined,
        survey_date: new Date(formDate).toISOString(),
        photos: uploadedFilenames
      });

      setActiveModal(null);
      fetchSurveysList();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to submit survey.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;
    const scoreVal = parseFloat(formScore);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 10) {
      setFormError("Score must be between 1 and 10.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      // 1. Upload new files if any
      let newlyUploaded: string[] = [];
      if (selectedFiles.length > 0) {
        newlyUploaded = await uploadPhotos(selectedFiles);
      }

      const combinedPhotos = [...existingPhotos, ...newlyUploaded];

      // 2. Submit edits
      await updateSurvey(selectedSurvey.id, {
        park_id: parseInt(formParkId),
        condition: formCondition,
        score: scoreVal,
        remarks: formRemarks || undefined,
        survey_date: new Date(formDate).toISOString(),
        photos: combinedPhotos
      });

      setActiveModal(null);
      fetchSurveysList();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to update survey.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSurvey) return;
    try {
      await deleteSurvey(selectedSurvey.id);
      setActiveModal(null);
      fetchSurveysList();
    } catch (err) {
      console.error("Failed to delete survey:", err);
    }
  };

  // Export handlers
  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    setExporting(format);
    try {
      let data: Blob;
      let nameStr = "";
      if (format === "pdf") {
        data = await exportSurveyPdf();
        nameStr = `UrbanIQ_Surveys_${Date.now()}.pdf`;
      } else if (format === "excel") {
        data = await exportSurveyExcel();
        nameStr = `UrbanIQ_Surveys_${Date.now()}.xlsx`;
      } else {
        data = await exportSurveyCsv();
        nameStr = `UrbanIQ_Surveys_${Date.now()}.csv`;
      }

      const blobUrl = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", nameStr);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  const getParkName = (id: number) => {
    return parks.find((p) => p.id === id)?.name || `Space #${id}`;
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  // Authorization check (researchers can edit/delete own survey, planner can do any)
  const canModify = (survey: Survey) => {
    if (isCityPlanner) return true;
    return survey.researcher_id === user?.id;
  };

  return (
    <div className="max-w-7xl mx-auto p-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            System Surveys
          </h1>
          <p className="text-gray-500 mt-2">Manage public space surveys, quality indicators, and photo documentation</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Survey
        </button>
      </div>

      {/* Export Toolbar */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={() => handleExport("pdf")}
          disabled={exporting !== null}
          className="flex items-center gap-2 border border-gray-200 text-sm font-semibold bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {exporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-red-500" />}
          PDF Report
        </button>
        <button
          onClick={() => handleExport("excel")}
          disabled={exporting !== null}
          className="flex items-center gap-2 border border-gray-200 text-sm font-semibold bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {exporting === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-green-500" />}
          Excel Sheet
        </button>
        <button
          onClick={() => handleExport("csv")}
          disabled={exporting !== null}
          className="flex items-center gap-2 border border-gray-200 text-sm font-semibold bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {exporting === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-blue-500" />}
          CSV Dump
        </button>
      </div>

      {/* Filtering Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Filter by Public Space</label>
          <select
            value={selectedParkId || ""}
            onChange={(e) => {
              setSelectedParkId(e.target.value ? parseInt(e.target.value) : undefined);
              setPage(1);
            }}
            className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Public Spaces</option>
            {parks.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Filter by Condition</label>
          <select
            value={selectedCondition || ""}
            onChange={(e) => {
              setSelectedCondition(e.target.value ? e.target.value as SurveyCondition : undefined);
              setPage(1);
            }}
            className="w-full border border-gray-200 rounded-xl p-3 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Conditions</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Score</label>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="1"
              value={minScore || ""}
              onChange={(e) => {
                setMinScore(e.target.value ? parseFloat(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Max Score</label>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="10"
              value={maxScore || ""}
              onChange={(e) => {
                setMaxScore(e.target.value ? parseFloat(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedParkId(undefined);
            setSelectedCondition(undefined);
            setMinScore(undefined);
            setMaxScore(undefined);
            setPage(1);
          }}
          className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold border rounded-xl transition-all"
        >
          Reset Filters
        </button>
      </div>

      {/* Surveys List Table */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading surveys...</p>
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center p-20">
            <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No surveys found</h2>
            <p className="text-gray-500">Apply different filters or submit a new inspection survey</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                  <th className="p-4 pl-6">Public Space Name</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Quality Score</th>
                  <th className="p-4">Survey Date</th>
                  <th className="p-4">Photos</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {surveys.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-gray-900">{getParkName(s.park_id)}</td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        s.condition === "Excellent" || s.condition === "Good"
                          ? "bg-green-100 text-green-800"
                          : s.condition === "Average"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {s.condition}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">{s.score} / 10</td>
                    <td className="p-4">{new Date(s.survey_date).toLocaleDateString()}</td>
                    <td className="p-4 font-medium text-gray-500 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" />
                      {s.photos?.length || 0} pics
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(s)}
                          title="View Details"
                          className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:shadow transition-all"
                        >
                          Show
                        </button>
                        
                        {canModify(s) && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(s)}
                              title="Edit"
                              className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 hover:text-indigo-600 hover:shadow transition-all font-semibold"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(s)}
                              title="Delete"
                              className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 hover:text-red-500 hover:shadow transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pager */}
        {!loading && surveys.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4 pl-6 pr-6 bg-gray-50 text-sm">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 font-medium px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="text-gray-500">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 font-medium px-4 py-2 border rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {activeModal === "add" && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <Plus className="w-5 h-5 text-blue-500" />
                Add Inspection Survey
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Select Public Space *</label>
                <select
                  required
                  value={formParkId}
                  onChange={(e) => setFormParkId(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="" disabled>-- Choose public space --</option>
                  {parks.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Condition *</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as SurveyCondition)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
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
                    value={formScore}
                    onChange={(e) => setFormScore(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Survey Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Remarks / Checklist notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe public space assets quality, damages, or notes..."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Upload Photos (Max 5, &lt;= 5MB each)</label>
                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-105"
                />

                {/* Previews */}
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {photoPreviews.map((p, idx) => (
                    <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group">
                      <img src={p} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute right-1 top-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all opacity-90"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 font-semibold text-gray-505 hover:text-gray-700 hover:bg-gray-105 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {activeModal === "edit" && selectedSurvey && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Edit Inspection Survey
              </h2>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Select Public Space *</label>
                <select
                  required
                  value={formParkId}
                  onChange={(e) => setFormParkId(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
                >
                  {parks.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Condition *</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as SurveyCondition)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-500"
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
                    value={formScore}
                    onChange={(e) => setFormScore(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Survey Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Remarks / Checklist notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe public space assets quality, damages, or notes..."
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-505"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Existing & New Photos</label>
                
                {/* Existing pics */}
                {existingPhotos.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3 bg-gray-50 p-2 rounded-xl border border-dashed">
                    {existingPhotos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group">
                        <img 
                          src={`http://127.0.0.1:8000/uploads/surveys/${photo}`} 
                          alt="Inspection" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = `http://localhost:8000/uploads/surveys/${photo}`;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(idx)}
                          className="absolute right-1 top-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all opacity-90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-105"
                />

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {photoPreviews.map((p, idx) => (
                      <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group">
                        <img src={p} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className="absolute right-1 top-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-all opacity-90"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-105 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Edits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS VIEW MODAL */}
      {activeModal === "details" && selectedSurvey && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Survey Details</h2>
                <p className="text-xs text-gray-400 mt-1">Inspection survey ID: #{selectedSurvey.id}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-650 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 font-bold uppercase font-semibold">Public Space</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{getParkName(selectedSurvey.park_id)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 font-bold uppercase font-semibold">Survey Date</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{new Date(selectedSurvey.survey_date).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 font-bold uppercase font-semibold">Condition</p>
                  <span className={`inline-block px-3 py-1 mt-2 text-xs font-bold rounded-full ${
                    selectedSurvey.condition === "Excellent" || selectedSurvey.condition === "Good"
                      ? "bg-green-100 text-green-800"
                      : selectedSurvey.condition === "Average"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedSurvey.condition}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400 font-bold uppercase font-semibold">Assigned Score</p>
                  <p className="text-lg font-bold text-yellow-600 mt-1">{selectedSurvey.score} / 10</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-400 font-bold uppercase font-semibold">Remarks & Notes</p>
                <p className="text-sm text-gray-707 mt-2 italic whitespace-pre-wrap">
                  {selectedSurvey.remarks || "No remarks entered for this survey."}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-bold uppercase font-semibold mb-3">Photo Documentation</p>
                {selectedSurvey.photos && selectedSurvey.photos.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {selectedSurvey.photos.map((photo, idx) => (
                      <a 
                        key={idx} 
                        href={`http://127.0.0.1:8000/uploads/surveys/${photo}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="relative aspect-square border rounded-xl overflow-hidden block hover:opacity-90 hover:scale-102 transition-all cursor-zoom-in"
                      >
                        <img 
                          src={`http://127.0.0.1:8000/uploads/surveys/${photo}`} 
                          alt="Survey Document" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.src = `http://localhost:8000/uploads/surveys/${photo}`;
                          }}
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No photos uploaded for this survey.</p>
                )}
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-3 font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-105 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {activeModal === "delete" && selectedSurvey && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Inspection Survey?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete this survey for <span className="font-semibold text-gray-850">"{getParkName(selectedSurvey.park_id)}"</span>? 
                This action is destructive and will recalculate the public space average survey score.
              </p>
              
              <div className="flex gap-3 w-full animate-up">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 font-semibold text-gray-500 hover:text-gray-705 hover:bg-gray-100 bg-white rounded-xl transition-all border border-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  className="flex-1 py-3 font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveysPage;
