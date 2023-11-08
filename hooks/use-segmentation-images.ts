import { create } from 'zustand';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { downloadImagesAsZip } from '@/lib/download';

type Labels = {
  labels: {
    labels: { name: string; color: string; count: number; current: boolean }[];
    setLabels: (labels: { name: string; color: string }[]) => void;
    addLabel: (labelName: string, labelColor: string) => void;
    deleteLabel: (labelName: string) => void;
    setCurrentLabel: (labelName: string) => void;
    getCurrentLabel: () => { name: string; color: string; count: number; current: boolean } | null;

    incrementLabelCount: (labelName: string) => void;
    decrementLabelCount: (labelName: string) => void;
  };
};

type CurrentImage = {
  currentImage: {
    bucketUrl: string;
    setBucketUrl: (url: string) => void;

    currentUrl: string | null;
    setCurrentUrl: (url: string) => void;
    clearCurrentUrl: () => void;

    currentElement: HTMLImageElement | null;
    setCurrentElement: (element: HTMLImageElement) => void;
    clearCurrentElement: () => void;

    moveToNextImage: () => void;
  };
};

type HoverMask = {
  hoverMask: {
    hoverMaskElement: HTMLImageElement | null;
    setHoverMaskElement: (element: HTMLImageElement) => void;
    clearHoverMaskElement: () => void;
  };
};

type CurrentMasks = {
  currentMasks: {
    currentMaskElements: { [labelName: string]: HTMLImageElement };
    addCurrentMaskElement: (labelName: string, element: HTMLImageElement) => void;
    deleteCurrentMaskElement: (labelName: string) => void;
  };
};

type ImagesArray = {
  images: {
    images: { url: string; completed: boolean; current: boolean; embeddingFileUrl: string; generatedMaskUrls: { [labelName: string]: string } }[];
    setImages: (images: { url: string; completed: boolean; current: boolean; embeddingFileUrl: string; generatedMaskUrls: { [labelName: string]: string } }[]) => void;
    getCurrentImage: () => { url: string; completed: boolean; current: boolean; embeddingFileUrl: string; generatedMaskUrls: { [labelName: string]: string } } | null;
  };
};

type SegmentationImages = Labels & CurrentImage & CurrentMasks & HoverMask & ImagesArray;

export const useSegmentationImages = create<SegmentationImages>((set, get) => ({
  labels: {
    labels: [],
    setLabels: (labels) => set((state) => ({ labels: { ...state.labels, labels: labels.map((label) => ({ ...label, count: 0, current: false })) } })),
    addLabel: (labelName, labelColor) => {
      const labels = get().labels.labels;
      const newLabels = [...labels, { name: labelName, color: labelColor, count: 0, current: false }];
      set((state) => ({ labels: { ...state.labels, labels: newLabels } }));
    },
    deleteLabel: (labelName) => {
      const labels = get().labels.labels;
      const newLabels = labels.filter((label) => label.name !== labelName);
      set((state) => ({ labels: { ...state.labels, labels: newLabels } }));
    },
    setCurrentLabel: (labelName) => {
      const labels = get().labels.labels;
      const newLabels = labels.map((label) => ({ ...label, current: label.name === labelName }));
      set((state) => ({ labels: { ...state.labels, labels: newLabels } }));
    },
    getCurrentLabel: () => {
      const labels = get().labels.labels;
      const currentLabel = labels.find((label) => label.current);
      return currentLabel || null;
    },

    incrementLabelCount: (labelName) => {
      const labels = get().labels.labels;
      const newLabels = labels.map((label) => ({ ...label, count: label.name === labelName ? label.count + 1 : label.count }));
      set((state) => ({ labels: { ...state.labels, labels: newLabels } }));
    },
    decrementLabelCount: (labelName) => {
      const labels = get().labels.labels;
      const newLabels = labels.map((label) => ({ ...label, count: label.name === labelName ? label.count - 1 : label.count }));
      set((state) => ({ labels: { ...state.labels, labels: newLabels } }));
    },
  },
  currentImage: {
    bucketUrl: '',
    setBucketUrl: (url: string) => set((state) => ({ currentImage: { ...state.currentImage, bucketUrl: url } })),
    currentUrl: null,
    setCurrentUrl: (url: string) => set((state) => ({ currentImage: { ...state.currentImage, currentUrl: url } })),

    clearCurrentUrl: () => set((state) => ({ currentImage: { ...state.currentImage, currentUrl: null } })),

    currentElement: null,
    setCurrentElement: (element) => set((state) => ({ currentImage: { ...state.currentImage, currentElement: element } })),
    clearCurrentElement: () => set((state) => ({ currentImage: { ...state.currentImage, currentElement: null } })),

    moveToNextImage: async () => {
      // Write the current image to the folder
      const currentImage = get().currentImage;

      // Get the original image
      const originalImageElement = currentImage.currentElement;
      if (!originalImageElement) return;

      // Get the current masks for the image
      const currentMasks = get().currentMasks.currentMaskElements;
      const labelsToElements = Object.entries(currentMasks).map(([labelName, element]) => ({ labelName, element }));
      await downloadImagesAsZip(labelsToElements.map(({ labelName, element }) => ({ image: element, label: labelName })));

      // Return if the next image doesn't exist
      const images = get().images.images;
      const currentImageIndex = images.findIndex((image) => image.current);
      const nextImageIndex = currentImageIndex + 1;
      const nextImage = images[nextImageIndex];
      if (!nextImage) return;

      set((state) => ({
        images: {
          ...state.images,
          images: images.map((image, index) => ({
            ...image,
            current: index === nextImageIndex,
          })),
        },
        currentImage: {
          ...state.currentImage,
          currentUrl: nextImage.url,
          currentElement: null,
          bucketUrl: nextImage.url,
        },
        currentMasks: {
          ...state.currentMasks,
          currentMaskElements: {},
        },
      }));
    },
  },
  currentMasks: {
    currentMaskElements: {},
    addCurrentMaskElement: (labelName, element) => set((state) => ({ currentMasks: { ...state.currentMasks, currentMaskElements: { ...state.currentMasks.currentMaskElements, [labelName]: element } } })),
    deleteCurrentMaskElement: (labelName) => {
      const currentMaskElements = get().currentMasks.currentMaskElements;
      const newCurrentMaskElements = Object.keys(currentMaskElements)
        .filter((key) => key !== labelName)
        .reduce((obj, key) => {
          obj[key] = currentMaskElements[key];
          return obj;
        }, {} as { [labelName: string]: HTMLImageElement });
      set((state) => ({ currentMasks: { ...state.currentMasks, currentMaskElements: newCurrentMaskElements } }));
    },
  },
  hoverMask: {
    hoverMaskElement: null,
    setHoverMaskElement: (element) => set((state) => ({ hoverMask: { ...state.hoverMask, hoverMaskElement: element } })),
    clearHoverMaskElement: () => set((state) => ({ hoverMask: { ...state.hoverMask, hoverMaskElement: null } })),
  },
  images: {
    images: [],
    setImages: (images) => set((state) => ({ images: { ...state.images, images } })),
    getCurrentImage: () => {
      const images = get().images.images;
      const currentImage = images.find((image) => image.current);
      return currentImage || null;
    },
  },
}));
