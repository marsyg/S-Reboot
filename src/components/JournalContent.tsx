import React from 'react';
import BulletItem from './BulletItem';
import { BulletItemType } from '../types/journal';

interface JournalContentProps {
  bullets: BulletItemType[];
  onUpdate: (id: string, content: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onAddBulletAfter: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  images: any[];
  onImageResize?: (imageId: string, width: number, height?: number, top?: number, left?: number) => void;
  onAddCollapsibleBullet?: (parentId: string) => void;
  handleOutdent: (id: string) => void;
}

export const JournalContent: React.FC<JournalContentProps> = ({
  bullets,
  onUpdate,
  onAddChild,
  onDelete,
  onAddBulletAfter,
  onToggleCollapse,
  onImageUpload,
  images,
  onImageResize,
  onAddCollapsibleBullet,
  handleOutdent
}) => {
  const convertToBulletItemProps = (bullet: BulletItemType) => {
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
      onImageUpload,
      images,
      onImageResize,
      onAddCollapsibleBullet,
      onOutdent: handleOutdent
    };
  };

  const bulletProps = bullets.map(convertToBulletItemProps);

  return (
    <div className="journal-content flex-1 overflow-y-auto px-2">
      {bulletProps.map((props) => (
        <BulletItem key={props.id} {...props} />
      ))}
    </div>
  );
}; 