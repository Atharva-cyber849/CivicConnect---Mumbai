import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <div className="bg-white rounded-lg shadow-lg border p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-900">Install App</h3>
          </div>
          <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Install Snap & Report for offline access and notifications.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
