import { useState } from "react";

interface Props {
  latitude: number;
  longitude: number;
  onSave: (name: string, condition: string) => void;
  onClose: () => void;
}

const AddParkModal = ({ latitude, longitude, onSave, onClose }: Props) => {
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("Good");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-2xl font-bold mb-5">Add New Park</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Park Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>

          <div className="text-sm text-gray-500">
            <p>Latitude : {latitude.toFixed(6)}</p>
            <p>Longitude : {longitude.toFixed(6)}</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={() => onSave(name, condition)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddParkModal;
