import React from 'react';

const StatusHeaders = ({ statuses }) => {
  return (
    <div className="flex overflow-x-auto py-2 px-1">
      {statuses.map((status) => (
        <div 
          key={status.name} 
          className="status-header flex-shrink-0 px-4 py-2 mx-1 rounded-md bg-gray-700 text-center"
          style={{ minWidth: '180px' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">{status.name}</span>
            <span className="text-sm px-2 py-1 bg-gray-600 text-blue-300 rounded-md">
              {status.count} / {status.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusHeaders;