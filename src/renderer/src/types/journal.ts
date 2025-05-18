import { BulletItemProps } from "../components/BulletItem";

// A type representing just the data structure of a bullet item without the handler functions
export type BulletItemType = {
  id: string;
  content: string;
  children: BulletItemType[];
  level: number;
  isCollapsed: boolean;
};

export interface JournalImage {
  id: string;
  url: string;
  width: number;
  height?: number;
  top?: number;
  left?: number;
  isResizing?: boolean;
}

export interface JournalProps {
  initialTitle?: string;
  initialContent?: {
    bullets?: any[];
    images?: any[];
  };
  journalId?: string;
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
