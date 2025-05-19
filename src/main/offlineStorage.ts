import { ipcMain } from 'electron';
import journalOperations from './database';

// Handle saving journal data offline
ipcMain.handle('save-offline-journal', async (event, journalData) => {
  try {
    // Use the existing autoSaveJournal function which handles both insert and update
    await journalOperations.autoSaveJournal({
      ...journalData,
      is_published: false // Mark as unpublished when saving offline
    });
    return true;
  } catch (error) {
    console.error('Error saving offline journal:', error);
    throw error;
  }
});

// Handle syncing journal data
ipcMain.handle('sync-journal', async (event, journalData) => {
  try {
    // Update the journal in the database
    await journalOperations.updateJournal({
      ...journalData,
      is_published: true // Mark as published when syncing
    });
    return true;
  } catch (error) {
    console.error('Error syncing journal:', error);
    throw error;
  }
});

// Handle checking auth status
ipcMain.handle('check-auth-status', async () => {
  try {
    // TODO: Implement your actual auth check logic here
    // This could involve checking tokens, etc.
    return true; // For now, always return true
  } catch (error) {
    console.error('Error checking auth status:', error);
    return false;
  }
});

// Handle getting offline journals
ipcMain.handle('get-offline-journals', async () => {
  try {
    const journals = await journalOperations.getAllJournals();
    return journals.filter(journal => !journal.is_published);
  } catch (error) {
    console.error('Error getting offline journals:', error);
    throw error;
  }
});

// Handle clearing offline journals
ipcMain.handle('clear-offline-journals', async () => {
  try {
    // Get all unpublished journals
    const offlineJournals = await journalOperations.getAllJournals();
    const unpublishedJournals = offlineJournals.filter(journal => !journal.is_published);
    
    // Delete each unpublished journal
    for (const journal of unpublishedJournals) {
      await journalOperations.deleteJournal(journal.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing offline journals:', error);
    throw error;
  }
}); 