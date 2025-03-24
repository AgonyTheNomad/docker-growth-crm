// src/constants/index.js

// Client Statuses
export const STATUSES = [
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
    "Canceled"
  ];
  
  // Required Fields for Each Status
  export const STATUS_FIELDS = {
    "Knows Cyberbacker": ['Assigned Growthbacker'],
    "Lead": ['Specific Industry', 'Company/Brokerage', 'Assigned Growthbacker', 'Assigned Growthassistant'],
    "Appointment Set": ['Appointment Set Date'],
    "Appointment Kept": ['Appointment Held Date'],
    "Agreement Signed": [
      'Agreement signed date',
      'Contract Signatory',
      'Name (Person to bill)',
      'Hiring Fee Amount',
      'PT/FT',
      'KW/Non-KW/Non-RE',
      'Endorsed Date',
      'One Sheet',
      'Contract',
      'Contract Version',
      'Type of Referral',
      'Additional 3% referral incentive from franchise commission',
      '50% split incentive for FGB/GB',
      'Additional Client 25% Growth Referral Fee'
    ],
    "Hiring Fee Paid": ['Hiring Fee Paid Date', 'Hiring Fee Posted Date', 'Monthly Service Fee']
  };
  
  // Status Mapping for UI Display
  export const STATUS_MAPPING = {
    "On Pause": "On Pause",
    "Returned SA": "On Pause",
    "Awaiting OS": "On Pause",
    "MAPS Credit": "Active",
    "Trade": "Active",
    "Active": "Active",
    "Active but Awaiting Replacement": "Active",
    "Active (Winback)": "Active",
    "Winback": "Active",
    "Active (NR - 6months)": "Active",
    "Awaiting Replacement": "Awaiting Replacement",
    "Suspended": "Awaiting Replacement",
    "Ghosted": "Awaiting Replacement",
    "Pending On Hold": "Awaiting Replacement",
    "Pending Cancellation": "Awaiting Replacement",
    "On Hold": "Awaiting Replacement"
  };
  
  // Status Options for Dropdowns
  export const STATUS_OPTIONS = {
    "On Pause": ["On Pause", "Returned SA", "Awaiting OS"],
    "Active": [
      "MAPS Credit",
      "Trade",
      "Active",
      "Active but Awaiting Replacement",
      "Active (Winback)",
      "Winback",
      "Active (NR - 6months)"
    ],
    "Awaiting Replacement": [
      "Awaiting Replacement",
      "Suspended",
      "Ghosted",
      "Pending On Hold",
      "Pending Cancellation",
      "On Hold"
    ]
  };
  
  // Franchise Options
  export const FRANCHISE_OPTIONS = [
    { label: "F001 - Rich Rector", value: "F001" },
    { label: "F002 - Rich Rector, Mike Galbally and Bonni Galbally", value: "F002" },
    { label: "F004 - Allison Gambone and Rich Rector", value: "F004" },
    { label: "F006 - Jessica Wimmer, Mark Wimmer, and Rich Rector", value: "F006" },
    { label: "F007 - Pam Butera", value: "F007" },
    { label: "F008 - Derek Blain, Amina Basic, Patrick Page, and Ron Cathell", value: "F008" },
    { label: "F009 - Jeff Kuhn, Jose Rivas, and Maria Santillano", value: "F009" },
    { label: "F013 - Ryan McLean and Rich Rector", value: "F013" },
    { label: "F014 - Rob Warfield, Zane Meadors, and Sarrin Warfield", value: "F014" },
    { label: "F015 - Bryan Fair, Marci Fair, Jason Bonds, John Durham, Trey Bell, and Kim Estes", value: "F015" },
    { label: "F016 - Rich Rector LA", value: "F016" },
    { label: "F019 - Rich Rector, Richard Kim, Bradford Knowles and Daniel Edwards", value: "F019" },
    { label: "F023 - Amy Pittard and Jeremy Pittard", value: "F023" },
    { label: "F024 - Ron Mast, Catherine Mast, Rene Gonzalez, and Elisa Gonzalez", value: "F024" },
    { label: "F025 - Michael Hyde", value: "F025" },
    { label: "F026 - Brooks Warner and John Douglas", value: "F026" },
    { label: "F027 - Timothy Minnix and Rich Rector", value: "F027" },
    { label: "F033 - Kelly Wiley and Michael Davis", value: "F033" },
    { label: "F034 - Jane Maslowski", value: "F034" },
    { label: "F040 - Craig Zuber and Sajag Patel", value: "F040" },
    { label: "F042 - Chris Guldi, Craig Zuber, Nicole Zuber, Liz Landry", value: "F042" },
    { label: "F043 - Richard Rector, Jennifer Avellan and Shelly Saroyan", value: "F043" },
    { label: "F045 - Christer Holmquist, Peter Vaillancourt", value: "F045" },
    { label: "F046 - Craig Zuber and Sajag Patel", value: "F046" },
    { label: "F047 - John Zercher, Courtney Newton", value: "F047" },
    { label: "No-Franchise", value: "No" },
  ];
  
  // Default Limits and Pagination
  export const DEFAULT_LIMIT = 10;
  export const DEFAULT_OFFSET = 0;
  export const MAX_ITEMS_PER_PAGE = 20;
  
  // WebSocket Constants
  export const WS_EVENTS = {
    FETCH_ALL: 'fetchAll',
    FETCH_MORE: 'fetchMore',
    UPDATE: 'update',
    ERROR: 'error',
    PING: 'ping'
  };
  
  // Client Properties
  export const GENERAL_FIELDS = [
    'client_name',
    'growthbacker',
    'company',
    'title',
    'industry',
    'source',
    'franchise'
  ];
  
  export const CONTACT_FIELDS = [
    'mobile_phone_number',
    'office_phone_number',
    'email_address'
  ];
  
  export const SOCIAL_MEDIA_FIELDS = [
    'instagram',
    'tiktok',
    'facebook',
    'linkedin'
  ];
  
  export const ADDRESS_FIELDS = [
    'street_address',
    'city_county',
    'state',
    'zip'
  ];
  
  export const DATABASE_FIELDS = [
    'date',
    'week',
    'month'
  ];
  
  export const CONTRACT_FIELDS = [
    'contract_version',
    'contract_start_date',
    'msf',
    'contract',
    'hiring_fee',
    'signed_date',
    'hiring_fee_paid_date',
    'hiring_fee_posted_date'
  ];
  
  // Status Colors
  export const STATUS_COLORS = {
    "Active": {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200"
    },
    "On Pause": {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200"
    },
    "Awaiting Replacement": {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-200"
    },
    "Lead": {
      bg: "bg-blue-100",
      text: "text-blue-800",
      border: "border-blue-200"
    },
    "Canceled": {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200"
    },
    "default": {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-200"
    }
  };
  
  // Error Messages
  export const ERROR_MESSAGES = {
    CONNECTION_FAILED: 'Failed to create WebSocket connection',
    SERVER_ERROR: 'Server error occurred',
    UPDATE_FAILED: 'Failed to update client status',
    LOADING_FAILED: 'Failed to load more clients',
    NO_FRANCHISE: 'Please select a franchise'
  };
  
  // Timeouts and Intervals (in milliseconds)
  export const TIMEOUTS = {
    RECONNECT: 3000,
    LOADING_DELAY: 500,
    PING_INTERVAL: 30000
  };