
import React from "react";
import BulletItem from "@/components/BulletItem";
import { Button } from "@/components/ui/button";
import { BulletItemType, JournalImage } from "@/types/journal";

interface JournalContentProps {
  bullets: BulletItemType[];
  onUpdate: (id: string, content: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onAddBulletAfter: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onAddNewRootBullet: () => void;
  images: JournalImage[];
}

const JournalContent: React.FC<JournalContentProps> = ({
  bullets,
  onUpdate,
  onAddChild,
  onDelete,
  onAddBulletAfter,
  onToggleCollapse,
  onImageUpload,
  onAddNewRootBullet,
  images,
}) => {
  return (
    <>
      {bullets.map((bullet) => (
        <BulletItem
          key={bullet.id}
          {...bullet}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onAddBulletAfter={onAddBulletAfter}
          onToggleCollapse={onToggleCollapse}
          onImageUpload={onImageUpload}
          images={images}
        />
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 text-gray-500 hover:text-gray-700"
        onClick={onAddNewRootBullet}
      >
        + Add new item
      </Button>
    </>
  );
};

export default JournalContent;
