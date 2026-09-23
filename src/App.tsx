/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  ImagePlus,
  SlidersHorizontal,
  Share2,
  Check,
  X,
  Sparkles,
  ArrowUpDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { INITIAL_BOOKS, Book } from './data/booksData';
import { BookCard } from './components/BookCard';
import { UploadCoverModal } from './components/UploadCoverModal';
import { CoverPreviewModal } from './components/CoverPreviewModal';
import { BatchUploadModal } from './components/BatchUploadModal';
import {
  getAllCoverImages,
  saveCoverImage,
  deleteCoverImage,
} from './utils/coverStorage';

export default function App() {
  const [books] = useState<Book[]>(INITIAL_BOOKS);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [isManageMode, setIsManageMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'name-asc' | 'price-asc' | 'price-desc'>('default');
  const [filterCoverStatus, setFilterCoverStatus] = useState<'all' | 'with-photo' | 'without-photo'>('all');

  // Modal states
  const [selectedBookForUpload, setSelectedBookForUpload] = useState<Book | null>(null);
  const [selectedBookForPreview, setSelectedBookForPreview] = useState<Book | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Load saved covers from IndexedDB on startup
  useEffect(() => {
    loadCovers();
  }, []);

  const loadCovers = async () => {
    try {
      const stored = await getAllCoverImages();
      setCovers(stored);
    } catch (err) {
      console.error('Failed to load covers from storage', err);
    }
  };

  const handleSaveCover = async (bookId: string, dataUrl: string) => {
    await saveCoverImage(bookId, dataUrl);
    setCovers((prev) => ({ ...prev, [bookId]: dataUrl }));
  };

  const handleRemoveCover = async (bookId: string) => {
    await deleteCoverImage(bookId);
    setCovers((prev) => {
      const copy = { ...prev };
      delete copy[bookId];
      return copy;
    });
  };

  const handleSaveBatchCovers = async (batchMap: Record<string, string>) => {
    for (const [id, url] of Object.entries(batchMap)) {
      await saveCoverImage(id, url);
    }
    setCovers((prev) => ({ ...prev, ...batchMap }));
  };

  // Filter & Search Logic
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return books.filter((book) => {
      // Name search matching Sinhala text or latin equivalents
      const matchesSearch =
        !q ||
        book.name.toLowerCase().includes(q) ||
        (book.publisher && book.publisher.toLowerCase().includes(q));

      // Filter by custom photo status
      const hasPhoto = Boolean(covers[book.id]);
      if (filterCoverStatus === 'with-photo' && !hasPhoto) return false;
      if (filterCoverStatus === 'without-photo' && hasPhoto) return false;

      return matchesSearch;
    });
  }, [books, searchQuery, filterCoverStatus, covers]);

  // Sort Logic
  const sortedBooks = useMemo(() => {
    const list = [...filteredBooks];
    switch (sortBy) {
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name, 'si'));
      case 'price-asc':
        return list.sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999));
      case 'price-desc':
        return list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
      default:
        return list;
    }
  }, [filteredBooks, sortBy]);

  const uploadedCoversCount = Object.keys(covers).length;

  // Next / Prev Book for modal
  const currentIndex = selectedBookForUpload
    ? sortedBooks.findIndex((b) => b.id === selectedBookForUpload.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < sortedBooks.length - 1;

  const handlePrevBook = () => {
    if (hasPrev) {
      setSelectedBookForUpload(sortedBooks[currentIndex - 1]);
    }
  };

  const handleNextBook = () => {
    if (hasNext) {
      setSelectedBookForUpload(sortedBooks[currentIndex + 1]);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-900 font-sans flex flex-col">
      {/* Google Sites Style Clean Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Site Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-stone-900 text-amber-200 flex items-center justify-center shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight leading-none">
                පොත් හල
              </h1>
              <p className="text-[11px] text-stone-500 font-medium tracking-normal mt-0.5">
                Personal Library & Book Store
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Share Button for viewers/friends/family */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
              title="Share site link"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* Owner / Cover Upload Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsManageMode(!isManageMode)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isManageMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/30'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-transparent'
              }`}
              title={isManageMode ? 'Disable Owner Mode' : 'Enable Owner Mode to Upload Covers'}
            >
              {isManageMode ? (
                <>
                  <Unlock className="h-3.5 w-3.5 text-amber-700" />
                  <span>Owner Mode</span>
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 text-stone-500" />
                  <span>Owner Mode</span>
                </>
              )}
            </button>

            {/* Batch manager trigger in manage mode */}
            {isManageMode && (
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 shadow-2xs transition-colors"
              >
                <ImagePlus className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden md:inline">Manage All Covers</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Owner Mode Helpful Indicator Banner */}
      {isManageMode && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 text-center text-xs text-amber-900 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Owner Mode Active:</strong> You can upload photographs for each book by tapping <em>"Add Cover Photo"</em> on any card.
            ({uploadedCoversCount} of {books.length} covers uploaded).
          </span>
          <button
            type="button"
            onClick={() => setIsManageMode(false)}
            className="ml-2 font-semibold underline hover:text-amber-950"
          >
            Switch to Viewer View
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Google Sites Style Clean Header Banner */}
        <div className="rounded-2xl bg-white border border-stone-200/90 p-6 sm:p-8 shadow-xs text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2
              className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: "'Noto Serif Sinhala', serif" }}
            >
              පොත් හලේ විකිණීමට ඇති පොත් මිල දර්ශණය
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              Books Available for Sale &middot; Official Catalog & Price List
            </p>
          </div>

          {/* Search Bar - Centerpiece for quick lookup */}
          <div className="mt-6 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by book name / පොතේ නම අනුව සොයන්න (e.g. අභිනය, Mahavamsa)..."
                className="w-full rounded-xl border border-stone-300 bg-stone-50/60 pl-10 pr-10 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-600 focus:border-stone-600 shadow-inner transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 rounded-full p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Minimalist Controls: Results Count & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
            <span>
              Showing <strong className="text-stone-900 font-semibold">{sortedBooks.length}</strong> {sortedBooks.length === 1 ? 'book' : 'books'}
            </span>
            {searchQuery && (
              <>
                <span className="text-stone-300">&middot;</span>
                <span className="text-stone-500">Filtered by &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-700 underline hover:text-stone-950 font-medium ml-1"
                >
                  Reset
                </button>
              </>
            )}
          </div>

          {/* Filters & Sorting */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Filter by Photo state */}
            {isManageMode && (
              <select
                value={filterCoverStatus}
                onChange={(e) => setFilterCoverStatus(e.target.value as any)}
                className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-500"
              >
                <option value="all">All Books ({books.length})</option>
                <option value="with-photo">With Uploaded Photo ({uploadedCoversCount})</option>
                <option value="without-photo">Pending Photo ({books.length - uploadedCoversCount})</option>
              </select>
            )}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-stone-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="default">Catalog Order</option>
                <option value="name-asc">Title (A - Z / සිංහල)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clean Book Grid */}
        {sortedBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {sortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                coverImage={covers[book.id]}
                isManageMode={isManageMode}
                onOpenUpload={(b) => setSelectedBookForUpload(b)}
                onViewCover={(b) => setSelectedBookForPreview(b)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search Results State */
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center my-8">
            <BookOpen className="mx-auto h-10 w-10 text-stone-300" />
            <h3 className="mt-3 text-sm font-semibold text-stone-900">
              No matching books found
            </h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any books matching &ldquo;{searchQuery}&rdquo;. Try another title keyword in Sinhala or English.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800"
            >
              Clear Search Filter
            </button>
          </div>
        )}
      </main>

      {/* Google Sites Style Minimalist Footer */}
      <footer className="mt-auto border-t border-stone-200/90 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">පොත් හල</span>
            <span>&middot;</span>
            <span>Personal Library Management Project</span>
          </div>

          <div className="flex items-center gap-4">
            <span>{books.length} Books in Collection</span>
            <span>&middot;</span>
            <button
              type="button"
              onClick={() => setIsManageMode(!isManageMode)}
              className="text-stone-600 hover:text-stone-900 underline"
            >
              {isManageMode ? 'Exit Owner Mode' : 'Owner Upload Mode'}
            </button>
          </div>
        </div>
      </footer>

      {/* Upload Cover Modal */}
      {selectedBookForUpload && (
        <UploadCoverModal
          book={selectedBookForUpload}
          currentCover={covers[selectedBookForUpload.id]}
          isOpen={Boolean(selectedBookForUpload)}
          onClose={() => setSelectedBookForUpload(null)}
          onSaveCover={handleSaveCover}
          onRemoveCover={handleRemoveCover}
          onPrevBook={handlePrevBook}
          onNextBook={handleNextBook}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}

      {/* Cover Preview Modal */}
      <CoverPreviewModal
        book={selectedBookForPreview}
        coverImage={selectedBookForPreview ? covers[selectedBookForPreview.id] : null}
        isOpen={Boolean(selectedBookForPreview)}
        onClose={() => setSelectedBookForPreview(null)}
        onEditCover={(b) => {
          setSelectedBookForPreview(null);
          setSelectedBookForUpload(b);
        }}
      />

      {/* Batch Upload & Backup Manager Modal */}
      <BatchUploadModal
        books={books}
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onRefreshCovers={loadCovers}
        onSaveBatchCovers={handleSaveBatchCovers}
      />
    </div>
  );
}
