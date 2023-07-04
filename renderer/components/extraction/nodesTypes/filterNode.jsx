import React, { useState, useEffect, useCallback } from "react";
import Node from "../../flow/node";
import { Form, Row, Col, Image } from "react-bootstrap";
import ViewButton from "../buttonsTypes/viewButton";
import DocLink from "../docLink";
import MeanFilter from "./filterTypes/meanFilter";
import LogFilter from "./filterTypes/logFilter";
import LawsFilter from "./filterTypes/lawsFilter";
import GaborFilter from "./filterTypes/gaborFilter";
import WaveletFilter from "./filterTypes/waveletFilter";

// Filter node component, used in the flow editor (flowCanvas.jsx) for the extraction tab
const FilterNode = ({ id, data, type }) => {
  // Default filter form for settings as of MEDimage documentation :
  // https://medimage.readthedocs.io/en/dev/configuration_file.html
  // TODO : put this in a separate file
  // Hook used to change the selected filter type (default set to mean filter)
  const [selectedFilter, setSelectedFilter] = useState("mean");
  // Hook used to change the filter form (default set to mean filter form)
  const [filterForm, setFilterForm] = useState(
    data.setupParam.possibleSettings.defaultSettings
  );

  // Function used to change the selected filter type
  const changeFilterChoice = useCallback((event) => {
    setSelectedFilter(event.target.value);
  }, []);

  // Function used to change the filter form
  const changeFilterForm = useCallback((filter, name, value) => {
    const updatedSettings = {
      ...filterForm,
      [filter]: {
        ...filterForm[filter],
        [name]: value,
      },
    };
    setFilterForm(updatedSettings);
  }, []);

  // Called when selected filter is changed, updates the filter form
  useEffect(() => {
    setFilterForm((prevState) => ({
      ...prevState,
      filter_type: selectedFilter,
    }));
  }, [selectedFilter]);

  // Called when filter form is changed, updates the node data
  useEffect(() => {
    data.internal.settings = filterForm;
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal,
    });
  }, [filterForm]);

  // TODO : Deplacer la fonction handleFormChange dans filterNode et l'enlever des types de filtres

  return (
    <>
      <Node
        key={id}
        id={id}
        data={data}
        type={type}
        setupParam={data.setupParam}
        defaultSettings={
          <>
            <ViewButton id={id} data={data} type={type} />
          </>
        }
        nodeSpecific={
          <>
            {/* TODO : Should be able to use input.jsx from learning module
            to automatize the construction of the different filter elements, for
            now this is done manually in the filterTypes folder */}
            <Form style={{ maxWidth: "400px" }}>
              <Form.Group as={Row}>
                <Form.Label column sm={3}>
                  Filter:
                </Form.Label>
                <Col sm={10}>
                  <Form.Control
                    as="select"
                    name="filter_type"
                    onChange={changeFilterChoice}
                    value={selectedFilter}
                  >
                    <option value="mean">Mean</option>
                    <option value="log">Laplacian of Gaussian</option>
                    <option value="laws">Laws</option>
                    <option value="gabor">Gabor</option>
                    <option value="wavelet">Wavelet</option>
                  </Form.Control>
                </Col>
              </Form.Group>

              {/* Showing element associated with selectedFilter */}
              {selectedFilter === "mean" && (
                <MeanFilter
                  changeFilterForm={changeFilterForm}
                  defaultFilterForm={filterForm}
                />
              )}
              {selectedFilter === "log" && (
                <LogFilter
                  changeFilterForm={changeFilterForm}
                  defaultFilterForm={filterForm}
                />
              )}
              {selectedFilter === "laws" && (
                <LawsFilter
                  changeFilterForm={changeFilterForm}
                  defaultFilterForm={filterForm}
                />
              )}
              {selectedFilter === "gabor" && (
                <GaborFilter
                  changeFilterForm={changeFilterForm}
                  defaultFilterForm={filterForm}
                />
              )}
              {selectedFilter === "wavelet" && (
                <WaveletFilter
                  changeFilterForm={changeFilterForm}
                  defaultFilterForm={filterForm}
                />
              )}
            </Form>
          </>
        }
      />
    </>
  );
};

export default FilterNode;
