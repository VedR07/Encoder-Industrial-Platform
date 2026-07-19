'use client';

import React, { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import './globals.css';

export default function RootLayout({ children }) {
  const [viewMode, setViewMode] = useState('desktop');
  const [selectedAsset, setSelectedAsset] = useState(null);

  React.useEffect(() => {
    window.__dashboardViewMode = viewMode;
    window.__dashboardSelectedAsset = selectedAsset;
  }, [viewMode, selectedAsset]);

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-[#1e293b] antialiased overflow-hidden min-h-screen flex flex-col h-screen select-none">
        {/* Horizontal Top Bar with Mega Menu */}
        <TopBar viewMode={viewMode} setViewMode={setViewMode} activeAsset={selectedAsset} />

        {/* Main Content — offset by header height */}
        <main className="flex-1 mt-14 overflow-y-auto bg-[#f8fafc] relative">
          {children}
        </main>
      </body>
    </html>
  );
}
