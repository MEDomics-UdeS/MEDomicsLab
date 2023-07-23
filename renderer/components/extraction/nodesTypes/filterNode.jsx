import React, { useState, useCallback } from "react"
import Node from "../../flow/node"
import { Form, Row, Col } from "react-bootstrap"
import ViewButton from "../buttonsTypes/viewButton"
import MeanFilter from "./filterTypes/meanFilter"
import LogFilter from "./filterTypes/logFilter"
import LawsFilter from "./filterTypes/lawsFilter"
import GaborFilter from "./filterTypes/gaborFilter"
import WaveletFilter from "./filterTypes/waveletFilter"

// Filter node component, used in the flow editor (flowCanvas.jsx) for the extraction tab
const FilterNode = ({ id, data, type }) => {
  // Default filter form for settings as of MEDimage documentation :
  // https://medimage.readthedocs.io/en/dev/configuration_file.html
  // TODO : put this in a separate file
  // Hook used to change the selected filter type (default set to mean filter)
  const [selectedFilter, setSelectedFilter] = useState(
    data.internal.settings.filter_type
  )

  // Function used to change the selected filter type
  const changeFilterType = useCallback((event) => {
    // Set the selected filter
    setSelectedFilter(event.target.value)

    // Change the filter_type in node data
    data.internal.settings.filter_type = selectedFilter
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [])

  // Function used to change the filter form
  const changeFilterForm = useCallback((name, value) => {
    data.internal.settings[selectedFilter][name] = value
    data.parentFct.updateNode({
      id: id,
      updatedData: data.internal
    })
  }, [])
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
                    onChange={changeFilterType}
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
                <MeanFilter changeFilterForm={changeFilterForm} data={data} />
              )}
              {selectedFilter === "log" && (
                <LogFilter changeFilterForm={changeFilterForm} data={data} />
              )}
              {selectedFilter === "laws" && (
                <LawsFilter changeFilterForm={changeFilterForm} data={data} />
              )}
              {selectedFilter === "gabor" && (
                <GaborFilter changeFilterForm={changeFilterForm} data={data} />
              )}
              {selectedFilter === "wavelet" && (
                <WaveletFilter
                  changeFilterForm={changeFilterForm}
                  data={data}
                />
              )}
            </Form>
          </>
        }
      />
    </>
  )
}

export default FilterNode
