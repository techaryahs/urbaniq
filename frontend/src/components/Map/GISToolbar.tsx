import { MousePointer2, Plus, Ruler, Circle } from "lucide-react";

export type Tool = "select" | "add" | "measure" | "buffer";

interface Props {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const GISToolbar = ({ activeTool, onToolChange }: Props) => {
  const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
    { id: "select", label: "Select", icon: <MousePointer2 className="w-5 h-5" /> },
    { id: "add", label: "Add", icon: <Plus className="w-5 h-5" /> },
    { id: "measure", label: "Measure", icon: <Ruler className="w-5 h-5" /> },
    { id: "buffer", label: "Buffer", icon: <Circle className="w-5 h-5" /> },
  ];

  return (
    <div
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-full shadow-lg border border-gray-200 p-1.5 flex gap-1"
    >
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tool.icon}
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default GISToolbar;
