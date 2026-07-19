'use client';

import React, { useState } from 'react';
import ChatInterface from '../../components/copilot/ChatInterface';
import DocumentViewer from '../../components/copilot/DocumentViewer';
import TelemetryTicker from '../../components/copilot/TelemetryTicker';

export default function CopilotPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Telemetry metrics row */}
      <TelemetryTicker />

      {/* Main split dashboard area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 h-full p-4">
          <ChatInterface onCitationClick={setSelectedDoc} />
        </div>

        {selectedDoc && (
          <DocumentViewer document={selectedDoc} onClose={() => setSelectedDoc(null)} />
        )}
      </div>
    </div>
  );
}
