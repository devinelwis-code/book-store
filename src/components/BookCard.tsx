import React from 'react';
import { Camera, ImagePlus, Eye } from 'lucide-react';
import { Book } from '../data/booksData';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: Book;
  coverImage?: string | null;
  isManageMode: boolean;
  onOpenUpload: (book: Book) => void;
  onViewCover: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  coverImage,
  isManageMode,
  onOpenUpload,
  onViewCover,
}) => {
  const formattedPrice =
    book.price !== null
      ? `Rs. ${book.price.toLocaleString('en-US')}`
      : 'Rs. —';

  return (
    <div className="group relative flex flex-col justify-between rounded-lg bg-white p-2.5 sm:p-3 border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Book Cover Image Container */}
      <div className="relative cursor-pointer overflow-hidden rounded-md" onClick={() => isManageMode ? onOpenUpload(book) : onViewCover(book)}>
        <BookCover
          name={book.name}
          price={book.price}
          publisher={book.publisher}
          coverImage={coverImage}
        />

        {/* Hover / View overlay for regular viewers */}
        {!isManageMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-md">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-xs">
              <Eye className="h-3.5 w-3.5" />
              View
            </span>
          </div>
        )}

        {/* Manage Mode Overlay: Quick action for easy image uploads */}
        {isManageMode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-900/60 p-2 text-center backdrop-blur-2xs transition-opacity duration-150">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenUpload(book);
              }}
              className="flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-semibold text-stone-900 shadow-md hover:bg-stone-100 active:scale-95 transition-all"
            >
              {coverImage ? (
                <>
                  <Camera className="h-3.5 w-3.5 text-stone-700" />
                  Change Cover
                </>
              ) : (
                <>
                  <ImagePlus className="h-3.5 w-3.5 text-emerald-600" />
                  Add Cover Photo
                </>
              )}
            </button>
            <span className="mt-2 text-[10px] text-stone-200 font-medium">
              {coverImage ? 'Custom photo added' : 'No photo yet'}
            </span>
          </div>
        )}
      </div>

      {/* Viewer Metadata: Strictly Book Name and Price only, as requested */}
      <div className="mt-2.5 flex flex-1 flex-col justify-between pt-1">
        {/* Book Name */}
        <h3
          className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-2"
          title={book.name}
          style={{ fontFamily: "'Noto Serif Sinhala', 'Google Sans', sans-serif" }}
        >
          {book.name}
        </h3>

        {/* Book Price */}
        <div className="mt-2 flex items-baseline justify-between border-t border-stone-100 pt-1.5">
          <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight font-mono">
            {formattedPrice}
          </span>
          {isManageMode && (
            <button
              type="button"
              onClick={() => onOpenUpload(book)}
              className="text-[11px] text-emerald-700 font-medium hover:underline flex items-center gap-0.5"
            >
              Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
