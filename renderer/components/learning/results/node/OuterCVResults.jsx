import React from "react";
import Parameters from "../utilities/parameters";
import DataTable from "../../../dataTypeVisualisation/dataTableWrapper";
import { Accordion, AccordionTab } from "primereact/accordion";

/**
 *
 * @param {Object} selectedResults The selected results
 * @returns {JSX.Element} The OuterCVResults component
 */
const OuterCVResults = ({ selectedResults }) => {
  /**
   * Générer un tableau des données des folds.
   */
  const generateFoldTables = (data) => {
    if (data && data.folds) {
      return data.folds.map((fold, index) => (
        <div key={index}>
          <h4>Fold {index + 1}</h4>
          <DataTable
            data={fold}
            tablePropsData={{
              paginator: true,
              rows: 10,
              scrollable: true,
              scrollHeight: "400px",
              size: "small",
            }}
            tablePropsColumn={{
              sortable: true,
            }}
          />
        </div>
      ));
    } else {
      return <div>No fold data available.</div>;
    }
  };

  return (
    <>
      <Accordion multiple className="outercv-results-accordion">
        {/* Paramètres généraux (seed, cv_type) */}
        <AccordionTab header="Parameters">
          <Parameters
            params={{
              Seed: selectedResults?.logs?.seed || "N/A",
              "Cross-Validation Type": selectedResults?.logs?.cv_type || "N/A",
              Folds: selectedResults?.logs?.folds || "N/A",
            }}
            tableProps={{
              scrollable: true,
              scrollHeight: "200px",
              size: "small",
            }}
            columnNames={["Parameter", "Value"]}
          />
        </AccordionTab>

        {/* Données des folds */}
        <AccordionTab header="Fold Data">
          <div className="card">{generateFoldTables(selectedResults.data)}</div>
        </AccordionTab>
      </Accordion>
    </>
  );
};

export default OuterCVResults;
