export function handleImageScale(image: HTMLImageElement) {
  // Input images to SAM must be resized so the longest side is 1024
  const LONG_SIDE_LENGTH = 1024;
  let w = image.naturalWidth;
  let h = image.naturalHeight;
  const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
  return { height: h, width: w, samScale };
}

function loadImage(img: HTMLImageElement) {
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const imageScaleData = handleImageScale(img);

      img.width = imageScaleData.width;
      img.height = imageScaleData.height;

      resolve({
        img,
        ...imageScaleData,
      });
    };

    img.onerror = (err) => {
      return null;
    };
  });
}

export async function onNewImage(imageUrl: string) {
  const img = new Image();
  img.src = imageUrl;
  const data = await loadImage(img);

  return data;
}
