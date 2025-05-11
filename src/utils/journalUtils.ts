
import { v4 as uuidv4 } from "uuid";
import { BulletItemType } from "@/types/journal";

// Generate sample journal entries for testing
export const generateSampleJournal = (): BulletItemType[] => {
  const childId1 = uuidv4();
  const childId2 = uuidv4();
  const nestedChildId1 = uuidv4();
  
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
      content: "Multilevel sections example",
      children: [
        {
          id: childId1,
          content: "First level nested item",
          children: [
            {
              id: nestedChildId1,
              content: "Second level nested item",
              children: [] as BulletItemType[],
              level: 2,
              isCollapsed: false,
            }
          ],
          level: 1,
          isCollapsed: false,
        },
        {
          id: childId2,
          content: "Another nested item",
          children: [] as BulletItemType[],
          level: 1,
          isCollapsed: false,
        }
      ],
      level: 0,
      isCollapsed: false,
    },
  ];
};
