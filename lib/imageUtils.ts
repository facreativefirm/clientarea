/**
 * Compresses an image and converts it to WebP format using Canvas API.
 * @param base64Str The original image as Base64 string
 * @param quality Quality from 0 to 1 (default 0.7)
 * @param maxWidth Maximum width of the image (default 1200px)
 * @returns Promise resolving to the compressed WebP Base64 string
 */
export const compressImage = (base64Str: string, quality: number = 0.7, maxWidth: number = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Maintain aspect ratio while resizing
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to WebP with specified quality
            const compressedBase64 = canvas.toDataURL('image/webp', quality);
            resolve(compressedBase64);
        };
        img.onerror = (err) => {
            reject(err);
        };
    });
};
