import React from 'react';

const RecentUpdatesTable = ({ updateReport }) => {
    // Function to truncate long error messages
    const formatErrorMessage = (error) => {
        if (!error) return '';
        
        // If it contains the convert_field_type error, show a more user-friendly message
        if (error.includes("name 'convert_field_type' is not defined")) {
            return "Server configuration error - please contact support";
        }
        
        // For other errors, truncate if too long
        return error.length > 60 ? `${error.substring(0, 57)}...` : error;
    };

    // Function to format changes display
    const formatChanges = (record) => {
        if (record.status === 'success') {
            const changedFields = Object.keys(record.new_values || {}).length;
            return `Updated ${changedFields} field${changedFields !== 1 ? 's' : ''}`;
        } else if (record.status === 'skipped') {
            return 'No changes needed';
        } else {
            return formatErrorMessage(record.error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <h3 className="font-bold p-4 border-b">Recent Updates</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                                Client Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8/12">
                                Changes
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {updateReport.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No updates to display
                                </td>
                            </tr>
                        ) : (
                            updateReport.slice(-10).map((record, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {record.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {record.client_name || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            record.status === 'success'
                                                ? 'bg-green-100 text-green-800'
                                                : record.status === 'skipped'
                                                ? 'bg-gray-100 text-gray-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatChanges(record)}
                                        {record.status === 'error' && (
                                            <button 
                                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                                                onClick={() => alert(record.error || 'Unknown error')}
                                            >
                                                View full error
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentUpdatesTable;