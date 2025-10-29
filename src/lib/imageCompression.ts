// Image compression utilities for localStorage storage
// Full data is kept in memory for server submission

/**
 * Compresses base64 image data for localStorage
 * Removes data URL prefix and optionally compresses the base64 string
 */
export const compressImageForStorage = (base64Data: string): string => {
  if (!base64Data || typeof base64Data !== 'string') return base64Data;
  
  // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
  // Store just the base64 string which is ~33% smaller
  if (base64Data.includes(',')) {
    const parts = base64Data.split(',');
    if (parts.length > 1) {
      // Return base64 string with format prefix: "jpeg|base64string"
      const mimeType = parts[0].match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      const format = mimeType.split('/')[1] || 'jpeg';
      return `${format}|${parts[1]}`;
    }
  }
  
  return base64Data;
};

/**
 * Decompresses base64 image data from localStorage
 * Restores data URL format for display
 */
export const decompressImageFromStorage = (compressedData: string): string => {
  if (!compressedData || typeof compressedData !== 'string') return compressedData;
  
  // Check if it's in compressed format "format|base64string"
  if (compressedData.includes('|')) {
    const [format, base64] = compressedData.split('|');
    const mimeType = format === 'jpeg' ? 'image/jpeg' :
                     format === 'png' ? 'image/png' :
                     format === 'gif' ? 'image/gif' :
                     format === 'webp' ? 'image/webp' : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  }
  
  // Legacy format - if it already has data URL prefix, return as is
  if (compressedData.startsWith('data:')) {
    return compressedData;
  }
  
  // If it's just base64 without prefix, assume JPEG
  return `data:image/jpeg;base64,${compressedData}`;
};

/**
 * Compresses an array of base64 images for storage
 */
export const compressImageArray = (images: string[]): string[] => {
  if (!Array.isArray(images)) return images;
  return images.map(compressImageForStorage);
};

/**
 * Decompresses an array of base64 images from storage
 */
export const decompressImageArray = (compressedImages: string[]): string[] => {
  if (!Array.isArray(compressedImages)) return compressedImages;
  return compressedImages.map(decompressImageFromStorage);
};

