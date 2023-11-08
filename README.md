# Semanta

This project is not a fork, but it refers to `https://github.com/facebookresearch/segment-anything`.

## Overview

Semanta is a Next.js and ONNX template for developers looking to integrate Meta's SAM model for semantic segmentation into their projects with the benefits of ONNX runtime optimizations. It includes basic scaffolding for downloading images, flexibly adding labels, and generating customizable image masks.

## Prerequisites

- Node.js (our version: `v18.14.0`)
- ONNX Runtime

### Installation

`git clone https://github.com/cantoramann/semanta.git`

`npm i`

`npx next dev`

## Getting Started

After trying the demo, you may want to override small steps.

#### Custom Images:

To override custom images, refer to the `segmentationImagesService.images.setImages()` function in `app/page.tsx`. You load images from buckets such as S3 using the URLs.

#### Generating Embeddings for Custom Images:

The applicaiton requires SAM embeddings (or any other ONNX comptabile image embedding) for each image. This can be achieved by making an external call to your model or containerizing a side service (or a Jupyter Notebook) that interacts with the app. Currently, all embedding URLs are set in the beginning of the project. This may not be efficient and possible for all use cases. This can be flexibly overridden before the `runInference()` function call in `app/page.tsx`.

### Mask Colors

By default, downloaded mask colors are the same as the label colors. To keep all downloaded mask colors in black, you can use the function `convertToBlackMask()` in `components/Segmentor/mask-utils.ts`.
