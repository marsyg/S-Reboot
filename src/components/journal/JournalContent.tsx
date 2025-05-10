
import React from "react";
import BulletItem from "@/components/BulletItem";
import { BulletItemProps } from "@/components/BulletItem";
import { BulletItemType, JournalImage } from "@/types/journal";

interface JournalContentProps {
  bullets: BulletItemType[];
  onUpdate: (id: string, content: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onAddBulletAfter: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  images: JournalImage[];
  onImageResize?: (id: string, width: number, height?: number, top?: number, left?: number) => void;
}

const JournalContent: React.FC<JournalContentProps> = ({
  bullets,
  onUpdate,
  onAddChild,
  onDelete,
  onAddBulletAfter,
  onToggleCollapse,
  images,
  onImageResize
}) => {
  // Convert BulletItemType to BulletItemProps for each bullet
  const convertToBulletItemProps = (bullet: BulletItemType): BulletItemProps => {
    return {
      id: bullet.id,
      content: bullet.content,
      children: bullet.children.map(convertToBulletItemProps),
      level: bullet.level,
      isCollapsed: bullet.isCollapsed,
      onUpdate,
      onAddChild,
      onDelete,
      onAddBulletAfter,
      onToggleCollapse,
      images,
      onImageResize
    };
  };

  // Convert all bullets
  const bulletProps = bullets.map(convertToBulletItemProps);

  return (
    <div className="journal-content p-4 flex-1 overflow-y-auto">
      {bulletProps.map((bullet) => (
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
          images={images}
          onImageResize={onImageResize}
        />
      ))}
    </div>
  );
};

export default JournalContent;
