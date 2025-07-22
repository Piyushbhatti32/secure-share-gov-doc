import { storage, db, auth } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

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
      alert('Please select a file first');
      return;
    }
    
    // Validate file
    validateFile(file);
    
    if (!auth.currentUser) {
      alert('Please login first');
      window.location.href = 'login.html';
      return;
    }
    
    // Add loading indicator
    const uploadBtn = document.querySelector('button');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';
    
    // Create unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `documents/${auth.currentUser.uid}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    // Detect document type
    const docType = detectDocumentType(file.name);
    
    await addDoc(collection(db, 'documents'), {
      uid: auth.currentUser.uid,
      name: file.name,
      fileName: fileName,
      url,
      type: docType,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      sharedWith: [] // Array to track who document is shared with
    });
    
    logAction('Document Uploaded', { name: file.name, fileName });
    alert('Document uploaded successfully!');
    
    // Clear file input and reload documents
    fileInput.value = '';
    loadUserDocuments();
    
    // Reset button
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
    
  } catch (error) {
    console.error('Upload error:', error);
    logAction('Document Upload Failed', error);
    alert('Failed to upload document: ' + error.message);
    
    // Reset button on error
    const uploadBtn = document.querySelector('button');
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
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
      const fileSize = docData.fileSize ? `${(docData.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown';
      
      listItem.innerHTML = `
        <div class="document-item">
          <div class="doc-header">
            <strong>${docData.name}</strong>
            <span class="doc-type-badge doc-type-${docData.type || 'other'}">${docTypeDisplay}</span>
          </div>
          <div class="doc-details">
            <small>📅 Uploaded: ${new Date(docData.uploadedAt).toLocaleDateString()}</small><br>
            <small>📁 Size: ${fileSize}</small>
            ${docData.sharedWith && docData.sharedWith.length > 0 ? 
              `<br><small>👥 Shared with ${docData.sharedWith.length} people</small>` : ''}
          </div>
          <div class="document-actions">
            <button onclick="viewDocument('${docData.url}')" class="btn-view">👁️ View</button>
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
  if (!confirm('Are you sure you want to delete this document?')) return;
  
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'documents', docId));
    
    // Delete from Storage
    const storageRef = ref(storage, `documents/${auth.currentUser.uid}/${fileName}`);
    await deleteObject(storageRef);
    
    logAction('Document Deleted', { docId, fileName });
    alert('Document deleted successfully!');
    loadUserDocuments();
  } catch (error) {
    console.error('Delete error:', error);
    logAction('Document Delete Failed', error);
    alert('Failed to delete document: ' + error.message);
  }
};

const viewDocument = (url) => {
  window.open(url, '_blank');
  logAction('Document Viewed', { url });
};

const shareDocument = async (docId) => {
  const recipientUID = prompt('Enter the UID of the person you want to share with:');
  if (!recipientUID) return;
  
  try {
    // Add to shared documents collection
    await addDoc(collection(db, 'sharedDocs'), {
      docId,
      ownerId: auth.currentUser.uid,
      sharedWith: recipientUID,
      sharedAt: new Date().toISOString()
    });
    
    logAction('Document Shared', { docId, recipientUID });
    alert('Document shared successfully!');
  } catch (error) {
    console.error('Share error:', error);
    logAction('Document Share Failed', error);
    alert('Failed to share document: ' + error.message);
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
