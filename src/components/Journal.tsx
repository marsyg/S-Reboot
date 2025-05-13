
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
    isPublished,
    isSaving,
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
    saveJournal,
    deleteJournal
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
          onImageResize={handleImageResize}
          onAddNewRootBullet={addNewRootBullet}
          onAddCollapsibleBullet={addCollapsibleBullet}
          images={images}
          setIsFullscreen={setIsFullscreen}
          onExport={exportToJson}
          onExportOPML={exportToOPML}
          onPublish={saveJournal}
          isPublished={isPublished}
          isSaving={isSaving}
          onDeleteJournal={deleteJournal}
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
          onImageResize={handleImageResize}
          onAddNewRootBullet={addNewRootBullet}
          onAddCollapsibleBullet={addCollapsibleBullet}
          images={images}
          setIsFullscreen={setIsFullscreen}
          onExport={exportToJson}
          onExportOPML={exportToOPML}
          onPublish={saveJournal}
          isPublished={isPublished}
          isSaving={isSaving}
          onDeleteJournal={deleteJournal}
        />
      </Dialog>
    </>
  );
};

export default Journal;
