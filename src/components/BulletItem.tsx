
import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChevronDown, ChevronRight, Image, Bold, Italic, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import ContentEditable from "react-contenteditable";
import { JournalImage } from "@/types/journal";

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
  onImageResize
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Image resize related state
  const [resizingImage, setResizingImage] = useState<string | null>(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  
  const handleChange = (e: React.FormEvent<HTMLElement>) => {
    onUpdate(id, e.currentTarget.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddBulletAfter(id);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!e.shiftKey) {
        onAddChild(id);
      }
    } else if (e.key === "Backspace" && content === "") {
      e.preventDefault();
      onDelete(id);
    }
  };

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

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(id, e.target.files[0]);
    }
  };

  const toggleBold = () => {
    document.execCommand('bold', false);
  };

  const toggleItalic = () => {
    document.execCommand('italic', false);
  };

  const toggleUnderline = () => {
    document.execCommand('underline', false);
  };

  // Image resize handlers
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
      
      // Calculate new dimensions based on mouse movement
      const deltaX = e.clientX - initialMousePos.x;
      const newWidth = Math.max(50, initialSize.width + deltaX);
      
      // Optional: maintain aspect ratio
      // const aspectRatio = initialSize.height / initialSize.width;
      // const newHeight = newWidth * aspectRatio;
      
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

  return (
    <div className="bullet-item relative animate-fade-in">
      <div className={cn(
        "flex items-start group transition-all",
        isDraggingImage && "bg-blue-50 rounded-md"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
        <div className="flex items-center mr-1 mt-1.5">
          {children.length > 0 ? (
            <div 
              className="cursor-pointer hover:bg-gray-200 rounded p-0.5 transition-colors"
              onClick={() => onToggleCollapse(id)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-journal-bulletCollapsed" />
              ) : (
                <ChevronDown className="h-4 w-4 text-journal-bullet" />
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
            <div 
              className={cn(
                "invisible absolute -top-8 left-0 bg-white border rounded shadow-sm p-1 flex space-x-1 group-hover:visible",
                isEditing && "visible"
              )}
            >
              <button onClick={toggleBold} className="p-1 hover:bg-gray-100 rounded">
                <Bold className="h-4 w-4" />
              </button>
              <button onClick={toggleItalic} className="p-1 hover:bg-gray-100 rounded">
                <Italic className="h-4 w-4" />
              </button>
              <button onClick={toggleUnderline} className="p-1 hover:bg-gray-100 rounded">
                <Underline className="h-4 w-4" />
              </button>
              <button onClick={handleImageUpload} className="p-1 hover:bg-gray-100 rounded">
                <Image className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
            
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
          </div>
          
          {/* Display images attached to this bullet */}
          <div className="ml-2 mt-1 flex flex-wrap gap-2">
            {images
              .filter(img => img.id.startsWith(id + "-"))
              .map((img) => (
                <div 
                  key={img.id} 
                  className={cn(
                    "relative group inline-block",
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
                    className="max-w-full rounded border border-gray-200" 
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black bg-opacity-20 transition-opacity flex items-center justify-center">
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
          
          {!isCollapsed && children.length > 0 && (
            <div className="ml-5 border-l border-gray-200 pl-2">
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
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulletItem;
