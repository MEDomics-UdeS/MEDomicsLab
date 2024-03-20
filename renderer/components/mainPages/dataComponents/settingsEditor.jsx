import { WorkspaceContext } from '../../workspace/workspaceContext';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Form, Row, Col } from "react-bootstrap"
import { Tooltip } from 'primereact/tooltip';
import { useState, useContext, useRef } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import DocLink from '../../extractionMEDimage/docLink';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { toast } from 'react-toastify';
import { requestJson } from '../../../utilities/requests';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';

function TextureParams({ModSettings, activeIndex, setActiveIndex, discretisationAlgos, indexAlgo, indexVal}) {
    return (
        <Form.Group as={Row}>
        <Col>
            <Form.Group as={Row}>
                <Form.Label column>Type</Form.Label>
            </Form.Group>
            <Dropdown 
                value={ModSettings.discretisation.texture.type[indexAlgo]}
                options={discretisationAlgos}
                optionLabel="name"
                placeholder={ModSettings.discretisation.texture.type[indexAlgo]}
                onChange={(event) => {
                    console.log(ModSettings);
                    ModSettings.discretisation.texture.type[indexAlgo] = event.target.value;
                    setActiveIndex(!activeIndex);
                }}/>
        </Col>
        <Col>
            <Form.Group as={Row}>
                <Form.Label column>Value</Form.Label>
            </Form.Group>
            <InputNumber
                style={{marginLeft: "1rem", width: "12rem"}}
                id='valueTexture'
                value={ModSettings.discretisation.texture.val[indexAlgo][indexVal]}
                onValueChange={(event) => {
                    console.log(ModSettings);
                    ModSettings.discretisation.texture.val[indexAlgo][indexVal] = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
                mode="decimal" />
        </Col></Form.Group>
    )
}

const renderFiltering = (params, filter_type, activeIndex, setActiveIndex) => {
    if (filter_type === "mean") {
        return (
            <Form.Group as={Row} controlId="filter-mean">
      <DocLink
        linkString={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#mean"
        }
        name={"Mean filter documentation"}
        image={"../icon/extraction_img/exclamation.svg"}
      />

      <Form.Group as={Row} controlId="ndims">
        <Form.Label column>Dimension:</Form.Label>
        <Col>
          <Form.Control
            className="int"
            name="ndims"
            type="number"
            value={params.mean.ndims}
            onChange={(event) => {
                params.mean.ndims = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="padding"
            value={params.mean.padding}
            onChange={(event) => {
                params.mean.padding = event.target.value
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="constant">Constant</option>
            <option value="edge">Edge</option>
            <option value="linear_ramp">Linear ramp</option>
            <option value="maximum">Maximum</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="minimum">Minimum</option>
            <option value="reflect">Reflect</option>
            <option value="symmetric">Symmetric</option>
            <option value="wrap">Wrap</option>
            <option value="empty">Empty</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="orthogonal_rot"
            value={params.mean.orthogonal_rot}
            onChange={(event) => {
                params.mean.orthogonal_rot = event.target.value
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col>
          <Form.Control
            name="name_save"
            type="text"
            value={params.mean.name_save}
            onChange={(event) =>{
                params.mean.name_save = event.target.value
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>
    </Form.Group>
    )} else if (filter_type === "log"){
        return (
        <Form.Group as={Row} controlId="filter-log">
        <DocLink
            linkString={
            "https://medimage.readthedocs.io/en/latest/configuration_file.html#log"
            }
            name={"Log filter documentation"}
            image={"../icon/extraction_img/exclamation.svg"}
        />

        <Form.Group as={Row} controlId="ndims">
            <Form.Label column>Dimension:</Form.Label>
            <Col>
            <Form.Control
                className="int"
                name="ndims"
                type="number"
                value={params.log.ndims}
                onChange={(event) => {
                    params.log.ndims = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
            />
            </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="sigma">
            <Form.Label column>Sigma:</Form.Label>
            <Col>
            <Form.Control
                name="sigma"
                type="number"
                value={params.log.sigma}
                onChange={(event) =>{
                    params.log.sigma = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
            />
            </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="orthogonal_rot">
            <Form.Label column>Orthogonal rotation:</Form.Label>
            <Col>
            <Form.Control
                as="select"
                name="orthogonal_rot"
                value={params.log.orthogonal_rot}
                onChange={(event) => {
                    params.log.orthogonal_rot = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
            >
                <option value="false">False</option>
                <option value="true">True</option>
            </Form.Control>
            </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="padding">
            <Form.Label column>Padding:</Form.Label>
            <Col>
            <Form.Control
                as="select"
                name="padding"
                value={params.log.padding}
                onChange={(event) => {
                    params.log.padding = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
            >
                <option value="constant">Constant</option>
                <option value="edge">Edge</option>
                <option value="linear_ramp">Linear ramp</option>
                <option value="maximum">Maximum</option>
                <option value="mean">Mean</option>
                <option value="median">Median</option>
                <option value="minimum">Minimum</option>
                <option value="reflect">Reflect</option>
                <option value="symmetric">Symmetric</option>
                <option value="wrap">Wrap</option>
                <option value="empty">Empty</option>
            </Form.Control>
            </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="name_save">
            <Form.Label column>Name save:</Form.Label>
            <Col>
            <Form.Control
                name="name_save"
                type="text"
                value={params.log.name_save}
                onChange={(event) => {
                    params.log.name_save = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
            />
            </Col>
        </Form.Group>
        </Form.Group>)
    } else if (filter_type === "laws"){
        return(
            <Form.Group as={Row} controlId="filter-laws">
      <DocLink
        linkString={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#laws"
        }
        name={"Laws filter documentation"}
        image={"../icon/extraction_img/exclamation.svg"}
      />
      <Form.Group as={Row} controlId="config">
          <Col style={{ minWidth: "220px" }}>
            <Form.Label column>1D filters to use (in order):</Form.Label>
          </Col>
          <Col xs lg="2">
            <Form.Group controlId="config_0">
              <Form.Control
                as="select"
                name="config_0"
                value={params.laws.config[0]}
                onChange={(event) => {
                    params.laws.config[0] = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
              >
                <option value="L3">L3</option>
                <option value="L5">L5</option>
                <option value="E3">E3</option>
                <option value="E5">E5</option>
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="W5">W5</option>
                <option value="R5">R5</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs lg="2">
            <Form.Group controlId="config_1">
              <Form.Control
                as="select"
                name="config_1"
                value={params.laws.config[1]}
                onChange={(event) => {
                    params.laws.config[1] = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
              >
                <option value=""></option>
                <option value="L3">L3</option>
                <option value="L5">L5</option>
                <option value="E3">E3</option>
                <option value="E5">E5</option>
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="W5">W5</option>
                <option value="R5">R5</option>
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs lg="2">
            <Form.Group controlId="config_2">
              <Form.Control
                as="select"
                name="config_2"
                value={params.laws.config[2]}
                onChange={(event) => {
                    params.laws.config[2] = event.target.value;
                    setActiveIndex(!activeIndex);
                }}
              >
                <option value=""></option>
                <option value="L3">L3</option>
                <option value="L5">L5</option>
                <option value="E3">E3</option>
                <option value="E5">E5</option>
                <option value="S3">S3</option>
                <option value="S5">S5</option>
                <option value="W5">W5</option>
                <option value="R5">R5</option>
              </Form.Control>
            </Form.Group>
          </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="energy_distance">
        <Form.Label column>Chebyshev distance:</Form.Label>
        <Col>
          <Form.Control
            name="energy_distance"
            type="number"
            value={params.laws.energy_distance}
            onChange={(event) => {
                params.laws.energy_distance = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="rot_invariance">
        <Form.Label column>Rotational invariance:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="rot_invariance"
            value={params.laws.rot_invariance}
            onChange={(event) => {
                params.laws.rot_invariance = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="orthogonal_rot"
            value={params.laws.orthogonal_rot}
            onChange={(event) => {
                params.laws.orthogonal_rot = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="energy_image">
        <Form.Label column>Energy images:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="energy_image"
            value={params.laws.energy_image}
            onChange={(event) => {
                params.laws.energy_image = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="padding"
            value={params.laws.padding}
            onChange={(event) => {
                params.laws.padding = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="constant">Constant</option>
            <option value="edge">Edge</option>
            <option value="linear_ramp">Linear ramp</option>
            <option value="maximum">Maximum</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="minimum">Minimum</option>
            <option value="reflect">Reflect</option>
            <option value="symmetric">Symmetric</option>
            <option value="wrap">Wrap</option>
            <option value="empty">Empty</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col>
          <Form.Control
            name="name_save"
            type="text"
            value={params.laws.name_save}
            onChange={(event) => {
                params.laws.name_save = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>
    </Form.Group>
    )} else if (filter_type === "gabor"){
        return(
    <Form.Group as={Row} controlId="filter-gabor">
      <DocLink
        linkString={
          "https://medimage.readthedocs.io/en/latest/configuration_file.html#gabor"
        }
        name={"Gabor filter documentation"}
        image={"../icon/extraction_img/exclamation.svg"}
      />
      <Form.Group as={Row} controlId="sigma">
        <Form.Label column>Sigma:</Form.Label>
        <Col>
          <Form.Control
            name="sigma"
            type="number"
            value={params.gabor.sigma}
            onChange={(event) => {
                params.gabor.sigma = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="lambda">
        <Form.Label column>Lambda:</Form.Label>
        <Col>
          <Form.Control
            name="lambda"
            type="number"
            value={params.gabor.lambda}
            onChange={(event) => {
                params.gabor.lambda = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="gamma">
        <Form.Label column>Gamma:</Form.Label>
        <Col>
          <Form.Control
            name="gamma"
            type="number"
            value={params.gabor.gamma}
            onChange={(event) => {
                params.gabor.gamma = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="theta">
        <Form.Label column>Theta:</Form.Label>
        <Col>
          <Form.Control
            name="theta"
            type="text"
            value={params.gabor.theta}
            onChange={(event) => {
                params.gabor.theta = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="rot_invariance">
        <Form.Label column>Rotational invariance:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="rot_invariance"
            value={params.gabor.rot_invariance}
            onChange={(event) => {
                params.gabor.rot_invariance = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="orthogonal_rot">
        <Form.Label column>Orthogonal rotation:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="orthogonal_rot"
            value={params.gabor.orthogonal_rot}
            onChange={(event) => {
                params.gabor.orthogonal_rot = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="padding">
        <Form.Label column>Padding:</Form.Label>
        <Col>
          <Form.Control
            as="select"
            name="padding"
            value={params.gabor.padding}
            onChange={(event) => {
                params.gabor.padding = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          >
            <option value="constant">Constant</option>
            <option value="edge">Edge</option>
            <option value="linear_ramp">Linear ramp</option>
            <option value="maximum">Maximum</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="minimum">Minimum</option>
            <option value="reflect">Reflect</option>
            <option value="symmetric">Symmetric</option>
            <option value="wrap">Wrap</option>
            <option value="empty">Empty</option>
          </Form.Control>
        </Col>
      </Form.Group>

      <Form.Group as={Row} controlId="name_save">
        <Form.Label column>Name save:</Form.Label>
        <Col>
          <Form.Control
            name="name_save"
            type="text"
            value={params.gabor.name_save}
            onChange={(event) => {
                params.gabor.name_save = event.target.value;
                setActiveIndex(!activeIndex);
            }}
          />
        </Col>
      </Form.Group>
    </Form.Group>)
    } else if (filter_type === "wavelet"){
        return(
        <Form.Group as={Row} controlId="filter-wavelet">
        <DocLink
            linkString={
            "https://medimage.readthedocs.io/en/latest/configuration_file.html#wavelet"
            }
            name={"Wavelet filter documentation"}
            image={"../icon/extraction_img/exclamation.svg"}
        />
        <Form.Group as={Row} controlId="ndims">
            <Form.Label column>Dimension:</Form.Label>
            <Col>
            <Form.Control
                className="int"
                name="ndims"
                type="number"
                value={params.wavelet.ndims}
                onChange={(event) =>
                changeFilterForm(event.target.name, event.target.value)
                }
            />
            </Col>
        </Form.Group>
    
        <Form.Group as={Row} controlId="basis_function">
            <Tooltip target=".basisFunc"/>
            <Form.Label 
                column
                className="basisFunc"
                data-pr-tooltip="Wavelet basis function's name to create the kernel. Click to see the list of available basis functions."
                data-pr-position="bottom">
            <DocLink
                linkString={
                "https://pywavelets.readthedocs.io/en/v0.3.0/ref/wavelets.html#wavelet-families"
                }
                name={"Basis function:"}
            />
            </Form.Label>
            <Col>
                
                <Form.Control
                    type="text"
                    name="basis_function"
                    value={params.wavelet.basis_function}
                    onChange={(event) => {
                        params.wavelet.basis_function = event.target.value;
                        setActiveIndex(!activeIndex);
                    }}
                />
            </Col>
        </Form.Group>
    
        <Form.Group as={Row} controlId="subband">
            <Form.Label column>Subband:</Form.Label>
            <Col xs lg="2">
                <Form.Group controlId="subbandX">
                <Form.Control
                    as="select"
                    name="subbandX"
                    value={params.wavelet.subband.split("")[0]}
                    onChange={(event) => {
                        params.wavelet.subband = event.target.value + params.wavelet.subband.split("")[1] + params.wavelet.subband.split("")[2];
                        setActiveIndex(!activeIndex);
                    }}
                >
                    <option value="L">L</option>
                    <option value="H">H</option>
                </Form.Control>
                </Form.Group>
            </Col>
            <Col xs lg="2">
                <Form.Group controlId="subbandY">
                <Form.Control
                    as="select"
                    name="subbandY"
                    value={params.wavelet.subband.split("")[1]}
                    onChange={(event) => {
                        params.wavelet.subband = params.wavelet.subband.split("")[0] + event.target.value + params.wavelet.subband.split("")[2];
                        setActiveIndex(!activeIndex);
                    }}
                >
                    <option value="L">L</option>
                    <option value="H">H</option>
                </Form.Control>
                </Form.Group>
            </Col>
            <Col xs lg="2">
                <Form.Group controlId="subbandZ">
                <Form.Control
                    as="select"
                    name="subbandZ"
                    value={params.wavelet.subband.split("")[2]}
                    onChange={(event) => {
                        params.wavelet.subband = params.wavelet.subband.split("")[0] + params.wavelet.subband.split("")[1] + event.target.value;
                        setActiveIndex(!activeIndex);
                    }}
                >
                    <option value="L">L</option>
                    <option value="H">H</option>
                </Form.Control>
                </Form.Group>
            </Col>
        </Form.Group>
    
        <Form.Group as={Row} controlId="level">
            <Form.Label column>Level:</Form.Label>
            <Col>
            <Form.Control
                className="int"
                type="number"
                name="level"
                value={params.wavelet.level}
                onChange={(event) =>
                changeFilterForm(event.target.name, event.target.value)
                }
            />
            </Col>
        </Form.Group>
    
        <Form.Group as={Row} controlId="rot_invariance">
            <Form.Label column>Rotational invariance:</Form.Label>
            <Col>
            <Form.Control
                as="select"
                name="rot_invariance"
                value={params.wavelet.rot_invariance}
                onChange={(event) =>
                changeFilterForm(event.target.name, event.target.value)
                }
            >
                <option value="false">False</option>
                <option value="true">True</option>
            </Form.Control>
            </Col>
        </Form.Group>
    
        <Form.Group as={Row} controlId="padding">
            <Form.Label column>Padding:</Form.Label>
            <Col>
            <Form.Control
                as="select"
                name="padding"
                value={params.wavelet.padding}
                onChange={(event) =>
                changeFilterForm(event.target.name, event.target.value)
                }
            >
                <option value="constant">Constant</option>
                <option value="edge">Edge</option>
                <option value="linear_ramp">Linear ramp</option>
                <option value="maximum">Maximum</option>
                <option value="mean">Mean</option>
                <option value="median">Median</option>
                <option value="minimum">Minimum</option>
                <option value="reflect">Reflect</option>
                <option value="symmetric">Symmetric</option>
                <option value="wrap">Wrap</option>
                <option value="empty">Empty</option>
            </Form.Control>
            </Col>
        </Form.Group>
    
        <Form.Group as={Row} controlId="name_save">
            <Form.Label column>Name save:</Form.Label>
            <Col>
            <Form.Control
                type="text"
                name="name_save"
                value={params.wavelet.name_save}
                onChange={(event) =>
                changeFilterForm(event.target.name, event.target.value)
                }
            />
            </Col>
        </Form.Group>
        </Form.Group>
        )
    }
}
/**
 * @param {boolean} showEdit if true, the settings editor is displayed
 * @param {function} setShowEdit function to set the showEdit state
 * @param {JSON} ModSettings contains the settings of the node 
 * @param {string} pathSettings path to the settings file
 * @returns {JSX.Element} optional, a settings edior panel
 */
const renderParamsPanel = (activeIndex, setActiveIndex, setShowEdit, ModSettings, imParamFilter, pathSettings) => {
    const toastPrime = useRef(null);
    const [oldValueMin, setoldValueMin] = useState(ModSettings.reSeg.range[0]);
    const [oldValueMax, setoldValueMax] = useState(ModSettings.reSeg.range[1]);
    const discretisationAlgos = [
        { name: 'FBS' },
        { name: 'FBSequal' },
        { name: 'FBN' },
        { name: 'FBNequal' },
    ];
    const filterTypes = [
        { name: 'mean' },
        { name: 'log' },
        { name: 'laws' },
        { name: 'gabor' },
        { name: 'wavelet' }
    ];
    const intensityTypes = [
        { name: 'arbitrary' },
        { name: 'definite' },
        { name: 'filtered' }
    ];
    const interpMethsVol = [
        { name: 'spline' },
        { name: 'linear' },
        { name: 'cubic' },
    ];
    const interpMethsRoi = [
        { name: 'nearest' },
        { name: 'linear' },
        { name: 'cubic' },
    ];
    

    return (
        <>
        <div className="text-center">
            <span className="p-inputgroup-addon">
                <i className="pi pi-box"></i>
            </span>
        </div>
        <Row className="form-group-box">
            {/* BOX STRING*/}
            <Form.Group as={Row} controlId="boxString">
                <Tooltip target=".boxString" />
                <Form.Label 
                    column 
                    className='boxString'
                    data-pr-tooltip="the size if the box containing the ROI (For example: full, box10, box7, etc.)"
                    data-pr-position="bottom"
                    >
                        Box string:
                </Form.Label>
                <Col>
                <Form.Control
                    className="text"
                    name="boxString"
                    type="text"
                    value={ModSettings.box_string}
                    onChange={(event) => {
                        ModSettings.box_string = event.target.value;
                        setActiveIndex(!activeIndex);
                    }}/>
                </Col>
            </Form.Group>
            {/* COMPUTE SUV MAP */}
            {('compute_suv_map' in ModSettings) && (
            <Form.Group as={Row} controlId="suv">
                <Tooltip target=".suv" />
                <Form.Label 
                    column 
                    className='suv'
                    data-pr-tooltip="Whether to compute the SUV map or not"
                    data-pr-position="bottom"
                    >
                        Compute suv map:
                </Form.Label>
                <Col>
                <InputSwitch 
                    style={{paddingTop: "10px"}}
                    checked={ModSettings.compute_suv_map} 
                    onChange={(event) => {
                        ModSettings.compute_suv_map = event.target.value;
                        console.log(ModSettings.compute_suv_map);
                        setActiveIndex(!activeIndex);
                    }} />
                </Col>
            </Form.Group>
            )}
            
        {/* INTERPOLATION */}
        </Row>
        <Row className="form-group-box">
            <div className="text-center">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-window-maximize"></i>
                </span>
                <label><b>Interpolation</b></label>
            </div>
        <Col className="form-group-box">
            <Form.Group as={Row}>
                <Tooltip target=".scaleNonText" />
                <Form.Label
                    className="scaleNonText"
                    data-pr-tooltip="Voxel spacing to use for interpolation for the extraction of non-textural features"
                    data-pr-position="bottom">
                    Scale non-text :
                </Form.Label>
                <Col>
                    <Form.Group as={Row}>
                        <Form.Label className="scaleNonTextX" column>X</Form.Label>
                    </Form.Group>
                        <InputNumber
                            style={{width: "3rem"}}
                            buttonLayout="vertical"
                            value={ModSettings.interp.scale_non_text[0]}
                            onValueChange={(event) => {
                                ModSettings.interp.scale_non_text[0] = event.target.value;
                                setActiveIndex(!activeIndex);
                            } }
                            mode="decimal"
                            showButtons
                            min={0.1}
                            minFractionDigits={1}
                            maxFractionDigits={5}
                            incrementButtonClassName="p-button-info"
                            decrementButtonClassName='p-button-info' 
                        />
                </Col>
                <Col>
                    <Form.Group as={Row}>
                        <Form.Label className="scaleNonTextY" column>Y</Form.Label>
                    </Form.Group>
                        <InputNumber
                            style={{width: "3rem"}}
                            buttonLayout="vertical"
                            value={ModSettings.interp.scale_non_text[1]}
                            onValueChange={(event) => {
                                ModSettings.interp.scale_non_text[1] = event.target.value;
                                setActiveIndex(!activeIndex);
                            } }
                            mode="decimal"
                            showButtons
                            min={0.1}
                            minFractionDigits={1}
                            maxFractionDigits={5}
                            incrementButtonClassName="p-button-info"
                            decrementButtonClassName='p-button-info' />
                </Col>
                <Col>
                    <Form.Group as={Row}>
                        <Form.Label className="scaleNonTextZ" column>Z</Form.Label>
                    </Form.Group>
                        <InputNumber
                            style={{width: "3rem"}}
                            buttonLayout="vertical"
                            value={ModSettings.interp.scale_non_text[2]}
                            onValueChange={(event) => {
                                ModSettings.interp.scale_non_text[2] = event.target.value;
                                setActiveIndex(!activeIndex);
                            } }
                            mode="decimal"
                            showButtons
                            min={0.1}
                            minFractionDigits={1}
                            maxFractionDigits={5}
                            incrementButtonClassName="p-button-info"
                            decrementButtonClassName='p-button-info' />
                </Col>
            </Form.Group>
        </Col>

        {/* SCALE TEXTURE*/}
        <Col className="form-group-box">
            <Form.Group as={Row}>
                <Tooltip target=".scaleText" />
                <Form.Label
                    className="scaleText"
                    data-pr-tooltip="Voxel spacing to use for interpolation for the extraction of textural features"
                    data-pr-position="bottom">
                    Scale text :
                </Form.Label>
                <Col>
                    <Form.Group as={Row}>
                        <Form.Label className="scaleTextX" column>X</Form.Label>
                    </Form.Group>
                    <InputNumber
                        style={{width: "3rem"}}
                        buttonLayout="vertical"
                        value={ModSettings.interp.scale_text[0][0]}
                        onValueChange={(event) => {
                            ModSettings.interp.scale_text[0][0] = event.target.value;
                            setActiveIndex(!activeIndex);
                        }}
                        mode="decimal"
                        showButtons
                        min={0.1}
                        minFractionDigits={1}
                        maxFractionDigits={5}
                        incrementButtonClassName="p-button-info"
                        decrementButtonClassName='p-button-info' />
                </Col>
                <Col>
                    <Form.Group as={Row}>
                        <Form.Label className="scaleTextY" column>Y</Form.Label>
                    </Form.Group>
                    <InputNumber
                        style={{width: "3rem"}}
                        buttonLayout="vertical"
                        value={ModSettings.interp.scale_text[0][1]}
                        onValueChange={(event) => {
                            ModSettings.interp.scale_text[0][1] = event.target.value;
                            setActiveIndex(!activeIndex);
                        } }
                        mode="decimal"
                        showButtons
                        min={0.1}
                        minFractionDigits={1}
                        maxFractionDigits={5}
                        incrementButtonClassName="p-button-info"
                        decrementButtonClassName='p-button-info' />
                </Col>
                <Col>
                    <Form.Group as={Row}>
                        <Form.Label className="scaleTextZ" column>Z</Form.Label>
                    </Form.Group>
                    <InputNumber
                        style={{width: "3rem"}}
                        buttonLayout="vertical"
                        value={ModSettings.interp.scale_text[0][2]}
                        onValueChange={(event) => {
                            ModSettings.interp.scale_text[0][2] = event.target.value;
                            setActiveIndex(!activeIndex);
                        } }
                        mode="decimal"
                        showButtons
                        min={0.1}
                        minFractionDigits={1}
                        maxFractionDigits={5}
                        incrementButtonClassName="p-button-info"
                        decrementButtonClassName='p-button-info' />
                </Col>
            </Form.Group>
        </Col>
        </Row>
        <Row className="form-group-box">
        <Col>
            <Form.Group as={Row}>
                <Form.Label className="volInterpMeth" column>Volume interpolation method</Form.Label>
            </Form.Group>
            <Dropdown 
                style={{width: "200px"}}
                value={ModSettings.interp.vol_interp}  
                options={interpMethsVol}
                optionLabel="name" 
                placeholder={ModSettings.interp.vol_interp} 
                className="w-full md:w-14rem"
                onChange={(event) => {
                    ModSettings.interp.vol_interp = event.target.value;
                    setActiveIndex(!activeIndex);
                }} 
            />
            <Form.Group as={Row}>
                <Form.Label className="InterpMeth" column>ROI interpolation method</Form.Label>
            </Form.Group>
            <Dropdown 
                style={{width: "200px"}}
                value={ModSettings.interp.roi_interp}  
                options={interpMethsRoi}
                optionLabel="name" 
                placeholder={ModSettings.interp.roi_interp} 
                className="w-full md:w-14rem"
                onChange={(event) => {
                    ModSettings.interp.roi_interp = event.target.value;
                    setActiveIndex(!activeIndex);
                }} 
            />
        </Col>
        <Row>
            <Col>
                <Form.Group as={Row}>
                    <Tooltip target=".roiPV" />
                    <Form.Label
                        className="roiPV"
                        data-pr-tooltip="ROI interpolation value to use for the extraction of textural features"
                        data-pr-position="bottom">
                        ROI PV :
                    </Form.Label>
                </Form.Group>
                <InputNumber
                    style={{width: "4rem"}}
                    buttonLayout="vertical"
                    value={ModSettings.interp.roi_pv}
                    onValueChange={(event) => {
                        ModSettings.interp.roi_pv = event.target.value;
                        setActiveIndex(!activeIndex);
                    } }
                    mode="decimal"
                    showButtons
                    min={0}
                    max={1}
                    minFractionsDigits={1}
                    maxFractionDigits={5}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
            </Col>
            <Col>
                <Form.Group as={Row}>
                    <Tooltip target=".glRound" />
                    <Form.Label
                        className="glRound"
                        data-pr-tooltip="Volume gray levels rounding value (Must be power of 10)"
                        data-pr-position="bottom">
                        Gray level round :
                    </Form.Label>
                </Form.Group>
                <InputNumber
                    style={{width: "4rem"}}
                    buttonLayout="vertical"
                    value={ModSettings.interp.gl_round}
                    onValueChange={(event) => {
                        if (!event.target.value) {
                            ModSettings.interp.gl_round = [];
                        }
                        ModSettings.interp.gl_round = event.target.value;
                        setActiveIndex(!activeIndex);
                    }}
                    showButtons
                    min={1}
                    step={ModSettings.interp.gl_round * 9}
                    incrementButtonClassName="p-button-info"
                    decrementButtonClassName='p-button-info' 
                />
            </Col>
        </Row>
        </Row>

        {/* RE-SEGMENTATION*/}
        <br/>
        <div className="text-center">
            <span className="p-inputgroup-addon">
                <i className="pi pi-sliders-h"></i>
            </span>
            <label><b>Re-Segmentation</b></label>
        </div>
        <Row className="form-group-box">
        <Form.Group as={Row}>
            <Tooltip target=".resegRange"/>
            <Form.Label 
                className="resegRange" 
                data-pr-tooltip="re-segmentation range to exclude voxels from the ROI (air for example)"
                data-pr-position="bottom">
                Range :
            </Form.Label>
            <Col>
                <label style={{width: "90px"}} htmlFor="minrange" className="font-bold block mb-2">Min</label>
                <InputNumber 
                    id='minrange'
                    value={ModSettings.reSeg.range[0]}
                    onValueChange={(event) => {
                        ModSettings.reSeg.range[0] = event.target.value;
                        setoldValueMin(event.target.value);
                        setActiveIndex(!activeIndex);
                    }} 
                    mode="decimal"
                />
                <div htmlFor="infinitySwitchMin" className="font-bold block mb-2">Infinity</div>
                <InputSwitch 
                    id="infinitySwitchMin"
                    className='bg-teal-400'
                    checked={ModSettings.reSeg.range[0] === "inf"}
                    onChange={(event) => {
                        if (event.target.value) {
                            ModSettings.reSeg.range[0] = "inf";
                        } else {
                            if (oldValueMin === "inf"){
                                ModSettings.reSeg.range[0] = 0;
                            }
                            else{
                                ModSettings.reSeg.range[0] = oldValueMin;
                            }
                        };
                        setActiveIndex(!activeIndex);
                    }}
                />
            </Col>
            <Col>
                <label style={{width: "90px"}} htmlFor="maxrange" className="font-bold block mb-2">Max</label>
                <InputNumber 
                    id='maxrange'
                    value={ModSettings.reSeg.range[1]}
                    onValueChange={(event) => {
                        ModSettings.reSeg.range[1] = event.target.value;
                        setoldValueMax(event.target.value);
                        setActiveIndex(!activeIndex);
                    }} 
                    mode="decimal"
                    disabled={ModSettings.reSeg.range[1] === "inf"} 
                />
                <div htmlFor="infinitySwitchMax" className="font-bold block mb-2">Infinity</div>
                <InputSwitch 
                    id="infinitySwitchMax"
                    checked={ModSettings.reSeg.range[1] === "inf"}
                    onChange={(event) => {
                        if (event.target.value) {
                            ModSettings.reSeg.range[1] = "inf";
                        } else {
                            if (oldValueMax === "inf") {
                                ModSettings.reSeg.range[1] = 1000;
                                setoldValueMax(1000);
                            } else {
                                ModSettings.reSeg.range[1] = oldValueMax;
                            }
                        };
                        setActiveIndex(!activeIndex);
                    }}
                />
            </Col>
            <Col>
                <div htmlFor="outliersSwtich" className="font-bold block mb-2">Outliers (Collewet)</div>
                <InputSwitch 
                    id="outliersSwtich"
                    checked={ModSettings.reSeg.outliers === "Collewet"} 
                    onChange={() => {
                        if (ModSettings.reSeg.outliers === "Collewet"){
                            ModSettings.reSeg.outliers = "";
                        }
                        else{
                            ModSettings.reSeg.outliers = "Collewet";
                        }
                        setActiveIndex(!activeIndex);
                    }}
                />
        </Col>
        </Form.Group>
        </Row>

            {/* DISCRETIZATION */}
            <br/>
            <div className="text-center">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-chart-bar"></i>
                </span>
                <label><b>Discretisation</b></label>
            </div>
            {/* IH DISCRETIZATION */}
            <Row className="form-group-box">
                <Form.Group as={Row}>
                    <Tooltip target=".discretisationIH"/>
                    <Form.Label 
                        className="discretisationIH" 
                        data-pr-tooltip="Intensity volume histogram features discretization parameters"
                        data-pr-position="bottom">
                        IH :
                    </Form.Label>
                    <Col>
                        <Form.Group as={Row}>
                            <Form.Label column>Type</Form.Label>
                        </Form.Group>
                        <Dropdown 
                            value={ModSettings.discretisation.IH.type}  
                            options={discretisationAlgos}
                            optionLabel="name" 
                            placeholder={ModSettings.discretisation.IH.type} 
                            onChange={(event) => {
                                console.log(event.target.value);
                                ModSettings.discretisation.IH.type = event.target.value;
                                setActiveIndex(!activeIndex);
                            }} 
                        />
                    </Col>
                    <Col>
                        <Form.Group as={Row}>
                            <Form.Label column>Value</Form.Label>
                        </Form.Group>
                        <InputNumber 
                            id='valueIH'
                            value={ModSettings.discretisation.IH.val}
                            onValueChange={(event) => {
                                ModSettings.discretisation.IH.val = event.target.value;
                                setActiveIndex(!activeIndex);
                            }} 
                            mode="decimal"
                        />
                    </Col>
                </Form.Group>
            </Row>

            {/* IVH DISCRETIZATION */}
            <Row className="form-group-box">
                <Form.Group as={Row}>
                    <Tooltip target=".discretisationIVH"/>
                    <Form.Label 
                        className="discretisationIVH" 
                        data-pr-tooltip="Intensity histogram features discretization parameters"
                        data-pr-position="bottom">
                        IVH :
                    </Form.Label>
                    <Col>
                        <Form.Group as={Row}>
                            <Form.Label column>Type</Form.Label>
                        </Form.Group>
                        <Dropdown 
                            value={ModSettings.discretisation.IVH.type}  
                            options={discretisationAlgos}
                            optionLabel="name" 
                            placeholder={ModSettings.discretisation.IVH.type} 
                            onChange={(event) => {
                                ModSettings.discretisation.IVH.type = event.target.value;
                                setActiveIndex(!activeIndex);
                            }} 
                        />
                    </Col>
                    <Col>
                        <Form.Group as={Row}>
                            <Form.Label column>Value</Form.Label>
                        </Form.Group>
                        <InputNumber 
                            id='valueIVH'
                            value={ModSettings.discretisation.IVH.val}
                            onValueChange={(event) => {
                                ModSettings.discretisation.IVH.val = event.target.value;
                                setActiveIndex(!activeIndex);
                            }} 
                            mode="decimal"
                        />
                    </Col>
                </Form.Group>
            </Row>

            {/* TEXTURE DISCRETIZATION */}
            <Row className="form-group-box">
                <Form.Group as={Row}>
                    <Tooltip target=".discretisation"/>
                    <Form.Label 
                        className="discretisation" 
                        data-pr-tooltip="Texture features discretization parameters (algorithms and values). Multiple algorithms/values can be used."
                        data-pr-position="bottom">
                        Texture :
                    </Form.Label>
                    {ModSettings.discretisation.texture.type.map((algo, indexAlgo) => 
                        <TextureParams 
                            ModSettings={ModSettings}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            discretisationAlgos={discretisationAlgos}
                            indexAlgo={indexAlgo}
                            indexVal={0}
                        />
                    )}
                    <div className="justify-content-center gap-3">
                    <Button 
                        icon="pi pi-plus" 
                        rounded 
                        text 
                        severity="info"
                        onClick={() => {
                            ModSettings.discretisation.texture.type.push("FBS");
                            ModSettings.discretisation.texture.val.push([1]);
                            setActiveIndex(!activeIndex);
                        }}
                        />
                    </div>

                </Form.Group>
            </Row>
            
            {/* FILTERING */}
            <br/>
            <div className="text-center">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-image"></i>
                </span>
            </div>

            {/* FILTERING DISCRETIZATION */}
            <Row className="form-group-box">
                <Form.Group as={Row}>
                    <Tooltip target=".filtering"/>
                    <Form.Label 
                        className="filtering" 
                        data-pr-tooltip="Filtering options"
                        data-pr-position="bottom">
                        Filtering :
                    </Form.Label>
                    <Col>
                        <Dropdown 
                            style={{width: "200px"}}
                            value={ModSettings.filter_type}
                            options={filterTypes}
                            optionLabel="name"
                            placeholder={ModSettings.filter_type}
                            className="w-full md:w-14rem"
                            onChange={(event) => {
                                ModSettings.filter_type = event.target.value.name;
                                setActiveIndex(!activeIndex);
                            }}/>
                    </Col>
                    {renderFiltering(imParamFilter, ModSettings.filter_type, activeIndex, setActiveIndex)}
                </Form.Group>
            </Row>

            {/* INTENSITY TYPE */}
            <Row className="form-group-box">
                <Form.Group as={Row}>
                    <Tooltip target=".inttype"/>
                    <Form.Label 
                        className="inttype" 
                        data-pr-tooltip="Intensity type of the dataset (arbitrary: No physical unit, definite: Physical unit, filtered: A filter is applied)"
                        data-pr-position="bottom">
                        Intensity type :
                    </Form.Label>
                    <div className="justify-content-center gap-3">
                    <Toast ref={toastPrime} position="bottom-right"/>
                    <Dropdown 
                        style={{width: "200px"}}
                        value={ModSettings.intensity_type}
                        options={intensityTypes}
                        optionLabel="name"
                        placeholder={ModSettings.intensity_type}
                        className="w-full md:w-14rem"
                        onChange={(event) => {
                            if (!ModSettings.filter_type && event.target.value.name !== "arbitrary")
                            {
                                toastPrime.current.show(
                                    { 
                                        severity: 'warn', 
                                        summary: 'Warning', 
                                        detail: "For MRI with no physical unit, we recommend to use the type 'arbitrary'", 
                                        life: 3000 
                                    });
                            }
                            ModSettings.intensity_type = event.target.value.name;
                            console.log(ModSettings.intensity_type);
                            setActiveIndex(!activeIndex);
                        }}/>
                    </div>
                </Form.Group>
            </Row>
        
        </>
    )
}
    
const SettingsEditor = ({ showEdit, setShowEdit, settings, pathSettings}) => {
    const [activeIndex, setActiveIndex] = useState(false);
    const { port } = useContext(WorkspaceContext); // Get the port of the backend
    const accept = (settings) => {
        console.log("settings", settings);
        requestJson(
            port, 
            '/extraction_MEDimage/save/json', 
            {settings, pathSettings}, 
            (response) => {
                // Handle the response from the backend if needed
                console.log('Response from backend:', response);
    
                // toast message
                toast.success('File saved successfully');

                // Close the dialog
                setShowEdit(false);
            },
            function (error) {
                console.error('Error:', error);
                toast.error('Error: ' + error);
            }
          );
    };
    const confirmSave = (event, settings) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to overwrite the current settings?',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-success',
            rejectClassName: 'p-button-info p-button-outlined',
            accept : () => accept(settings),
        });
    };

    return (
        <Dialog
          header="Edit extraction options"
          visible={showEdit}
          style={{ width: '50vw' }}
          position={'right'}
          onHide={() => setShowEdit(false)}
          maximizable
        >
        {/* GENERAL PARAMS */}
        <Row className="form-group-box">
            <div className="text-center">
                <span className="p-inputgroup-addon">
                    <i className="pi pi-cog"></i>
                </span>
                <label style={{paddingTop: "10px"}}><b>General parameters</b></label>
            </div>
            
            <Col>
                {/* ROI TYPE LABELS */}
                <Form.Group controlId="roiTypeLabel" style={{ paddingTop: "10px", marginRight: "150px" }}>
                    <Tooltip target=".roiTypeLabel"/>
                    <Form.Label 
                        className="roiTypeLabel" 
                        style={{ width: "200px" }}
                        data-pr-tooltip="Label used in saving, given according to the ROI used"
                        data-pr-position="bottom">
                            ROI type label
                    </Form.Label>
                    <InputText
                        value={settings.roi_type_labels[0]}
                        onChange={(event) => {
                            settings.roi_type_labels[0] = event.target.value;
                            setActiveIndex(!activeIndex);
                        } }
                    />
                </Form.Group>
                {/* ROI TYPE */}
                <Form.Group controlId="roiType" style={{ paddingTop: "10px", marginRight: "150px" }}>
                    <Tooltip target=".roiType"/>
                    <Form.Label 
                        className="roiTypeLabel" 
                        style={{ width: "200px" }}
                        data-pr-tooltip="Name of the ROI to use (Same in the CSV file name)"
                        data-pr-position="bottom">
                            ROI type
                    </Form.Label>
                    <InputText
                        value={settings.roi_types[0]}
                        onChange={(event) => {
                            settings.roi_types[0] = event.target.value;
                            setActiveIndex(!activeIndex);
                        }} 
                    />
                </Form.Group>
            </Col>
        </Row>
        <br></br>
            <TabView>
            <TabPanel header="MR-scan">
                {renderParamsPanel(activeIndex, setActiveIndex, setShowEdit, settings.imParamMR, settings.imParamFilter, pathSettings)}
            </TabPanel>
            <TabPanel header="CT-scan">
                {renderParamsPanel(activeIndex, setActiveIndex, setShowEdit, settings.imParamCT, settings.imParamFilter, pathSettings)}
            </TabPanel>
            <TabPanel header="PET-scan">
                {renderParamsPanel(activeIndex, setActiveIndex, setShowEdit, settings.imParamPET, settings.imParamFilter, pathSettings)}
            </TabPanel>
            </TabView>
            {/* SAVE BUTTON */}
            <br></br>
            <div className="text-center">
            <ConfirmPopup />
            <Button
                label="Save"
                className="p-button-info"
                icon="pi pi-save"
                onClick={(event) => confirmSave(event, settings)}
                raised
                outlined
            />
            </div>
        </Dialog>
    )
}

export default SettingsEditor