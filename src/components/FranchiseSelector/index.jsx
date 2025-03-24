import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/UserContext';
import Select from 'react-select';

const EnhancedFranchiseDropdown = ({ options, onChange, defaultValue = '' }) => {
  const { userRole, subRole, userName } = useAuth();
  const [availableFranchises, setAvailableFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  
  // Check if user has access to all franchises (No subRole)
  const hasAllFranchisesAccess = () => {
    // Check if subRole is a string "No"
    if (subRole === "No") return true;
    
    // Check if subRole is an array containing "No"
    if (Array.isArray(subRole) && subRole.includes("No")) return true;
    
    // Check if userRole is admin
    if (userRole === "admin" || (Array.isArray(userRole) && userRole.includes("admin"))) return true;
    
    return false;
  };

  // Get franchises the user has access to
  useEffect(() => {
    // Default options include all franchises
    let franchiseOptions = [...options];
    
    // If user has all-access, add a special "All Franchises" option at the top
    if (hasAllFranchisesAccess()) {
      setAvailableFranchises([
        { label: "All Franchises", value: "" },
        ...franchiseOptions
      ]);
      return;
    }
    
    // For regular franchise users with specific franchise access
    if (Array.isArray(subRole)) {
      // Filter options to only include franchises the user has access to
      const userFranchises = franchiseOptions.filter(option => 
        subRole.includes(option.value)
      );
      setAvailableFranchises(userFranchises);
      
      // Auto-select first franchise if only one is available
      if (userFranchises.length === 1 && !defaultValue) {
        setSelectedFranchise(userFranchises[0]);
        onChange && onChange(userFranchises[0].value);
      }
    } else if (subRole) {
      // Single franchise access
      const userFranchise = franchiseOptions.find(option => option.value === subRole);
      if (userFranchise) {
        setAvailableFranchises([userFranchise]);
        setSelectedFranchise(userFranchise);
        onChange && onChange(userFranchise.value);
      }
    } else {
      // Fallback to show all franchises if role structure is unclear
      console.warn("User role structure unclear, showing all franchises as fallback");
      setAvailableFranchises(franchiseOptions);
    }
  }, [options, subRole, userRole, onChange, defaultValue]);

  // Set initial selected value if provided
  useEffect(() => {
    if (defaultValue && availableFranchises.length > 0) {
      const defaultOption = availableFranchises.find(option => option.value === defaultValue);
      if (defaultOption) {
        setSelectedFranchise(defaultOption);
      }
    }
  }, [defaultValue, availableFranchises]);

  // Define styles
  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '40px',
      color: 'white',
      backgroundColor: 'black',
      borderColor: '#333',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#555'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? 'black' : 'white',
      backgroundColor: state.isFocused ? 'gray' : 'black',
      padding: 20,
    }),
    dropdownIndicator: base => ({
      ...base,
      color: 'white' 
    }),
    clearIndicator: base => ({
      ...base,
      color: 'red'
    }),
    singleValue: base => ({
      ...base,
      color: 'white'
    }),
    placeholder: base => ({
      ...base,
      color: '#aaa'
    })
  };

  // Handle franchise selection
  const handleFranchiseChange = (selectedOption) => {
    setSelectedFranchise(selectedOption);
    onChange && onChange(selectedOption ? selectedOption.value : '');
  };

  return (
    <div>
      <label className="label">Select Franchise</label>
      <Select
        options={availableFranchises}
        onChange={handleFranchiseChange}
        value={selectedFranchise}
        styles={customStyles}
        placeholder="Select a Franchise"
        isSearchable
        isClearable={hasAllFranchisesAccess()} // Only allow clearing if user has all-access
        isDisabled={availableFranchises.length <= 1 && !hasAllFranchisesAccess()} // Disable if only one franchise is available
        className="franchise-select"
      />
      {hasAllFranchisesAccess() && (
        <div className="text-xs text-gray-400 mt-1">
          You have access to all franchises
        </div>
      )}
    </div>
  );
};

export default EnhancedFranchiseDropdown;