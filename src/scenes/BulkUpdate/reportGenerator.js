// reportGenerator.js
import * as XLSX from 'xlsx';

// Helper function to format field changes for better readability
const formatFieldChanges = (previousValues, newValues) => {
    const changes = [];
    for (const [field, newValue] of Object.entries(newValues)) {
        const oldValue = previousValues[field];
        if (oldValue !== newValue) {
            changes.push({
                field,
                from: oldValue || 'N/A',
                to: newValue || 'N/A'
            });
        }
    }
    return changes;
};

// Helper function to find most common errors
const getMostCommonErrors = (errorData) => {
    const errorCounts = errorData.reduce((acc, curr) => {
        const error = curr['Error Message'];
        acc[error] = (acc[error] || 0) + 1;
        return acc;
    }, {});
    
    return Object.entries(errorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([error, count]) => `${error} (${count} times)`);
};

// Helper function to format date consistently
const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const generateDetailedReport = (updateResults) => {
    const wb = XLSX.utils.book_new();
    
    // Successful updates sheet
    const successData = updateResults
        .filter(r => r.status === 'success')
        .map(r => {
            const changes = formatFieldChanges(r.previous_values || {}, r.new_values || {});
            return {
                'ID': r.id,
                'Client Name': r.client_name,
                'Update Time': formatDate(r.timestamp),
                'Number of Changes': changes.length,
                'Changes': changes.map(c => 
                    `${c.field}: ${c.from} → ${c.to}`
                ).join('\n'),
                'Status': r.status
            };
        });

    if (successData.length) {
        const wsSuccess = XLSX.utils.json_to_sheet(successData, {
            header: ['ID', 'Client Name', 'Update Time', 'Number of Changes', 'Changes', 'Status']
        });
        
        // Set column widths
        wsSuccess['!cols'] = [
            { width: 10 }, // ID
            { width: 20 }, // Client Name
            { width: 20 }, // Update Time
            { width: 15 }, // Number of Changes
            { width: 50 }, // Changes
            { width: 10 }  // Status
        ];
        
        XLSX.utils.book_append_sheet(wb, wsSuccess, 'Successful Updates');
    }

    // Failed updates sheet
    const errorData = updateResults
        .filter(r => r.status === 'error')
        .map(r => ({
            'ID': r.id,
            'Client Name': r.client_name,
            'Error Time': formatDate(r.timestamp),
            'Error Message': r.error,
            'Attempted Changes': Object.entries(r.attempted_values || {})
                .map(([field, value]) => `${field}: ${value}`)
                .join('\n')
        }));

    if (errorData.length) {
        const wsErrors = XLSX.utils.json_to_sheet(errorData, {
            header: ['ID', 'Client Name', 'Error Time', 'Error Message', 'Attempted Changes']
        });
        
        // Set column widths
        wsErrors['!cols'] = [
            { width: 10 }, // ID
            { width: 20 }, // Client Name
            { width: 20 }, // Error Time
            { width: 40 }, // Error Message
            { width: 40 }  // Attempted Changes
        ];
        
        XLSX.utils.book_append_sheet(wb, wsErrors, 'Failed Updates');
    }

    // Summary sheet
    const summaryData = [{
        'Report Generated': formatDate(new Date()),
        'Total Records': updateResults.length,
        'Successful Updates': successData.length,
        'Failed Updates': errorData.length,
        'Success Rate': `${((successData.length / updateResults.length) * 100).toFixed(2)}%`,
        'Most Common Errors': getMostCommonErrors(errorData).join('\n'),
        'Average Changes Per Update': (successData.reduce((acc, curr) => 
            acc + (curr['Number of Changes'] || 0), 0) / successData.length || 0).toFixed(2)
    }];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    
    // Set column widths for summary
    wsSummary['!cols'] = [
        { width: 30 }  // All columns
    ];
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    return wb;
};

// Function to generate a simple report for small updates
export const generateSimpleReport = (updateResults) => {
    const wb = XLSX.utils.book_new();
    
    const data = updateResults.map(r => ({
        'ID': r.id,
        'Client Name': r.client_name,
        'Status': r.status,
        'Time': formatDate(r.timestamp),
        'Result': r.status === 'success' 
            ? `Updated ${Object.keys(r.new_values || {}).length} fields`
            : r.error
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Updates');

    return wb;
};