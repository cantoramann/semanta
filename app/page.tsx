'use client';

import Link from 'next/link';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { CheckCheckIcon } from 'lucide-react';
import { useEffect } from 'react';
import { runInference, runONNX } from '@/components/Segmenator/model-utils';
import { useOnnxService } from '@/hooks/use-onnx';
import { debounce } from 'lodash';
import { useSegmentationImages } from '@/hooks/use-segmentation-images';
import { handleMouseMove, onNewAreaSelected } from '@/components/Segmenator/interaction-utils';
import { cn } from '@/lib/utils';
import { LabelModal } from '@/components/label-modal';

export default function ProjectPage() {
  return (
    <section className="w-full bg-white dark:bg-zinc-900 min-h-screen">
      <nav className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">semanta</h1>
        </Link>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-24 flex justify-center gap-x-20 space-y-8">
        <Segmentation />
        <LabelNav />
      </div>
    </section>
  );
}

function Segmentation() {
  const onnxService = useOnnxService();
  const segmentationImagesService = useSegmentationImages();

  async function startNewInference() {
    console.log('starting new inference');
    const { setCurrentUrl, setCurrentElement } = segmentationImagesService.currentImage;
    const { setModelScale, setModel, setTensor, setInferenceCompleted } = onnxService;
    const { currentUrl } = segmentationImagesService.currentImage;

    // todo : refactor variables on zustand, as this will get sphagetti
    const currentImageData = segmentationImagesService.images.getCurrentImage();
    if (!currentImageData) return;

    if (!currentUrl) return;
    const imageElement = await runInference(currentUrl, currentImageData.embeddingFileUrl, setModelScale, setModel, setTensor);
    setCurrentElement(imageElement);
    setCurrentUrl(imageElement.src);
    setInferenceCompleted(true);
  }

  async function runONNXOnHover() {
    const currentLabelColor = segmentationImagesService.labels.getCurrentLabel()?.color || '#FFFFFF';
    const image = await runONNX({ model: onnxService.model, tensor: onnxService.tensor, modelScale: onnxService.modelScale }, onnxService.mouseCoordinates, currentLabelColor);
    if (image) segmentationImagesService.hoverMask.setHoverMaskElement(image);
  }

  function clearHoverMaskOnMouseLeave() {
    segmentationImagesService.hoverMask.clearHoverMaskElement();
    onnxService.setMouseCoordinates({});
    changeMouseCoordinatesOnHover.cancel();
  }

  const changeMouseCoordinatesOnHover = debounce((e: any) => {
    const { setMouseCoordinates } = onnxService;
    const { currentElement } = segmentationImagesService.currentImage;

    if (!currentElement) return;
    handleMouseMove(e, currentElement, setMouseCoordinates);
  }, 200);

  function addNewMask() {
    const hoverMaskElement = segmentationImagesService.hoverMask.hoverMaskElement;
    const currentLabel = segmentationImagesService.labels.getCurrentLabel();
    if (!hoverMaskElement || !currentLabel) return;

    const currentMaskElement = segmentationImagesService.currentMasks.currentMaskElements[currentLabel.name];
    const generatedSelectedMask = onNewAreaSelected(hoverMaskElement, currentMaskElement || null);

    if (!generatedSelectedMask) return;
    segmentationImagesService.currentMasks.addCurrentMaskElement(currentLabel.name, generatedSelectedMask);

    // increment the label count
    segmentationImagesService.labels.incrementLabelCount(currentLabel.name);
  }

  useEffect(() => {
    segmentationImagesService.images.setImages([
      {
        url: 'https://cdn.britannica.com/16/234216-050-C66F8665/beagle-hound-dog.jpg',
        completed: false,
        current: true,
        generatedMaskUrls: {},
        embeddingFileUrl: '/segmentation/dog_embedding.npy',
      },
      {
        url: 'https://images.ctfassets.net/4f3rgqwzdznj/4IPtB6YNbhB6VKcH5c5wwS/4ddf7ad3cc59e8af7bf18fad0f2f0156/golden_retriever_gray_cat-1027475322.jpg',
        completed: false,
        current: true,
        generatedMaskUrls: {},
        embeddingFileUrl: '/segmentation/cat_embedding.npy',
      },
    ]);
    segmentationImagesService.currentImage.setBucketUrl('https://cdn.britannica.com/16/234216-050-C66F8665/beagle-hound-dog.jpg');
    segmentationImagesService.currentImage.setCurrentUrl('https://cdn.britannica.com/16/234216-050-C66F8665/beagle-hound-dog.jpg');
  }, []);

  useEffect(() => {
    if (segmentationImagesService.currentImage.bucketUrl) startNewInference();
  }, [segmentationImagesService.currentImage.bucketUrl]);

  useEffect(() => {
    console.log('mouse coordinates changed', onnxService.mouseCoordinates);
    if (onnxService.mouseCoordinates && onnxService.inferenceCompleted) {
      runONNXOnHover();
    }
  }, [onnxService.mouseCoordinates]);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="relative max-w-4xl w-full">
        {segmentationImagesService.currentImage.currentElement && (
          <img
            src={segmentationImagesService.currentImage.currentElement.src}
            className="max-w-4xl w-full absolute inset-0"
            onMouseMove={changeMouseCoordinatesOnHover}
            onMouseLeave={() => clearHoverMaskOnMouseLeave()}
            onClick={addNewMask}
          />
        )}
        {Object.values(segmentationImagesService.currentMasks.currentMaskElements).map((maskElement, index) => (
          <img key={index} src={maskElement.src} className="max-w-4xl w-full absolute inset-0 pointer-events-none opacity-60" />
        ))}
        {segmentationImagesService.hoverMask.hoverMaskElement && <img src={segmentationImagesService.hoverMask.hoverMaskElement.src} className="max-w-4xl w-full absolute inset-0 pointer-events-none opacity-60" />}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>New Label</ContextMenuItem>
        <ContextMenuItem>Next Image</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function LabelNav() {
  const segmentationImages = useSegmentationImages();
  const labelService = segmentationImages.labels;

  function onLabelClick(labelName: string) {
    labelService.setCurrentLabel(labelName);
  }

  useEffect(() => {
    labelService.setLabels([]);
    labelService.addLabel('Dog', '#00FFFF');
    labelService.addLabel('Cat', '#7FFFD4');
  }, []);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex gap-x-4 items-center">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Labels</h2>
        <LabelModal />
      </div>
      <div className="flex flex-col space-y-4">
        {labelService.labels.map((label) => (
          <div
            key={label.name.replaceAll(' ', '_')}
            className={cn('flex space-x-2 items-center hover:cursor-pointer hover:bg-zinc-800 p-2 rounded-lg w-40', label.current && 'bg-zinc-800')}
            onClick={() => onLabelClick(label.name)}
          >
            <div className={cn('w-4 h-4')} style={{ backgroundColor: label.color }} />
            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="font-bold">{label.name}</span> - {label.count}
            </p>
            {label.current && <CheckCheckIcon className="w-5 h-5 text-green-400" />}
          </div>
        ))}
      </div>
      <div className="py-4 flex gap-x-4 flex-wrap">
        <Button variant="outline" onClick={segmentationImages.currentImage.moveToNextImage}>
          Next Image
        </Button>
      </div>
    </div>
  );
}
