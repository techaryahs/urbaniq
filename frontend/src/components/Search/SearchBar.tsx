interface Props {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchBar = ({ searchTerm, setSearchTerm }: Props) => {
  return (
    <div>
      <input
        type="text"
        placeholder="🔍 Search parks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-14 w-full rounded-xl border border-gray-300 px-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
};

export default SearchBar;
