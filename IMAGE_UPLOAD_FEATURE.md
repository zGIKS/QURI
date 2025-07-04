# Image Upload Feature - Design Lab

## Overview

This feature allows users to upload images to their Design Lab projects using Cloudinary as the cloud storage provider. The uploaded images are automatically converted to image layers that can be positioned and styled within the project.

## Components

### 1. CloudinaryService (`/src/app/design-lab/services/cloudinary.service.ts`)

**Purpose**: Handles image uploads to Cloudinary
- Uploads images to Cloudinary with proper validation
- Supports JPEG, PNG, GIF, and WebP formats
- Maximum file size: 10MB
- Automatically organizes images in a "design-lab" folder

**Key Methods**:
- `uploadImage(file: File)` - Uploads image to Cloudinary
- `isValidImageFile(file: File)` - Validates file type and size
- `getSupportedFormats()` - Returns supported image formats
- `getMaxFileSize()` - Returns maximum allowed file size

### 2. ImageUploadComponent (`/src/app/design-lab/components/image-upload/image-upload.component.ts`)

**Purpose**: Provides UI for image upload
- Material Design file upload button
- Progress indicator during upload
- Success/error feedback with snackbar notifications
- File validation with user-friendly error messages

**Events**:
- `imageUploaded` - Emitted when image is successfully uploaded with result data

### 3. SimpleEditorComponent Updates

**New Features**:
- Added image upload component to the "Add Image" tab
- Integrated with the design lab service to create image layers
- Added image layer rendering in the preview
- Added image layer styling with hover effects

## Backend Integration

The image upload feature integrates with the existing backend API:

- **Endpoint**: `POST /api/v1/projects/{projectId}/images`
- **Request Body**:
  ```json
  {
    "imageUrl": "https://res.cloudinary.com/...",
    "width": "800",
    "height": "600"
  }
  ```

## Cloudinary Configuration

To use this feature, you need to:

1. **Create a Cloudinary account** at https://cloudinary.com
2. **Update the CloudinaryService** with your credentials:
   ```typescript
   private readonly cloudName = 'your-cloud-name';
   private readonly uploadPreset = 'your-upload-preset';
   ```
3. **Create an Upload Preset** in Cloudinary Dashboard:
   - Go to Settings → Upload
   - Create a new preset with name "design-lab-images"
   - Set signing mode to "Unsigned"
   - Configure allowed formats: jpg, png, gif, webp
   - Set maximum file size to 10MB

## Usage

1. User opens a project in the Design Lab editor
2. User clicks on the "Add Image" tab
3. User clicks "Add Image" button to open file picker
4. User selects an image file (JPEG, PNG, GIF, or WebP)
5. Image is uploaded to Cloudinary
6. Image layer is automatically created in the project
7. Image appears in the preview canvas and can be positioned

## Translations

The feature includes translations for both English and Spanish:

- Upload button text
- Progress indicators
- Success/error messages
- File format information
- Help text

## Error Handling

The system provides comprehensive error handling:
- File validation (format, size)
- Network errors during upload
- Backend API errors
- User-friendly error messages with actionable feedback

## Future Enhancements

- Image layer resizing and rotation
- Image filters and effects
- Batch image upload
- Image cropping before upload
- Integration with stock photo APIs
