
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
}) => {
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md animate-fade-in">
      <CardHeader className="bg-gray-50 rounded-t-lg">
        <JournalToolbar
          title={title}
          setTitle={setTitle}
          onExport={onExport}
          onExportOPML={onExportOPML}
          onClose={() => setIsFullscreen(true)}
          isFullscreen={false}
        />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="journal-content min-h-[300px] p-4 bg-journal-background rounded">
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
