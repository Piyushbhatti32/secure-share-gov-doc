# Cloudflare R2 Integration for SecureShare App

This document explains how to set up and use Cloudflare R2 storage integration in your SecureShare application.

## Overview

Cloudflare R2 is a cloud storage service that's compatible with Amazon S3's API. It provides:
- **Cost-effective storage** (no egress fees)
- **Global CDN** for fast access worldwide
- **S3-compatible API** for easy integration
- **Security features** including encryption at rest

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account
2. **R2 Storage Enabled**: R2 storage must be enabled in your Cloudflare dashboard
3. **API Tokens**: You'll need R2 API tokens with appropriate permissions

## Setup Instructions

### 1. Create R2 Bucket

1. Go to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name your bucket (e.g., `secure-docs`)
5. Choose your preferred region

### 2. Generate API Tokens

1. In your Cloudflare dashboard, go to **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use the **Custom token** template
4. Configure permissions:
   - **Account Resources**: Include specific account
   - **Zone Resources**: Include specific zone
   - **Permissions**:
     - `Object Read` - for downloading files
     - `Object Write` - for uploading files
     - `Object Delete` - for deleting files
5. Click **Continue to summary** and then **Create Token**

### 3. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your-account-id-here
R2_ACCESS_KEY_ID=your-access-key-id-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET_NAME=secure-docs

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Never commit your `.env.local` file to version control!

### 4. Install Dependencies

The required packages are already installed:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner @smithy/hash-node
```

## Architecture

### File Structure

```
lib/services/
├── r2-storage-service.js    # Core R2 operations
└── document-service.js      # Document management

app/api/
├── upload/route.js          # File upload endpoint
└── download/[fileName]/route.js  # File download endpoint

components/
├── PDFViewer.js            # PDF display component
└── DocumentCard.js         # Document card with download

app/documents/
├── upload/page.js          # Upload page
└── [id]/page.js            # Document detail page
```

### Key Components

#### 1. R2 Storage Service (`lib/services/r2-storage-service.js`)

Handles all direct interactions with Cloudflare R2:

- **Upload**: `uploadDocument(fileBuffer, fileName, contentType)`
- **Download**: `generateDownloadUrl(fileName, expiresIn)`
- **Delete**: `deleteDocument(fileName)`
- **Metadata**: `getDocumentMetadata(fileName)`
- **Existence Check**: `documentExists(fileName)`

#### 2. Upload API (`app/api/upload/route.js`)

- Accepts multipart form data
- Validates file type and size
- Generates unique filenames
- Uploads to R2 storage
- Returns file metadata

#### 3. Download API (`app/api/download/[fileName]/route.js`)

- Generates signed download URLs
- URLs expire after 1 hour by default
- Secure access control via authentication

#### 4. PDF Viewer Component (`components/PDFViewer.js`)

- Displays PDFs inline using browser's built-in viewer
- Handles loading states and errors
- Provides fallback download options

## Usage Examples

### Uploading a Document

```javascript
// Frontend upload
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My Document');
formData.append('type', 'government');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Uploaded:', result.file.fileName);
```

### Downloading a Document

```javascript
// Generate download URL
const response = await fetch(`/api/download/${fileName}`);
const data = await response.json();

// Open in new tab
window.open(data.downloadUrl, '_blank');
```

### Displaying a PDF

```javascript
import PDFViewer from '@/components/PDFViewer';

<PDFViewer 
  fileName={document.fileName} 
  title={document.title}
/>
```

## Security Features

### 1. Authentication
- All API endpoints require valid Clerk authentication
- User ID is embedded in filenames for isolation

### 2. File Validation
- File type restrictions (PDF, images, documents)
- File size limits (10MB maximum)
- Content type validation

### 3. Secure URLs
- Signed download URLs with expiration
- No direct access to R2 bucket
- User-specific file access

### 4. Unique Filenames
- Timestamp-based naming
- Random string generation
- User ID prefix for isolation

## File Naming Convention

Files are stored with the following naming pattern:
```
{userId}_{timestamp}_{randomString}.{extension}
```

Example: `user123_1703123456789_a1b2c3.pdf`

This ensures:
- **Uniqueness**: No filename collisions
- **Traceability**: User association
- **Security**: No predictable patterns

## Error Handling

The system handles various error scenarios:

- **Upload failures**: Network issues, R2 errors
- **Invalid files**: Wrong type, oversized
- **Authentication**: Unauthorized access
- **Storage errors**: Bucket issues, permissions

## Monitoring and Logging

- All R2 operations are logged to console
- Error details are captured and reported
- Upload/download success/failure tracking

## Cost Considerations

### R2 Pricing (as of 2024)
- **Storage**: $0.015 per GB per month
- **Class A operations** (uploads): $4.50 per million
- **Class B operations** (downloads): $0.36 per million
- **No egress fees** (unlike AWS S3)

### Optimization Tips
- Use appropriate file compression
- Implement file lifecycle policies
- Monitor usage patterns
- Set up billing alerts

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check API token permissions
   - Verify environment variables
   - Ensure Clerk authentication is working

2. **Upload failures**
   - Check file size limits
   - Verify file type restrictions
   - Check R2 bucket permissions

3. **Download issues**
   - Verify signed URL generation
   - Check file existence in R2
   - Ensure proper authentication

### Debug Mode

Enable detailed logging by adding to your environment:

```bash
DEBUG_R2=true
```

## Future Enhancements

Potential improvements to consider:

1. **File compression** before upload
2. **Image resizing** for photos
3. **Batch operations** for multiple files
4. **File versioning** support
5. **Advanced access controls**
6. **CDN optimization** settings

## Support

For issues related to:
- **R2 Storage**: Check Cloudflare documentation
- **App Integration**: Review this README and code
- **Authentication**: Verify Clerk configuration

## Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use environment variables** for all secrets
3. **Implement proper authentication** on all endpoints
4. **Validate file uploads** thoroughly
5. **Use signed URLs** for secure access
6. **Regular security audits** of your implementation

---

**Note**: This integration provides enterprise-grade cloud storage for your SecureShare application. Ensure you follow security best practices and regularly review your R2 bucket permissions and access patterns.

