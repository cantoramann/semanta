import { modelScaleProps } from '@/components/Segmenator/model-props';
import { Tensor, TypedTensor } from 'onnxruntime-web';
import { create } from 'zustand';

type onnx = {
  inferenceCompleted: boolean;
  setInferenceCompleted: (inferenceCompleted: boolean) => void;

  model: any;
  setModel: (model: any) => void;

  modelScale: modelScaleProps | null;
  setModelScale: (modelScale: modelScaleProps) => void;

  tensor: Tensor | null;
  setTensor: (tensor: TypedTensor<'float32'> | null) => void;

  embeddingLoaded: boolean;
  setEmbeddingLoaded: (embeddingLoaded: boolean) => void;

  mouseCoordinates: any;
  setMouseCoordinates: (mouseCoordinates: any) => void;

  shouldFitToWidth: boolean;
  setShouldFitToWidth: (shouldFitToWidth: boolean) => void;
};

export const useOnnxService = create<onnx>((set) => ({
  inferenceCompleted: false,
  setInferenceCompleted: (inferenceCompleted: boolean) => set((state) => ({ ...state, inferenceCompleted })),

  model: null,
  setModel: (model: any) => set((state) => ({ ...state, model })),

  modelScale: null,
  setModelScale: (modelScale: modelScaleProps) => set((state) => ({ ...state, modelScale })),

  tensor: null,
  setTensor: (tensor: TypedTensor<'float32'> | null) => set((state) => ({ ...state, tensor })),

  embeddingLoaded: false,
  setEmbeddingLoaded: (embeddingLoaded: boolean) => set((state) => ({ ...state, embeddingLoaded })),

  mouseCoordinates: {},
  setMouseCoordinates: (mouseCoordinates: any) => set((state) => ({ ...state, mouseCoordinates })),

  shouldFitToWidth: false,
  setShouldFitToWidth: (shouldFitToWidth: boolean) => set((state) => ({ ...state, shouldFitToWidth })),
}));
