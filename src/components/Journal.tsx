
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import JournalCard from "./journal/JournalCard";
import JournalFullscreen from "./journal/JournalFullscreen";
import { useJournalState } from "@/hooks/useJournalState";
import { JournalProps } from "@/types/journal";

interface EditorAccessProps {
  children: React.ReactNode;
}

const EditorAccess: React.FC<EditorAccessProps> = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "EDITOR") {
      setIsAuthorized(true);
      setShowPasswordModal(false);
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Editor Access Required</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enter Editor Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="Enter password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Access Editor
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
};

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
    <EditorAccess>
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
    </EditorAccess>
  );
};

export default Journal;
