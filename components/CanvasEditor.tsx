import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as fabric from 'fabric';
import type { PrintableArea, SelectedObjectInfo, FilterType } from '../types';
import { PPI_THRESHOLD } from '../constants';

interface CanvasEditorProps {
  garmentImageUrl: string;
  printableArea: PrintableArea;
  onObjectSelected: (info: SelectedObjectInfo | null) => void;
}

export interface CanvasEditorRef {
  addText: (text: string) => void;
  addImage: (url: string, fileType: string) => void;
  updateImage: (newUrl: string) => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  applyFilter: (filter: FilterType) => void;
}

export const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>((props, ref) => {
  const { garmentImageUrl, printableArea, onObjectSelected } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });

  const getObjectInfo = (obj: fabric.Object): SelectedObjectInfo => {
    const scaleX = obj.scaleX || 1;
    const scaleY = obj.scaleY || 1;
    const width = obj.width || 0;
    const height = obj.height || 0;

    const widthInches = (width * scaleX / printableArea.width) * printableArea.realWidthInches;
    const heightInches = (height * scaleY / printableArea.width) * printableArea.realWidthInches;
    
    let ppi, qualityWarning = false;
    // fabric.Image has _element property with naturalWidth/Height
    const imgElement = (obj as any)._element;
    if (obj.type === 'image' && imgElement) {
        const naturalWidth = imgElement.naturalWidth;
        ppi = naturalWidth / widthInches;
        qualityWarning = ppi < PPI_THRESHOLD;
    }

    return {
      type: obj.type as 'image' | 'text',
      widthInches: parseFloat(widthInches.toFixed(2)),
      heightInches: parseFloat(heightInches.toFixed(2)),
      rotation: Math.round(obj.angle || 0),
      src: (obj as any).src,
      fileType: (obj as any).fileType,
      ppi: ppi ? Math.round(ppi) : undefined,
      qualityWarning,
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            const size = Math.min(width, height, 800);
            setCanvasSize({ width: size, height: size });
        }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#f9fafb',
    });
    fabricCanvasRef.current = canvas;

    // Set garment background
    fabric.Image.fromURL(garmentImageUrl, { crossOrigin: 'anonymous' }).then(img => {
        img.scaleToWidth(canvas.getWidth());
        img.scaleToHeight(canvas.getHeight());
        img.set({
          originX: 'left',
          originY: 'top',
        });
        canvas.backgroundImage = img;
        canvas.renderAll();
    });

    // Draw printable area
    const rect = new fabric.Rect({
        left: printableArea.left,
        top: printableArea.top,
        width: printableArea.width,
        height: printableArea.height,
        fill: 'rgba(0,0,0,0.1)',
        stroke: 'rgba(255,0,0,0.5)',
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
    });
    canvas.add(rect);

    // FIX: Using fabric.TEvent as fabric.IEvent is not exported in this version.
    const onObjectModified = (e: fabric.TEvent) => {
        const obj = (e as any).target as fabric.Object;
        if (!obj) return;
        
        // Bounding box for printable area
        const area = {
            left: printableArea.left,
            top: printableArea.top,
            right: printableArea.left + printableArea.width,
            bottom: printableArea.top + printableArea.height,
        };

        const objBounds = obj.getBoundingRect();

        // Clamp position
        if (objBounds.left < area.left) obj.left = (obj.left ?? 0) - (objBounds.left - area.left);
        if (objBounds.top < area.top) obj.top = (obj.top ?? 0) - (objBounds.top - area.top);
        if (objBounds.left + objBounds.width > area.right) obj.left = (obj.left ?? 0) - (objBounds.left + objBounds.width - area.right);
        if (objBounds.top + objBounds.height > area.bottom) obj.top = (obj.top ?? 0) - (objBounds.top + objBounds.height - area.bottom);
        
        obj.setCoords();
        canvas.renderAll();
        onObjectSelected(getObjectInfo(obj));
    };
    
    canvas.on('object:modified', onObjectModified);
    canvas.on('object:scaling', onObjectModified);

    // FIX: Using fabric.TEvent as fabric.IEvent is not exported in this version.
    const handleSelection = (e: fabric.TEvent) => {
      // FIX: Cast e.target to fabric.Object to satisfy getObjectInfo function signature
      onObjectSelected((e as any).target ? getObjectInfo((e as any).target as fabric.Object) : null);
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => onObjectSelected(null));
    
    return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garmentImageUrl, printableArea, canvasSize]);

  useImperativeHandle(ref, () => ({
    addText: (text) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const textObj = new fabric.Textbox(text, {
        left: printableArea.left + (printableArea.width / 2),
        top: printableArea.top + (printableArea.height / 2),
        width: 150,
        fontSize: 24,
        fill: '#000000',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
      });
      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
    },
    addImage: (url, fileType) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        fabric.Image.fromURL(url, { crossOrigin: 'anonymous' }).then(img => {
            img.scaleToWidth(printableArea.width / 2);
            img.set({
                left: printableArea.left + printableArea.width / 2,
                top: printableArea.top + printableArea.height / 2,
                originX: 'center',
                originY: 'center',
            });
            (img as any).src = url; // Store original src
            (img as any).fileType = fileType;
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
        });
    },
    updateImage: (newUrl: string) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.type === 'image') {
            const img = activeObject as fabric.Image;
            const originalProps = {
                left: img.left, top: img.top, angle: img.angle,
                scaleX: img.scaleX, scaleY: img.scaleY,
            };
            
            fabric.Image.fromURL(newUrl, { crossOrigin: 'anonymous' }).then(newImg => {
                newImg.set(originalProps);
                (newImg as any).src = newUrl;
                (newImg as any).fileType = 'image/png'; // After bg removal it's png
                canvas.remove(img);
                canvas.add(newImg);
                canvas.setActiveObject(newImg);
                canvas.renderAll();
            });
        }
    },
    deleteSelected: () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                canvas.remove(activeObject);
                canvas.discardActiveObject();
                canvas.renderAll();
                onObjectSelected(null);
            }
        }
    },
    clearCanvas: () => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
            const objects = canvas.getObjects().filter(obj => obj.selectable);
            objects.forEach(obj => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
            onObjectSelected(null);
        }
    },
    applyFilter: (filter: FilterType) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const activeObject = canvas.getActiveObject();

      if (activeObject && activeObject.type === 'image') {
        const image = activeObject as InstanceType<typeof fabric.Image>;
        image.filters = []; // Clear existing filters

        switch (filter) {
          case 'grayscale':
            image.filters.push(new fabric.filters.Grayscale());
            break;
          case 'sepia':
            image.filters.push(new fabric.filters.Sepia());
            break;
          case 'invert':
            image.filters.push(new fabric.filters.Invert());
            break;
          case 'vintage':
            image.filters.push(new fabric.filters.Vintage());
            break;
          case 'none':
            // Filters are already cleared, do nothing.
            break;
        }

        image.applyFilters();
        canvas.renderAll();
      }
    }
  }));

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} />
    </div>
  );
});