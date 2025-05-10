
import React from "react";
import BulletItem from "@/components/BulletItem";
import { Button } from "@/components/ui/button";
import { Plus, IndentIncrease } from "lucide-react";
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
  onAddCollapsibleBullet: () => void;
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
  onAddCollapsibleBullet,
  images,
}) => {
  return (
    <>
      {bullets.map((bullet) => (
        <BulletItem
          key={bullet.id}
          id={bullet.id}
          content={bullet.content}
          children={bullet.children}
          level={bullet.level}
          isCollapsed={bullet.isCollapsed}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onDelete={onDelete}
          onAddBulletAfter={onAddBulletAfter}
          onToggleCollapse={onToggleCollapse}
          onImageUpload={onImageUpload}
          images={images}
        />
      ))}
      <div className="flex space-x-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
          onClick={onAddNewRootBullet}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add new item
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
          onClick={onAddCollapsibleBullet}
        >
          <IndentIncrease className="h-4 w-4 mr-1" />
          Add collapsible section
        </Button>
      </div>
    </>
  );
};

export default JournalContent;
