import { v4 as uuidv4 } from 'uuid';
import { auth } from '@clerk/nextjs/server';

export class DocumentStorageService {
  constructor() {
    this.cloudinary = require('cloudinary').v2;
    this.cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    this.userEmailCache = new Map(); // Cache for user ID to email mapping
    
    // Log environment variables for debugging
    console.log('DocumentStorageService initialized with:');
    console.log('- CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'set' : 'not set');
    console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'set' : 'not set');
    console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set');
    
    // Check for Clerk environment variables
    const clerkVars = ['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'];
    clerkVars.forEach(varName => {
      console.log(`- ${varName}:`, process.env[varName] ? 'set' : 'not set');
    });
  }

  /**
   * Generate user-specific folder path
   * @param {string} userId - Clerk user ID
   * @returns {string} - Secure folder path
   */
  getUserFolder(userId) {
    if (!userId) {
      throw new Error('User ID is required for document storage');
    }
    
    // Create a secure, user-specific folder structure
    // Format: users/{userId}/documents/{timestamp}
    const timestamp = new Date().toISOString().split('T')[0];
    return `users/${userId}/documents/${timestamp}`;
  }

  /**
   * Set user email for a user ID (for external resolution)
   * @param {string} userId - Clerk user ID
   * @param {string} email - User's email address
   */
  setUserEmail(userId, email) {
    if (userId && email) {
      this.userEmailCache.set(userId, email);
      console.log('Set cached email for', userId, ':', email);
    }
  }

  /**
   * Resolve user ID to email address
   * @param {string} userId - Clerk user ID
   * @returns {Promise<string|null>} - User's email address or null if not found
   */
  async resolveUserEmail(userId) {
    if (!userId) return null;
    
    console.log('Resolving user email for ID:', userId);
    
    // Check cache first
    if (this.userEmailCache.has(userId)) {
      const cachedEmail = this.userEmailCache.get(userId);
      console.log('Found cached email for', userId, ':', cachedEmail);
      return cachedEmail;
    }

    try {
      // Import clerkClient dynamically to avoid issues
      const { clerkClient } = await import('@clerk/nextjs/server');
      console.log('Clerk client imported successfully');
      
      const clerk = clerkClient();
      console.log('Clerk client instance created:', typeof clerk, clerk ? 'exists' : 'null');
      
      if (clerk && typeof clerk === 'object') {
        console.log('Clerk client properties:', Object.keys(clerk));
        
        if (clerk.users && typeof clerk.users === 'object') {
          console.log('Clerk users object available');
          
          try {
            const user = await clerk.users.getUser(userId);
            console.log('User data retrieved:', user ? 'success' : 'failed');
            
            if (user) {
              const email = user?.primaryEmailAddress?.emailAddress || 
                           user?.emailAddresses?.[0]?.emailAddress || 
                           user?.emailAddresses?.find(email => email.verification?.status === 'verified')?.emailAddress ||
                           null;
              
              console.log('Resolved email for', userId, ':', email);
              console.log('User email addresses:', user?.emailAddresses?.map(e => ({ email: e.emailAddress, verified: e.verification?.status })));
              
              // Cache the result
              this.userEmailCache.set(userId, email);
              return email;
            } else {
              console.log('No user data returned for', userId);
            }
          } catch (userError) {
            console.log('Error getting user data for', userId, ':', userError.message);
          }
        } else {
          console.log('Clerk users object not available. Clerk object:', clerk);
        }
      } else {
        console.log('Clerk client not properly initialized:', clerk);
      }
    } catch (error) {
      console.log('Failed to resolve user email for:', userId, error.message);
      console.log('Error details:', error);
      console.log('Error stack:', error.stack);
    }
    
    console.log('Returning null for user email resolution of:', userId);
    return null;
  }

  /**
   * Generate secure document ID
   * @param {string} userId - Clerk user ID
   * @param {string} originalName - Original filename
   * @returns {string} - Unique document ID
   */
  generateDocumentId(userId, originalName) {
    // Keep original filename (sanitized) – uniqueness is handled by Cloudinary
    return originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  /**
   * Upload document with user isolation and PDF handling
   * @param {Object} file - File object
   * @param {string} userId - Clerk user ID
   * @param {Object} metadata - Document metadata
   * @returns {Object} - Upload result with secure paths
   */
  async uploadDocument(file, userId, metadata = {}) {
    try {
      // Verify user authentication
      if (!userId) {
        throw new Error('User authentication required');
      }

      const userFolder = this.getUserFolder(userId);
      const documentId = this.generateDocumentId(userId, file.name);
      const isPDF = file.type === 'application/pdf';
      
      // Set upload options with user isolation
      const baseUploadOptions = {
        folder: userFolder,
        // Let Cloudinary keep original name and ensure uniqueness with a short suffix
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        // Add user-specific tags for better organization
        tags: [`user:${userId}`, 'secure', 'government-document'],
        // Add metadata for access control
        context: {
          userId: userId,
          uploadDate: new Date().toISOString(),
          documentType: metadata.type || file.type,
          securityLevel: metadata.securityLevel || 'standard',
          originalName: file.name
        }
      };

      let uploadResult;

      if (isPDF) {
        // Upload preview first to get Cloudinary's unique public_id based on original name
        const previewUpload = await this.cloudinary.uploader.upload(file.path, {
          ...baseUploadOptions,
          resource_type: 'auto',
          format: 'pdf'
        });

        // Upload raw with a deterministic suffix so we can find/delete it reliably
        const rawUpload = await this.cloudinary.uploader.upload(file.path, {
          folder: userFolder,
          public_id: `${previewUpload.public_id}_raw`,
          resource_type: 'raw',
          overwrite: false,
          tags: [`user:${userId}`, 'secure', 'government-document'],
          context: baseUploadOptions.context,
        });

        uploadResult = {
          success: true,
          documentId: previewUpload.public_id,
          cloudinaryId: previewUpload.public_id,
          rawCloudinaryId: rawUpload.public_id,
          secureUrl: previewUpload.secure_url,
          rawUrl: rawUpload.secure_url,
          previewUrl: previewUpload.secure_url,
          userId: userId,
          folder: userFolder,
          isPDF: true,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
            fileSize: previewUpload.bytes,
            format: previewUpload.format,
            originalName: file.name,
            pages: previewUpload.pages || 1
          }
        };
      } else {
        // For non-PDF files, use standard upload
        const result = await this.cloudinary.uploader.upload(file.path, {
          ...baseUploadOptions,
          resource_type: 'auto'
        });

        uploadResult = {
          success: true,
          documentId: result.public_id,
          cloudinaryId: result.public_id,
          secureUrl: result.secure_url,
          previewUrl: result.secure_url,
          userId: userId,
          folder: userFolder,
          isPDF: false,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString(),
            fileSize: result.bytes,
            format: result.format,
            originalName: file.name
          }
        };
      }

      return uploadResult;
    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Generate signed expiring URL for secure document access
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID requesting access
   * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns {Object} - Signed URLs for download and preview
   */
  async generateSignedUrls(documentId, userId, expiresIn = 3600) {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      // Get document metadata to check if it's a PDF
      const document = await this.getDocumentById(documentId, userId);
      if (!document) {
        throw new Error('Document not found or access denied');
      }

      const expirationTime = Math.round(Date.now() / 1000) + expiresIn;

      if (document.isPDF) {
        // Generate signed URLs for both raw and preview versions
        const rawSignedUrl = this.cloudinary.url(document.rawCloudinaryId, {
          sign_url: true,
          type: 'upload',
          resource_type: 'raw',
          expires_at: expirationTime
        });

        const previewSignedUrl = this.cloudinary.url(document.cloudinaryId, {
          sign_url: true,
          type: 'upload',
          resource_type: 'auto',
          expires_at: expirationTime
        });

        return {
          downloadUrl: rawSignedUrl,
          previewUrl: previewSignedUrl,
          expiresAt: new Date(expirationTime * 1000),
          documentId: documentId
        };
      } else {
        // Generate signed URL for non-PDF documents
        const signedUrl = this.cloudinary.url(document.cloudinaryId, {
          sign_url: true,
          type: 'upload',
          resource_type: 'auto',
          expires_at: expirationTime
        });

        return {
          downloadUrl: signedUrl,
          previewUrl: signedUrl,
          expiresAt: new Date(expirationTime * 1000),
          documentId: documentId
        };
      }
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      throw new Error(`Failed to generate signed URLs: ${error.message}`);
    }
  }

  /**
   * Get document by ID with access verification
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID
   * @returns {Object} - Document information
   */
  async getDocumentById(documentId, userId) {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      // Get user's documents
      const userDocuments = await this.getUserDocuments(userId);
      const sharedDocuments = await this.getSharedDocuments(userId);

      // Check if user owns the document
      const ownedDoc = userDocuments.find(doc => doc.id === documentId);
      if (ownedDoc) {
        return { ...ownedDoc, isOwner: true };
      }

      // Check if document is shared with user
      const sharedDoc = sharedDocuments.find(doc => doc.id === documentId);
      if (sharedDoc) {
        return { ...sharedDoc, isOwner: false };
      }

      return null; // Document not found or access denied
    } catch (error) {
      console.error('Error getting document by ID:', error);
      throw new Error(`Failed to get document: ${error.message}`);
    }
  }

  /**
   * Get user's documents only
   * @param {string} userId - Clerk user ID
   * @returns {Array} - User's documents only
   */
  async getUserDocuments(userId) {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      const userFolder = this.getUserFolder(userId);
      
      // Search for documents in user's folder only
      const result = await this.cloudinary.search
        .expression(`folder:${userFolder}/*`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      return result.resources.map(resource => {
        const isPDF = resource.resource_type === 'raw' || resource.format === 'pdf';
        const isRaw = resource.public_id.endsWith('_raw');
        
        // Skip raw PDF uploads in the list (we'll show the preview version)
        if (isRaw) return null;

        return {
          id: resource.public_id,
          url: resource.secure_url,
          name: resource.original_filename || resource.public_id.split('/').pop(),
          format: resource.format,
          size: resource.bytes,
          uploadedAt: resource.created_at,
          userId: userId,
          ownerId: userId, // Add ownerId field for consistency
          folder: userFolder,
          isPDF: isPDF,
          pages: resource.pages || 1,
          // For PDFs, construct the raw ID for download
          rawCloudinaryId: isPDF ? `${resource.public_id}_raw` : null,
          // Include tags to check if document is shared
          tags: resource.tags || []
        };
      }).filter(Boolean); // Remove null entries
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
  }

  /**
   * Delete user's document
   * @param {string} documentId - Document ID
   * @param {string} userId - Clerk user ID
   * @returns {Object} - Deletion result
   */
  async deleteDocument(documentId, userId) {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      // Verify document belongs to user before deletion
      const userFolder = this.getUserFolder(userId);
      if (!documentId.includes(userId) || !documentId.startsWith(userFolder)) {
        throw new Error('Access denied: Document does not belong to user');
      }

      // Get document to check if it's a PDF
      const document = await this.getDocumentById(documentId, userId);
      if (!document) {
        throw new Error('Document not found');
      }

      let deleteResults = [];

      if (document.isPDF) {
        // Delete both raw and preview versions for PDFs
        const rawId = document.rawCloudinaryId || documentId.replace('_preview', '_raw');
        const previewId = documentId;

        const [rawResult, previewResult] = await Promise.all([
          this.cloudinary.uploader.destroy(rawId, { resource_type: 'raw' }),
          this.cloudinary.uploader.destroy(previewId, { resource_type: 'auto' })
        ]);

        deleteResults = [rawResult, previewResult];
      } else {
        // Delete single file for non-PDFs
        const result = await this.cloudinary.uploader.destroy(documentId);
        deleteResults = [result];
      }

      const allSuccessful = deleteResults.every(result => result.result === 'ok');
      
      return {
        success: allSuccessful,
        message: allSuccessful ? 'Document deleted successfully' : 'Some files could not be deleted',
        documentId: documentId,
        deleteResults: deleteResults
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Share document with specific users
   * @param {string} documentId - Document ID
   * @param {string} ownerId - Document owner ID
   * @param {Array} sharedWith - Array of user IDs to share with
   * @returns {Object} - Sharing result
   */
  async shareDocument(documentId, ownerId, sharedWith, options = {}) {
    try {
      if (!ownerId) {
        throw new Error('Owner authentication required');
      }

      // Verify document ownership
      const userFolder = this.getUserFolder(ownerId);
      if (!documentId.includes(ownerId) || !documentId.startsWith(userFolder)) {
        throw new Error('Access denied: Document does not belong to user');
      }

      // Tag-based sharing for reliable search
      // Add tags: isShared, owner and sharedWith (both colon and underscore variants for safe search)
      const emailTags = (options.emailsSanitized || []).map(e => `sharedWithEmail_${e}`);
      const originalEmailTags = (options.originalEmails || []).map(e => 
        `originalEmail_${e.replace(/\./g, '_dot_').replace(/@/g, '_at_').replace(/[^a-zA-Z0-9_]/g, '_')}`
      );
      const shareTags = [
        'isShared',
        `owner:${ownerId}`,
        `owner_${ownerId}`,
        ...sharedWith.flatMap(uid => [`sharedWith:${uid}`, `sharedWith_${uid}`]),
        ...emailTags,
        ...originalEmailTags
      ];
      
      console.log('Setting share tags:', shareTags);
      console.log('Document ID:', documentId);
      console.log('Owner ID:', ownerId);
      console.log('Shared with:', sharedWith);
      console.log('Email tags:', emailTags);

      // First, get the resource info to determine the correct resource type
      let resourceType = 'image'; // default
      try {
        const resourceInfo = await this.cloudinary.api.resource(documentId, {
          type: 'upload'
        });
        resourceType = resourceInfo.resource_type;
        console.log('Document resource type:', resourceType);
      } catch (error) {
        console.log('Could not get resource info, using default image type:', error.message);
      }

      // Tag the document using explicit method (more reliable than add_tag)
      try {
        console.log(`Tagging as ${resourceType} resource using explicit method...`);
        const tagResult = await this.cloudinary.uploader.explicit(documentId, {
          type: 'upload',
          resource_type: resourceType,
          tags: shareTags.join(',')
        });
        console.log(`${resourceType} explicit tagging result:`, tagResult);
      } catch (error) {
        console.log(`${resourceType} explicit tagging failed:`, error.message);
        
        // Fallback: try with add_tag method
        try {
          console.log('Fallback: using add_tag method...');
          const tagResult = await this.cloudinary.uploader.add_tag(shareTags, [documentId], {
            type: 'upload',
            resource_type: resourceType
          });
          console.log(`${resourceType} add_tag result:`, tagResult);
        } catch (addTagError) {
          console.log(`${resourceType} add_tag also failed:`, addTagError.message);
          
          // Final fallback: try with 'auto' resource type
          try {
            console.log('Final fallback: tagging with auto resource type...');
            const autoResult = await this.cloudinary.uploader.add_tag(shareTags, [documentId], {
              type: 'upload',
              resource_type: 'auto'
            });
            console.log('Auto tagging result:', autoResult);
          } catch (autoError) {
            console.log('Auto tagging also failed:', autoError.message);
          }
        }
      }

      // If a raw variant exists for PDFs, tag it as well
      const rawId = `${documentId}_raw`;
      try {
        console.log('Tagging raw variant:', rawId);
        const rawResult = await this.cloudinary.uploader.add_tag(shareTags, [rawId], {
          type: 'upload',
          resource_type: 'raw'
        });
        console.log('Raw tagging result:', rawResult);
      } catch (error) {
        console.log('Raw tagging failed:', error.message);
      }

      // Verify that tags were applied by fetching the resource again
      try {
        const verifyResource = await this.cloudinary.api.resource(documentId, {
          type: 'upload'
        });
        console.log('Verification - Document tags after sharing:', verifyResource.tags);
        console.log('Verification - Document resource type:', verifyResource.resource_type);
        
        // If tags are still not set, try to set them again with a different approach
        if (!verifyResource.tags || verifyResource.tags.length === 0) {
          console.log('Tags not set, trying alternative tagging approach...');
          try {
            await this.cloudinary.api.update(documentId, {
              tags: shareTags.join(','),
              resource_type: resourceType
            });
            console.log('Alternative tagging completed');
          } catch (altError) {
            console.log('Alternative tagging failed:', altError.message);
          }
        }
      } catch (error) {
        console.log('Could not verify tags:', error.message);
      }

      return {
        success: true,
        message: 'Document shared successfully',
        sharingData: { documentId, ownerId, sharedWith }
      };
    } catch (error) {
      console.error('Error sharing document:', error);
      throw new Error(`Failed to share document: ${error.message}`);
    }
  }

  /**
   * Get user's own documents
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's documents
   */
  async getUserDocuments(userId) {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      const userFolder = this.getUserFolder(userId);
      console.log('Fetching user documents from folder:', userFolder);

      const result = await this.cloudinary.search
        .expression(`folder:${userFolder}`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .with_field('tags')
        .execute();

      console.log('User documents search result:', result.resources.length, 'documents found');
      console.log('User documents with tags:', result.resources.map(r => ({ id: r.public_id, tags: r.tags })));

      return await Promise.all(result.resources.map(async (resource) => {
        const isPDF = resource.resource_type === 'raw' || resource.format === 'pdf';
        const isRaw = resource.public_id.includes('_raw');
        
        // Skip raw PDF uploads in the list
        if (isRaw) return null;

        // Extract shared with emails from tags (for owned documents)
        let sharedWithEmails = [];
        if (resource.tags && Array.isArray(resource.tags)) {
          const originalEmailTags = resource.tags.filter(t => t.startsWith('originalEmail_'));
          if (originalEmailTags.length > 0) {
            // Use original email tags if available
            sharedWithEmails = originalEmailTags.map(tag => {
              const encodedEmail = tag.replace('originalEmail_', '');
              // Decode the email by replacing underscores with dots and @ symbols
              return encodedEmail.replace(/_dot_/g, '.').replace(/_at_/g, '@');
            });
          } else {
            // Fallback to sanitized email tags
            const emailTags = resource.tags.filter(t => t.startsWith('sharedWithEmail_'));
            if (emailTags.length > 0) {
              sharedWithEmails = emailTags.map(tag => {
                const sanitizedEmail = tag.replace('sharedWithEmail_', '');
                // Better reconstruction: replace underscores with dots, then replace the last dot with @
                const parts = sanitizedEmail.split('_');
                if (parts.length >= 2) {
                  const domain = parts.slice(-1)[0]; // last part
                  const user = parts.slice(0, -1).join('.'); // everything except last part
                  return `${user}@${domain}`;
                }
                return sanitizedEmail;
              });
            } else {
              // Try to extract from sharedWith tags (for older documents)
              const sharedWithTags = resource.tags.filter(t => t.startsWith('sharedWith:') && !t.includes('_'));
              sharedWithEmails = sharedWithTags.map(tag => tag.replace('sharedWith:', ''));
            }
          }
        }

        // Resolve owner email
        const ownerEmail = await this.resolveUserEmail(userId);
        console.log('Final owner email resolved for owned document', userId, ':', ownerEmail);

        const result = {
          id: resource.public_id,
          url: resource.secure_url,
          name: resource.original_filename || resource.public_id.split('/').pop(),
          format: resource.format,
          size: resource.bytes,
          uploadedAt: resource.created_at,
          ownerId: userId,
          ownerEmail: ownerEmail,
          isPDF: isPDF,
          pages: resource.pages || 1,
          tags: resource.tags || [],
          sharedWithEmails: sharedWithEmails
        };
        
        console.log('Final owned document result:', {
          id: result.id,
          ownerId: result.ownerId,
          ownerEmail: result.ownerEmail,
          sharedWithEmails: result.sharedWithEmails
        });
        
        return result;
      })).then(results => results.filter(Boolean));
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw new Error(`Failed to fetch user documents: ${error.message}`);
    }
  }

  /**
   * Get shared documents for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Shared documents
   */
  async getSharedDocuments(userId, userEmail = null) {
    try {
      if (!userId) {
        throw new Error('User authentication required');
      }

      // Search for documents shared with this user via tags
      // Look for documents tagged with the user's email
      const emailTag = userEmail ? userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_') : '';
      
      console.log('=== SEARCHING FOR SHARED DOCUMENTS ===');
      console.log('User email:', userEmail, 'Email tag:', emailTag);
      console.log('User ID:', userId);
      
      // Try multiple search strategies
      let allResults = [];
      
      // Strategy 1: Search by email tag if available
      if (emailTag) {
        const emailExpression = `tags=sharedWithEmail_${emailTag}`;
        console.log('Searching with email expression:', emailExpression);
        try {
          const emailResult = await this.cloudinary.search
            .expression(emailExpression)
            .sort_by('created_at', 'desc')
            .max_results(50)
            .with_field('tags')
            .execute();
          console.log('Email search found:', emailResult.resources.length, 'documents');
          allResults = [...allResults, ...emailResult.resources];
        } catch (error) {
          console.log('Email search failed:', error.message);
        }
      }
      
      // Strategy 2: Search by user ID tag
      const userIdExpression = `tags=sharedWith_${userId}`;
      console.log('Searching with user ID expression:', userIdExpression);
      try {
        const userIdResult = await this.cloudinary.search
          .expression(userIdExpression)
          .sort_by('created_at', 'desc')
          .max_results(50)
          .with_field('tags')
          .execute();
        console.log('User ID search found:', userIdResult.resources.length, 'documents');
        allResults = [...allResults, ...userIdResult.resources];
      } catch (error) {
        console.log('User ID search failed:', error.message);
      }
      
      // Strategy 3: Search for all shared documents and filter by email in tags
      const sharedExpression = `tags=isShared`;
      console.log('Searching for all shared documents:', sharedExpression);
      try {
        const sharedResult = await this.cloudinary.search
          .expression(sharedExpression)
          .sort_by('created_at', 'desc')
          .max_results(100)
          .with_field('tags')
          .execute();
        console.log('All shared documents found:', sharedResult.resources.length);
        
        // Filter by email if we have one, otherwise include all shared documents
        if (userEmail) {
          const emailToFind = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const filteredByEmail = sharedResult.resources.filter(resource => 
            resource.tags && resource.tags.some(tag => tag.includes(`sharedWithEmail_${emailToFind}`))
          );
          console.log('Filtered by email:', filteredByEmail.length, 'documents');
          console.log('Email to find:', emailToFind);
          console.log('All shared document tags:', sharedResult.resources.map(r => ({ id: r.public_id, tags: r.tags })));
          allResults = [...allResults, ...filteredByEmail];
        } else {
          // If no email, include all shared documents for now (we'll filter later)
          console.log('No email available, including all shared documents');
          allResults = [...allResults, ...sharedResult.resources];
        }
      } catch (error) {
        console.log('Shared documents search failed:', error.message);
      }
      
              // Remove duplicates based on public_id
        const uniqueResults = allResults.filter((resource, index, self) => 
          index === self.findIndex(r => r.public_id === resource.public_id)
        );
        
        console.log('Total unique shared documents found:', uniqueResults.length);
        const result = { resources: uniqueResults };
        
        console.log('Found shared documents:', result.resources.length);
        console.log('Search result resources:', result.resources.map(r => ({
          id: r.public_id,
          tags: r.tags,
          format: r.format
        })));

        return await Promise.all(result.resources.map(async (resource) => {
        const isPDF = resource.resource_type === 'raw' || resource.format === 'pdf';
        const isRaw = resource.public_id.includes('_raw');
        
        // Skip raw PDF uploads in the list
        if (isRaw) return null;

        // Extract owner information from tags or document path
        let ownerId = null;
        let sharedWithEmails = [];
        
        // First try to get owner from tags
        if (resource.tags && Array.isArray(resource.tags)) {
          const ownerTag = resource.tags.find(t => t.startsWith('owner_')) || resource.tags.find(t => t.startsWith('owner:'));
          if (ownerTag) {
            ownerId = ownerTag.startsWith('owner_') ? ownerTag.slice('owner_'.length) : ownerTag.split(':')[1];
          }
          
          // Extract shared with emails from tags
          const originalEmailTags = resource.tags.filter(t => t.startsWith('originalEmail_'));
          if (originalEmailTags.length > 0) {
            // Use original email tags if available
            sharedWithEmails = originalEmailTags.map(tag => {
              const encodedEmail = tag.replace('originalEmail_', '');
              // Decode the email by replacing underscores with dots and @ symbols
              return encodedEmail.replace(/_dot_/g, '.').replace(/_at_/g, '@');
            });
          } else {
            // Fallback to sanitized email tags
            const emailTags = resource.tags.filter(t => t.startsWith('sharedWithEmail_'));
            if (emailTags.length > 0) {
              sharedWithEmails = emailTags.map(tag => {
                const sanitizedEmail = tag.replace('sharedWithEmail_', '');
                // Better reconstruction: replace underscores with dots, then replace the last dot with @
                const parts = sanitizedEmail.split('_');
                if (parts.length >= 2) {
                  const domain = parts.slice(-1)[0]; // last part
                  const user = parts.slice(0, -1).join('.'); // everything except last part
                  return `${user}@${domain}`;
                }
                return sanitizedEmail;
              });
            } else {
              // Try to extract from sharedWith tags (for older documents)
              const sharedWithTags = resource.tags.filter(t => t.startsWith('sharedWith:') && !t.includes('_'));
              sharedWithEmails = sharedWithTags.map(tag => tag.replace('sharedWith:', ''));
            }
          }
        }
        
        // If no owner from tags, try to extract from document path
        if (!ownerId && resource.public_id) {
          const pathParts = resource.public_id.split('/');
          // Look for user_ pattern in the path
          const userPart = pathParts.find(part => part.startsWith('user_'));
          if (userPart) {
            ownerId = userPart;
          }
        }
        
        console.log('Shared document tags:', resource.tags);
        console.log('Extracted owner ID:', ownerId);
        console.log('Extracted shared with emails:', sharedWithEmails);
        console.log('Document path:', resource.public_id);
        
        // Debug email extraction
        if (resource.tags && Array.isArray(resource.tags)) {
          const originalEmailTags = resource.tags.filter(t => t.startsWith('originalEmail_'));
          const emailTags = resource.tags.filter(t => t.startsWith('sharedWithEmail_'));
          const sharedWithTags = resource.tags.filter(t => t.startsWith('sharedWith:') && !t.includes('_'));
          console.log('Email extraction debug:', {
            originalEmailTags,
            emailTags,
            sharedWithTags,
            allTags: resource.tags
          });
        }
        
        // IMPORTANT: Filter out documents owned by the current user
        // These should appear in "Documents You've Shared" not "Documents shared with you"
        if (ownerId === userId) {
          console.log('Skipping document owned by current user:', resource.public_id);
          return null;
        }
        
        // If we still don't have an owner ID, skip this document as it's not properly shared
        if (!ownerId) {
          console.log('Skipping document with no owner ID:', resource.public_id);
          return null;
        }
        
        // Resolve owner email
        const ownerEmail = await this.resolveUserEmail(ownerId);
        console.log('Final owner email resolved for', ownerId, ':', ownerEmail);

        const result = {
          id: resource.public_id,
          url: resource.secure_url,
          name: resource.original_filename || resource.public_id.split('/').pop(),
          format: resource.format,
          size: resource.bytes,
          sharedAt: resource.created_at,
          ownerId: ownerId,
          ownerEmail: ownerEmail,
          permissions: ['read'],
          isPDF: isPDF,
          pages: resource.pages || 1,
          tags: resource.tags || [],
          sharedWithEmails: sharedWithEmails
        };
        
        console.log('Final document result:', {
          id: result.id,
          ownerId: result.ownerId,
          ownerEmail: result.ownerEmail,
          sharedWithEmails: result.sharedWithEmails
        });
        
        return result;
      })).then(results => results.filter(Boolean)); // Remove null entries
    } catch (error) {
      console.error('Error fetching shared documents:', error);
      throw new Error(`Failed to fetch shared documents: ${error.message}`);
    }
  }
}

export default DocumentStorageService;
