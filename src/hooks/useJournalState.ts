import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { generateSampleJournal } from "@/utils/journalUtils";
import { BulletItemType, JournalImage } from "@/types/journal";
import { supabase } from "@/integrations/supabase/client";

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
    
    toast({
      title: "Added new nested item",
      description: "New nested item has been added.",
      duration: 2000,
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
  const handleImageUpload = async (bulletId: string, file: File) => {
    try {
      // Show loading toast
      toast({
        title: "Uploading image...",
        description: "Please wait while we upload your image.",
      });

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }

      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${bulletId}-${uuidv4()}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('journal-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('journal-images')
        .getPublicUrl(filePath);

      // Add the image to our images array
      const imageId = `${bulletId}-${uuidv4()}`;
      setImages(prev => [
        ...prev,
        {
          id: imageId,
          url: publicUrl,
          width: 300, // Default width
          height: undefined, // Auto height
        }
      ]);

      toast({
        title: "Image uploaded",
        description: "Image has been added to your journal entry.",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    }
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

  // Add a collapsible section
  const addCollapsibleBullet = (parentId?: string) => {
    const newParentId = uuidv4();
    const childId = uuidv4();
    
    if (!parentId) {
      const newSection: BulletItemType = {
        id: newParentId,
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
      
      setBullets([...bullets, newSection]);
    } else {
      const findBulletInfo = (
        items: BulletItemType[],
        targetId: string,
        parentPath: string[] = []
      ): { level: number; parentPath: string[] } | null => {
        for (const item of items) {
          if (item.id === targetId) {
            return { level: item.level, parentPath };
          }
          
          const result = findBulletInfo(item.children, targetId, [...parentPath, item.id]);
          if (result) {
            return result;
          }
        }
        return null;
      };
      
      const bulletInfo = findBulletInfo(bullets, parentId);
      
      if (bulletInfo && bulletInfo.parentPath.length > 0) {
        const immediateParentId = bulletInfo.parentPath[bulletInfo.parentPath.length - 1];
        
        const nestedSection: BulletItemType = {
          id: newParentId,
          content: "New section",
          level: bulletInfo.level,
          isCollapsed: false,
          children: [
            {
              id: childId,
              content: "",
              level: bulletInfo.level + 1,
              isCollapsed: false,
              children: [],
            }
          ]
        };
        
        const addSiblingToParent = (
          items: BulletItemType[],
          targetParentId: string,
          targetId: string,
          newSection: BulletItemType
        ): BulletItemType[] => {
          return items.map(item => {
            if (item.id === targetParentId) {
              const targetIndex = item.children.findIndex(child => child.id === targetId);
              
              if (targetIndex !== -1) {
                const newChildren = [...item.children];
                newChildren.splice(targetIndex + 1, 0, newSection);
                
                return {
                  ...item,
                  children: newChildren,
                  isCollapsed: false
                };
              }
            }
            
            if (item.children.length > 0) {
              return {
                ...item,
                children: addSiblingToParent(item.children, targetParentId, targetId, newSection)
              };
            }
            
            return item;
          });
        };
        
        setBullets(addSiblingToParent(bullets, immediateParentId, parentId, nestedSection));
      } else {
        const addNestedSectionToParent = (items: BulletItemType[]): BulletItemType[] => {
          return items.map(item => {
            if (item.id === parentId) {
              const nestedSectionLevel = item.level + 1;
              const nestedSection: BulletItemType = {
                id: newParentId,
                content: "New section",
                level: nestedSectionLevel,
                isCollapsed: false,
                children: [
                  {
                    id: childId,
                    content: "",
                    level: nestedSectionLevel + 1,
                    isCollapsed: false,
                    children: [],
                  }
                ]
              };
              
              return {
                ...item,
                children: [...item.children, nestedSection],
                isCollapsed: false
              };
            }
            
            if (item.children.length > 0) {
              return {
                ...item,
                children: addNestedSectionToParent(item.children)
              };
            }
            
            return item;
          });
        };

        setBullets(addNestedSectionToParent(bullets));
      }
      
      setCollapsedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });
    }
    
    toast({
      title: "Collapsible section created",
      description: "You can now add content to your new section.",
      duration: 2000,
    });
  };

  // Export functions
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

  const exportToOPML = () => {
    const buildOutline = (bullet: BulletItemType): string => {
      let outlineContent = `<outline text="${escapeXml(bullet.content)}"`;
      
      if (bullet.children.length > 0) {
        outlineContent += `>\n`;
        bullet.children.forEach(child => {
          outlineContent += buildOutline(child);
        });
        outlineContent += `</outline>\n`;
      } else {
        outlineContent += `/>\n`;
      }
      
      return outlineContent;
    };

    const escapeXml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(title)}</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
  </head>
  <body>
${bullets.map(buildOutline).join('')}
  </body>
</opml>`;

    const dataUri = `data:text/xml;charset=utf-8,${encodeURIComponent(opmlContent)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}.opml`);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);

    toast({
      title: "Journal exported",
      description: "Your journal has been exported as OPML.",
    });
  };

  // Save journal to Supabase
  const saveJournal = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to save your journal.",
          variant: "destructive"
        });
        return;
      }
      
      const simpleBullets = bullets.map(bullet => ({
        id: bullet.id,
        content: bullet.content,
        children: bullet.children,
        isCollapsed: collapsedItems.has(bullet.id)
      }));

      const simpleImages = images.map(img => ({
        id: img.id,
        url: img.url,
        width: img.width,
        height: img.height
      }));

      const contentObject = {
        bullets: simpleBullets,
        images: simpleImages
      };
      
      const { error } = await supabase
        .from('journals')
        .insert({
          title,
          content: contentObject,
          user_id: session.user.id
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Journal saved",
        description: "Your journal has been saved successfully.",
      });
      
    } catch (error) {
      console.error("Error saving journal:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your journal.",
        variant: "destructive"
      });
    }
  };

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
    exportToJson,
    exportToOPML,
    saveJournal
  };
};