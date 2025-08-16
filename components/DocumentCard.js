'use client';

import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { incrementDownloadCount, deleteDocument } from '@/lib/services/document-service';
import { archiveDocument } from '@/lib/services/document-archive-service';
import { restoreDocument } from '@/lib/services/document-restore-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faPencil, 
  faCloudArrowDown, 
  faShareNodes, 
  faTrashCan,
  faUndo,
  faArchive
} from '@fortawesome/free-solid-svg-icons';

// Utility function to format dates
const formatDate = (timestamp) => {
  if (!timestamp) return 'Not available';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function DocumentCard({ 
  doc, 
  isSelected, 
  onSelect, 
  onDelete, 
  onError 
}) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={(e) => {
        // Don't trigger selection when clicking on buttons/links
        if (!e.target.closest('button, a')) {
          onSelect(doc.id);
        }
      }}
    >
      <div className="p-4">
        <div className="space-y-4">
          {/* Header with Title and Creation Date */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {doc.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Type: {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Created:
              </p>
              <p className="text-sm font-medium text-gray-800">
                {formatDate(doc.createdAt)}
              </p>
            </div>
          </div>

          {/* Document Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-clock mr-2 text-blue-500"></i>
              <div>
                <p className="text-xs text-gray-500">Last Accessed</p>
                <p className="font-medium">{formatDate(doc.lastAccessed)}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-edit mr-2 text-green-500"></i>
              <div>
                <p className="text-xs text-gray-500">Last Modified</p>
                <p className="font-medium">{formatDate(doc.lastModified)}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-download mr-2 text-purple-500"></i>
              <div>
                <p className="text-xs text-gray-500">Downloads</p>
                <p className="font-medium">{doc.downloads || 0}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <i className="fas fa-share-alt mr-2 text-yellow-500"></i>
              <div>
                <p className="text-xs text-gray-500">Sharing</p>
                <p className="font-medium">
                  {doc.sharedCount ? `${doc.sharedCount} users` : 'Not shared'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Actions Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/documents/${doc.id}`}
              className="relative group p-2 text-primary-600 hover:text-primary-800 hover:bg-gray-100 rounded-full transition-colors"
              title="View Document"
            >
              <FontAwesomeIcon icon={faEye} className="text-lg" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                View
              </span>
            </Link>
            <Link
              href={`/documents/${doc.id}/edit`}
              className="relative group p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Edit Document"
            >
              <FontAwesomeIcon icon={faPencil} className="text-lg" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Edit
              </span>
            </Link>
            <button
              onClick={async () => {
                try {
                  await incrementDownloadCount(doc.id);
                  window.open(doc.url, '_blank');
                } catch (err) {
                  onError(err);
                }
              }}
              className="relative group p-2 text-green-600 hover:text-green-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Download Document"
            >
              <FontAwesomeIcon icon={faCloudArrowDown} className="text-lg" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Download
              </span>
            </button>
            <Link
              href={`/documents/share?id=${doc.id}`}
              className="relative group p-2 text-yellow-600 hover:text-yellow-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Share Document"
            >
              <FontAwesomeIcon icon={faShareNodes} className="text-lg" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Share
              </span>
            </Link>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this document?')) {
                  try {
                    await deleteDocument(doc.id, auth.currentUser.uid);
                    onDelete(doc.id);
                  } catch (err) {
                    onError(err);
                  }
                }
              }}
              className="relative group p-2 text-red-600 hover:text-red-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Delete Document"
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-lg" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Delete
              </span>
            </button>
          </div>
          <div className={`flex items-center gap-2`}>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              doc.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : doc.status === 'archived'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </span>
            {doc.status === 'archived' && (
              <button
                onClick={async () => {
                  if (window.confirm('Do you want to restore this archived document?')) {
                    try {
                      await restoreDocument(doc.id, auth.currentUser.uid);
                      onRestore?.(doc.id);
                    } catch (err) {
                      onError(err);
                    }
                  }
                }}
                className="text-green-600 hover:text-green-800 text-xs"
                title="Restore Document"
              >
                <FontAwesomeIcon icon={faUndo} className="mr-1" /> Restore
              </button>
            )}
            {doc.status === 'active' && (
              <button
                onClick={async () => {
                  if (window.confirm('Do you want to archive this document?')) {
                    try {
                      await archiveDocument(doc.id, auth.currentUser.uid);
                      onArchive?.(doc.id);
                    } catch (err) {
                      onError(err);
                    }
                  }
                }}
                className="text-yellow-600 hover:text-yellow-800 text-xs"
                title="Archive Document"
              >
                <FontAwesomeIcon icon={faArchive} className="mr-1" /> Archive
              </button>
            )}
            {doc.status === 'inactive' && (
              <button
                onClick={async () => {
                  if (window.confirm('Do you want to delete this inactive document?')) {
                    try {
                      await deleteDocument(doc.id, auth.currentUser.uid);
                      onDelete(doc.id);
                    } catch (err) {
                      onError(err);
                    }
                  }
                }}
                className="text-red-600 hover:text-red-800 text-xs"
                title="Delete Inactive Document"
              >
                <i className="fas fa-trash"></i> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
