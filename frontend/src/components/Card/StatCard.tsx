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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h2 className="mt-2 break-words text-3xl font-bold text-gray-900 sm:text-4xl">{value}</h2>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 sm:h-14 sm:w-14">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
