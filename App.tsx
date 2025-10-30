
import React, { useState, useRef, useCallback } from 'react';
import type { fabric } from 'fabric';

import { CanvasEditor, CanvasEditorRef } from './components/CanvasEditor';
import { ControlPanel } from './components/ControlPanel';
import type { GarmentView, SelectedObjectInfo } from './types';
import { GARMENT_VIEWS, PRINTABLE_AREAS } from './constants';
import { removeBackground as removeBgService } from './services/geminiService';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState<GarmentView>('front');
  const [selectedObjectInfo, setSelectedObjectInfo] = useState<SelectedObjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasEditorRef = useRef<CanvasEditorRef>(null);

  const handleAddText = (text: string) => {
    if (text.trim()) {
      canvasEditorRef.current?.addText(text);
    }
  };

  const handleAddImage = (imageSrc: string, fileType: string) => {
    canvasEditorRef.current?.addImage(imageSrc, fileType);
  };
  
  const handleRemoveBackground = useCallback(async () => {
    if (!selectedObjectInfo || !selectedObjectInfo.src) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const newImageSrc = await removeBgService(selectedObjectInfo.src);
      canvasEditorRef.current?.updateImage(newImageSrc);
    } catch (err) {
      console.error("Background removal failed:", err);
      setError("Failed to remove background. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedObjectInfo]);


  const handleObjectSelected = (info: SelectedObjectInfo | null) => {
    setSelectedObjectInfo(info);
  };
  
  const handleDeleteSelected = () => {
    canvasEditorRef.current?.deleteSelected();
  };

  const handleClearCanvas = () => {
    canvasEditorRef.current?.clearCanvas();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 h-full">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex items-center justify-center min-h-[60vh] lg:min-h-0">
            <CanvasEditor
              ref={canvasEditorRef}
              garmentImageUrl={GARMENT_VIEWS[currentView]}
              printableArea={PRINTABLE_AREAS[currentView]}
              onObjectSelected={handleObjectSelected}
            />
          </div>
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <ControlPanel
              currentView={currentView}
              onViewChange={setCurrentView}
              onAddText={handleAddText}
              onAddImage={handleAddImage}
              selectedObjectInfo={selectedObjectInfo}
              onRemoveBackground={handleRemoveBackground}
              isLoading={isLoading}
              apiError={error}
              onDeleteSelected={handleDeleteSelected}
              onClearCanvas={handleClearCanvas}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
