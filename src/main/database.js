const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// Get the user data directory for storing the database
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'journals.db');

// Initialize database with error handling
let db = null;

function initializeDatabase() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    // Check if database file exists
    const dbExists = fs.existsSync(dbPath);
    
    // Initialize database
    db = new Database(dbPath);
    console.log('Database initialized at:', dbPath);

    // Create journals table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS journals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_published BOOLEAN DEFAULT 0
      )
    `);
    console.log('Journals table created or already exists');

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      dbPath,
      userDataPath
    });
    return false;
  }
}

// Database operations with error handling
const journalOperations = {
  // Initialize database
  initialize: () => {
    if (!db) {
      return initializeDatabase();
    }
    return true;
  },

  // Create a new journal entry
  createJournal: (journal) => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    try {
      console.log('Database: Creating journal:', journal);
      const stmt = db.prepare(`
        INSERT INTO journals (id, title, content)
        VALUES (@id, @title, @content)
      `);
      const result = stmt.run(journal);
      console.log('Database: Journal created successfully:', result);
      return result;
    } catch (error) {
      console.error('Database: Error creating journal:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  },

  // Get all journals
  getAllJournals: () => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    try {
      console.log('Database: Getting all journals');
      const stmt = db.prepare('SELECT * FROM journals ORDER BY updated_at DESC');
      const journals = stmt.all();
      console.log('Database: Retrieved journals:', journals);
      return journals;
    } catch (error) {
      console.error('Database: Error getting all journals:', error);
      throw error;
    }
  },

  // Get a single journal by ID
  getJournalById: (id) => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare('SELECT * FROM journals WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('Error getting journal by ID:', error);
      throw error;
    }
  },

  // Update a journal
  updateJournal: (journal) => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare(`
        UPDATE journals 
        SET title = @title, 
            content = @content, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `);
      return stmt.run(journal);
    } catch (error) {
      console.error('Error updating journal:', error);
      throw error;
    }
  },

  // Delete a journal
  deleteJournal: (id) => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    try {
      const stmt = db.prepare('DELETE FROM journals WHERE id = ?');
      return stmt.run(id);
    } catch (error) {
      console.error('Error deleting journal:', error);
      throw error;
    }
  },

  // Auto-save journal
  autoSaveJournal: (journal) => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    try {
      console.log('Database: Auto-saving journal:', journal);
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO journals (id, title, content, updated_at)
        VALUES (@id, @title, @content, datetime('now'))
      `);
      const result = stmt.run(journal);
      console.log('Database: Journal auto-saved:', result);
      return result;
    } catch (error) {
      console.error('Database: Error auto-saving journal:', error);
      throw error;
    }
  }
};

export default journalOperations; 