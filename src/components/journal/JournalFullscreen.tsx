
import React from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JournalContent from "./JournalContent";
import JournalToolbar from "./JournalToolbar";
import { BulletItemType, JournalImage } from "@/types/journal";

interface JournalFullscreenProps {
  title: string;
  setTitle: (title: string) => void;
  bullets: BulletItemType[];
  onUpdate: (id: string, content: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onAddBulletAfter: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onImageResize: (imageId: string, width: number, height?: number) => void;
  onAddNewRootBullet: () => void;
  onAddCollapsibleBullet: () => void;
  images: JournalImage[];
  setIsFullscreen: (isFullscreen: boolean) => void;
  onExport: () => void;
  onExportOPML: () => void;
}

const JournalFullscreen: React.FC<JournalFullscreenProps> = ({
  title,
  setTitle,
  bullets,
  onUpdate,
  onAddChild,
  onDelete,
  onAddBulletAfter,
  onToggleCollapse,
  onImageUpload,
  onImageResize,
  onAddNewRootBullet,
  onAddCollapsibleBullet,
  images,
  setIsFullscreen,
  onExport,
  onExportOPML,
}) => {
  return (
    <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0">
      <DialogHeader className="p-4 border-b">
        <DialogTitle className="sr-only">Journal Editor</DialogTitle>
        <JournalToolbar
          title={title}
          setTitle={setTitle}
          onExport={onExport}
          onExportOPML={onExportOPML}
          onClose={() => setIsFullscreen(false)}
          isFullscreen={true}
        />
      </DialogHeader>
      
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <div className="journal-content bg-journal-background p-6 rounded-lg shadow-sm min-h-full max-w-4xl mx-auto">
          <JournalContent
            bullets={bullets}
            onUpdate={onUpdate}
            onAddChild={onAddChild}
            onDelete={onDelete}
            onAddBulletAfter={onAddBulletAfter}
            onToggleCollapse={onToggleCollapse}
            onImageUpload={onImageUpload}
            onImageResize={onImageResize}
            onAddNewRootBullet={onAddNewRootBullet}
            onAddCollapsibleBullet={onAddCollapsibleBullet}
            images={images}
          />
        </div>
      </div>
    </DialogContent>
  );
};

export default JournalFullscreen;
