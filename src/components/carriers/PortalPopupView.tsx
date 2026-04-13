'use client';

import { useState, useEffect, useRef } from 'react';

interface PopupWindow {
  id: string;
  carrierName: string;
  url: string;
  window: Window | null;
  slot: number;
}

interface PortalPopupViewProps {
  onClose: () => void;
  initialCarrier?: { name: string; url: string; };
}

export default function PortalPopupView({ onClose, initialCarrier }: PortalPopupViewProps) {
  const [layout, setLayout] = useState<'2x1' | '2x2'>('2x2');
  const [popups, setPopups] = useState<PopupWindow[]>([]);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

  const maxSlots = layout === '2x2' ? 4 : 2;

  // Screen dimensions
  const screenWidth = typeof window !== 'undefined' ? window.screen.availWidth : 1920;
  const screenHeight = typeof window !== 'undefined' ? window.screen.availHeight : 1080;

  // Calculate window positions based on layout
  const getWindowPosition = (slot: number) => {
    if (layout === '2x1') {
      // 2 columns, 1 row
      const width = Math.floor(screenWidth / 2);
      const height = screenHeight;
      const left = slot * width;
      return { width, height, left, top: 0 };
    } else {
      // 2x2 grid
      const width = Math.floor(screenWidth / 2);
      const height = Math.floor(screenHeight / 2);
      const left = (slot % 2) * width;
      const top = Math.floor(slot / 2) * height;
      return { width, height, left, top };
    }
  };

  // Initialize with carrier if provided
  useEffect(() => {
    if (initialCarrier?.name && initialCarrier?.url && popups.length === 0) {
      addPopup(initialCarrier.name, initialCarrier.url);
    }
  }, [initialCarrier]);

  // Check if popup windows are still open
  useEffect(() => {
    checkInterval.current = setInterval(() => {
      setPopups(prev => prev.filter(popup => {
        if (popup.window && !popup.window.closed) {
          return true;
        }
        console.log('Window closed, removing from list:', popup.carrierName);
        return false;
      }));
    }, 2000); // Check every 2 seconds instead of 1

    return () => {
      if (checkInterval.current) clearInterval(checkInterval.current);
      // Close all popups when component unmounts
      popups.forEach(popup => {
        if (popup.window && !popup.window.closed) {
          popup.window.close();
        }
      });
    };
  }, [popups]);

  const addPopup = (carrierName: string, url: string) => {
    if (popups.length >= maxSlots) {
      alert(`Maximum ${maxSlots} windows reached. Change layout or close a window first.`);
      return;
    }

    const slot = popups.length;
    const position = getWindowPosition(slot);
    
    const features = `width=${position.width},height=${position.height},left=${position.left},top=${position.top},menubar=no,toolbar=yes,location=yes,status=yes,scrollbars=yes,resizable=yes`;
    
    const newWindow = window.open(url, `_blank_${carrierName}_${Date.now()}`, features);
    
    if (!newWindow || newWindow.closed) {
      alert('Popup blocked! Please:\n1. Click the popup blocker icon in your address bar\n2. Allow popups for this site\n3. Try again');
      return;
    }

    // Give window time to initialize before checking if closed
    setTimeout(() => {
      if (newWindow.closed) {
        console.warn('Window closed immediately after opening:', carrierName);
        return;
      }

      const newPopup: PopupWindow = {
        id: `${carrierName}-${Date.now()}`,
        carrierName,
        url,
        window: newWindow,
        slot
      };

      setPopups(prev => [...prev, newPopup]);
    }, 100);
  };

  const closePopup = (id: string) => {
    const popup = popups.find(p => p.id === id);
    if (popup?.window && !popup.window.closed) {
      popup.window.close();
    }
    setPopups(prev => prev.filter(p => p.id !== id));
  };

  const closeAllPopups = () => {
    popups.forEach(popup => {
      if (popup.window && !popup.window.closed) {
        popup.window.close();
      }
    });
    setPopups([]);
  };

  const rearrangeWindows = () => {
    popups.forEach((popup, index) => {
      if (popup.window && !popup.window.closed) {
        const position = getWindowPosition(index);
        popup.window.moveTo(position.left, position.top);
        popup.window.resizeTo(position.width, position.height);
      }
    });
  };

  // Rearrange windows when layout changes
  useEffect(() => {
    if (popups.length > 0) {
      rearrangeWindows();
    }
  }, [layout]);

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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col">
      {/* Control Panel */}
      <div className="bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="text-white font-semibold text-xl">Portal Popup Manager</h2>
          
          {/* Layout Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setLayout('2x1')}
              className={`px-4 py-2 rounded font-medium ${layout === '2x1' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1">view_column</span>
              2 Windows
            </button>
            <button
              onClick={() => setLayout('2x2')}
              className={`px-4 py-2 rounded font-medium ${layout === '2x2' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              <span className="material-symbols-outlined text-base align-middle mr-1">grid_view</span>
              4 Windows
            </button>
          </div>

          {/* Quick Add Carriers */}
          <div className="flex gap-2">
            {carriers.map(carrier => (
              <button
                key={carrier.name}
                onClick={() => addPopup(carrier.name, carrier.url)}
                disabled={popups.length >= maxSlots}
                className="px-4 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + {carrier.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={rearrangeWindows}
            className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
          >
            <span className="material-symbols-outlined text-base align-middle mr-1">window</span>
            Rearrange
          </button>
          <button
            onClick={closeAllPopups}
            className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700"
          >
            <span className="material-symbols-outlined text-base align-middle mr-1">close_small</span>
            Close All
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white px-4 py-2"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
      </div>

      {/* Active Windows List */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-white text-lg font-semibold mb-4">
            Active Windows ({popups.length}/{maxSlots})
          </h3>
          
          {popups.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <span className="material-symbols-outlined text-6xl mb-4 block">tab_group</span>
              <p className="text-xl">No windows open</p>
              <p className="text-sm mt-2">Click a carrier button above to open a new window</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {popups.map((popup, index) => (
                <div
                  key={popup.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border-2 border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{popup.carrierName}</h4>
                      <p className="text-gray-400 text-sm truncate max-w-md">{popup.url}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (popup.window && !popup.window.closed) {
                          popup.window.focus();
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                    >
                      <span className="material-symbols-outlined text-sm align-middle">open_in_new</span>
                      Focus
                    </button>
                    <button
                      onClick={() => closePopup(popup.id)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <span className="material-symbols-outlined text-sm align-middle">close</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 text-gray-400 text-sm">
        <strong>How it works:</strong> Click carrier buttons to open browser windows in a grid layout. 
        Click "Rearrange" to reposition all windows. Full browser context with login support!
      </div>
    </div>
  );
}
