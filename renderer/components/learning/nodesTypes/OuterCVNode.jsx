import React, { useState, useContext } from "react";
import Node from "../../flow/node";
import Input from "../input";
import { Button } from "react-bootstrap";
import ModalSettingsChooser from "../modalSettingsChooser";
import * as Icon from "react-bootstrap-icons";
import { FlowFunctionsContext } from "../../flow/context/flowFunctionsContext";
import { Stack } from "react-bootstrap";
 
const OuterCVNode = ({ id, data }) => {
    const [modalShow, setModalShow] = useState(false);
    const { updateNode } = useContext(FlowFunctionsContext);
 
    const onInputChange = (inputUpdate) => {
        data.internal.settings[inputUpdate.name] = inputUpdate.value;
        updateNode({
            id: id,
            updatedData: data.internal,
        });
    };
 
    const handleWarning = (hasWarning) => {
        data.internal.hasWarning = hasWarning;
        updateNode({
            id: id,
            updatedData: data.internal,
        });
    };
 
    return (
        <>
            <Node
                key={id}
                id={id}
                data={data}
                setupParam={data.setupParam}
                defaultSettings={
                    <>
                        {data.setupParam?.possibleSettings && "default" in data.setupParam.possibleSettings && (
                            <>
                                <Stack direction="vertical" gap={1}>
                                    {Object.entries(data.setupParam.possibleSettings.default).map(
                                        ([settingName, setting]) => {
                                            return (
                                                <Input
                                                    setHasWarning={handleWarning}
                                                    key={settingName}
                                                    name={settingName}
                                                    settingInfos={setting}
                                                    currentValue={data.internal.settings[settingName]}
                                                    onInputChange={onInputChange}
                                                />
                                            );
                                        }
                                    )}
                                </Stack>
                            </>
                        )}
                    </>
                }
                nodeSpecific={
                    <>
                        <Button variant="light" className="width-100 btn-contour" onClick={() => setModalShow(true)}>
                            <Icon.Plus width="30px" height="30px" className="img-fluid" />
                        </Button>
                        {data.setupParam?.possibleSettings?.options && (
                            <ModalSettingsChooser
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                options={data.setupParam.possibleSettings.options}
                                data={data}
                                id={id}
                            />
                        )}
                        {data.internal.checkedOptions.map((optionName) => {
                            return (
                                <Input
                                    key={optionName}
                                    name={optionName}
                                    settingInfos={data.setupParam.possibleSettings?.options?.[optionName]}
                                    currentValue={data.internal.settings[optionName]}
                                    onInputChange={onInputChange}
                                />
                            );
                        })}
                    </>
                }
            />
        </>
    );
};
 
export default OuterCVNode;
