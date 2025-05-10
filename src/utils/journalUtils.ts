
import { v4 as uuidv4 } from "uuid";
import { BulletItemType } from "@/types/journal";

// Generate sample journal entries for testing
export const generateSampleJournal = (): BulletItemType[] => {
  return [
    {
      id: uuidv4(),
      content: "Welcome to your journal",
      children: [] as BulletItemType[],
      level: 0,
      isCollapsed: false,
    },
    {
      id: uuidv4(),
      content: "Add content with formatting",
      children: [
        {
          id: uuidv4(),
          content: "Press Tab to nest a bullet",
          children: [] as BulletItemType[],
          level: 1,
          isCollapsed: false,
        },
      ],
      level: 0,
      isCollapsed: false,
    },
  ];
};
