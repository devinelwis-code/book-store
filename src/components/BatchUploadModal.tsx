import React, { useState, useRef } from 'react';
import { X, Upload, Download, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { Book } from '../data/booksData';
import { processImageFile, getAllCoverImages, clearAllCovers } from '../utils/coverStorage';

interface BatchUploadModalProps {
  books: Book[];
  isOpen: boolean;
  onClose: () => void;
  onRefreshCovers: () => Promise<void>;
  onSaveBatchCovers: (coversMap: Record<string, string>) => Promise<void>;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  books,
  isOpen,
  onClose,
  onRefreshCovers,
  onSaveBatchCovers,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredBooks = books.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBatchFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setMessage(`Processing ${files.length} cover image(s)...`);

    try {
      const newCovers: Record<string, string> = {};

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await processImageFile(file);

        // Try matching by filename or current selection
        const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const matchedBook = books.find((b) => {
          const cleanName = b.name.replace(/[^a-zA-Z0-9\u0D80-\u0DFF]/g, '').toLowerCase();
          const cleanFile = fileNameWithoutExt.replace(/[^a-zA-Z0-9\u0D80-\u0DFF]/g, '').toLowerCase();
          return cleanName.includes(cleanFile) || cleanFile.includes(cleanName) || b.id === fileNameWithoutExt;
        });

        if (matchedBook) {
          newCovers[matchedBook.id] = dataUrl;
        } else if (files.length === 1 && selectedBookId) {
          newCovers[selectedBookId] = dataUrl;
        }
      }

      await onSaveBatchCovers(newCovers);
      const count = Object.keys(newCovers).length;
      setMessage(`Successfully saved ${count} book cover(s)!`);
      await onRefreshCovers();
    } catch (err) {
      console.error(err);
      setMessage('Failed to process batch files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      setIsProcessing(true);
      const allCovers = await getAllCoverImages();
      const count = Object.keys(allCovers).length;
      if (count === 0) {
        alert('No custom covers have been uploaded yet to export.');
        return;
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allCovers, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `book_covers_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setMessage(`Exported ${count} cover(s) backup file.`);
    } catch (err) {
      console.error(err);
      alert('Failed to export backup.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const covers = JSON.parse(text);
      if (typeof covers === 'object' && covers !== null) {
        await onSaveBatchCovers(covers);
        await onRefreshCovers();
        setMessage(`Successfully imported ${Object.keys(covers).length} cover(s)!`);
      } else {
        alert('Invalid backup file format.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to read or parse backup file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to remove ALL uploaded book covers? This action cannot be undone unless you have a backup.')) {
      await clearAllCovers();
      await onRefreshCovers();
      setMessage('All uploaded covers cleared.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 bg-stone-50">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-stone-700" />
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Book Covers Manager
              </h2>
              <p className="text-xs text-stone-500">
                Bulk upload, backup and maintain book photographs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="mx-5 mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 border border-emerald-200">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Quick Upload for a selected book */}
          <div className="rounded-xl border border-stone-200 p-4 bg-stone-50/50 space-y-3">
            <label className="block text-xs font-semibold text-stone-800">
              Select Book to Upload Cover:
            </label>

            <input
              type="text"
              placeholder="Search by title to select..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-500"
            />

            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 font-serif"
            >
              {filteredBooks.slice(0, 80).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.price ? `Rs. ${b.price}` : 'Unpriced'})
                </option>
              ))}
            </select>

            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleBatchFileChange}
              />
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-stone-800 disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                Select Photo(s) for Selected Book
              </button>
              <p className="text-[11px] text-stone-500 text-center mt-1.5">
                Tip: You can also name photos like the book title to auto-match multiple files!
              </p>
            </div>
          </div>

          {/* Backup & Restore covers */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Data Backup & Transfer
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportBackup}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-stone-500" />
                Export Covers Backup
              </button>

              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 shadow-2xs"
              >
                <Upload className="h-3.5 w-3.5 text-stone-500" />
                Import Covers JSON
              </button>
              <input
                ref={backupInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-red-600 hover:text-red-700 hover:underline"
            >
              Reset / Delete All Custom Covers
            </button>
            <button
              type="button"
              onClick={onRefreshCovers}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800"
            >
              <RefreshCw className="h-3 w-3" />
              Reload Storage
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 px-5 py-3 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
