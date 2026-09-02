/**
 * Resizes and compresses a base64 image or File object using an HTML5 Canvas.
 * Reduces raw 5-10MB base64 strings down to ~20-50KB for fast network transfers & safe localStorage quota compliance.
 */
export const compressImage = (
  base64OrFile: string | File,
  maxWidth: number = 350,
  maxHeight: number = 350,
  quality: number = 0.82
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio constraints
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // High quality smooth image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
      }

      // Convert to efficient WebP or JPEG compressed data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Return original as fallback if canvas fails
      resolve(typeof base64OrFile === 'string' ? base64OrFile : '');
    };

    if (typeof base64OrFile === 'string') {
      img.src = base64OrFile;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          resolve('');
        }
      };
      reader.readAsDataURL(base64OrFile);
    }
  });
};
