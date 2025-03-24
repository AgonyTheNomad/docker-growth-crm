import * as React from 'react'; // Import full React namespace
import Select from 'react-select';

const FranchiseDropdown = ({ options, onChange }) => {
  // Define styles outside of any hooks or conditional logic
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
    })
  };

  // Memoize the handler to prevent unnecessary re-renders
  const handleChange = React.useCallback((selectedOption) => {
    if (onChange) {
      onChange(selectedOption);
    }
  }, [onChange]);

  return (
    <Select
      styles={customStyles}
      options={options}
      onChange={handleChange}
      placeholder="Select a Franchise"
      isClearable={true}
      isSearchable={true}
    />
  );
};

export default FranchiseDropdown;