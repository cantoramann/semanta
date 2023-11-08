import { Tensor } from "onnxruntime-web";

export interface modelScaleProps {
  samScale: number;
  height: number;
  width: number;
}

export interface modelInputProps {
  x: number;
  y: number;
  mouseMoveType: number;
}

export interface modelDataProps {
  mouseCoordinates?: Array<modelInputProps>;
  tensor: Tensor;
  modelScale: modelScaleProps;
}

export interface ToolProps {
  handleMouseMove: (e: any) => void;
}
