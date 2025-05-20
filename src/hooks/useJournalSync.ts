import { useEffect, useState } from 'react';
import { useOnlineStatus } from './useOnline';
import { supabase } from '../integrations/supabase/client';

interface SyncStatus {
  isOnline: boolean;
  isAuthenticated: boolean;
  lastSynced: Date | null;
  pendingChanges: boolean;
}

export function useJournalSync() {
  const isOnline = useOnlineStatus();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Check authentication status and listen for changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle offline storage
  const saveOffline = async (journalData: any) => {
    try {
      await window.electron.ipcRenderer.invoke('save-offline-journal', journalData);
      setPendingChanges(true);
    } catch (error) {
      console.error('Error saving offline:', error);
    }
  };

  // Handle sync when coming back online
  const syncJournal = async (journalData: any) => {
    if (!isOnline || !isAuthenticated) {
      await saveOffline(journalData);
      return;
    }

    try {
      await window.electron.ipcRenderer.invoke('sync-journal', journalData);
      setLastSynced(new Date());
      setPendingChanges(false);
    } catch (error) {
      console.error('Error syncing journal:', error);
      await saveOffline(journalData);
    }
  };

  return {
    isOnline,
    isAuthenticated,
    lastSynced,
    pendingChanges,
    saveOffline,
    syncJournal
  };
} 