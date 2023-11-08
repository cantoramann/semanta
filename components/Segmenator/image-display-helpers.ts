export function combineImages(img1: HTMLImageElement | null, img2: HTMLImageElement): HTMLImageElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // if img1 is null, return img2
  if (img1 === null) return img2;

  canvas.width = Math.max(img1.width, img2.width);
  canvas.height = Math.max(img1.height, img2.height);
  ctx?.drawImage(img1, 0, 0);
  ctx?.drawImage(img2, 0, 0);

  const combinedImageSrc = canvas.toDataURL();
  const combinedImage = new Image();
  combinedImage.src = combinedImageSrc;

  return combinedImage;
}

export function removeHoveredMaskFromSelectedMask(hoveredMask: HTMLImageElement, selectedMask: HTMLImageElement | null): HTMLImageElement | null {
  if (!selectedMask) return null;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = selectedMask.width;
  canvas.height = selectedMask.height;
  ctx?.drawImage(selectedMask, 0, 0);

  const hoverCanvas = document.createElement('canvas');
  const hoverCtx = hoverCanvas.getContext('2d');

  hoverCanvas.width = hoveredMask.width;
  hoverCanvas.height = hoveredMask.height;
  hoverCtx?.drawImage(hoveredMask, 0, 0);

  // for every pixel in hoveredMask, if the pixel is not transparent, and if the pixel is also not transparent in selectedMask, set the pixel in selectedMask to transparent
  for (let x = 0; x < hoveredMask.width; x++) {
    for (let y = 0; y < hoveredMask.height; y++) {
      const pixelData = ctx?.getImageData(x, y, 1, 1).data;
      const hoverPixelData = hoverCtx?.getImageData(x, y, 1, 1).data;
      if (pixelData && hoverPixelData && hoverPixelData[3] !== 0 && pixelData[3] !== 0) {
        ctx?.clearRect(x, y, 1, 1);
      }
    }
  }

  const selectedMaskSrc = canvas.toDataURL();
  const selectedMaskImage = new Image();
  selectedMaskImage.src = selectedMaskSrc;

  return selectedMaskImage;
}

export function overlayImageWithMask(styledUrl: string, maskImage: HTMLImageElement, maskColor: string = '#FFFFFF'): Promise<HTMLImageElement> {
  const [maskR, maskG, maskB] = hex2rgb(maskColor); // Assuming you still have the hex2rgb function

  return new Promise((resolve, reject) => {
    // Step 1. Create an HTMLImageElement from the styledUrl
    const styledImage = new Image();
    styledImage.crossOrigin = 'anonymous';
    styledImage.onload = () => {
      // Create canvas for the styled image
      const styledCanvas = document.createElement('canvas');
      const styledCtx = styledCanvas.getContext('2d');
      styledCanvas.width = maskImage.width;
      styledCanvas.height = maskImage.height;
      styledCtx?.drawImage(styledImage, 0, 0, styledImage.width, styledImage.height, 0, 0, styledCanvas.width, styledCanvas.height);

      // Step 2. Create a canvas from the maskImage
      const maskCanvas = document.createElement('canvas');
      const maskCtx = maskCanvas.getContext('2d');
      maskCanvas.width = maskImage.width;
      maskCanvas.height = maskImage.height;
      maskCtx?.drawImage(maskImage, 0, 0);

      // Step 3. For every pixel in maskCanvas, if the pixel is not white or transparent, keep the styledCanvas pixel color, otherwise make the styledCanvas pixel transparent
      const maskImageData = maskCtx?.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      const styledImageData = styledCtx?.getImageData(0, 0, styledCanvas.width, styledCanvas.height);
      if (maskImageData && styledImageData) {
        for (let i = 0; i < maskImageData.data.length; i += 4) {
          // If pixel in the mask is opaque (part of the mask)
          if (maskImageData.data[i + 3] === 255) {
            styledImageData.data[i + 3] = 255; // Make the corresponding styledImage pixel opaque
          } else {
            styledImageData.data[i + 3] = 0; // Make the corresponding styledImage pixel transparent
          }
        }
        styledCtx?.putImageData(styledImageData, 0, 0);
      }

      // Step 4. Return the styledCanvas as an HTMLImageElement
      const styledImageSrc = styledCanvas.toDataURL();
      const styledImageWithMask = new Image();
      styledImageWithMask.onload = () => resolve(styledImageWithMask);
      styledImageWithMask.onerror = reject;
      styledImageWithMask.src = styledImageSrc;
      styledImageWithMask.crossOrigin = 'anonymous';
    };
    styledImage.onerror = reject;
    styledImage.src = styledUrl;
  });
}

function hex2rgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}
