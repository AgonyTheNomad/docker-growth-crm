import React, { useState } from 'react';
import { useAuth } from '../../services/UserContext';
import { constructWsUrl } from '../../utils/apiUtils';
import { getClientIdWithTimestamp } from './utils';
import Papa from 'papaparse';
import FeedbackMessage from './FeedbackMessage';
import { FRANCHISE_OPTIONS, FRANCHISE_DESCRIPTIONS, GROWTHBACKERS } from './utils';

// Updated comprehensive list of statuses from StatusHistory.VALID_STATUSES
const VALID_STATUSES = [
  'Key Target Demographics',
  'Knows Cyberbacker',
  'Lead',
  'MAPS Credit',
  'Trade',
];

// Define lead sources constant with provided options
const LEAD_SOURCES = [
  "Lead Sources",
  "Affiliate Referral",
  "Associate Referral",
  "Career",
  "CB Referral",
  "CBCraig KC",
  "CBCraig KTD",
  "CBINC KC",
  "CBINC KTD",
  "CBINC Landing Page 2024",
  "CBShiela KC",
  "CBShiela KTD",
  "CEE Class",
  "Client Referral",
  "Concierge (Cold)",
  "Concierge (Warm)",
  "Craig Goodliffe",
  "Email Marketing",
  "Existing Client",
  "Franchise (Event-Attended)",
  "Franchise (Event-Hosted)",
  "Franchise (Event-Sponsored)",
  "Franchise (MLS/List)",
  "Franchise (Website)",
  "Franchise Referral (Warm)",
  "G.Email",
  "GA (Google)",
  "GA (LinkedIn)",
  "GA (SM-FB)",
  "GA (SM-IG)",
  "GA (WP) - White Pages",
  "Game Room",
  "GB (Google)",
  "GB (LinkedIn)",
  "GB (SM-FB)",
  "GB (SM-IG)",
  "GB (WP) - White Pages",
  "GPAB",
  "Gr0wth Class",
  "Her Best Life",
  "Inman",
  "InvestHer Texas 2024",
  "KTD Backer",
  "KW Event (Fall MM 2023)",
  "KW Event (Fall MM 2024)",
  "KW Event (FR 2023)",
  "KW Event (FR 2024)",
  "KW Event (FR 2025)",
  "KW Event (Megacamp 2023)",
  "KW Event (Megacamp 2024)",
  "KW Event (Spring MM 2023)",
  "KW Event (Spring MM 2024)",
  "KW Event (Young Professionals Summit)",
  "Launch KC",
  "Launch KTD",
  "LB (WP) - White Pages",
  "LevPros",
  "LMRE KC",
  "LMRE KTD",
  "LMRE LEAD",
  "MAPS Business",
  "MAPS Credit",
  "Marketing Email",
  "Mortgage (LV)",
  "NAR",
  "Old lead (previously declined/canceled)",
  "On demand",
  "ON24",
  "RISE",
  "SM.PaidAds  (IG Ad)",
  "SM.PaidAds (FB Ad)",
  "SM.PaidAds (Google Search Ad)",
  "SM.PaidAds (Landing Page)",
  "SMM Inc (FB)",
  "SMM Inc (IG)",
  "SMM Inc (LinkedIn)",
  "SMM Inc (YouTube)",
  "Team in a box",
  "Website (Mortgage)",
  "Website/TAWK"
];

// Helper function to calculate week number
const getWeekNumber = (d) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

// Style objects moved outside the component for optimization
const formStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px'
};

const modalStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  padding: '24px',
  width: '100%',
  maxWidth: '800px',
  maxHeight: '90vh',
  overflowY: 'auto',
  color: '#ffffff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #333333',
  backgroundColor: '#2d2d2d',
  color: '#ffffff',
  fontSize: '14px',
  marginTop: '4px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '4px',
  color: '#cccccc',
  fontSize: '14px'
};

const selectStyle = {
  ...inputStyle,
  appearance: 'menulist'
};

const gridContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '16px',
  marginBottom: '20px'
};

const buttonStyle = {
  padding: '10px 20px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

const submitButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#0095eb',
  color: '#ffffff'
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#333333',
  color: '#ffffff',
  marginRight: '10px'
};

const SingleClientForm = ({ onSubmit, onClose, isOpen }) => {
  const { userEmail } = useAuth();
  const username = userEmail.split('@')[0];

  const initialFormData = {
    date: '',
    client_name: '',
    company: '',
    title: '',
    industry: '',
    source: '',
    mobile_phone_number: '',
    office_phone_number: '',
    email_address: '',
    street_address: '',
    city_county: '',
    state: '',
    zip: '',
    facebook: '',
    linkedin: '',
    instagram: '',
    tiktok: '',
    status: '', // Empty default status to force selection
    notes: '',
    growthbacker: '',
    franchise: '',
    contact_history: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that at least one contact method is provided
    if (
      !formData.email_address.trim() &&
      !formData.mobile_phone_number.trim() &&
      !formData.office_phone_number.trim()
    ) {
      setFeedback({
        message: 'Please provide at least one contact method: Email, Mobile Phone, or Office Phone.',
        type: 'error',
        show: true
      });
      return;
    }

    try {
      const dateObj = new Date(formData.date);
      const month = dateObj.toLocaleString('default', { month: 'long' });
      const week = getWeekNumber(dateObj);

      const submissionData = {
        'Date': formData.date,
        'Week': `Week ${week}`,
        'Month': month,
        'Client Name': formData.client_name,
        'Company': formData.company,
        'Title': formData.title,
        'Industry': formData.industry,
        'Source': formData.source,
        'Mobile Phone number': formData.mobile_phone_number,
        'Office Phone number': formData.office_phone_number,
        'Email Address': formData.email_address,
        'Street Address': formData.street_address,
        'City/County': formData.city_county,
        'State': formData.state,
        'Zip': formData.zip,
        'Facebook': formData.facebook,
        'Linkedin': formData.linkedin,
        'Instagram': formData.instagram,
        'Tiktok': formData.tiktok,
        'Status': formData.status,
        'Notes': formData.notes,
        'Growth Backer': formData.growthbacker,
        'Franchise': formData.franchise,
        'Contact History': formData.contact_history
          ? JSON.stringify([{
              date: new Date().toISOString().split('T')[0],
              note: formData.contact_history
            }])
          : '[]'
      };

      const csvString = Papa.unparse({
        fields: Object.keys(submissionData),
        data: [submissionData]
      });

      const ws = new WebSocket(
        constructWsUrl(`/ws/clients/bulk-upload/${getClientIdWithTimestamp(`single-${username}`)}`)
      );

      ws.onopen = () => {
        ws.send(csvString);
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.type === "error") {
          setFeedback({
            message: response.message,
            type: 'error',
            show: true
          });
        } else if (response.type === "complete") {
          setFeedback({
            message: 'Client added successfully!',
            type: 'success',
            show: true
          });
          setTimeout(() => {
            setFormData(initialFormData);
            onClose();
          }, 2000);
        }
      };

      ws.onerror = () => {
        setFeedback({
          message: "Error connecting to server. Please try again.",
          type: 'error',
          show: true
        });
      };
    } catch (error) {
      setFeedback({
        message: error.message,
        type: 'error',
        show: true
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div style={formStyle}>
      {feedback.show && (
        <FeedbackMessage
          message={feedback.message}
          type={feedback.type}
          onClose={() => setFeedback({ ...feedback, show: false })}
        />
      )}
      <div style={modalStyle}>
        <h2 style={{ color: '#ffffff', marginBottom: '24px' }}>Add Single Client</h2>
        <form onSubmit={handleSubmit}>
          <div style={gridContainerStyle}>
            <div>
              <label style={labelStyle}>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Client Name *</label>
              <input
                type="text"
                name="client_name"
                value={formData.client_name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="" disabled>Select a status</option>
                {VALID_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Growth Backer</label>
              <select
                name="growthbacker"
                value={formData.growthbacker}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="">Select a Growth Backer</option>
                {GROWTHBACKERS.map((gb) => (
                  <option key={gb} value={gb}>{gb}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Franchise *</label>
              <select
                name="franchise"
                value={formData.franchise}
                onChange={handleChange}
                style={selectStyle}
                required
              >
                <option value="" disabled>Select a franchise</option>
                {Object.entries(FRANCHISE_DESCRIPTIONS).map(([code, description]) => (
                  <option key={code} value={code}>{description}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Source</label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                style={selectStyle}
              >
                <option value="" disabled>Select a lead source</option>
                {LEAD_SOURCES.map((src, index) => (
                  <option key={index} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email_address"
                value={formData.email_address}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Mobile Phone</label>
              <input
                type="tel"
                name="mobile_phone_number"
                value={formData.mobile_phone_number}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Office Phone</label>
              <input
                type="tel"
                name="office_phone_number"
                value={formData.office_phone_number}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Street Address</label>
              <input
                type="text"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>City/County</label>
              <input
                type="text"
                name="city_county"
                value={formData.city_county}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>ZIP</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Facebook</label>
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Instagram</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>TikTok</label>
              <input
                type="text"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Contact History</label>
            <textarea
              name="contact_history"
              value={formData.contact_history}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
              placeholder="Enter contact notes here"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={submitButtonStyle}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleClientForm;
