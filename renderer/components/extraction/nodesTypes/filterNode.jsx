import React, {
  useState,
  useEffect,
  useLayoutEffect,
  createElement,
  useCallback,
} from "react";
import Node from "../../flow/node";
import { Form, Row, Col, Image } from "react-bootstrap";
import ViewButton from "../buttonsTypes/viewButton";
import DocLink from "../docLink";
import MeanFilter from "./filterTypes/meanFilter";
import LogFilter from "./filterTypes/logFilter";
import LawsFilter from "./filterTypes/lawsFilter";
import GaborFilter from "./filterTypes/gaborFilter";
import WaveletFilter from "./filterTypes/waveletFilter";

const defaultFilterForm = {
  filter_type: "mean",
  mean: {
    ndims: 3,
    orthogonal_rot: false,
    size: 5,
    padding: "symmetric",
    name_save: "mean_filter",
  },
  log: {
    ndims: 3,
    sigma: 1.5,
    orthogonal_rot: false,
    padding: "symmetric",
    name_save: "log_filter",
  },
  laws: {
    config: ["L3", "", ""],
    energy_distance: 7,
    rot_invariance: true,
    orthogonal_rot: false,
    energy_image: true,
    padding: "symmetric",
    name_save: "laws_filter",
  },
  gabor: {
    sigma: 5,
    lambda: 2,
    gamma: 1.5,
    theta: "Pi/8",
    rot_invariance: true,
    orthogonal_rot: true,
    padding: "symmetric",
    name_save: "gabor_filter",
  },
  wavelet: {
    ndims: 3,
    basis_function: "db3",
    subband: "LLH",
    level: 1,
    rot_invariance: true,
    padding: "symmetric",
    name_save: "wavelet_filter",
  },
};

// Filter node component, used in the flow editor (flowCanvas.jsx) for the extraction tab
const FilterNode = ({ id, data, type }) => {
  // Default filter form for settings as of MEDimage documentation :
  // https://medimage.readthedocs.io/en/dev/configuration_file.html
  // TODO : put this in a separate file

  // Hook used to change the selected filter type (default set to mean filter)
  const [selectedFilter, setSelectedFilter] = useState("mean");
  // Hook used to change the filter form (default set to mean filter form)
  const [filterForm, setFilterForm] = useState(defaultFilterForm);

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
