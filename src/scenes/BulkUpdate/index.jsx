import React from 'react';
import { useBulkUpdate } from './useBulkUpdate';
import ProgressTracker from './ProgressTracker';
import RecentUpdatesTable from './RecentUpdatesTable';

const BulkUpdate = () => {
    const {
        file,
        fileName,
        isUploading,
        error,
        warnings,
        uploadProgress,
        updateReport,
        uploadSummary,
        currentBatch,
        totalBatches,
        currentStats,
        showStats,  // New flag from hook
        fileInputRef,
        handleFileChange,
        uploadFile,
        downloadReport,
        resetState
    } = useBulkUpdate();

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Bulk Update Records</h2>
                {showStats && (
                    <button
                        onClick={() => resetState(true)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Clear Results
                    </button>
                )}
            </div>

            {/* File Upload Section */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="mb-4">
                    <p className="text-gray-600">
                        Upload a CSV file with ID column and values to update. The system will only update fields that have values - empty fields will be ignored.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                        />
                        <div className="flex items-center border rounded p-2">
                            <button className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded mr-2">
                                Choose File
                            </button>
                            <span className="text-gray-600">
                                {fileName || 'No file chosen'}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={uploadFile}
                            disabled={isUploading || !file}
                            className={`px-4 py-2 rounded ${
                                isUploading || !file
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                        >
                            {isUploading ? 'Uploading...' : 'Upload & Update'}
                        </button>
                        {updateReport.length > 0 && (
                            <button
                                onClick={downloadReport}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Download Report
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <h3 className="font-bold mb-2">Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* Warnings Display */}
            {warnings.length > 0 && (
                <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                    <h3 className="font-bold mb-2">Warnings ({warnings.length})</h3>
                    <ul className="list-disc pl-4">
                        {warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Always show Progress Tracker if showStats is true */}
            {showStats && (
                <ProgressTracker
                    currentBatch={currentBatch}
                    totalBatches={totalBatches}
                    currentStats={currentStats}
                    isUploading={isUploading}
                />
            )}

            {/* Always show Upload Summary if available */}
            {uploadSummary && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="font-bold mb-2 text-lg">Update Summary</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <div className="text-gray-600 text-sm">Total Processed</div>
                            <div className="text-xl font-bold">{uploadSummary.total_processed}</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                            <div className="text-green-600 text-sm">Successfully Updated</div>
                            <div className="text-xl font-bold">{uploadSummary.updated}</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded">
                            <div className="text-red-600 text-sm">Errors</div>
                            <div className="text-xl font-bold">{uploadSummary.errors}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Updates Table */}
            {updateReport.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <h3 className="font-bold p-4 border-b">Recent Updates</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Client Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Changes
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {updateReport.slice(-10).map((record, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {record.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {record.client_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                record.status === 'success'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {record.status === 'success'
                                                ? `Updated ${Object.keys(record.new_values || {}).length} fields`
                                                : record.error}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkUpdate;