import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

interface ImageLabelData {
  image: HTMLImageElement;
  label: string;
}

export async function downloadImagesAsZip(data: ImageLabelData[]): Promise<void> {
  const zip = new JSZip();
  const uuid = uuidv4();

  await Promise.all(
    data.map(async (imageData, index) => {
      const response = await fetch(imageData.image.src);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      zip.file(`${uuid}_${imageData.label.toLocaleLowerCase().replaceAll(' ', '_')}.${blob.type.split('/')[1]}`, blob);
    }),
  );

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${uuid}.zip`);
}
