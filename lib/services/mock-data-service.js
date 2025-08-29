// Mock data service to replace Firebase functionality
// This provides a simple in-memory storage solution for development

class MockDataService {
  constructor() {
    this.documents = new Map();
    this.activities = new Map();
    this.users = new Map();
    this.shares = new Map();
    this.notifications = new Map();

    // Initialize with some sample data
    this.initializeSampleData();
  }

  initializeSampleData() {
    // Sample documents
    const sampleDocs = [
      {
        id: 'doc1',
        title: 'Aadhaar Card',
        description: 'Government issued identity document',
        type: 'government',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        size: '2.5 MB',
        tags: ['identity', 'government', 'important']
      },
      {
        id: 'doc2',
        title: 'PAN Card',
        description: 'Permanent Account Number card',
        type: 'government',
        status: 'active',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        size: '1.8 MB',
        tags: ['identity', 'government', 'financial']
      },
      {
        id: 'doc3',
        title: 'Driving License',
        description: 'Motor vehicle driving license',
        type: 'government',
        status: 'active',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
        size: '3.2 MB',
        tags: ['license', 'government', 'vehicle']
      }
    ];

    sampleDocs.forEach(doc => {
      this.documents.set(doc.id, doc);
    });

    // Sample activities
    const sampleActivities = [
      {
        id: 'act1',
        type: 'document_uploaded',
        description: 'Aadhaar Card uploaded',
        timestamp: new Date('2024-01-15T10:30:00'),
        documentId: 'doc1'
      },
      {
        id: 'act2',
        type: 'document_shared',
        description: 'PAN Card shared with family member',
        timestamp: new Date('2024-01-12T14:20:00'),
        documentId: 'doc2'
      }
    ];

    sampleActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
  }

  // Document methods
  async getDocuments(userId) {
    return Array.from(this.documents.values());
  }

  async getDocument(id) {
    return this.documents.get(id);
  }

  async addDocument(documentData) {
    const id = `doc${Date.now()}`;
    const document = {
      id,
      ...documentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id, updates) {
    const document = this.documents.get(id);
    if (document) {
      const updatedDoc = { ...document, ...updates, updatedAt: new Date() };
      this.documents.set(id, updatedDoc);
      return updatedDoc;
    }
    return null;
  }

  async deleteDocument(id) {
    return this.documents.delete(id);
  }

  // Activity methods
  async getActivities(userId) {
    return Array.from(this.activities.values());
  }

  async addActivity(activityData) {
    const id = `act${Date.now()}`;
    const activity = {
      id,
      ...activityData,
      timestamp: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }

  // User methods
  async getUser(userId) {
    return this.users.get(userId) || null;
  }

  async updateUser(userId, updates) {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);
      return updatedUser;
    } else {
      // Create new user if doesn't exist
      const newUser = { id: userId, ...updates, createdAt: new Date(), updatedAt: new Date() };
      this.users.set(userId, newUser);
      return newUser;
    }
  }

  // Share methods
  async getShares(userId) {
    return Array.from(this.shares.values()).filter(share =>
      share.ownerId === userId || share.sharedWith.includes(userId)
    );
  }

  async addShare(shareData) {
    const id = `share${Date.now()}`;
    const share = {
      id,
      ...shareData,
      createdAt: new Date()
    };
    this.shares.set(id, share);
    return share;
  }

  // Notification methods
  async getNotifications(userId) {
    return Array.from(this.notifications.values()).filter(notification =>
      notification.userId === userId
    );
  }

  async addNotification(notificationData) {
    const id = `notif${Date.now()}`;
    const notification = {
      id,
      ...notificationData,
      createdAt: new Date(),
      read: false
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
      return notification;
    }
    return null;
  }

  async updateNotification(id, updates) {
    const notification = this.notifications.get(id);
    if (notification) {
      const updatedNotification = { ...notification, ...updates, updatedAt: new Date() };
      this.notifications.set(id, updatedNotification);
      return updatedNotification;
    }
    return null;
  }
}

// Create a singleton instance
const mockDataService = new MockDataService();

export default mockDataService;
