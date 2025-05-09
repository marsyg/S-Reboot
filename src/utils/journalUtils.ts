
import { v4 as uuidv4 } from "uuid";
import { BulletItemType } from "@/types/journal";

// A function to generate a sample journal structure
export const generateSampleJournal = (): BulletItemType[] => {
  return [
    {
      id: uuidv4(),
      content: "Welcome to your journal",
      children: [
        {
          id: uuidv4(),
          content: "This is a nested bullet point",
          children: [],
          level: 1,
          isCollapsed: false,
        },
        {
          id: uuidv4(),
          content: "You can add more nested points",
          children: [
            {
              id: uuidv4(),
              content: "Like this one!",
              children: [],
              level: 2,
              isCollapsed: false,
            },
          ],
          level: 1,
          isCollapsed: false,
        },
      ],
      level: 0,
      isCollapsed: false,
    },
    {
      id: uuidv4(),
      content: "Press Enter to create a new bullet",
      children: [],
      level: 0,
      isCollapsed: false,
    },
    {
      id: uuidv4(),
      content: "Press Tab to create a nested bullet",
      children: [],
      level: 0,
      isCollapsed: false,
    },
    {
      id: uuidv4(),
      content: "Press Backspace on an empty bullet to delete it",
      children: [],
      level: 0,
      isCollapsed: false,
    },
    {
      id: uuidv4(),
      content: "Drag and drop images directly into your journal",
      children: [],
      level: 0,
      isCollapsed: false,
    },
  ];
};
