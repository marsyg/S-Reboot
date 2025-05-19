import React from "react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { List, ListTree, Share, Loader2, Save, Share2, Download, FileText, Image, WifiOff, Video } from "lucide-react";
import { useJournalSync } from "../../hooks/useJournalSync";
import { toast } from "../../components/ui/use-toast";

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
  onVideoUpload?: () => void;
  journalData?: any;
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
  onVideoUpload,
  journalData
}) => {
  const { isOnline, isAuthenticated, lastSynced, pendingChanges, syncJournal } = useJournalSync();

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

  const handleVideoUpload = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('select-video');
      if (result && onVideoUpload) {
        onVideoUpload();
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const handleSave = async () => {
    onSave();
    await syncJournal(journalData);
  };

  const handlePublish = async () => {
    if (!isOnline) {
      toast({
        title: 'Offline Mode',
        description: 'You are currently offline. Changes will be saved locally and synced when you are back online.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to publish your journal.',
        variant: 'destructive',
      });
      return;
    }

    if (onPublish) {
      onPublish();
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center flex-wrap fullscreen-toolbar-buttons">
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleVideoUpload}
          className="flex items-center gap-1 hover:scale-105 transition-transform"
        >
          <Video className="h-4 w-4" />
          <span>Upload Video</span>
        </Button>

        {onPublish && (
          <Button
            variant={isPublished ? "outline" : "default"}
            size="sm"
            onClick={handlePublish}
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
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-200"
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

        {!isOnline && (
          <div className="flex items-center gap-1 text-yellow-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">Offline</span>
          </div>
        )}

        {pendingChanges && (
          <span className="text-sm text-yellow-600">
            Changes pending sync
          </span>
        )}

        {lastSaved && (
          <span className="text-sm text-gray-500 mr-2">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform border-gray-300 hover:bg-gray-100">
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-fade-in bg-white border border-gray-200 shadow-lg rounded-md p-1">
            <DropdownMenuItem onClick={onExport} className="hover:bg-gray-100 cursor-pointer rounded-sm p-2">
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportOPML} className="hover:bg-gray-100 cursor-pointer rounded-sm p-2">
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
