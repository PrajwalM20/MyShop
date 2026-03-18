import { useEffect } from 'react';

/**
 * useBlockZoom — Call once in App.jsx
 * Blocks: Ctrl+Scroll, Ctrl+Plus, Ctrl+Minus, Ctrl+0 on desktop
 * Also blocks pinch-zoom gesture on touch devices via JS
 */
export default function useBlockZoom() {
  useEffect(() => {

    // ── Block Ctrl + Scroll wheel zoom (desktop browsers) ────────
    const blockCtrlScroll = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // ── Block Ctrl + Plus / Minus / 0 keyboard zoom ──────────────
    const blockKeyZoom = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '+' || e.key === '-' || e.key === '=' ||
         e.key === '_' || e.key === '0' ||
         e.keyCode === 187 || e.keyCode === 189 || e.keyCode === 48)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // ── Block pinch zoom gesture on touch devices ─────────────────
    const blockPinch = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // ── Block gesture events (Safari iOS) ─────────────────────────
    const blockGesture = (e) => {
      e.preventDefault();
    };

    // Attach all listeners
    window.addEventListener('wheel',         blockCtrlScroll, { passive: false });
    window.addEventListener('keydown',       blockKeyZoom,    { passive: false });
    document.addEventListener('touchmove',   blockPinch,      { passive: false });
    document.addEventListener('gesturestart',blockGesture,    { passive: false });
    document.addEventListener('gesturechange',blockGesture,   { passive: false });

    return () => {
      window.removeEventListener('wheel',          blockCtrlScroll);
      window.removeEventListener('keydown',        blockKeyZoom);
      document.removeEventListener('touchmove',    blockPinch);
      document.removeEventListener('gesturestart', blockGesture);
      document.removeEventListener('gesturechange',blockGesture);
    };
  }, []);
}