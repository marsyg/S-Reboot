import React from "react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { List, ListTree, Share, Loader2, Save, Share2, Download, FileText, Image } from "lucide-react";

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
  onDeleteJournal?: (journalId: string) => Promise<boolean>;
  onSave: () => void;
  lastSaved: Date | null;
  onImageUpload?: () => void;
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
  isSaving,
  onDeleteJournal,
  onSave,
  lastSaved,
  onImageUpload,
}) => {
  const handleImageUpload = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('select-image');
      if (result && onImageUpload) {
        onImageUpload();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

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
      <div className="flex gap-2 items-center fullscreen-toolbar-buttons">
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleImageUpload}
          className="flex items-center gap-1 hover:scale-105 transition-transform"
        >
          <Image className="h-4 w-4" />
          <span>Upload Image</span>
        </Button>

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

        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>

        {lastSaved && (
          <span className="text-sm text-gray-500">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
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
