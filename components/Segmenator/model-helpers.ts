import * as ort from 'onnxruntime-web';
import npyjs from './npyjs';
import { InferenceSession } from 'onnxruntime-web';

const MODEL_DIR = '/segmentation/sam_onnx_quantized.onnx';

ort.env.wasm.wasmPaths = {
  'ort-wasm.wasm': '/segmentation/ort-wasm.wasm',
  'ort-wasm-simd.wasm': '/segmentation/ort-wasm-simd.wasm',
  'ort-wasm-threaded.wasm': '/segmentation/ort-wasm-threaded.wasm',
};

export const initModel = async (imageUrl: string, embeddingUrl: string) => {
  if (!imageUrl || !embeddingUrl?.length) return null;

  try {
    const URL: string = MODEL_DIR;
    const model = await InferenceSession.create(URL);
    return model;
  } catch (e) {
    console.log('error in initModel', e);
    return null;
  }
};

export const getProcessedEmbedding = async (embeddingUrl: string) => {
  try {
    const embedding = await loadNpyTensor(embeddingUrl);
    return embedding;
  } catch (e) {
    return null;
  }
};

const loadNpyTensor = async (tensorFile: string) => {
  const dType = 'float32';
  let npLoader = new npyjs();
  const npArray = await npLoader.load(tensorFile);
  const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
  return tensor;
};
