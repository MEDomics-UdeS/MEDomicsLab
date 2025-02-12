import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';

const DropdownSelect = ({ choices, selectedValue, onSelect }) => {
  const [value, setValue] = useState(selectedValue || null);

  const handleChange = (e) => {
    setValue(e.value);
    if (onSelect) {
      onSelect(e.value);
    }
  };

  return (
    <Dropdown
      value={value}
      options={choices}   // Dropdown choices from the settings
      onChange={handleChange}
      optionLabel="label" // Label to display
      placeholder="Select an option"
      className="w-full"
    />
  );
};

export default DropdownSelect;
