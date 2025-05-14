
import React from "react";
import { BulletItemType, JournalImage } from "@/types/journal";

interface JournalViewProps {
  content: {
    bullets?: BulletItemType[];
    images?: JournalImage[];
  };
}

const JournalView: React.FC<JournalViewProps> = ({ content }) => {
  const bullets = content?.bullets || [];
  const images = content?.images || [];

  // Function to render bullet items recursively
  const renderBullets = (items: BulletItemType[]) => {
    return (
      <ul className="list-none">
        {items.map((bullet) => {
          // Find any images associated with this bullet
          const bulletImages = images.filter(img => img.id.startsWith(bullet.id));
          
          return (
            <li key={bullet.id} className="mb-2">
              <div className="flex items-start">
                <div className="min-w-4 mt-1.5 mr-2">
                  {bullet.children.length > 0 ? (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  )}
                </div>
                <div className="flex-grow">
                  {/* Bullet content */}
                  <div className="whitespace-pre-wrap">{bullet.content}</div>
                  
                  {/* Images associated with this bullet */}
                  {bulletImages.map(image => (
                    <div key={image.id} className="my-2">
                      <img 
                        src={image.url} 
                        alt="" 
                        style={{ 
                          width: image.width || 300,
                          height: image.height || 'auto'
                        }} 
                        className="rounded-md shadow-sm"
                      />
                    </div>
                  ))}
                  
                  {/* Render children if not collapsed */}
                  {!bullet.isCollapsed && bullet.children.length > 0 && (
                    <div className="ml-6 mt-2">
                      {renderBullets(bullet.children)}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="journal-view">
      {bullets.length > 0 ? (
        renderBullets(bullets)
      ) : (
        <div className="text-gray-500 italic">This journal is empty.</div>
      )}
    </div>
  );
};

export default JournalView;
