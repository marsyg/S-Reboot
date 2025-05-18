import React, { useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Dialog, DialogTrigger } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import JournalContent from "./JournalContent";
import JournalToolbar from "./JournalToolbar";
import { BulletItemType, JournalImage } from "../../types/journal";
import { Loader2, Save, Share2 } from "lucide-react";

interface JournalCardProps {
  title: string;
  setTitle: (title: string) => void;
  bullets: BulletItemType[];
  images: JournalImage[];
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
  isPublished: boolean;
  isSaving: boolean;
  isLocalSaving: boolean;
  lastSaved: Date | null;
  onUpdate: (id: string, content: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onAddBulletAfter: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onImageResize: (imageId: string, width: number, height?: number) => void;
  addNewRootBullet: () => void;
  addCollapsibleBullet: () => void;
  exportToJson: () => void;
  exportToOPML: () => void;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onDeleteJournal: (journalId: string) => Promise<boolean>;
  journalId: string;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  title,
  setTitle,
  bullets,
  images,
  isFullscreen,
  setIsFullscreen,
  isPublished,
  isSaving,
  isLocalSaving,
  lastSaved,
  onUpdate,
  onAddChild,
  onDelete,
  onAddBulletAfter,
  onToggleCollapse,
  onImageUpload,
  onImageResize,
  addNewRootBullet,
  addCollapsibleBullet,
  exportToJson,
  exportToOPML,
  onSave,
  onPublish,
  onDeleteJournal,
  journalId,
}) => {
  console.log('=== JournalCard Render ===');
  console.log('Props:', { 
    title, 
    bulletsCount: bullets.length, 
    imagesCount: images.length, 
    isFullscreen, 
    isPublished, 
    isSaving, 
    isLocalSaving, 
    lastSaved, 
    journalId 
  });

  const handleImageUpload = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('select-image');
      if (result) {
        // Create a File object from the base64 data
        const response = await fetch(result.base64);
        const blob = await response.blob();
        const file = new File([blob], 'image.png', { type: 'image/png' });
        
        // Find the currently focused bullet or use the first bullet
        const focusedElement = document.activeElement;
        const bulletId = focusedElement?.closest('[data-bullet-id]')?.getAttribute('data-bullet-id') || bullets[0]?.id;
        
        if (bulletId) {
          onImageUpload(bulletId, file);
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-none">
        <CardTitle className="flex items-center justify-between">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            placeholder="Enter title..."
          />
          <JournalToolbar
            title={title}
            setTitle={setTitle}
            onExport={exportToJson}
            onExportOPML={exportToOPML}
            onClose={() => setIsFullscreen(true)}
            isFullscreen={false}
            onAddNewRootBullet={addNewRootBullet}
            onAddCollapsibleBullet={addCollapsibleBullet}
            onPublish={onPublish}
            isPublished={isPublished}
            isSaving={isSaving}
            onSave={onSave}
            lastSaved={lastSaved}
            onImageUpload={handleImageUpload}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        <JournalContent
          bullets={bullets}
          images={images}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onAddBulletAfter={onAddBulletAfter}
          onToggleCollapse={onToggleCollapse}
          onImageUpload={onImageUpload}
          onImageResize={onImageResize}
          onAddNewRootBullet={addNewRootBullet}
          onAddCollapsibleBullet={addCollapsibleBullet}
        />
      </CardContent>
    </Card>
  );
};

export default JournalCard;
