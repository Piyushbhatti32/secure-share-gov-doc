'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getDocument, updateDocument } from '@/lib/services/document-service';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';
import { use } from 'react';

export default function EditDocumentPage({ params }) {
  const documentId = use(params).id;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: ''
  });
  const router = useRouter();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await getDocument(documentId);
        setDocument(doc);
        setFormData({
          name: doc.name,
          type: doc.type,
          description: doc.description || ''
        });
      } catch (err) {
        const errorDetails = handleError(err);
        setError(errorDetails.message);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchDocument();
    } else {
      router.push('/login');
    }
  }, [documentId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateDocument(documentId, formData, auth.currentUser.uid);
      router.push('/documents');
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-gray-900">Edit Document</h1>
          </div>

          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="form-label">Document Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="type" className="form-label">Document Type</label>
              <select
                id="type"
                name="type"
                required
                className="form-input"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="">Select a type</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="pan">PAN Card</option>
                <option value="passport">Passport</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="form-label">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="form-input"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              ></textarea>
            </div>

            <div className="card-footer flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
