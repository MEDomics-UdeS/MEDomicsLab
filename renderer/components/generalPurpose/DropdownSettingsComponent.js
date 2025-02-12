import React from 'react';
import DropdownSelect from './DropdownSelect'; 

// Fonction pour générer les dropdowns à partir des settings
const renderDropdowns = (sections) => {
  let dropdowns = [];

  // Itérer à travers toutes les sections de settings
  Object.keys(sections).forEach((sectionKey) => {
    const section = sections[sectionKey];

    // Itérer à travers chaque option de la section
    Object.keys(section.options).forEach((settingKey) => {
      const setting = section.options[settingKey];

      // Afficher uniquement les dropdowns
      if (setting.type === 'dropdown') {
        dropdowns.push(
          <div key={sectionKey + '-' + settingKey}>
            <label dangerouslySetInnerHTML={{ __html: setting.tooltip }}></label>
            <DropdownSelect
              choices={setting.choices}           // Passer les choix du dropdown
              selectedValue={setting.default_val}  // Valeur par défaut
              onSelect={(value) => console.log(`${settingKey} selected:`, value)}
            />
          </div>
        );
      }
    });
  });

  return dropdowns;
};

// Composant pour afficher les settings avec dropdowns
const DropdownSettingsComponent = ({ settings }) => {
  return <div>{renderDropdowns(settings)}</div>;
};

export default DropdownSettingsComponent;
