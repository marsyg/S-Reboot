
import React from "react";
import { Button } from "@/components/ui/button";

interface JournalToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  onExport: () => void;
  onClose: () => void;
  isFullscreen: boolean;
}

const JournalToolbar: React.FC<JournalToolbarProps> = ({
  title,
  setTitle,
  onExport,
  onClose,
  isFullscreen,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 p-1 ${
            isFullscreen ? "text-2xl" : "text-xl"
          } font-semibold`}
          placeholder="Journal Title"
        />
      </div>
      <div className="flex gap-2">
        {isFullscreen && (
          <Button variant="outline" size="sm" onClick={onExport}>
            Export
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onClose}>
          {isFullscreen ? "Close" : "Open Full Editor"}
        </Button>
      </div>
    </div>
  );
};

export default JournalToolbar;
