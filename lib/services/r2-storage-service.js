import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Hash } from "@smithy/hash-node";

// Environment variables are checked at runtime, not build time
let r2 = null;

function getR2Client() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME) {
    throw new Error('Missing required R2 environment variables');
  }
  
  if (!r2) {
    const r2Config = {
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      maxAttempts: 3,
      // Remove problematic requestHandler configuration
    };
    r2 = new S3Client(r2Config);
  }
  
  return r2;
}

/**
 * Upload a document to R2 storage with support for large files
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - Success message
 */
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for multipart uploads

async function retry(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation, ${retries} attempts remaining...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retry(fn, retries - 1);
    }
    throw error;
  }
}

async function uploadInChunks(fileBuffer, fileName, contentType) {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;
  
  try {
    // Start multipart upload
    const multipartUpload = await client.send(new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
        uploadMethod: 'multipart',
        totalParts: Math.ceil(fileBuffer.length / CHUNK_SIZE)
      }
    }));

    const uploadId = multipartUpload.UploadId;
    const parts = [];
    
    console.log(`Starting multipart upload: ${uploadId} with ${Math.ceil(fileBuffer.length / CHUNK_SIZE)} parts`);

    // Upload parts
    for (let i = 0; i < fileBuffer.length; i += CHUNK_SIZE) {
      const partNumber = Math.floor(i / CHUNK_SIZE) + 1;
      const chunk = fileBuffer.slice(i, i + CHUNK_SIZE);
      
      console.log(`Uploading part ${partNumber}/${Math.ceil(fileBuffer.length / CHUNK_SIZE)}`);
      
      const uploadPartResponse = await client.send(new UploadPartCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: chunk,
      }));

      parts.push({
        PartNumber: partNumber,
        ETag: uploadPartResponse.ETag
      });
    }

    // Complete multipart upload
    await client.send(new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts }
    }));

    console.log(`Multipart upload completed successfully: ${fileName}`);
    return `Uploaded ${fileName} to R2 using multipart upload (${parts.length} parts)`;
    
  } catch (error) {
    console.error('Multipart upload failed:', error);
    
    // Attempt to abort multipart upload
    try {
      if (multipartUpload?.UploadId) {
        await client.send(new AbortMultipartUploadCommand({
          Bucket: bucketName,
          Key: fileName,
          UploadId: multipartUpload.UploadId
        }));
        console.log('Multipart upload aborted');
      }
    } catch (abortError) {
      console.error('Failed to abort multipart upload:', abortError);
    }
    
    throw error;
  }
}

export async function uploadDocument(fileBuffer, fileName, contentType = "application/octet-stream") {
  if (!fileBuffer || !fileName) {
    throw new Error('Missing required parameters: fileBuffer and fileName are required');
  }

  const fileSize = fileBuffer.length;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
  
  console.log(`Starting upload: ${fileName} (${fileSizeMB} MB)`);

  try {
    // Use multipart upload for files larger than 5MB
    if (fileSize > CHUNK_SIZE) {
      console.log(`File size (${fileSizeMB} MB) exceeds chunk size, using multipart upload`);
      return await uploadInChunks(fileBuffer, fileName, contentType);
    }

    // Standard upload for smaller files
    console.log(`Using standard upload for file: ${fileName}`);
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
        uploadMethod: 'standard',
        fileSize: fileSize.toString()
      },
    });

    await retry(() => getR2Client().send(command));
    console.log(`Standard upload successful: ${fileName} (${fileSizeMB} MB)`);
    return `Uploaded ${fileName} to R2 successfully (${fileSizeMB} MB)`;
    
  } catch (error) {
    console.error('R2 upload error:', error);
    
    // Enhanced error messages
    if (error.name === 'NetworkError') {
      throw new Error(`Network error during upload: ${error.message}. Please check your internet connection.`);
    }
    
    if (error.name === 'TimeoutError') {
      throw new Error(`Upload timeout: ${error.message}. The file may be too large or the connection is slow.`);
    }
    
    if (error.name === 'AccessDenied') {
      throw new Error(`Access denied: ${error.message}. Please check your R2 credentials and permissions.`);
    }
    
    if (error.name === 'NoSuchBucket') {
      throw new Error(`Bucket not found: ${error.message}. Please check your R2 bucket configuration.`);
    }
    
    throw new Error(`Failed to upload ${fileName}: ${error.message}`);
  }
}

/**
 * Generate a signed download URL for a document
 * @param {string} fileName - The name of the file to download
 * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Signed download URL
 */
export async function generateDownloadUrl(fileName, expiresIn = 3600) {
  try {
    const url = new URL(`https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME || "secure-docs"}/${fileName}`);

    const presigner = new S3RequestPresigner({
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      region: "auto",
      sha256: Hash.bind(null, "sha256"),
    });

    const signed = await presigner.presign(new HttpRequest({
      method: "GET",
      protocol: "https:",
      hostname: url.hostname,
      path: url.pathname,
    }), { expiresIn });

    console.log(`Generated download URL for ${fileName}, expires in ${expiresIn} seconds`);
    return signed.url;
  } catch (error) {
    console.error('R2 download URL generation error:', error);
    throw new Error(`Failed to generate download URL for ${fileName}: ${error.message}`);
  }
}

/**
 * Delete a document from R2 storage
 * @param {string} fileName - The name of the file to delete
 * @returns {Promise<string>} - Success message
 */
export async function deleteDocument(fileName) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "secure-docs",
      Key: fileName,
    });

    await getR2Client().send(command);
    console.log(`Document deleted from R2: ${fileName}`);
    return `Deleted ${fileName} from R2 successfully`;
  } catch (error) {
    console.error('R2 delete error:', error);
    
    if (error.name === 'NoSuchKey') {
      throw new Error(`File ${fileName} not found in R2 storage`);
    }
    
    throw new Error(`Failed to delete ${fileName}: ${error.message}`);
  }
}

/**
 * Get document metadata from R2
 * @param {string} fileName - The name of the file
 * @returns {Promise<Object>} - Document metadata
 */
export async function getDocumentMetadata(fileName) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || "secure-docs",
      Key: fileName,
    });

    const response = await getR2Client().send(command);
    
    const metadata = {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      metadata: response.Metadata,
      etag: response.ETag,
      versionId: response.VersionId
    };
    
    console.log(`Retrieved metadata for ${fileName}:`, metadata);
    return metadata;
    
  } catch (error) {
    console.error('R2 metadata error:', error);
    
    if (error.name === 'NoSuchKey') {
      throw new Error(`File ${fileName} not found in R2 storage`);
    }
    
    throw new Error(`Failed to get metadata for ${fileName}: ${error.message}`);
  }
}

/**
 * Check if a document exists in R2
 * @param {string} fileName - The name of the file to check
 * @returns {Promise<boolean>} - Whether the file exists
 */
export async function documentExists(fileName) {
  try {
    await getDocumentMetadata(fileName);
    return true;
  } catch (error) {
    if (error.message.includes('not found')) {
      return false;
    }
    throw error;
  }
}

/**
 * Get storage statistics for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Storage statistics
 */
export async function getUserStorageStats(userId) {
  try {
    // This would typically query R2 for user-specific storage info
    // For now, returning mock data
    return {
      totalFiles: 0,
      totalSize: 0,
      storageUsed: '0 MB',
      storageLimit: '1 GB',
      usagePercentage: 0
    };
  } catch (error) {
    console.error('Storage stats error:', error);
    throw new Error(`Failed to get storage statistics: ${error.message}`);
  }
}
