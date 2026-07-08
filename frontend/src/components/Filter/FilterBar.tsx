interface Props {
  condition: string;
  setCondition: (value: string) => void;
}

const FilterBar = ({ condition, setCondition }: Props) => {
  return (
    <select
      value={condition}
      onChange={(e) => setCondition(e.target.value)}
      className="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <option value="">All Conditions</option>
      <option value="Good">Good</option>
      <option value="Fair">Fair</option>
      <option value="Poor">Poor</option>
    </select>
  );
};

export default FilterBar;
