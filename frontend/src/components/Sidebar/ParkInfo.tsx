interface Props {
  park: {
    name: string;
    latitude: number;
    longitude: number;
    condition: string;
  } | null;
}

const ParkInfo = ({ park }: Props) => {
  if (!park) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold">Park Information</h2>

        <p className="text-gray-500 mt-4">Click any park marker on the map.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold">{park.name}</h2>

      <div className="mt-5 space-y-3">
        <p>
          <strong>Condition:</strong> {park.condition}
        </p>

        <p>
          <strong>Latitude:</strong> {park.latitude}
        </p>

        <p>
          <strong>Longitude:</strong> {park.longitude}
        </p>
      </div>
    </div>
  );
};

export default ParkInfo;
