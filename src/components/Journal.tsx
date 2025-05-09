
import React from "react";
import { Dialog } from "@/components/ui/dialog";
import JournalCard from "./journal/JournalCard";
import JournalFullscreen from "./journal/JournalFullscreen";
import { useJournalState } from "@/hooks/useJournalState";
import { JournalProps } from "@/types/journal";

const Journal: React.FC<JournalProps> = ({ initialTitle = "My Journal" }) => {
  const {
    title,
    setTitle,
    bullets,
    images,
    isFullscreen,
    setIsFullscreen,
    handleUpdateBullet,
    handleAddChild,
    handleDeleteBullet,
    handleAddBulletAfter,
    handleToggleCollapse,
    handleImageUpload,
    addNewRootBullet,
    exportToJson
  } = useJournalState(initialTitle);

  return (
    <>
      {/* Regular card view */}
      {!isFullscreen && (
        <JournalCard
          title={title}
          setTitle={setTitle}
          bullets={bullets}
          onUpdate={handleUpdateBullet}
          onAddChild={handleAddChild}
          onDelete={handleDeleteBullet}
          onAddBulletAfter={handleAddBulletAfter}
          onToggleCollapse={handleToggleCollapse}
          onImageUpload={handleImageUpload}
          onAddNewRootBullet={addNewRootBullet}
          images={images}
          setIsFullscreen={setIsFullscreen}
        />
      )}

      {/* Fullscreen dialog mode */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <JournalFullscreen
          title={title}
          setTitle={setTitle}
          bullets={bullets}
          onUpdate={handleUpdateBullet}
          onAddChild={handleAddChild}
          onDelete={handleDeleteBullet}
          onAddBulletAfter={handleAddBulletAfter}
          onToggleCollapse={handleToggleCollapse}
          onImageUpload={handleImageUpload}
          onAddNewRootBullet={addNewRootBullet}
          images={images}
          setIsFullscreen={setIsFullscreen}
          onExport={exportToJson}
        />
      </Dialog>
    </>
  );
};

export default Journal;
