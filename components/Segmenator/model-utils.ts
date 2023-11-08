import { onNewImage } from './image-utils';
import { onnxMaskToImage } from './mask-utils';
import { getProcessedEmbedding, initModel } from './model-helpers';
import { modelData } from './onnx-model-api';

export async function runONNX({ model, tensor, modelScale }: { model: any; tensor: any; modelScale: any }, mouseCoordinates: any, maskColor: any) {
  try {
    if (model === null || mouseCoordinates === null || tensor === null || modelScale === null) {
      return;
    } else {
      const feeds = modelData({ mouseCoordinates, tensor, modelScale });
      if (feeds === undefined) return;

      const results = await model.run(feeds);
      const output = results[model.outputNames[0]];

      const data: HTMLImageElement = onnxMaskToImage(output.data, output.dims[2], output.dims[3], maskColor);
      return data;
    }
  } catch (e) {
    console.log('error in runONNX');
  }
}

async function getEmbeddingUrl(url: string) {
  return '/segmentation/dog_embedding.npy';
}

export async function setupModel(imageUrl: string, embeddingUrl: string) {
  // const embeddingFileUrl: string = await getEmbeddingUrl(imageUrl);
  const model = await initModel(imageUrl, embeddingUrl);
  const embedding = await getProcessedEmbedding(embeddingUrl);

  return { model, embedding };
}

export async function runInference(imageUrl: string, embeddingUrl: string, setModelScale: (arg: any) => void, setModel: (arg: any) => void, setTensor: (arg: any) => void) {
  const { model, embedding } = await setupModel(imageUrl, embeddingUrl);

  const imageElement: any = await onNewImage(imageUrl);

  const { img, height, width, samScale } = imageElement;
  setModelScale({ height, width, samScale });
  setModel(model);
  setTensor(embedding);
  return img;
}
