'use client';

import { useState } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PlusCircleIcon } from 'lucide-react';
import { useSegmentationImages } from '@/hooks/use-segmentation-images';

export function LabelModal() {
  const [name, setName] = useState('');
  const [hoverMaskColor, setHoverMaskColor] = useState('#ffffff'); // Start with white
  const [fileMaskColor, setFileMaskColor] = useState('#ffffff'); // Start with white
  const segmentationImagesService = useSegmentationImages();

  function handleAddNewLabel() {
    const { addLabel } = segmentationImagesService.labels;
    addLabel(name, hoverMaskColor);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <PlusCircleIcon className="dark:text-zinc-50 dark:hover:text-white hover:cursor-pointer h-6 w-6" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Label</AlertDialogTitle>
          <AlertDialogDescription>Anything you want.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="label-name">Label Name</Label>
          <Input id="label-name" placeholder="Enter label name" className="text-zinc-900" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="label-color">Hover Color</Label>
          <Input id="mask-color" type="color" value={hoverMaskColor} onChange={(e) => setHoverMaskColor(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mask-color">Mask File Color</Label>
          <Input id="mask-color" type="color" value={fileMaskColor} onChange={(e) => setFileMaskColor(e.target.value)} />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAddNewLabel}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
