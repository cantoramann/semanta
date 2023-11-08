// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

// Convert the onnx model mask prediction to ImageData
function arrayToImageData(input: any, width: number, height: number, color: string) {
  // set to black
  const actualColor = color || '#ffffff';
  const [r, g, b, a] = hex2rgb(actualColor);
  const arr = new Uint8ClampedArray(4 * width * height).fill(0);
  for (let i = 0; i < input.length; i++) {
    // Threshold the onnx model mask prediction at 0.0
    // This is equivalent to thresholding the mask using predictor.model.mask_threshold
    // in python
    if (input[i] > 0.0) {
      arr[4 * i + 0] = r;
      arr[4 * i + 1] = g;
      arr[4 * i + 2] = b;
      arr[4 * i + 3] = a;
    }
  }
  return new ImageData(arr, height, width);
}

// Use a Canvas element to produce an image from ImageData
function imageDataToImage(imageData: ImageData) {
  const canvas = imageDataToCanvas(imageData);
  const image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

// Canvas elements can be created from ImageData
function imageDataToCanvas(imageData: ImageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);
  return canvas;
}

// Convert the onnx model mask output to an HTMLImageElement
export function onnxMaskToImage(input: any, width: number, height: number, color: string) {
  return imageDataToImage(arrayToImageData(input, width, height, color));
}

const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
};

// given an HTMLImageElement, turn it into a buffer, and for each coordinate that is not white, make it black.
// return it as an HTMLImageElement
export function convertToBlackMask(image: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to get 2D context.');

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 255) {
        // Check if the pixel is opaque
        data[i] = 0; // Set red to 0
        data[i + 1] = 0; // Set green to 0
        data[i + 2] = 0; // Set blue to 0
      }
    }

    context.putImageData(imageData, 0, 0);

    const blackMaskImage = new Image();
    blackMaskImage.onload = () => resolve(blackMaskImage);
    blackMaskImage.onerror = (errorEvent) => reject(new Error('Error loading the black mask image.'));

    blackMaskImage.src = canvas.toDataURL();
  });
}
