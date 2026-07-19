'use client';

import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import AssetTree from '../components/layout/AssetTree';
import './globals.css';

export default function RootLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewMode, setViewMode] = useState('desktop'); // desktop vs mobile
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Expose context through window/global so children can listen if needed
  React.useEffect(() => {
    window.__dashboardViewMode = viewMode;
    window.__dashboardSelectedAsset = selectedAsset;
  }, [viewMode, selectedAsset]);

  return (
    <html lang="en">
      <body className="bg-[#0b0f19] text-[#f4f4f5] antialiased overflow-hidden min-h-screen flex h-screen select-none">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <TopBar viewMode={viewMode} setViewMode={setViewMode} activeAsset={selectedAsset} />

          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* Show hierarchy tree sidebars only on desktop or engineer view */}
            {viewMode === 'desktop' && (
              <AssetTree onSelectAsset={setSelectedAsset} selectedAssetId={selectedAsset?.id} />
            )}

            {/* Main dashboard body viewport */}
            <main className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-[#0b0f19]/80 relative grid-bg">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
