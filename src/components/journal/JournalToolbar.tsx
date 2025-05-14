
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { List, ListTree, Share, Loader2 } from "lucide-react";

interface JournalToolbarProps {
  title: string;
  setTitle: (title: string) => void;
  onExport: () => void;
  onExportOPML: () => void;
  onClose: () => void;
  isFullscreen: boolean;
  onAddNewRootBullet?: () => void;
  onAddCollapsibleBullet?: () => void;
  onPublish?: () => void;
  isPublished?: boolean;
  isSaving?: boolean;
}

const JournalToolbar: React.FC<JournalToolbarProps> = ({
  title,
  setTitle,
  onExport,
  onExportOPML,
  onClose,
  isFullscreen,
  onAddNewRootBullet,
  onAddCollapsibleBullet,
  onPublish,
  isPublished,
  isSaving
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
          } font-semibold animate-fade-in`}
          placeholder="Journal Title"
        />
      </div>
      <div className="flex gap-2 items-center">
        {onAddNewRootBullet && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNewRootBullet}
            className="flex items-center gap-1 hover:scale-105 transition-transform"
          >
            <List className="h-4 w-4" />
            <span>Add Bullet</span>
          </Button>
        )}
        
        {onAddCollapsibleBullet && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddCollapsibleBullet}
            className="flex items-center gap-1 hover:scale-105 transition-transform"
          >
            <ListTree className="h-4 w-4" />
            <span>Add Section</span>
          </Button>
        )}

        {onPublish && (
          <Button
            variant={isPublished ? "outline" : "default"}
            size="sm"
            onClick={onPublish}
            disabled={isSaving || isPublished}
            className="flex items-center gap-1 hover:scale-105 transition-transform"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share className="h-4 w-4" />
            )}
            <span>{isPublished ? "Published" : isSaving ? "Publishing..." : "Publish"}</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-fade-in">
            <DropdownMenuItem onClick={onExport} className="hover:bg-gray-100">
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportOPML} className="hover:bg-gray-100">
              Export as OPML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose}
          className="hover:scale-105 transition-transform"
        >
          {isFullscreen ? "Close" : "Open Full Editor"}
        </Button>
      </div>
    </div>
  );
};

export default JournalToolbar;
