import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary.config';
import ApiError from './ApiError';

export const uploadFile = async (
  buffer: Buffer,
  folder: string = 'uploads',
  fileName?: string,
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto',
  mimeType?: string
): Promise<any> => {
  try {
    // Convert buffer to base64
    const base64 = buffer.toString('base64');
    const dataURI = `data:${mimeType || 'application/octet-stream'};base64,${base64}`;
    let finalResourceType: 'auto' | 'image' | 'video' | 'raw' = resourceType;

    // Prefer explicit mime type when available.
    if (mimeType === 'application/pdf') {
      finalResourceType = 'raw';
    } else if (mimeType?.startsWith('image/')) {
      finalResourceType = 'image';
    } else if (mimeType?.startsWith('video/')) {
      finalResourceType = 'video';
    }

    const uploadOptions: any = {
      folder,
      resource_type: finalResourceType,
      type: 'upload',
      access_mode: 'public',
    };

    if (fileName) {
      uploadOptions.public_id = fileName;
    }

    // ✅ PDF specific options
    if (mimeType === 'application/pdf') {
      uploadOptions.format = 'pdf';
      // PDF এর সব page upload করতে
      uploadOptions.pages = true;
    }

    console.log('🚀 Uploading file with options:', {
      folder,
      fileName,
      mimeType,
      resourceType: uploadOptions.resource_type,
    });

    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    console.log('✅ Upload successful:', {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      pages: result.pages, // PDF এর page count
      bytes: result.bytes,
    });

    return result;
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', {
      message: error.message,
      error: error.error,
      http_code: error.http_code,
    });
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'File upload failed: ' + error.message);
  }
};

const extractCloudinaryPublicId = (fileUrl: string): string | null => {
  try {
    const decodedUrl = decodeURIComponent(fileUrl);
    const match = decodedUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    if (!match || !match[1]) return null;
    return match[1];
  } catch {
    return null;
  }
};

export const deleteFileByUrl = async (fileUrl: string): Promise<void> => {
  const publicId = extractCloudinaryPublicId(fileUrl);
  if (!publicId) return;

  const resourceTypes: Array<'image' | 'video' | 'raw'> = ['image', 'video', 'raw'];

  for (const resourceType of resourceTypes) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (result?.result === 'ok' || result?.result === 'not found') {
        return;
      }
    } catch {
      // Try next resource type.
    }
  }
};
