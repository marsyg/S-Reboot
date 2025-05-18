import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronDown, ChevronRight, Image, Bold, Italic, Underline, ListTree, X, Maximize } from "lucide-react";
import { cn } from "../lib/utils";
import ContentEditable from "react-contenteditable";
import { JournalImage } from "../types/journal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { Dialog, DialogContent } from "../components/ui/dialog";

export interface BulletItemProps {
  id: string;
  content: string;
  children: BulletItemProps[];
  level: number;
  onUpdate: (id: string, content: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onAddBulletAfter: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  isCollapsed: boolean;
  onImageUpload: (id: string, file: File) => void;
  images: JournalImage[];
  onImageResize?: (imageId: string, width: number, height?: number) => void;
  onAddCollapsibleBullet?: (parentId: string) => void;
}

const BulletItem: React.FC<BulletItemProps> = ({
  id,
  content,
  children,
  level,
  onUpdate,
  onAddChild,
  onDelete,
  onAddBulletAfter,
  onToggleCollapse,
  isCollapsed,
  onImageUpload,
  images,
  onImageResize,
  onAddCollapsibleBullet
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image resize related state
  const [resizingImage, setResizingImage] = useState<string | null>(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  
  const [showControls, setShowControls] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<'left' | 'right' | 'center'>('center');

  const handleChange = (e: React.FormEvent<HTMLElement>) => {
    const newContent = e.currentTarget.innerHTML;
    // Only update if content actually changed
    if (newContent !== content) {
      onUpdate(id, newContent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && previewImage) {
      e.preventDefault();
      setPreviewImage(null);
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Save current content before adding new bullet
      const currentContent = contentRef.current?.innerHTML || '';
      
      // Only update if content changed
      if (currentContent !== content) {
        onUpdate(id, currentContent);
      }
      
      // Add a small delay to ensure the content is saved before adding the new bullet
      requestAnimationFrame(() => {
        onAddBulletAfter(id);
      });
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      // Save current content before adding new bullet
      const currentContent = contentRef.current?.innerHTML || '';
      
      // Only update if content changed
      if (currentContent !== content) {
        onUpdate(id, currentContent);
      }
      
      // Add a small delay to ensure the content is saved before adding the new bullet
      requestAnimationFrame(() => {
        onAddBulletAfter(id);
      });
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!e.shiftKey) {
        onAddChild(id);
      }
    } else if (e.key === "Backspace") {
      // Add a small delay to ensure content state is updated
      requestAnimationFrame(() => {
        if (contentRef.current?.innerHTML === "") {
          e.preventDefault();
          onDelete(id);
        }
      });
    }
  };

  // Global keyboard listener for ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewImage) {
        setPreviewImage(null);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [previewImage]);

  // Add effect to handle content updates
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== content) {
      contentRef.current.innerHTML = content;
    }
  }, [content]);

  // Add effect to handle focus and blur
  useEffect(() => {
    const handleBlur = () => {
      setIsEditing(false);
      // Save content on blur
      if (contentRef.current) {
        const currentContent = contentRef.current.innerHTML;
        if (currentContent !== content) {
          onUpdate(id, currentContent);
        }
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('blur', handleBlur);
      return () => {
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [id, content, onUpdate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleDragLeave = () => {
    setIsDraggingImage(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        onImageUpload(id, file);
      }
    }
  };

  const handleImageUpload = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default to avoid losing focus
    e.stopPropagation(); // Stop event from bubbling up
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(id, e.target.files[0]);
      e.target.value = ''; // Reset the input to allow selecting the same file again
    }
  };

  const handleAddCollapsibleSection = () => {
    if (onAddCollapsibleBullet) {
      onAddCollapsibleBullet(id);
    }
  };

  const toggleBold = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand('bold', false);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const toggleItalic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand('italic', false);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const toggleUnderline = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.execCommand('underline', false);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const cycleImagePosition = (imageId: string) => {
    setImagePosition(prev => {
      const newPosition = prev === 'left' ? 'center' : prev === 'center' ? 'right' : 'left';
      return newPosition;
    });
  };

  const startResizing = (imageId: string, e: React.MouseEvent, width: number, height?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingImage(imageId);
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setInitialSize({ width, height: height || width });
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', stopResizing);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (resizingImage && onImageResize) {
      e.preventDefault();
      
      const deltaX = e.clientX - initialMousePos.x;
      const newWidth = Math.max(50, initialSize.width + deltaX);
      
      onImageResize(resizingImage, newWidth);
    }
  };
  
  const stopResizing = () => {
    setResizingImage(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [resizingImage]);

  // Filter images that belong to this bullet item
  const bulletImages = images.filter(img => img.id.startsWith(id + "-"));

  return (
    <div 
      className="bullet-item relative animate-fade-in" 
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div 
        className={cn(
          "flex items-start group transition-all",
          isDraggingImage && "bg-blue-50 rounded-md"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center mr-1 mt-1.5">
          {children.length > 0 ? (
            <div 
              className="cursor-pointer hover:bg-gray-200 rounded p-0.5 transition-colors"
              onClick={() => onToggleCollapse(id)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-journal-bulletCollapsed animate-fade-in" />
              ) : (
                <ChevronDown className="h-4 w-4 text-journal-bullet animate-fade-in" />
              )}
            </div>
          ) : (
            <div className="w-5 flex justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-journal-bullet mt-1"></div>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="relative">
            {/* Text formatting toolbar - only visible when this specific bullet is being edited */}
            {isEditing && (
              <div 
                className="absolute -top-8 left-0 bg-white border rounded-md shadow-sm p-1.5 flex space-x-1.5 z-10 animate-fade-in"
                style={{ transform: "translateY(-4px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={toggleBold} 
                  className="p-1 hover:bg-gray-100 rounded"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button 
                  onClick={toggleItalic} 
                  className="p-1 hover:bg-gray-100 rounded"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button 
                  onClick={toggleUnderline} 
                  className="p-1 hover:bg-gray-100 rounded"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Underline className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleImageUpload} 
                  className="p-1 hover:bg-gray-100 rounded"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Image className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <ContentEditable
              innerRef={contentRef}
              html={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsEditing(true)}
              onBlur={() => setIsEditing(false)}
              className="outline-none py-1 min-h-[1.5rem] break-words"
              tagName="div"
            />

            {/* File input hidden element */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Add collapsible section button - appears only on hover of this specific bullet */}
            {showControls && onAddCollapsibleBullet && (
              <div 
                className="absolute -right-8 top-0 flex gap-1.5 animate-fade-in"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={handleAddCollapsibleSection} 
                      className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label="Add collapsible section"
                    >
                      <ListTree className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">Add nested section</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
          
          {/* Display images attached to this bullet */}
          {bulletImages.length > 0 && (
            <div className={`mt-3 ${imagePosition === 'left' ? 'float-left mr-4' : imagePosition === 'right' ? 'float-right ml-4' : 'flex justify-center'}`}>
              {bulletImages.map((img) => (
                <div 
                  key={img.id} 
                  className={cn(
                    "relative group inline-block mb-2",
                    resizingImage === img.id && "ring-2 ring-blue-500"
                  )}
                  style={{
                    width: img.width || 200,
                    height: img.height || 'auto',
                    marginTop: img.top || 0,
                    marginLeft: img.left || 0
                  }}
                >
                  <img 
                    src={img.url} 
                    className="max-w-full rounded-md border border-gray-200 shadow-sm cursor-pointer animate-fade-in hover:shadow-md transition-shadow" 
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                    onClick={() => setPreviewImage(img.url)}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 transition-opacity flex items-center justify-center rounded-md">
                    {/* Image controls */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        className="bg-white p-1.5 rounded-full shadow hover:bg-gray-100 transition-colors"
                        onClick={() => setPreviewImage(img.url)}
                      >
                        <Maximize className="h-3.5 w-3.5 text-gray-700" />
                      </button>
                      <button
                        className="bg-white p-1.5 rounded-full shadow hover:bg-gray-100 transition-colors"
                        onClick={() => cycleImagePosition(img.id)}
                      >
                        <svg className="h-3.5 w-3.5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d={imagePosition === 'left' ? "M9 12h9M9 16h9" : imagePosition === 'right' ? "M6 12h9M6 16h9" : "M6 12h12M6 16h12"} />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Resize handle */}
                    <div 
                      className="absolute bottom-0 right-0 w-5 h-5 bg-white border border-gray-300 rounded-tl cursor-se-resize flex items-center justify-center"
                      onMouseDown={(e) => startResizing(img.id, e, img.width, img.height)}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 7L1 1M7 1L1 7" stroke="#666" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Improved multilevel collapsible sections implementation */}
          {children.length > 0 && (
            <Collapsible
              open={!isCollapsed}
              className="ml-5 mt-1 animate-fade-in"
            >
              <CollapsibleContent className="border-l border-gray-200 pl-2 animate-accordion-down">
                {children.map((child) => (
                  <BulletItem
                    key={child.id}
                    {...child}
                    level={level + 1}
                    onUpdate={onUpdate}
                    onAddChild={onAddChild}
                    onDelete={onDelete}
                    onAddBulletAfter={onAddBulletAfter}
                    onToggleCollapse={onToggleCollapse}
                    onImageUpload={onImageUpload}
                    images={images}
                    onImageResize={onImageResize}
                    onAddCollapsibleBullet={onAddCollapsibleBullet}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Image fullscreen dialog */}
          <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
            <DialogContent className="max-w-[90vw] p-0 bg-black bg-opacity-90 border-none overflow-hidden">
              <div className="relative flex items-center justify-center h-screen max-h-[90vh]">
                {previewImage && (
                  <img 
                    src={previewImage} 
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                )}
                <button
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-70">
                  Press ESC to close
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default BulletItem;
