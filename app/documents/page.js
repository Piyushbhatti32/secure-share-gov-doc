'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getUserDocuments } from '@/lib/services/document-service';
import { batchDeleteDocuments } from '@/lib/services/batch-document-service';
import { batchArchiveDocuments } from '@/lib/services/document-archive-service';
import { batchRestoreDocuments } from '@/lib/services/document-restore-service';
import { handleError } from '@/lib/utils/error-handler';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocs, setSelectedDocs] = useState(new Set());
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchDocuments = async () => {
          try {
            const docs = await getUserDocuments(user.uid);
            setDocuments(docs);
            setFilteredDocs(docs);
          } catch (err) {
            const errorDetails = handleError(err);
            setError(errorDetails.message);
          } finally {
            setLoading(false);
          }
        };

        fetchDocuments();
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || doc.type === filterType;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesFilter && matchesStatus;
    });

    // Sort the filtered documents
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Handle dates
      if (['createdAt', 'lastModified', 'lastAccessed'].includes(sortField)) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });

    setFilteredDocs(filtered);
  }, [searchTerm, filterType, statusFilter, documents, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Documents</h1>
            <p className="text-gray-600">
              Manage and organize your important government documents
            </p>
          </div>
          <Link
            href="/documents/upload"
            className="btn btn-primary"
          >
            <i className="fas fa-upload mr-2"></i>
            Upload New Document
          </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="aadhar">Aadhar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="createdAt">Creation Date</option>
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="lastModified">Last Modified</option>
                <option value="downloads">Downloads</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-100 rounded-full"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
              </button>
            </div>
            
            {/* Batch Operations */}
            {selectedDocs.size > 0 && (
              <div className="flex items-center gap-4 ml-auto">
                <span className="text-sm text-gray-600">
                  {selectedDocs.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to archive ${selectedDocs.size} documents?`)) {
                        try {
                          setLoading(true);
                          const results = await batchArchiveDocuments(
                            Array.from(selectedDocs),
                            auth.currentUser.uid
                          );
                          
                          if (results.failed.length > 0) {
                            setError(`Failed to archive ${results.failed.length} documents`);
                          }
                          
                          // Update documents with new status
                          setDocuments(prev => prev.map(doc => 
                            results.success.includes(doc.id)
                              ? { ...doc, status: 'archived' }
                              : doc
                          ));
                          setSelectedDocs(new Set());
                        } catch (err) {
                          const errorDetails = handleError(err);
                          setError(errorDetails.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                  >
                    <i className="fas fa-archive mr-1"></i>
                    Archive Selected
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to restore ${selectedDocs.size} documents?`)) {
                        try {
                          setLoading(true);
                          const results = await batchRestoreDocuments(
                            Array.from(selectedDocs),
                            auth.currentUser.uid
                          );
                          
                          if (results.failed.length > 0) {
                            setError(`Failed to restore ${results.failed.length} documents`);
                          }
                          
                          // Update documents with new status
                          setDocuments(prev => prev.map(doc => 
                            results.success.includes(doc.id)
                              ? { ...doc, status: 'active' }
                              : doc
                          ));
                          setSelectedDocs(new Set());
                        } catch (err) {
                          const errorDetails = handleError(err);
                          setError(errorDetails.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="text-green-600 hover:text-green-800 font-medium text-sm"
                  >
                    <i className="fas fa-undo mr-1"></i>
                    Restore Selected
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete ${selectedDocs.size} documents? This action cannot be undone.`)) {
                        try {
                          setLoading(true);
                          const results = await batchDeleteDocuments(
                            Array.from(selectedDocs),
                            auth.currentUser.uid
                          );
                          
                          if (results.failed.length > 0) {
                            setError(`Failed to delete ${results.failed.length} documents`);
                          }
                          
                          setDocuments(prev => prev.filter(doc => !results.success.includes(doc.id)));
                          setSelectedDocs(new Set());
                        } catch (err) {
                          const errorDetails = handleError(err);
                          setError(errorDetails.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-medium text-sm"
                  >
                    <i className="fas fa-trash mr-1"></i>
                    Delete Selected
                  </button>
                  <button
                    onClick={() => setSelectedDocs(new Set())}
                    className="text-gray-600 hover:text-gray-800 text-sm ml-2"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Documents Grid */}
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isSelected={selectedDocs.has(doc.id)}
                onSelect={(docId) => {
                  setSelectedDocs(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(docId)) {
                      newSet.delete(docId);
                    } else {
                      newSet.add(docId);
                    }
                    return newSet;
                  });
                }}
                onDelete={(docId) => {
                  setDocuments(prev => prev.filter(d => d.id !== docId));
                  setFilteredDocs(prev => prev.filter(d => d.id !== docId));
                }}
                onError={(err) => {
                  const errorDetails = handleError(err);
                  setError(errorDetails.message);
                }}
                onArchive={(docId) => {
                  setDocuments(prev => prev.map(d => 
                    d.id === docId ? { ...d, status: 'archived' } : d
                  ));
                  setFilteredDocs(prev => prev.map(d => 
                    d.id === docId ? { ...d, status: 'archived' } : d
                  ));
                }}
                onRestore={(docId) => {
                  setDocuments(prev => prev.map(d => 
                    d.id === docId ? { ...d, status: 'active' } : d
                  ));
                  setFilteredDocs(prev => prev.map(d => 
                    d.id === docId ? { ...d, status: 'active' } : d
                  ));
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <i className="fas fa-folder-open text-6xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No documents found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all'
                ? "No documents match your search criteria"
                : "You haven't uploaded any documents yet"}
            </p>
            <Link
              href="/documents/upload"
              className="btn btn-primary"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload Your First Document
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
