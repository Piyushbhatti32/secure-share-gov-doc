// Document service with localStorage persistence
class DocumentService {
  constructor() {
    this.storageKey = 'secure-docs-documents';
    this.isBrowser = typeof window !== 'undefined';
    this.documents = [];
    if (this.isBrowser) {
      this.documents = this.loadDocuments();
    }
  }

  loadDocuments() {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading documents from localStorage:', error);
      return [];
    }
  }

  saveDocuments() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.documents));
    } catch (error) {
      console.error('Error saving documents to localStorage:', error);
    }
  }

  async getDocuments() {
    if (this.isBrowser) {
      // Try API first, fallback to localStorage
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const result = await response.json();
          const docs = result.documents;
          if (Array.isArray(docs)) {
            this.documents = docs;
          } else if (docs && typeof docs === 'object') {
            const owned = Array.isArray(docs.owned) ? docs.owned : [];
            const shared = Array.isArray(docs.shared) ? docs.shared : [];
            const byId = new Map();
            [...owned, ...shared].forEach(d => {
              if (d && d.id && !byId.has(d.id)) byId.set(d.id, d);
            });
            this.documents = Array.from(byId.values());
          } else {
            this.documents = [];
          }
          this.saveDocuments();
          return this.documents;
        }
      } catch (error) {
        // Fallback to localStorage
        return this.documents;
      }
      return this.documents;
    } else {
      // On server, only use API
      try {
        const response = await fetch('http://localhost:3000/api/documents');
        if (response.ok) {
          const result = await response.json();
          const docs = result.documents;
          if (Array.isArray(docs)) return docs;
          if (docs && typeof docs === 'object') {
            const owned = Array.isArray(docs.owned) ? docs.owned : [];
            const shared = Array.isArray(docs.shared) ? docs.shared : [];
            const byId = new Map();
            [...owned, ...shared].forEach(d => {
              if (d && d.id && !byId.has(d.id)) byId.set(d.id, d);
            });
            return Array.from(byId.values());
          }
          return [];
        }
      } catch (error) {
        return [];
      }
      return [];
    }
  }

  async getDocument(id) {
    if (this.isBrowser) {
      // Try API first, fallback to localStorage
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const result = await response.json();
          const docs = result.documents;
          if (Array.isArray(docs)) {
            return docs.find(doc => doc.id === id) || null;
          } else if (docs && typeof docs === 'object') {
            const owned = Array.isArray(docs.owned) ? docs.owned : [];
            const shared = Array.isArray(docs.shared) ? docs.shared : [];
            const allDocs = [...owned, ...shared];
            return allDocs.find(doc => doc.id === id) || null;
          }
        }
      } catch (error) {
        console.error('Error fetching document from API:', error);
      }
      // Fallback to localStorage
      return this.documents.find(doc => doc.id === id) || null;
    } else {
      // On server, only use API
      try {
        const response = await fetch('http://localhost:3000/api/documents');
        if (response.ok) {
          const result = await response.json();
          const docs = result.documents;
          if (Array.isArray(docs)) {
            return docs.find(doc => doc.id === id) || null;
          } else if (docs && typeof docs === 'object') {
            const owned = Array.isArray(docs.owned) ? docs.owned : [];
            const shared = Array.isArray(docs.shared) ? docs.shared : [];
            const allDocs = [...owned, ...shared];
            return allDocs.find(doc => doc.id === id) || null;
          }
        }
      } catch (error) {
        console.error('Error fetching document from API:', error);
        return null;
      }
      return null;
    }
  }

  async addDocument(documentData) {
    if (this.isBrowser) {
      try {
        // Save to server-side API
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });

        if (!response.ok) {
          throw new Error('Failed to save document to server');
        }

        const result = await response.json();
        const document = result.document;
        
        // Also save to localStorage for offline access
        if (!Array.isArray(this.documents)) {
          this.documents = [];
        }
        if (!this.documents.find(d => d.id === document.id)) {
          this.documents.push(document);
        }
        this.saveDocuments();
        
        console.log('✅ Document saved to server and localStorage:', document);
      return document;
    } catch (error) {
        console.error('Error saving document:', error);
        // Fallback to localStorage only
        const id = `doc${Date.now()}`;
        const document = {
          id,
          ...documentData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        if (!Array.isArray(this.documents)) {
          this.documents = [];
        }
        if (!this.documents.find(d => d.id === document.id)) {
          this.documents.push(document);
        }
        this.saveDocuments();
        
        console.log('✅ Document saved to localStorage (fallback):', document);
        return document;
      }
    } else {
      // On server, only use API
      try {
        const response = await fetch('http://localhost:3000/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });
        if (!response.ok) {
          throw new Error('Failed to save document to server');
        }
        const result = await response.json();
        return result.document;
      } catch (error) {
        return null;
      }
    }
  }

  async updateDocument(id, updates) {
    if (this.isBrowser) {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        if (!response.ok) {
          throw new Error('Failed to update document on server');
        }
        const result = await response.json();
        const updatedDoc = result.document;
        // Update local copy
        const index = this.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          this.documents[index] = updatedDoc;
          this.saveDocuments();
        }
        return updatedDoc;
      } catch (error) {
        // Fallback to localStorage
        const index = this.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          this.documents[index] = {
            ...this.documents[index],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          this.saveDocuments();
          return this.documents[index];
        }
        return null;
      }
    } else {
      // On server, only use API
      try {
        const response = await fetch(`http://localhost:3000/api/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        if (!response.ok) {
          throw new Error('Failed to update document on server');
        }
        const result = await response.json();
        return result.document;
      } catch (error) {
        return null;
      }
    }
  }

  async deleteDocument(id) {
    if (this.isBrowser) {
      try {
        const response = await fetch(`/api/documents/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete document on server');
        }
        // Remove from localStorage
        const index = this.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          this.documents.splice(index, 1);
          this.saveDocuments();
        }
        return true;
      } catch (error) {
        // Fallback to localStorage
        const index = this.documents.findIndex(doc => doc.id === id);
        if (index !== -1) {
          this.documents.splice(index, 1);
          this.saveDocuments();
          return true;
        }
        return false;
      }
    } else {
      // On server, only use API
      try {
        const response = await fetch(`http://localhost:3000/api/documents/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete document on server');
        }
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  // Search documents
  async searchDocuments(query) {
    const searchTerm = query.toLowerCase();
    return this.documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.description.toLowerCase().includes(searchTerm) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get documents by type
  async getDocumentsByType(type) {
    return this.documents.filter(doc => doc.type === type);
  }

  // Get documents by status
  async getDocumentsByStatus(status) {
    return this.documents.filter(doc => doc.status === status);
  }

  // Export documents (for backup)
  exportDocuments() {
    return JSON.stringify(this.documents, null, 2);
  }

  // Import documents (for restore)
  importDocuments(jsonData) {
    try {
      const documents = JSON.parse(jsonData);
      if (Array.isArray(documents)) {
        this.documents = documents;
        this.saveDocuments();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing documents:', error);
      return false;
    }
  }

  // Clear all documents
  clearDocuments() {
    this.documents = [];
    this.saveDocuments();
  }

  // Get document statistics
  getStats() {
    const total = this.documents.length;
    const byType = {};
    const byStatus = {};
    
    this.documents.forEach(doc => {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
      byStatus[doc.status] = (byStatus[doc.status] || 0) + 1;
    });

    return {
      total,
      byType,
      byStatus,
      totalSize: this.documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
    };
  }
}

const documentService = new DocumentService();
export default documentService;
