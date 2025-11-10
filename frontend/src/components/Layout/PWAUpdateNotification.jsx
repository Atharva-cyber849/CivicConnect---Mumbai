import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import pwaService from '../../services/pwaService';

const PWAUpdateNotification = () => {
  const { t } = useTranslation();
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowUpdate(true);
    };

    pwaService.on('update', handleUpdate);

    return () => {
      pwaService.off('update', handleUpdate);
    };
  }, []);

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      await pwaService.skipWaiting();
      // The page will reload automatically
    } catch (error) {
      console.error('Failed to update app:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-down">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">
            {t('pwa.updateAvailable')}
          </h3>
          <p className="text-sm opacity-90 mt-1">
            {t('pwa.updatePrompt')}
          </p>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleUpdateClick}
              disabled={isUpdating}
              className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              {isUpdating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Now</span>
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-700 transition-colors rounded-md"
            >
              Later
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-200 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;