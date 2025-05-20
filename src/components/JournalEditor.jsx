import React, { useState, useEffect } from 'react';
import { journalService } from '../services/journalService';

const JournalEditor = () => {
  const [journals, setJournals] = useState([]);
  const [currentJournal, setCurrentJournal] = useState({
    title: '',
    content: ''
  });

  // Load all journals on component mount
  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    try {
      const allJournals = await journalService.getAllJournals();
      setJournals(allJournals);
    } catch (error) {
      console.error('Failed to load journals:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (currentJournal.id) {
        // Update existing journal
        await journalService.updateJournal(currentJournal);
      } else {
        // Create new journal
        await journalService.createJournal(currentJournal);
      }
      // Reload journals after save
      await loadJournals();
      // Clear current journal
      setCurrentJournal({ title: '', content: '' });
    } catch (error) {
      console.error('Failed to save journal:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await journalService.deleteJournal(id);
      await loadJournals();
    } catch (error) {
      console.error('Failed to delete journal:', error);
    }
  };

  const handleEdit = (journal) => {
    setCurrentJournal(journal);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={currentJournal.title}
          onChange={(e) => setCurrentJournal({ ...currentJournal, title: e.target.value })}
          placeholder="Journal Title"
          className="w-full p-2 border rounded mb-2"
        />
        <textarea
          value={currentJournal.content}
          onChange={(e) => setCurrentJournal({ ...currentJournal, content: e.target.value })}
          placeholder="Write your journal entry..."
          className="w-full p-2 border rounded h-40"
        />
        <button
          onClick={handleSave}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {currentJournal.id ? 'Update' : 'Save'} Journal
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Your Journals</h2>
        <div className="space-y-4">
          {journals.map((journal) => (
            <div key={journal.id} className="border p-4 rounded">
              <h3 className="text-lg font-semibold">{journal.title}</h3>
              <p className="mt-2">{journal.content}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleEdit(journal)}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(journal.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalEditor; 