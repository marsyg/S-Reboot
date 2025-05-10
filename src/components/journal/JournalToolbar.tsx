
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface JournalToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  onExport: () => void;
  onExportOPML: () => void;
  onClose: () => void;
  isFullscreen: boolean;
}

const JournalToolbar: React.FC<JournalToolbarProps> = ({
  title,
  setTitle,
  onExport,
  onExportOPML,
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportOPML}>
                Export as OPML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button variant="outline" size="sm" onClick={onClose}>
          {isFullscreen ? "Close" : "Open Full Editor"}
        </Button>
      </div>
    </div>
  );
};

export default JournalToolbar;
