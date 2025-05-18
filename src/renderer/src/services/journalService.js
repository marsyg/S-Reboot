// Remove the direct require
// const { ipcRenderer } = window.require('electron');

export const journalService = {
  // Create a new journal entry
  createJournal: async (journal) => {
    try {
      console.log('=== Creating Journal ===');
      console.log('Journal data:', journal);
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC Renderer not available');
      }
      const result = await window.electron.ipcRenderer.invoke('create-journal', journal);
      console.log('Journal created:', result);
      return result;
    } catch (error) {
      console.error('Error creating journal:', error);
      throw error;
    }
  },

  // Get all journals
  getAllJournals: async () => {
    try {
      console.log('=== Getting All Journals ===');
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC Renderer not available');
      }
      const journals = await window.electron.ipcRenderer.invoke('get-all-journals');
      console.log('Journals retrieved:', journals);
      return journals;
    } catch (error) {
      console.error('Error getting all journals:', error);
      throw error;
    }
  },

  // Get a single journal by ID
  getJournal: async (id) => {
    try {
      console.log('=== Getting Journal ===');
      console.log('Journal ID:', id);
      
      // Ensure we're in an Electron context
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC Renderer not available');
      }

      const journal = await window.electron.ipcRenderer.invoke('get-journal', id);
      console.log('Journal retrieved:', journal);
      
      if (!journal) {
        console.error('No journal found with ID:', id);
        return null;
      }

      // Ensure the content is properly parsed
      if (journal.content && typeof journal.content === 'string') {
        try {
          journal.content = JSON.parse(journal.content);
        } catch (e) {
          console.error('Error parsing journal content:', e);
          console.error('Raw content:', journal.content);
          // Return a default structure if parsing fails
          journal.content = {
            bullets: [],
            images: []
          };
        }
      }

      return journal;
    } catch (error) {
      console.error('Error getting journal:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        journalId: id
      });
      throw error;
    }
  },

  // Update a journal
  updateJournal: async (journal) => {
    try {
      console.log('=== Updating Journal ===');
      console.log('Journal data:', journal);
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC Renderer not available');
      }
      const result = await window.electron.ipcRenderer.invoke('update-journal', journal);
      console.log('Journal updated:', result);
      return result;
    } catch (error) {
      console.error('Error updating journal:', error);
      throw error;
    }
  },

  // Delete a journal
  deleteJournal: async (id) => {
    try {
      console.log('=== Deleting Journal ===');
      console.log('Journal ID:', id);
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC Renderer not available');
      }
      const result = await window.electron.ipcRenderer.invoke('delete-journal', id);
      console.log('Journal deleted:', result);
      return result;
    } catch (error) {
      console.error('Error deleting journal:', error);
      throw error;
    }
  },

  // Auto-save journal
  autoSaveJournal: async (journal) => {
    try {
      console.log('=== Auto-saving Journal ===');
      console.log('Journal data:', journal);
      if (!window.electron?.ipcRenderer) {
        throw new Error('IPC Renderer not available');
      }
      const result = await window.electron.ipcRenderer.invoke('auto-save-journal', journal);
      console.log('Journal auto-saved:', result);
      return result;
    } catch (error) {
      console.error('Error auto-saving journal:', error);
      throw error;
    }
  }
}; 