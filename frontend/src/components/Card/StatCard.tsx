import {
  Trees,
  CircleCheck,
  AlertTriangle,
  CircleX,
  Building2,
  Star,
} from "lucide-react";

interface Props {
  title: string;
  value: number | string;
  icon: "parks" | "good" | "fair" | "poor" | "organization" | "survey";
}

const StatCard = ({ title, value, icon }: Props) => {
  const getIcon = () => {
    switch (icon) {
      case "parks":
        return <Trees className="w-7 h-7 text-blue-600" />;

      case "good":
        return <CircleCheck className="w-7 h-7 text-green-600" />;

      case "fair":
        return <AlertTriangle className="w-7 h-7 text-amber-500" />;

      case "poor":
        return <CircleX className="w-7 h-7 text-red-500" />;

      case "organization":
        return <Building2 className="w-7 h-7 text-purple-600" />;

      case "survey":
        return <Star className="w-7 h-7 text-yellow-500" />;

      default:
        return <Trees className="w-7 h-7" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h2 className="text-4xl font-bold mt-2 text-gray-900">{value}</h2>
        </div>

        <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
