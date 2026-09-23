import React from 'react';
import { X, Camera, Share2, Check } from 'lucide-react';
import { Book } from '../data/booksData';
import { BookCover } from './BookCover';

interface CoverPreviewModalProps {
  book: Book | null;
  coverImage?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEditCover: (book: Book) => void;
}

export const CoverPreviewModal: React.FC<CoverPreviewModalProps> = ({
  book,
  coverImage,
  isOpen,
  onClose,
  onEditCover,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !book) return null;

  const formattedPrice =
    book.price !== null
      ? `Rs. ${book.price.toLocaleString('en-US')}`
      : 'Price not listed';

  const handleCopyDetails = () => {
    navigator.clipboard.writeText(`${book.name} - ${formattedPrice}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-w-sm sm:max-w-md w-full rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Cover Presentation */}
        <div className="mx-auto w-48 sm:w-56 py-2">
          <BookCover
            name={book.name}
            price={book.price}
            coverImage={coverImage}
            className="shadow-xl"
          />
        </div>

        {/* Viewer Information: Book Name and Price */}
        <div className="mt-4 text-center">
          <h2
            className="text-base sm:text-lg font-bold text-stone-900 leading-snug"
            style={{ fontFamily: "'Noto Serif Sinhala', 'Google Sans', serif" }}
          >
            {book.name}
          </h2>

          <div className="mt-2 text-base sm:text-lg font-mono font-bold text-emerald-700">
            {formattedPrice}
          </div>

          {/* Quick utility buttons */}
          <div className="mt-5 flex items-center justify-center gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={handleCopyDetails}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  Copied Details
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-stone-500" />
                  Share Book
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEditCover(book);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-stone-800 transition-colors"
            >
              <Camera className="h-4 w-4" />
              {coverImage ? 'Change Photo' : 'Upload Cover'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
