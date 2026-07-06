import { useState } from "react";

interface Props {
  latitude: number;
  longitude: number;
  onSave: (name: string, type: string, condition: string) => void;
  onClose: () => void;
}

const SPACE_TYPES = [
  { value: "PARK", label: "Park" },
  { value: "LAKE", label: "Lake" },
  { value: "SCHOOL", label: "School" },
  { value: "GARDEN", label: "Garden" },
  { value: "PLAYGROUND", label: "Playground" },
  { value: "OPEN_SPACE", label: "Open Space" }
];

const AddParkModal = ({ latitude, longitude, onSave, onClose }: Props) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("PARK");
  const [condition, setCondition] = useState("Good");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-96 shadow-2xl border border-gray-100 animate-in zoom-in duration-200">
        <h2 className="text-2xl font-bold mb-5 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add Public Space</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Oakridge Park"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-250 rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Space Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-250 rounded-xl p-3 bg-white focus:outline-none focus:border-blue-500 text-sm"
            >
              {SPACE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Condition Status</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full border border-gray-250 rounded-xl p-3 bg-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-500 space-y-1">
            <p><strong>Latitude:</strong> {latitude.toFixed(6)}</p>
            <p><strong>Longitude:</strong> {longitude.toFixed(6)}</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all text-sm"
            >
              Cancel
            </button>

            <button
              onClick={() => onSave(name, type, condition)}
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md transition-all text-sm"
            >
              Save Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddParkModal;
