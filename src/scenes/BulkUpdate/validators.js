// validators.js

// Constants for validation
const STATUSES = [
    "New",
    "Key Target Demographics",
    "Knows Cyberbacker",
    "Lead",
    "Invalid Lead",
    "Declined",
    "Appointment Set",
    "Appointment Kept",
    "Prime Simulations",
    "Agreement Signed",
    "Hiring Fee Paid",
    "On Pause",
    "Active",
    "Awaiting Replacement",
    "Canceled",
    "MAPS Credit",
    "Trade",
    "Active (Winback)",
    "Winback",
    "Active (NR - 6months)",
];

// Main validation function - modified for bulk updates
export const validateCSV = (data, isUpdateMode = false) => {
    const errors = [];
    const warnings = [];

    // Check if data exists
    if (!data || !data.length) {
        errors.push('CSV file is empty');
        return { errors, warnings };
    }

    // Check required columns - 'id' is required for updates
    const requiredColumns = ['id'];
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !firstRow.hasOwnProperty(col));
    
    if (missingColumns.length) {
        errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
        const rowNumber = index + 1;

        // Validate ID
        if (!row.id) {
            errors.push(`Row ${rowNumber}: Missing ID`);
        } else if (isNaN(row.id)) {
            errors.push(`Row ${rowNumber}: ID must be a number`);
        }

        // Validate Status if present
        if (row.status && !STATUSES.includes(row.status)) {
            warnings.push(`Row ${rowNumber}: Status "${row.status}" is not a standard status`);
        }

        // For update mode, we don't require contact methods, just validate format if present
        if (!isUpdateMode) {
            // Check for client name (required for new records)
            if (row.client_name === '') {
                warnings.push(`Row ${rowNumber}: Empty value for client name`);
            }

            // Check that at least one contact method is provided (only for new records)
            const hasEmail = row.email_address && row.email_address.trim() !== '';
            const hasMobilePhone = row.mobile_phone_number && row.mobile_phone_number.trim() !== '';
            const hasOfficePhone = row.office_phone_number && row.office_phone_number.trim() !== '';

            if (!hasEmail && !hasMobilePhone && !hasOfficePhone) {
                warnings.push(`Row ${rowNumber}: At least one contact method (email, mobile phone, or office phone) is required`);
            }
        }

        // Validate Email if present
        if (row.email_address && row.email_address.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(row.email_address)) {
                warnings.push(`Row ${rowNumber}: Invalid email format "${row.email_address}"`);
            }
        }

        // Validate Phone Numbers if present
        if (row.mobile_phone_number && row.mobile_phone_number.trim() !== '') {
            const phoneRegex = /^[\d\s()+\-.,]+$/;
            if (!phoneRegex.test(row.mobile_phone_number)) {
                warnings.push(`Row ${rowNumber}: Invalid mobile phone format "${row.mobile_phone_number}"`);
            }
        }

        if (row.office_phone_number && row.office_phone_number.trim() !== '') {
            const phoneRegex = /^[\d\s()+\-.,]+$/;
            if (!phoneRegex.test(row.office_phone_number)) {
                warnings.push(`Row ${rowNumber}: Invalid office phone format "${row.office_phone_number}"`);
            }
        }

        // Validate Date formats if present
        if (row.date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(row.date)) {
                warnings.push(`Row ${rowNumber}: Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY`);
            }
        }

        // Validate Notes length if present
        if (row.notes && row.notes.length > 1000) {
            warnings.push(`Row ${rowNumber}: Notes exceed 1000 characters`);
        }
    });

    // Check for duplicate IDs
    const ids = data.map(row => row.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length) {
        errors.push(`Duplicate IDs found: ${[...new Set(duplicateIds)].join(', ')}`);
    }

    return { errors, warnings };
};

// Helper function to validate specific fields
export const validateField = (fieldName, value) => {
    switch (fieldName) {
        case 'status':
            return STATUSES.includes(value);
        case 'email_address':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        case 'mobile_phone_number':
        case 'office_phone_number':
            return /^[\d\s()+\-.,]+$/.test(value);
        case 'date':
            return /^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/.test(value);
        default:
            return true;
    }
};

// Export constants for use in other files
export const VALIDATION_CONSTANTS = {
    STATUSES,
    MAX_NOTES_LENGTH: 1000,
    REQUIRED_COLUMNS: ['id'],
    IMPORTANT_FIELDS: ['client_name']
};