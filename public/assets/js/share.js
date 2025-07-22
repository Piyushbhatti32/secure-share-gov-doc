import { db } from './firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const shareDoc = async (docId, recipientUID) => {
  await addDoc(collection(db, 'sharedDocs'), {
    docId,
    sharedWith: recipientUID
  });
  logAction('Document Shared', { docId, recipientUID });
};

window.shareDoc = shareDoc;
