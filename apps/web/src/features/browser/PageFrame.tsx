'use client';

import { useEffect, useRef, useState } from 'react';
import { FRAME_MESSAGE_SOURCE, buildFrameDocument } from './frame-document';

const MAX_ADDRESS_LENGTH = 300;

interface PageFrameProps {
  title: string;
  safeHtml: string;
  restoreY: number;
  onNavigate: (address: string) => void;
  onScroll: (y: number) => void;
}

type FrameMessage = { type: 'navigate'; address: string } | { type: 'scroll'; y: number };

// Anything can arrive through postMessage, so check the shape before trusting it.
function parseFrameMessage(data: unknown): FrameMessage | null {
  if (typeof data !== 'object' || data === null) return null;
  const message = data as Record<string, unknown>;
  if (message.source !== FRAME_MESSAGE_SOURCE) return null;
  if (
    message.type === 'navigate' &&
    typeof message.address === 'string' &&
    message.address.length <= MAX_ADDRESS_LENGTH
  ) {
    return { type: 'navigate', address: message.address };
  }
  if (
    message.type === 'scroll' &&
    typeof message.y === 'number' &&
    Number.isFinite(message.y) &&
    message.y >= 0
  ) {
    return { type: 'scroll', y: message.y };
  }
  return null;
}

// Shows one site. Give it a new React `key` per history entry: the document (with its nonce and
// restore position) is built once when the component mounts, so scroll updates don't reload it.
export function PageFrame({ title, safeHtml, restoreY, onNavigate, onScroll }: PageFrameProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [srcDoc] = useState(() =>
    buildFrameDocument({
      safeHtml,
      restoreY,
      nonce: crypto.randomUUID(),
      parentOrigin: window.location.origin,
    }),
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages from OUR frame. A sandboxed frame's origin is "null", so identity is
      // checked by window reference; messages from any other window or tab are ignored.
      if (event.source !== frameRef.current?.contentWindow) return;
      const message = parseFrameMessage(event.data);
      if (message?.type === 'navigate') onNavigate(message.address);
      if (message?.type === 'scroll') onScroll(message.y);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate, onScroll]);

  return (
    <iframe
      ref={frameRef}
      className="page-frame"
      title={title}
      srcDoc={srcDoc}
      // sandbox with allow-scripts ONLY (for our nonce'd bridge script). Without allow-same-origin
      // the frame gets an opaque origin: it cannot read our DOM, cookies or storage. Without
      // allow-top-navigation, allow-popups, allow-forms and allow-modals it cannot navigate this
      // tab, open windows, submit forms, or show alert() dialogs.
      sandbox="allow-scripts"
      // The frame never tells anyone which page it was opened from.
      referrerPolicy="no-referrer"
    />
  );
}
