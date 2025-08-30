import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Check if Cloudinary is properly configured
 */
export function checkCloudinaryConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Cloudinary Configuration Check Failed:');
    console.log('Missing variables:', missingVars);
    return false;
  }
  
  console.log('✅ Cloudinary Configuration Check Passed');
  console.log('☁️ Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  console.log('🔑 API Key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
  console.log('🔐 API Secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
  console.log('📤 Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  
  return true;
}

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} fileName - The name of the file
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<Object>} - Upload result with Cloudinary details
 */
export async function uploadToCloudinary(fileBuffer, fileName, contentType) {
  try {
    console.log('☁️ Starting Cloudinary upload...');
    console.log('📁 File:', fileName);
    console.log('📊 Size:', (fileBuffer.length / 1024 / 1024).toFixed(2), 'MB');
    console.log('🎯 Type:', contentType);
    
    // Convert buffer to base64 for Cloudinary
    const base64File = fileBuffer.toString('base64');
    const dataURI = `data:${contentType};base64,${base64File}`;
    
            // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            dataURI,
            {
              folder: 'secure-docs',
              public_id: fileName.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_'), // Remove file extension and replace spaces with underscores
              resource_type: 'auto',
              overwrite: true,
              tags: ['secure-docs', 'uploaded'],
              context: {
                original_filename: fileName,
                uploaded_at: new Date().toISOString()
              }
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
        });
    
    console.log('✅ Cloudinary upload successful');
    console.log('🔗 Public URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);
    
    return {
      success: true,
      file: {
        fileName: result.public_id,
        originalName: fileName,
        size: fileBuffer.length,
        type: contentType,
        url: result.secure_url,
        cloudinaryId: result.public_id,
        uploadedAt: new Date().toISOString(),
        format: result.format,
        width: result.width,
        height: result.height
      },
      cloudinary: result
    };
    
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @returns {Promise<Object>} - Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    console.log('🗑️ Deleting from Cloudinary:', publicId);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    console.log('✅ Cloudinary deletion successful:', result);
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ Cloudinary deletion failed:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
}

/**
 * Get file information from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @returns {Promise<Object>} - File information
 */
export async function getCloudinaryInfo(publicId) {
  try {
    console.log('🔍 Getting Cloudinary info for:', publicId);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    
    console.log('✅ Cloudinary info retrieved:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Failed to get Cloudinary info:', error);
    throw new Error(`Failed to get Cloudinary info: ${error.message}`);
  }
}

/**
 * Get Cloudinary configuration status
 */
export function getCloudinaryStatus() {
  return {
    configured: checkCloudinaryConfig(),
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
  };
}
