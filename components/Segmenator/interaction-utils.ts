import { combineImages } from './image-display-helpers';
import { modelInputProps } from './model-props';
const getMouseCoordinates = (x: number, y: number): modelInputProps => {
  return { x, y, mouseMoveType: 1 };
};

export const handleMouseMove = (e: any, image: HTMLImageElement, setMouseCoordinates: (arg0: any) => void) => {
  let el = e.nativeEvent.target;
  const rect = el.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  const imageScale = image ? image.width / el.offsetWidth : 1;
  x *= imageScale;
  y *= imageScale;

  const click = getMouseCoordinates(x, y);
  if (x) if (click) setMouseCoordinates([click]);
};

export const onNewAreaSelected = (maskImage: HTMLImageElement, selectedImage: HTMLImageElement | null) => {
  if (!maskImage?.width || !maskImage?.height) return;
  return combineImages(selectedImage, maskImage);
};

export async function handleSubmitSegmentation(selectedImage: HTMLImageElement, setSegmentationContext: any, completeCurrentSegmentationContext: any) {
  if (!selectedImage) return;

  setSegmentationContext(selectedImage);
  completeCurrentSegmentationContext();
}
