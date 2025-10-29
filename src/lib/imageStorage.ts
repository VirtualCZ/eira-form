// Image storage utilities - store keys in localStorage, actual data in IndexedDB
// This avoids localStorage quota issues while keeping images persistent

const DB_NAME = 'eira-image-storage';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export type ImageKey = string;

/**
 * Generates a deterministic key identifier for an image
 * Format: "{code}_{fieldName}_{index}"
 * Same key = overwrites previous image (no duplicates)
 */
export const generateImageKey = (code: string, fieldName: string, index: number): ImageKey => {
  const key = `${code}_${fieldName}_${index}`;
  return key;
};

/**
 * Converts array of base64 images to array of key strings
 * Stores actual image data in IndexedDB using keys
 */
export const imagesToKeys = async (images: string[], code: string, fieldName: string): Promise<ImageKey[]> => {
  if (!Array.isArray(images) || images.length === 0) return [];
  
  const keys: ImageKey[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const base64Data = images[i];
    if (!base64Data || typeof base64Data !== 'string') continue;
    
    const key = generateImageKey(code, fieldName, i);
    
    // Store actual image data in IndexedDB, using key
    await storeImageInIndexedDB(key, base64Data);
    
    keys.push(key);
  }
  
  return keys;
};

/**
 * Retrieves images from IndexedDB using keys
 */
export const keysToImages = async (keys: ImageKey[]): Promise<string[]> => {
  if (!Array.isArray(keys) || keys.length === 0) return [];
  
  const images: string[] = [];
  
  for (const key of keys) {
    if (typeof key !== 'string') continue;
    
    const image = await getImageFromIndexedDB(key);
    if (image) {
      images.push(image);
    } else {
      console.warn(`Image not found in IndexedDB for key: ${key}`);
    }
  }
  
  return images;
};

/**
 * Store image in IndexedDB using key
 */
const storeImageInIndexedDB = async (key: string, base64Data: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(base64Data, key);
      
      putRequest.onsuccess = () => {
        console.log(`💾 Stored image in IndexedDB with key: ${key}`);
        resolve();
      };
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

/**
 * Get image from IndexedDB using key
 */
const getImageFromIndexedDB = async (key: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        const result = getRequest.result || null;
        if (result) {
          console.log(`🔍 Retrieved image from IndexedDB with key: ${key}`);
        }
        resolve(result);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

/**
 * Clean up old images from IndexedDB that aren't referenced by any valid keys
 */
export const cleanupOldImages = async (validKeys: Set<string>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAllKeys();
      
      getAllRequest.onsuccess = () => {
        const keys = getAllRequest.result as string[];
        let deleted = 0;
        
        keys.forEach(key => {
          if (!validKeys.has(key)) {
            store.delete(key);
            deleted++;
          }
        });
        
        if (deleted > 0) {
          console.log(`🗑️ Cleaned up ${deleted} old images from IndexedDB`);
        }
        
        resolve();
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};
