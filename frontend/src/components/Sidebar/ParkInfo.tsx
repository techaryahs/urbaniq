import { useEffect, useState } from "react";
import { 
  X, 
  MapPin, 
  Layers, 
  BadgeAlert, 
  Plus, 
  Calendar,
  Image as ImageIcon,
  Loader2,
  Building
} from "lucide-react";
import { getSurveysByPark } from "../../services/surveyApi";
import type { Survey } from "../../services/surveyApi";
import type { Park } from "../../services/parkService";

interface Props {
  park: Park | null;
  onClear: () => void;
  onCreateSurvey: () => void;
}

const ParkInfo = ({ park, onClear, onCreateSurvey }: Props) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!park) {
      setSurveys([]);
      return;
    }
    setLoading(true);
    getSurveysByPark(park.id)
      .then((data) => {
        // Sort surveys: latest date first
        const sorted = data.sort((a, b) => new Date(b.survey_date).getTime() - new Date(a.survey_date).getTime());
        setSurveys(sorted);
      })
      .catch((err) => console.error("Error fetching surveys for park:", err))
      .finally(() => setLoading(false));
  }, [park]);

  if (!park) {
    return (
      <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-md text-center">
        <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Public Space Info</h2>
        <p className="text-gray-550 mt-2 text-sm leading-relaxed">
          Select any public space marker on the map to review details, inspection survey records, or create new surveys.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-150 p-4 sm:p-6 shadow-md flex flex-col gap-5 lg:max-h-[80vh] overflow-y-auto animate-in fade-in duration-205">
      {/* Header */}
      <div className="flex justify-between items-start gap-2 border-b border-gray-100 pb-4">
        <div>
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase">Selected Space</span>
          <h2 className="text-xl font-bold text-gray-900 mt-1">{park.name}</h2>
        </div>
        <button 
          onClick={onClear} 
          className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
          title="Clear selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Basic details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-3">
          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Space Type</span>
          <span className="font-bold text-slate-805 text-sm uppercase">
            {park.type ? park.type.replace("_", " ") : "PARK"}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Condition</span>
          <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full ${
            park.condition === "Excellent" || park.condition === "Good"
              ? "bg-green-100 text-green-800"
              : park.condition === "Average"
              ? "bg-yellow-105 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}>
            {park.condition}
          </span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 sm:col-span-2 lg:col-span-1 xl:col-span-2 flex justify-between items-center">
          <span className="text-xs text-gray-450 font-bold uppercase">Quality Score</span>
          <span className="font-bold text-gray-900 text-base">
            {park.survey_score !== undefined && park.survey_score > 0 
              ? `${park.survey_score.toFixed(1)} / 10` 
              : "N/A"}
          </span>
        </div>

        {park.organization && (
          <div className="bg-slate-50 rounded-xl p-3 sm:col-span-2 lg:col-span-1 xl:col-span-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Organization</span>
              <span className="font-medium text-gray-808">{park.organization}</span>
            </div>
          </div>
        )}

        {park.area !== undefined && (
          <div className="bg-slate-55 rounded-xl p-3 sm:col-span-2 lg:col-span-1 xl:col-span-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase">Land Area</span>
              <span className="font-semibold text-gray-808">{park.area.toLocaleString()} m²</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Survey Action */}
      <button
        onClick={onCreateSurvey}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Create Survey
      </button>

      {/* Survey History List */}
      <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <BadgeAlert className="w-4.5 h-4.5 text-blue-500" />
          Survey History ({surveys.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : surveys.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
            No inspection surveys found for this space.
          </p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto pr-1">
            {surveys.map((sv) => (
              <div 
                key={sv.id} 
                className="bg-white border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-all text-xs flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(sv.survey_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sv.condition === "Excellent" || sv.condition === "Good"
                        ? "bg-green-50 text-green-700"
                        : sv.condition === "Average"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-red-50 text-red-700"
                    }`}>
                      {sv.condition}
                    </span>
                    <span className="font-bold text-gray-800">{sv.score}/10</span>
                  </div>
                </div>

                {sv.remarks && (
                  <p className="text-gray-600 bg-slate-50 p-2 rounded italic text-[11px] leading-relaxed break-words">
                    "{sv.remarks}"
                  </p>
                )}

                {sv.photos && sv.photos.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] text-gray-450 font-semibold">{sv.photos.length} photos:</span>
                    <div className="flex gap-1 overflow-x-auto py-0.5 max-w-full">
                      {sv.photos.map((p, pIdx) => (
                        <a 
                          key={pIdx} 
                          href={`http://127.0.0.1:8000/uploads/surveys/${p}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-7 h-7 rounded border border-gray-100 overflow-hidden shrink-0 hover:opacity-85"
                        >
                          <img 
                            src={`http://127.0.0.1:8000/uploads/surveys/${p}`} 
                            alt="Survey Pic" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = `http://localhost:8000/uploads/surveys/${p}`;
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkInfo;
