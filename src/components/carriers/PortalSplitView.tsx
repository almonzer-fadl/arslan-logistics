'use client';

import { useState, useEffect, useRef } from 'react';

interface Portal {
  id: string;
  carrierName: string;
  url: string;
  slot: number;
}

interface PortalSplitViewProps {
  onClose: () => void;
  initialCarrier?: { name: string; url: string; };
}

export default function PortalSplitView({ onClose, initialCarrier }: PortalSplitViewProps) {
  const [layout, setLayout] = useState<'2x1' | '2x2'>('2x2');
  const [portals, setPortals] = useState<Portal[]>(() => {
    // Initialize with carrier if provided
    if (initialCarrier?.name && initialCarrier?.url) {
      return [{
        id: `${initialCarrier.name}-${Date.now()}`,
        carrierName: initialCarrier.name,
        url: initialCarrier.url,
        slot: 0
      }];
    }
    return [];
  });
  const [focusedSlot, setFocusedSlot] = useState<number>(0);
  const [fullscreenSlot, setFullscreenSlot] = useState<number | null>(null);
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  const maxSlots = layout === '2x2' ? 4 : 2;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= maxSlots) {
          e.preventDefault();
          setFocusedSlot(num - 1);
          iframeRefs.current[num - 1]?.focus();
        }
      }
      if (e.key === 'Escape' && fullscreenSlot !== null) {
        setFullscreenSlot(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maxSlots, fullscreenSlot]);

  const addPortal = (carrierName: string, url: string) => {
    if (portals.length >= maxSlots) return;
    
    const newPortal: Portal = {
      id: `${carrierName}-${Date.now()}`,
      carrierName,
      url,
      slot: portals.length
    };
    
    setPortals([...portals, newPortal]);
  };

  const removePortal = (slot: number) => {
    setPortals(portals.filter(p => p.slot !== slot).map((p, i) => ({ ...p, slot: i })));
    if (fullscreenSlot === slot) setFullscreenSlot(null);
  };

  const toggleFullscreen = (slot: number) => {
    setFullscreenSlot(fullscreenSlot === slot ? null : slot);
  };

  // Predefined carrier portals
  const carriers = [
    { name: 'Maersk', url: 'https://www.maersk.com/shipping' },
    { name: 'DB Schenker', url: 'https://eschenker.dbschenker.com' },
    { name: 'Kuehne+Nagel', url: 'https://ecommerce.kn-portal.com' },
    { name: 'Hapag-Lloyd', url: 'https://www.hapag-lloyd.com/en/online-business.html' },
    { name: 'MSC', url: 'https://www.msc.com/track-a-shipment' },
    { name: 'CMA CGM', url: 'https://www.cma-cgm.com/ebusiness/login' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold text-lg">Portal Split View</h2>
          
          {/* Layout Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setLayout('2x1')}
              className={`p-2 rounded ${layout === '2x1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              title="2 Portals"
            >
              <span className="material-symbols-outlined text-base">view_column</span>
            </button>
            <button
              onClick={() => setLayout('2x2')}
              className={`p-2 rounded ${layout === '2x2' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              title="4 Portals"
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
          </div>

          {/* Quick Add Carriers */}
          <div className="flex gap-2">
            {carriers.map(carrier => (
              <button
                key={carrier.name}
                onClick={() => addPortal(carrier.name, carrier.url)}
                disabled={portals.length >= maxSlots}
                className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {carrier.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>

      {/* Portal Grid */}
      <div className={`flex-1 grid ${layout === '2x2' ? 'grid-cols-2 grid-rows-2' : 'grid-cols-2'} gap-1 bg-gray-900 p-1`}>
        {Array.from({ length: maxSlots }).map((_, index) => {
          const portal = portals.find(p => p.slot === index);
          const isFullscreen = fullscreenSlot === index;
          const isFocused = focusedSlot === index;

          if (isFullscreen) {
            return (
              <div key={index} className="col-span-2 row-span-2 relative bg-gray-800 rounded">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <button
                    onClick={() => toggleFullscreen(index)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                  >
                    <span className="material-symbols-outlined text-base">fullscreen_exit</span>
                  </button>
                  <button
                    onClick={() => removePortal(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded text-white"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
                {portal && (
                  <iframe
                    ref={el => { iframeRefs.current[index] = el; }}
                    src={portal.url}
                    className="w-full h-full rounded"
                    title={portal.carrierName}
                  />
                )}
              </div>
            );
          }

          if (fullscreenSlot !== null) return null;

          return (
            <div
              key={index}
              className={`relative bg-gray-800 rounded border-2 ${isFocused ? 'border-blue-500' : 'border-gray-700'}`}
              onClick={() => setFocusedSlot(index)}
            >
              {portal ? (
                <>
                  {/* Portal Header */}
                  <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-2 flex items-center justify-between z-10">
                    <span className="text-white text-sm font-medium">{portal.carrierName}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFullscreen(index);
                        }}
                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                      >
                        <span className="material-symbols-outlined text-xs">fullscreen</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePortal(index);
                        }}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  </div>

                  {/* iframe */}
                  <iframe
                    ref={el => { iframeRefs.current[index] = el; }}
                    src={portal.url}
                    className="w-full h-full rounded"
                    title={portal.carrierName}
                  />

                  {/* Slot Number */}
                  <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 px-2 py-1 rounded text-white text-xs">
                    Ctrl+{index + 1}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{index + 1}</div>
                    <div className="text-sm">Empty Slot</div>
                    <div className="text-xs mt-1">Click carrier above to add</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-gray-400 text-xs flex gap-6">
        <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+1/2/3/4</kbd> Focus slot</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Esc</kbd> Exit fullscreen</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Click</kbd> Focus & interact</span>
      </div>
    </div>
  );
}
