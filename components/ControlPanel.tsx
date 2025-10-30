import React, { useState, useRef } from 'react';
import type { GarmentView, SelectedObjectInfo, FilterType } from '../types';
import { UploadIcon, TextIcon, SwitchHorizontalIcon, TrashIcon, SparklesIcon, XCircleIcon } from './icons';

interface ControlPanelProps {
  currentView: GarmentView;
  onViewChange: (view: GarmentView) => void;
  onAddText: (text: string) => void;
  onAddImage: (imageSrc: string, fileType: string) => void;
  selectedObjectInfo: SelectedObjectInfo | null;
  onRemoveBackground: () => void;
  isLoading: boolean;
  apiError: string | null;
  onDeleteSelected: () => void;
  onClearCanvas: () => void;
  onApplyFilter: (filter: FilterType) => void;
}

const FilterButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="w-full py-2 px-2 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
        {children}
    </button>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  currentView,
  onViewChange,
  onAddText,
  onAddImage,
  selectedObjectInfo,
  onRemoveBackground,
  isLoading,
  apiError,
  onDeleteSelected,
  onClearCanvas,
  onApplyFilter,
}) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onAddImage(result, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
     // Reset file input to allow uploading the same file again
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleAddTextClick = () => {
    onAddText(text);
    setText('');
  };
  
  const canRemoveBackground = selectedObjectInfo?.type === 'image' && selectedObjectInfo?.fileType?.startsWith('image/jpeg');

  return (
    <div className="flex flex-col space-y-6 h-full">
      
      {/* Garment View */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Garment View</h3>
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onViewChange('front')}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentView === 'front' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => onViewChange('back')}
            className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              currentView === 'back' ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Back
          </button>
        </div>
      </div>
      
      {/* Add Elements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Add Elements</h3>
        <div className="space-y-4">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              <UploadIcon className="h-5 w-5 mr-2" />
              Upload Logo
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="flex-grow p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddTextClick}
              disabled={!text.trim()}
              className="flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
            >
              <TextIcon className="h-5 w-5 mr-2" /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 flex-grow pt-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Selected Element</h3>
        {selectedObjectInfo ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="capitalize text-md font-medium text-gray-800">{selectedObjectInfo.type}</p>
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <p className="text-gray-500">Width:</p><p className="text-gray-800 font-mono">{selectedObjectInfo.widthInches}"</p>
                <p className="text-gray-500">Height:</p><p className="text-gray-800 font-mono">{selectedObjectInfo.heightInches}"</p>
                <p className="text-gray-500">Rotation:</p><p className="text-gray-800 font-mono">{selectedObjectInfo.rotation}°</p>
                {selectedObjectInfo.ppi && (
                  <>
                    <p className="text-gray-500">Quality:</p><p className="text-gray-800 font-mono">{selectedObjectInfo.ppi} PPI</p>
                  </>
                )}
              </div>
              {selectedObjectInfo.qualityWarning && (
                  <div className="mt-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-xs" role="alert">
                    <p><strong>Warning:</strong> Image resolution is low for the selected size. Print quality may be poor.</p>
                  </div>
              )}
            </div>
            
            {selectedObjectInfo.type === 'image' && (
              <div className="space-y-4">
                  <div>
                      <button onClick={onRemoveBackground} disabled={!canRemoveBackground || isLoading} className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 transition-colors">
                          {isLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-5 w-5 mr-2" />
                              AI Remove Background
                            </>
                          )}
                      </button>
                      {!canRemoveBackground && <p className="text-xs text-gray-500 mt-2 text-center">Background removal is available for JPG images.</p>}
                      {apiError && <p className="text-xs text-red-500 mt-2 text-center">{apiError}</p>}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-600 mb-3">Image Filters</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <FilterButton onClick={() => onApplyFilter('none')}>Original</FilterButton>
                      <FilterButton onClick={() => onApplyFilter('grayscale')}>Grayscale</FilterButton>
                      <FilterButton onClick={() => onApplyFilter('sepia')}>Sepia</FilterButton>
                      <FilterButton onClick={() => onApplyFilter('invert')}>Invert</FilterButton>
                      <FilterButton onClick={() => onApplyFilter('vintage')}>Vintage</FilterButton>
                    </div>
                  </div>
              </div>
            )}
            
            <button onClick={onDeleteSelected} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-all">
                <TrashIcon className="h-5 w-5 mr-2"/> Delete Element
            </button>

          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-sm text-gray-500">Select an element on the canvas to see its properties and edit it.</p>
          </div>
        )}
      </div>

      <div className="pt-4 mt-auto">
        <button onClick={onClearCanvas} className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all">
            <XCircleIcon className="h-5 w-5 mr-2"/> Clear Canvas
        </button>
      </div>

    </div>
  );
};
