'use client';

import dynamic from 'next/dynamic';

// The browser reads window.history and sessionStorage from its very first render, which only
// exist in the browser, so it is not rendered on the server.
const Browser = dynamic(
  () => import('@/features/browser/Browser').then((module) => module.Browser),
  { ssr: false },
);

export default function Home() {
  return <Browser />;
}
