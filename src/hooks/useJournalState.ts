
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { generateSampleJournal } from "@/utils/journalUtils";
import { BulletItemType, JournalImage } from "@/types/journal";

export const useJournalState = (initialTitle: string = "My Journal") => {
  const [title, setTitle] = useState(initialTitle);
  const [bullets, setBullets] = useState<BulletItemType[]>(generateSampleJournal());
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<JournalImage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  // Update a bullet's content
  const handleUpdateBullet = (id: string, content: string) => {
    const updateBulletInTree = (items: BulletItemType[]): BulletItemType[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, content };
        }
        if (item.children.length > 0) {
          return {
            ...item,
            children: updateBulletInTree(item.children),
          };
        }
        return item;
      });
    };

    setBullets(updateBulletInTree(bullets));
  };

  // Add a child bullet to a parent
  const handleAddChild = (parentId: string) => {
    const addChildToParent = (items: BulletItemType[]): BulletItemType[] => {
      return items.map(item => {
        if (item.id === parentId) {
          const newChild: BulletItemType = {
            id: uuidv4(),
            content: "",
            children: [],
            level: item.level + 1,
            isCollapsed: false,
          };
          return {
            ...item,
            children: [...item.children, newChild],
            isCollapsed: false,
          };
        }
        if (item.children.length > 0) {
          return {
            ...item,
            children: addChildToParent(item.children),
          };
        }
        return item;
      });
    };

    const updatedBullets = addChildToParent(bullets);
    setBullets(updatedBullets);
    
    // Ensure the parent is not collapsed
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(parentId);
      return newSet;
    });
  };

  // Delete a bullet
  const handleDeleteBullet = (id: string) => {
    // Helper function to filter out bullet with given id
    const filterBullet = (items: BulletItemType[]): BulletItemType[] => {
      return items
        .filter(item => item.id !== id)
        .map(item => ({
          ...item,
          children: filterBullet(item.children),
        }));
    };

    setBullets(filterBullet(bullets));
  };

  // Add a new bullet after the current one
  const handleAddBulletAfter = (id: string) => {
    // Helper function to find the parent of a bullet
    const findParentId = (
      items: BulletItemType[],
      targetId: string,
      parentId: string | null = null
    ): string | null => {
      for (const item of items) {
        if (item.id === targetId) {
          return parentId;
        }
        const foundParent = findParentId(item.children, targetId, item.id);
        if (foundParent) {
          return foundParent;
        }
      }
      return null;
    };

    // Helper function to insert a new bullet after the target
    const insertBulletAfter = (
      items: BulletItemType[],
      targetId: string,
      level: number
    ): BulletItemType[] => {
      const result: BulletItemType[] = [];
      
      for (let i = 0; i < items.length; i++) {
        result.push(items[i]);
        
        if (items[i].id === targetId) {
          // Insert new bullet after this one
          const newBullet: BulletItemType = {
            id: uuidv4(),
            content: "",
            children: [],
            level,
            isCollapsed: false,
          };
          result.push(newBullet);
        }
        
        if (items[i].children.length > 0) {
          result[i] = {
            ...result[i],
            children: insertBulletAfter(items[i].children, targetId, level + 1),
          };
        }
      }
      
      return result;
    };

    // Find the level of the current bullet
    const findLevel = (
      items: BulletItemType[],
      targetId: string
    ): number | null => {
      for (const item of items) {
        if (item.id === targetId) {
          return item.level;
        }
        const foundLevel = findLevel(item.children, targetId);
        if (foundLevel !== null) {
          return foundLevel;
        }
      }
      return null;
    };

    const level = findLevel(bullets, id) ?? 0;
    const parentId = findParentId(bullets, id);

    if (parentId) {
      const updateChildrenOfParent = (
        items: BulletItemType[]
      ): BulletItemType[] => {
        return items.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: insertBulletAfter(item.children, id, level),
            };
          }
          return {
            ...item,
            children: updateChildrenOfParent(item.children),
          };
        });
      };

      setBullets(updateChildrenOfParent(bullets));
    } else {
      // Target bullet is at the root level
      setBullets(insertBulletAfter(bullets, id, level));
    }
  };

  // Toggle collapse state of a bullet
  const handleToggleCollapse = (id: string) => {
    setCollapsedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle image upload for a specific bullet
  const handleImageUpload = (bulletId: string, file: File) => {
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(file);
    const imageId = `${bulletId}-${uuidv4()}`;

    // Add the image to our images array
    setImages(prev => [
      ...prev, 
      { 
        id: imageId, 
        url: imageUrl,
        width: 300, // Default width
        height: undefined // Auto height
      }
    ]);

    toast({
      title: "Image uploaded",
      description: "Image has been added to your journal entry.",
    });
  };

  // Handle image resizing
  const handleImageResize = (imageId: string, width: number, height?: number) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === imageId 
          ? { ...img, width, height } 
          : img
      )
    );
  };

  // Add a new root-level bullet
  const addNewRootBullet = () => {
    const newBullet: BulletItemType = {
      id: uuidv4(),
      content: "",
      children: [],
      level: 0,
      isCollapsed: false,
    };
    setBullets([...bullets, newBullet]);
  };

  // Add a new collapsible section with a nested bullet
  const addCollapsibleBullet = () => {
    const parentId = uuidv4();
    const childId = uuidv4();
    
    const newParent: BulletItemType = {
      id: parentId,
      content: "New section",
      level: 0,
      isCollapsed: false,
      children: [
        {
          id: childId,
          content: "",
          level: 1,
          isCollapsed: false,
          children: [],
        }
      ]
    };
    
    setBullets([...bullets, newParent]);
    
    toast({
      title: "Collapsible section created",
      description: "You can now add content to your new section.",
    });
  };

  // Convert the bullets data to simplified JSON for save/export
  const exportToJson = () => {
    const simplifyBullet = (bullet: BulletItemType) => {
      return {
        id: bullet.id,
        content: bullet.content,
        children: bullet.children.map(simplifyBullet),
        isCollapsed: collapsedItems.has(bullet.id),
      };
    };

    const data = {
      title,
      bullets: bullets.map(simplifyBullet),
      images: images,
      timestamp: new Date().toISOString(),
    };

    // Create and trigger download
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}.json`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    toast({
      title: "Journal exported",
      description: "Your journal has been exported as JSON.",
    });
  };

  // Map the bullets with their collapse state
  const mapBulletsWithCollapseState = (items: BulletItemType[]): BulletItemType[] => {
    return items.map(item => ({
      ...item,
      isCollapsed: collapsedItems.has(item.id),
      children: mapBulletsWithCollapseState(item.children),
    }));
  };

  const displayBullets = mapBulletsWithCollapseState(bullets);

  return {
    title,
    setTitle,
    bullets: displayBullets,
    images,
    isFullscreen,
    setIsFullscreen,
    handleUpdateBullet,
    handleAddChild,
    handleDeleteBullet,
    handleAddBulletAfter,
    handleToggleCollapse,
    handleImageUpload,
    handleImageResize,
    addNewRootBullet,
    addCollapsibleBullet,
    exportToJson
  };
};
