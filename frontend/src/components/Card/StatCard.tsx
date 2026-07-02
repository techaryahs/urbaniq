interface Props {
  title: string;
  value: number;
}

const StatCard = ({ title, value }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-gray-500">{title}</h3>

      <p className="text-4xl font-bold mt-3">{value}</p>
    </div>
  );
};

export default StatCard;
