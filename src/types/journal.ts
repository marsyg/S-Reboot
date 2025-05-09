
import { BulletItemProps } from "@/components/BulletItem";

// A type representing just the data structure of a bullet item without the handler functions
export type BulletItemType = Omit<
  BulletItemProps, 
  'onUpdate' | 'onAddChild' | 'onDelete' | 'onAddBulletAfter' | 'onToggleCollapse' | 'onImageUpload' | 'images'
> & {
  children: BulletItemType[];
};

export interface JournalImage {
  id: string;
  url: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
}

export interface JournalProps {
  initialTitle?: string;
}

export interface JournalExportData {
  title: string;
  bullets: {
    id: string;
    content: string;
    children: any[];
    isCollapsed: boolean;
  }[];
  images: JournalImage[];
  timestamp: string;
}
