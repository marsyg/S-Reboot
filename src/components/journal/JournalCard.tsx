
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import JournalContent from "./JournalContent";
import JournalToolbar from "./JournalToolbar";
import { BulletItemType, JournalImage } from "@/types/journal";

interface JournalCardProps {
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
  onPublish?: () => void;
  isPublished?: boolean;
  isSaving?: boolean;
}

const JournalCard: React.FC<JournalCardProps> = ({
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
  onPublish,
  isPublished,
  isSaving
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg animate-fade-in hover:shadow-xl transition-all duration-300 transform perspective-1000 border-gray-200">
      <CardHeader className="bg-gray-50 rounded-t-lg border-b border-gray-100">
        <JournalToolbar
          title={title}
          setTitle={setTitle}
          onExport={onExport}
          onExportOPML={onExportOPML}
          onClose={() => setIsFullscreen(true)}
          isFullscreen={false}
          onAddNewRootBullet={onAddNewRootBullet}
          onAddCollapsibleBullet={onAddCollapsibleBullet}
          onPublish={onPublish}
          isPublished={isPublished}
          isSaving={isSaving}
        />
      </CardHeader>
      <CardContent className="p-5">
        <div className="journal-content min-h-[300px] p-6 bg-journal-background rounded-lg shadow-sm transform translate-y-0 hover:translate-y-[-1px] transition-all duration-200" 
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)" }}>
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
      </CardContent>
    </Card>
  );
};

export default JournalCard;
