import { storage, db, auth } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUserDocuments();
    loadSharedDocuments();
  } else {
    window.location.href = 'login.html';
  }
});

// Document types and validation
const DOCUMENT_TYPES = {
  'aadhaar': ['aadhaar', 'adhaar', 'aadhar'],
  'pan': ['pan'],
  'passport': ['passport'],
  'driving_license': ['driving', 'license', 'dl'],
  'voter_id': ['voter', 'epic'],
  'birth_certificate': ['birth', 'certificate'],
  'income_certificate': ['income'],
  'caste_certificate': ['caste'],
  'marksheet': ['marksheet', 'mark sheet', 'certificate', 'diploma', 'degree'],
  'other': []
};

const detectDocumentType = (fileName) => {
  const lowerFileName = fileName.toLowerCase();
  for (const [type, keywords] of Object.entries(DOCUMENT_TYPES)) {
    if (keywords.some(keyword => lowerFileName.includes(keyword))) {
      return type;
    }
  }
  return 'other';
};

const validateFile = (file) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PDF, Image, or Word document.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }
  
  return true;
};

const uploadDoc = async () => {
  try {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
      showNotification('Please select a file first', 'error');
      return;
    }
    
    // Validate file
    validateFile(file);
    
    if (!auth.currentUser) {
      showNotification('Please login first', 'error');
      window.location.href = 'login.html';
      return;
    }
    
    // Check if encryption is available
    if (!DocumentEncryption.isEncryptionAvailable()) {
      showNotification('Encryption library not loaded. Please refresh the page.', 'error');
      return;
    }
    
    // Add loading indicator
    const uploadBtn = document.querySelector('.btn-upload');
    if (uploadBtn) {
      uploadBtn.disabled = true;
      uploadBtn.innerHTML = '⏳ Encrypting & Uploading...';
    }
    
    showNotification('🔒 Encrypting document...', 'info');
    
    // Read file as ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();
    
    // Generate encryption password based on user credentials
    const encryptionPassword = documentEncryption.generateDocumentPassword(
      auth.currentUser.email,
      auth.currentUser.uid
    );
    
    // Encrypt the document
    const encryptionResult = documentEncryption.encryptDocument(fileArrayBuffer, encryptionPassword);
    
    if (!encryptionResult.success) {
      throw new Error(`Encryption failed: ${encryptionResult.error}`);
    }
    
    showNotification('📤 Uploading encrypted document...', 'info');
    
    // Create unique filename with timestamp and .encrypted extension
    const timestamp = new Date().getTime();
    const encryptedFileName = `${timestamp}_${file.name}.encrypted`;
    const storageRef = ref(storage, `documents/${auth.currentUser.uid}/${encryptedFileName}`);
    
    // Upload encrypted data
    await uploadBytes(storageRef, encryptionResult.encryptedData);
    const url = await getDownloadURL(storageRef);
    
    // Detect document type from original filename
    const docType = detectDocumentType(file.name);
    
    // Store document metadata in Firestore (no sensitive data)
    await addDoc(collection(db, 'documents'), {
      uid: auth.currentUser.uid,
      name: file.name, // Original filename (not encrypted)
      fileName: encryptedFileName, // Encrypted filename for storage
      url, // Download URL for encrypted file
      type: docType,
      originalSize: file.size, // Original file size
      encryptedSize: encryptionResult.size, // Encrypted file size
      mimeType: file.type, // Original MIME type
      encrypted: true, // Flag to indicate this is an encrypted document
      encryptionSalt: encryptionResult.salt, // Store salt for decryption
      uploadedAt: new Date().toISOString(),
      sharedWith: [] // Array to track who document is shared with
    });
    
    logAction('Encrypted Document Uploaded', { 
      name: file.name, 
      fileName: encryptedFileName, 
      docType,
      originalSize: file.size,
      encryptedSize: encryptionResult.size
    });
    
    showNotification(`🎉 Document "${file.name}" encrypted and uploaded successfully!`, 'success');
    
    // Clear file input and reload documents
    fileInput.value = '';
    loadUserDocuments();
    
    // Reset button
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '🔒 Upload Encrypted Document';
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    logAction('Document Upload Failed', error);
    showNotification('Failed to upload document: ' + error.message, 'error');
    
    // Reset button on error
    const uploadBtn = document.querySelector('.btn-upload');
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '🔒 Upload Encrypted Document';
    }
  }
};

const loadUserDocuments = async () => {
  try {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'documents'),
      where('uid', '==', auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const docList = document.getElementById('docList');
    docList.innerHTML = '';
    
    if (querySnapshot.empty) {
      docList.innerHTML = '<li>No documents found. Upload your first document!</li>';
      return;
    }
    
    querySnapshot.forEach((docSnapshot) => {
      const docData = docSnapshot.data();
      const listItem = document.createElement('li');
      const docTypeDisplay = docData.type ? docData.type.replace('_', ' ').toUpperCase() : 'OTHER';
      // Use original size if available, otherwise use encrypted size or fallback
      const sizeToShow = docData.originalSize || docData.fileSize || docData.encryptedSize || 0;
      const fileSize = sizeToShow ? `${(sizeToShow / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
      
      // Add encryption indicator
      const encryptionBadge = docData.encrypted ? '<span class="doc-type-badge" style="background: #e8f5e8; color: #2e7d2e;">🔒 ENCRYPTED</span>' : '';
      
      listItem.innerHTML = `
        <div class="document-item">
          <div class="doc-header">
            <strong>${docData.name}</strong>
            <span class="doc-type-badge doc-type-${docData.type || 'other'}">${docTypeDisplay}</span>
            ${encryptionBadge}
          </div>
          <div class="doc-details">
            <small>📅 Uploaded: ${new Date(docData.uploadedAt).toLocaleDateString()}</small><br>
            <small>📁 Size: ${fileSize}</small>
            ${docData.sharedWith && docData.sharedWith.length > 0 ? 
              `<br><small>👥 Shared with ${docData.sharedWith.length} people</small>` : ''}
          </div>
          <div class="document-actions">
            <button onclick="viewDocument('${docData.url}', '${docSnapshot.id}')" class="btn-view">👁️ ${docData.encrypted ? 'Decrypt & View' : 'View'}</button>
            <button onclick="deleteDocument('${docSnapshot.id}', '${docData.fileName}')" class="btn-delete">🗑️ Delete</button>
            <button onclick="shareDocument('${docSnapshot.id}')" class="btn-share">📤 Share</button>
          </div>
        </div>
      `;
      docList.appendChild(listItem);
    });
    
    logAction('Documents Loaded', { count: querySnapshot.size });
  } catch (error) {
    console.error('Error loading documents:', error);
    logAction('Documents Load Failed', error);
  }
};

const deleteDocument = async (docId, fileName) => {
  if (!confirm('⚠️ Are you sure you want to delete this document?\n\nThis action cannot be undone.')) return;
  
  try {
    showNotification('🗑️ Deleting document...', 'info');
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'documents', docId));
    
    // Delete from Storage
    const storageRef = ref(storage, `documents/${auth.currentUser.uid}/${fileName}`);
    await deleteObject(storageRef);
    
    // Also delete any shared document references
    const sharedQuery = query(
      collection(db, 'sharedDocs'),
      where('docId', '==', docId)
    );
    const sharedDocs = await getDocs(sharedQuery);
    
    // Delete all shared document references
    const deletePromises = sharedDocs.docs.map(sharedDoc => 
      deleteDoc(doc(db, 'sharedDocs', sharedDoc.id))
    );
    await Promise.all(deletePromises);
    
    logAction('Document Deleted', { docId, fileName });
    showNotification('✅ Document deleted successfully!', 'success');
    loadUserDocuments();
    loadSharedDocuments(); // Refresh shared docs too
    
  } catch (error) {
    console.error('Delete error:', error);
    logAction('Document Delete Failed', error);
    showNotification('Failed to delete document: ' + error.message, 'error');
  }
};

const viewDocument = async (url, docId = null) => {
  try {
    // If docId is provided, check if it's an encrypted document
    if (docId) {
      const docQuery = query(
        collection(db, 'documents'),
        where('__name__', '==', docId)
      );
      const docSnapshot = await getDocs(docQuery);
      
      if (!docSnapshot.empty) {
        const docData = docSnapshot.docs[0].data();
        
        if (docData.encrypted) {
          await viewEncryptedDocument(url, docData);
          return;
        }
      }
    }
    
    // For non-encrypted documents, open directly
    window.open(url, '_blank');
    logAction('Document Viewed', { url });
    
  } catch (error) {
    console.error('Error viewing document:', error);
    showNotification('Failed to open document: ' + error.message, 'error');
  }
};

const viewEncryptedDocument = async (url, docData) => {
  try {
    showNotification('🔒 Decrypting document...', 'info');
    
    // Download encrypted file
    const response = await fetch(url);
    const encryptedArrayBuffer = await response.arrayBuffer();
    
    // Generate decryption password
    const decryptionPassword = documentEncryption.generateDocumentPassword(
      auth.currentUser.email,
      auth.currentUser.uid
    );
    
    // Decrypt the document
    const decryptionResult = documentEncryption.decryptDocument(
      encryptedArrayBuffer, 
      decryptionPassword
    );
    
    if (!decryptionResult.success) {
      throw new Error(decryptionResult.error);
    }
    
    // Create a blob from decrypted data
    const decryptedBlob = new Blob([decryptionResult.decryptedData], {
      type: docData.mimeType
    });
    
    // Create a temporary URL for the decrypted document
    const tempUrl = URL.createObjectURL(decryptedBlob);
    
    // Open in new window
    const newWindow = window.open(tempUrl, '_blank');
    
    // Clean up the temporary URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(tempUrl);
    }, 60000); // Clean up after 1 minute
    
    logAction('Encrypted Document Viewed', { 
      originalName: docData.name,
      docType: docData.type
    });
    
    showNotification('✅ Document decrypted and opened!', 'success');
    
  } catch (error) {
    console.error('Decryption error:', error);
    logAction('Document Decryption Failed', { error: error.message });
    showNotification('Failed to decrypt document: ' + error.message, 'error');
  }
};

const shareDocument = async (docId) => {
  const recipientEmail = prompt('Enter the email address of the person you want to share with:');
  if (!recipientEmail) return;
  
  // Validate email format
  if (!validateEmail(recipientEmail)) {
    showNotification('Please enter a valid email address.', 'error');
    return;
  }
  
  try {
    // First, find the user by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', recipientEmail)
    );
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      showNotification('No user found with that email address. Please make sure they are registered.', 'error');
      return;
    }
    
    const recipientUser = userSnapshot.docs[0];
    const recipientUID = recipientUser.id;
    
    // Check if document is already shared with this user
    const existingShareQuery = query(
      collection(db, 'sharedDocs'),
      where('docId', '==', docId),
      where('ownerId', '==', auth.currentUser.uid),
      where('sharedWith', '==', recipientUID)
    );
    const existingShareSnapshot = await getDocs(existingShareQuery);
    
    if (!existingShareSnapshot.empty) {
      showNotification('Document is already shared with this user.', 'error');
      return;
    }
    
    // Add to shared documents collection
    await addDoc(collection(db, 'sharedDocs'), {
      docId,
      ownerId: auth.currentUser.uid,
      ownerEmail: auth.currentUser.email,
      sharedWith: recipientUID,
      sharedWithEmail: recipientEmail,
      sharedAt: new Date().toISOString()
    });
    
    logAction('Document Shared', { docId, recipientEmail, recipientUID });
    showNotification(`📤 Document shared successfully with ${recipientEmail}!`, 'success');
    loadUserDocuments(); // Refresh the document list
    
  } catch (error) {
    console.error('Share error:', error);
    logAction('Document Share Failed', error);
    showNotification('Failed to share document: ' + error.message, 'error');
  }
};

const loadSharedDocuments = async () => {
  try {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, 'sharedDocs'),
      where('sharedWith', '==', auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const sharedDocList = document.getElementById('sharedDocList');
    
    if (!sharedDocList) return; // Element might not exist on all pages
    
    sharedDocList.innerHTML = '';
    
    if (querySnapshot.empty) {
      sharedDocList.innerHTML = '<li>No documents shared with you yet.</li>';
      return;
    }
    
    // Get document details for each shared document
    for (const sharedDoc of querySnapshot.docs) {
      const sharedData = sharedDoc.data();
      
      try {
        // Get the actual document details
        const docRef = doc(db, 'documents', sharedData.docId);
        const docSnap = await getDocs(query(collection(db, 'documents'), where('__name__', '==', sharedData.docId)));
        
        if (!docSnap.empty) {
          const docData = docSnap.docs[0].data();
          const listItem = document.createElement('li');
          listItem.innerHTML = `
            <div class="document-item">
              <strong>${docData.name}</strong> <span class="shared-badge">(Shared)</span>
              <br><small>Shared on: ${new Date(sharedData.sharedAt).toLocaleDateString()}</small>
              <br><small>Owner UID: ${sharedData.ownerId}</small>
              <div class="document-actions">
                <button onclick="viewDocument('${docData.url}')" class="btn-view">View</button>
              </div>
            </div>
          `;
          sharedDocList.appendChild(listItem);
        }
      } catch (docError) {
        console.error('Error loading shared document details:', docError);
      }
    }
    
    logAction('Shared Documents Loaded', { count: querySnapshot.size });
  } catch (error) {
    console.error('Error loading shared documents:', error);
    logAction('Shared Documents Load Failed', error);
  }
};

// Make functions available globally
window.uploadDoc = uploadDoc;
window.deleteDocument = deleteDocument;
window.viewDocument = viewDocument;
window.shareDocument = shareDocument;
