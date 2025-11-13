import { useAuth } from '../../context/AuthContext';

const SessionTimeoutModal = () => {
  const { showSessionWarning, resetSessionWarning, extendSession } = useAuth();

  const handleStayLoggedIn = () => {
    extendSession();
    resetSessionWarning();
  };

  if (!showSessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Timeout Warning</h3>
        <p className="text-gray-600 mb-6">
          Your session is about to expire due to inactivity. You will be logged out in 5 minutes.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={resetSessionWarning}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout Now
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
