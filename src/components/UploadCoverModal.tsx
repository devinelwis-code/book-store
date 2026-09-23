import React, { useState, useRef } from 'react';
import { X, Upload, Link, Trash2, Camera, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Book } from '../data/booksData';
import { processImageFile } from '../utils/coverStorage';
import { BookCover } from './BookCover';

interface UploadCoverModalProps {
  book: Book;
  currentCover?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCover: (bookId: string, dataUrl: string) => Promise<void>;
  onRemoveCover: (bookId: string) => Promise<void>;
  onPrevBook?: () => void;
  onNextBook?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const UploadCoverModal: React.FC<UploadCoverModalProps> = ({
  book,
  currentCover,
  isOpen,
  onClose,
  onSaveCover,
  onRemoveCover,
  onPrevBook,
  onNextBook,
  hasPrev,
  hasNext,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processAndSet(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndSet(file);
    }
  };

  const processAndSet = async (file: File) => {
    try {
      setIsProcessing(true);
      const dataUrl = await processImageFile(file);
      setPreview(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert('Could not process this image. Please try a standard JPG/PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    const imageToSave = preview || (activeTab === 'url' && imageUrl ? imageUrl : null);
    if (!imageToSave) return;

    try {
      setIsProcessing(true);
      await onSaveCover(book.id, imageToSave);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      alert('Failed to save cover image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (confirm(`Remove the custom cover photo for "${book.name}"?`)) {
      await onRemoveCover(book.id);
      setPreview(null);
      setImageUrl('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 bg-stone-50">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              Upload Book Cover
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Add or update photograph for this book
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Book Title Summary */}
        <div className="bg-stone-100/60 px-5 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="pr-4">
            <h3
              className="text-sm font-semibold text-stone-900 line-clamp-1 font-serif"
              style={{ fontFamily: "'Noto Serif Sinhala', serif" }}
            >
              {book.name}
            </h3>
            <p className="text-xs font-mono font-medium text-emerald-700 mt-0.5">
              {book.price !== null ? `Rs. ${book.price.toLocaleString()}` : 'Price not listed'}
            </p>
          </div>

          {/* Quick prev/next navigation inside modal */}
          {(hasPrev || hasNext) && (
            <div className="flex items-center space-x-1 shrink-0">
              <button
                type="button"
                onClick={onPrevBook}
                disabled={!hasPrev}
                className="p-1 rounded border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous book"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onNextBook}
                disabled={!hasNext}
                className="p-1 rounded border border-stone-300 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next book"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cover comparison & preview */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="w-28 text-center">
              <p className="text-[11px] font-medium text-stone-500 mb-1.5 uppercase tracking-wide">
                Current Cover
              </p>
              <BookCover
                name={book.name}
                price={book.price}
                coverImage={currentCover}
                className="shadow-sm"
              />
            </div>

            {preview && (
              <div className="w-28 text-center">
                <p className="text-[11px] font-medium text-emerald-600 mb-1.5 uppercase tracking-wide">
                  New Preview
                </p>
                <BookCover
                  name={book.name}
                  price={book.price}
                  coverImage={preview}
                  className="shadow-sm ring-2 ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-lg bg-stone-100 p-1 text-xs font-medium text-stone-600">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
                activeTab === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Image / Camera
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
                activeTab === 'url' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
              }`}
            >
              <Link className="h-3.5 w-3.5" />
              Image URL
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-600">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">
                    Click to browse or take photo
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Drag and drop cover image (JPG, PNG, WebP)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-stone-700">
                Image Web Link (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreview(e.target.value);
                  }}
                  className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Paste direct URL to a photo of the book cover.
              </p>
            </div>
          )}

          {/* Delete action if cover exists */}
          {currentCover && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium py-1 px-2 rounded hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Current Photograph
              </button>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3.5 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={(!preview && !imageUrl) || isProcessing}
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                Cover Saved!
              </>
            ) : isProcessing ? (
              'Saving...'
            ) : (
              'Save Book Cover'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
