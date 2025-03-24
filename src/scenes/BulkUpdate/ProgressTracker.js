// ProgressTracker.js
import React from 'react';

const ProgressTracker = ({ 
    currentBatch, 
    totalBatches, 
    currentStats,
    isUploading 
}) => {
    // Calculate percentage complete
    const percentComplete = Math.round((currentBatch / totalBatches) * 100) || 0;
    
    // Format numbers with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
            {/* Progress Header */}
            <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium">
                    {isUploading ? 
                        `Processing Batch ${currentBatch} of ${totalBatches}` : 
                        `Processing Batch ${totalBatches} of ${totalBatches}`}
                </span>
                <span className="text-sm font-medium">
                    {isUploading ? `${percentComplete}% Complete` : `100% Complete`}
                </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: isUploading ? `${percentComplete}%` : '100%' }}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                {/* Total Processed */}
                <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-gray-500 text-sm font-medium">
                        Processed
                    </div>
                    <div className="text-lg font-semibold">
                        {formatNumber(currentStats.processed || 0)}
                    </div>
                </div>

                {/* Successfully Updated */}
                <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-green-600 text-sm font-medium">
                        Updated
                    </div>
                    <div className="text-lg font-semibold text-green-700">
                        {formatNumber(currentStats.updated || 0)}
                    </div>
                </div>

                {/* Errors */}
                <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-red-600 text-sm font-medium">
                        Errors
                    </div>
                    <div className="text-lg font-semibold text-red-700">
                        {formatNumber(currentStats.errors || 0)}
                    </div>
                </div>
            </div>

            {/* Processing Rate - only show during upload */}
            {isUploading && currentStats.processingRate && (
                <div className="mt-3 text-center text-sm text-gray-500">
                    Processing {currentStats.processingRate} records per second
                </div>
            )}

            {/* Estimated Time Remaining - only show during upload */}
            {isUploading && currentStats.estimatedTimeRemaining && (
                <div className="text-center text-sm text-gray-500">
                    Estimated time remaining: {currentStats.estimatedTimeRemaining}
                </div>
            )}
            
            {/* Completion timestamp - show when not uploading and there's a completedAt timestamp */}
            {!isUploading && currentStats.completedAt && (
                <div className="mt-3 text-center text-sm text-gray-500">
                    Completed at {new Date(currentStats.completedAt).toLocaleTimeString()}
                </div>
            )}
        </div>
    );
};

export default ProgressTracker;