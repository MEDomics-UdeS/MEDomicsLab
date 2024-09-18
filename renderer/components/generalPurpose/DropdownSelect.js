import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';

// Define the DropdownSelect component that accepts two props:
// `options` (the options to be displayed in the dropdown) and `onSelect` (the callback function when a selection is made)
const DropdownSelect = ({ options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  // Function to handle the selection of an option
  const handleSelect = (e) => {
    // Update the state with the newly selected value
    setSelectedValue(e.value);
    // If the onSelect function is provided as a prop, call it with the selected value
    if (onSelect) {
      onSelect(e.value);
    }
  };

  return (
    <div className="card">
      {/* PrimeReact Dropdown component */}
      <Dropdown
        value={selectedValue}
        options={choices}
        onChange={handleSelect}
        placeholder="Select an option"
        optionLabel="label"
        className="w-full"
      />
    </div>
  );
};

export default DropdownSelect;
