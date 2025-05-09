
import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import BulletItem, { BulletItemProps } from "./BulletItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface JournalProps {
  initialTitle?: string;
}

// A function to generate a sample journal structure
const generateSampleJournal = () => {
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

const Journal: React.FC<JournalProps> = ({ initialTitle = "My Journal" }) => {
  const [title, setTitle] = useState(initialTitle);
  const [bullets, setBullets] = useState<BulletItemProps[]>(generateSampleJournal());
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [images, setImages] = useState<{id: string, url: string, width?: number, height?: number, top?: number, left?: number}[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  // Update a bullet's content
  const handleUpdateBullet = (id: string, content: string) => {
    const updateBulletInTree = (items: BulletItemProps[]): BulletItemProps[] => {
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
    const addChildToParent = (items: BulletItemProps[]): BulletItemProps[] => {
      return items.map(item => {
        if (item.id === parentId) {
          const newChild = {
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
    const filterBullet = (items: BulletItemProps[]): BulletItemProps[] => {
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
      items: BulletItemProps[],
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
      items: BulletItemProps[],
      targetId: string,
      level: number
    ): BulletItemProps[] => {
      const result: BulletItemProps[] = [];
      
      for (let i = 0; i < items.length; i++) {
        result.push(items[i]);
        
        if (items[i].id === targetId) {
          // Insert new bullet after this one
          result.push({
            id: uuidv4(),
            content: "",
            children: [],
            level,
            isCollapsed: false,
          });
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
      items: BulletItemProps[],
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
        items: BulletItemProps[]
      ): BulletItemProps[] => {
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

  // Add a new root-level bullet
  const addNewRootBullet = () => {
    const newBullet = {
      id: uuidv4(),
      content: "",
      children: [],
      level: 0,
      isCollapsed: false,
    };
    setBullets([...bullets, newBullet]);
  };

  // Convert the bullets data to simplified JSON for save/export
  const exportToJson = () => {
    const simplifyBullet = (bullet: BulletItemProps) => {
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
  const mapBulletsWithCollapseState = (items: BulletItemProps[]): BulletItemProps[] => {
    return items.map(item => ({
      ...item,
      isCollapsed: collapsedItems.has(item.id),
      children: mapBulletsWithCollapseState(item.children),
    }));
  };

  const displayBullets = mapBulletsWithCollapseState(bullets);

  return (
    <>
      {/* Regular card view */}
      {!isFullscreen && (
        <Card className="w-full max-w-4xl mx-auto shadow-md animate-fade-in">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 p-1 text-xl font-semibold"
                  placeholder="Journal Title"
                />
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    onClick={() => setIsFullscreen(true)}
                  >
                    Open Full Editor
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="journal-content min-h-[300px] p-4 bg-journal-background rounded">
              {displayBullets.map((bullet) => (
                <BulletItem
                  key={bullet.id}
                  {...bullet}
                  onUpdate={handleUpdateBullet}
                  onAddChild={handleAddChild}
                  onDelete={handleDeleteBullet}
                  onAddBulletAfter={handleAddBulletAfter}
                  onToggleCollapse={handleToggleCollapse}
                  onImageUpload={handleImageUpload}
                  images={images}
                />
              ))}
              <Button 
                variant="ghost"
                size="sm" 
                className="mt-2 text-gray-500 hover:text-gray-700"
                onClick={addNewRootBullet}
              >
                + Add new item
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen dialog mode */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <DialogTitle>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="bg-transparent focus:outline-none border-b border-transparent focus:border-gray-300 p-1 text-2xl font-semibold"
                  placeholder="Journal Title"
                />
              </DialogTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToJson}
                >
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFullscreen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            <div className="journal-content bg-journal-background p-6 rounded-lg shadow-sm min-h-full max-w-4xl mx-auto">
              {displayBullets.map((bullet) => (
                <BulletItem
                  key={bullet.id}
                  {...bullet}
                  onUpdate={handleUpdateBullet}
                  onAddChild={handleAddChild}
                  onDelete={handleDeleteBullet}
                  onAddBulletAfter={handleAddBulletAfter}
                  onToggleCollapse={handleToggleCollapse}
                  onImageUpload={handleImageUpload}
                  images={images}
                />
              ))}
              <Button 
                variant="ghost"
                size="sm" 
                className="mt-4 text-gray-500 hover:text-gray-700"
                onClick={addNewRootBullet}
              >
                + Add new item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Journal;
