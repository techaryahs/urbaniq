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
      className="absolute left-2 right-2 top-3 z-[1000] flex flex-wrap justify-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg sm:left-1/2 sm:right-auto sm:top-4 sm:-translate-x-1/2 sm:flex-nowrap sm:rounded-full"
    >
      {tools.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
              isActive
                ? "bg-blue-600 text-white shadow-md"
                : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tool.icon}
            <span className="hidden min-[420px]:inline">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default GISToolbar;
