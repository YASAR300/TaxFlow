'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * DraftBanner component showing a notification at the top of the screen when a draft is found.
 * 
 * Props:
 * - onRestore (function): Callback when the restore button is clicked
 * - onDismiss (function): Callback when the dismiss button is clicked
 * - timestamp (string): ISO timestamp when the draft was saved
 */
export default function DraftBanner({ onRestore, onDismiss, timestamp }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide down transition on mount
    const t = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Wait for transition out
  };

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' on ' +
      new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div
      className={`w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 flex items-center justify-between gap-4 transition-all duration-300 ease-in-out border-b border-amber-600/30 shadow-md transform z-50 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 h-0 overflow-hidden py-0 border-b-0'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle size={16} className="shrink-0 text-black animate-pulse" />
        <span className="text-xs font-semibold">
          You have an unsaved draft from <span className="font-bold underline">{formattedTime || 'a previous session'}</span>.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRestore}
          className="bg-black hover:bg-black/90 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          Restore Draft
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-black/80 hover:text-black font-semibold text-[11px] px-2.5 py-1.5 transition-all hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
