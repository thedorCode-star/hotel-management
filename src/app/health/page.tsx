export default function HealthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">System Healthy</h2>
          <p className="mt-2 text-sm text-gray-500">
            Hotel Management System is running successfully
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Environment: {process.env.NODE_ENV || 'development'}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 