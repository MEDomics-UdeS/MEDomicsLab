import React, { useEffect, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { MultiSelect } from "primereact/multiselect";
import { Message } from "primereact/message";
import { getCollectionData } from "../utils";
import {InputNumber} from "primereact/inputnumber";
import {Tooltip} from "react-tooltip";
import {Slider} from "primereact/slider";
import {Dropdown} from "primereact/dropdown";
import {InputText} from "primereact/inputtext";
import {Button} from "primereact/button";

const HoldoutSetCreationToolsDB = ({ DB, data, collection, currentCollection }) => {
    const [shuffle, setShuffle] = useState(false);
    const [stratify, setStratify] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [columns, setColumns] = useState([]);
    const [seed, setSeed] = useState(54288);
    const [holdoutSetSize, setHoldoutSetSize] = useState(20);
    const [cleaningOption, setCleaningOption] = useState("drop")
    const cleaningOptions = ["drop", "random fill", "mean fill", "median fill", "mode fill", "bfill", "ffill"]
    const [newCollectionName, setNewCollectionName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const collectionData = await getCollectionData(DB.name, currentCollection);
            if (collectionData && collectionData.length > 0) {
                setColumns(Object.keys(collectionData[0]));
            }
        };
        fetchData();
    }, [DB, currentCollection]);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "5px"
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <Message
                    content={
                        <div>
                            <i className="pi pi-info-circle" />
                            &nbsp; The Holdout Set Creation tool serves as a visual representation of the{" "}
                            <i>
                                <a href="https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html" target="_blank">
                                    scikit-learn Python package's model_selection train_test_split function
                                </a>
                            </i>
                            . This tool will create a folder containing your holdout and learning sets.
                        </div>
                    }
                />
                <Message
                    severity="success"
                    text={`Current collection: ${currentCollection}`}
                    style={{ marginTop: "10px" }}
                />
                <div style={{marginTop: "10px", marginLeft: '80px'}}>
                    <div style={{display: "flex", justifyContent: "space-between", maxWidth: "600px"}}>
                        <div className="p-field-checkbox" style={{marginRight: "10px", marginTop: '10px'}}>
                            <Checkbox
                                inputId="shuffle"
                                checked={shuffle}
                                onChange={e => {
                                    setShuffle(e.checked);
                                    if (!e.checked) {
                                        setSelectedColumns([]);
                                        setStratify(false);
                                    }
                                }}
                                style={{marginLeft: '30px'}}
                            />
                            <label htmlFor="shuffle">Shuffle</label>
                        </div>
                        <div className="p-field-checkbox" style={{marginRight: "10px", marginTop: '10px'}}>
                            <Checkbox
                                inputId="stratify"
                                checked={stratify}
                                onChange={e => {
                                    setStratify(e.checked);
                                    if (!e.checked) {
                                        setSelectedColumns([]);
                                    }
                                }}
                                disabled={!shuffle}
                                style={{marginLeft: '30px'}}
                            />
                            <label htmlFor="stratify">Stratify</label>
                        </div>
                        <div style={{width: "200px"}}>
                            <MultiSelect
                                value={selectedColumns}
                                options={columns}
                                onChange={(e) => setSelectedColumns(e.value)}
                                placeholder="Select Columns"
                                disabled={!(shuffle && stratify)}
                            />
                        </div>
                    </div>
                    <div className="p-field"
                         style={{display: 'flex', alignItems: 'center', maxWidth: "600px", marginTop: '10px'}}>
                        <InputNumber
                            value={seed}
                            inputId="seed"
                            onChange={(e) => {
                                setSeed(e.value)
                            }}
                            mode="decimal"
                            showButtons
                            min={0}
                            max={100000}
                            size={6}
                            tooltip="Seed for random number generation."
                            tooltipOptions={{position: "top"}}
                            style={{marginRight: '1em'}}
                        />
                        <Slider
                            className="custom-slider holdout-slider"
                            value={holdoutSetSize}
                            style={{flexGrow: "2", marginRight: '1em'}}
                            onChange={(e) => {
                                setHoldoutSetSize(e.value)
                            }}
                        />
                        <InputNumber
                            prefix="% "
                            inputId="minmax-buttons"
                            value={holdoutSetSize}
                            onValueChange={(e) => {
                                setHoldoutSetSize(e.value)
                            }}
                            mode="decimal"
                            showButtons
                            min={0}
                            max={100}
                            size={5}
                            tooltip="Holdout set size (%)."
                            tooltipOptions={{ position: "top" }}
                        />
                    </div>
                    <div style={{marginTop: "10px", justifyContent: "center", marginRight: '70px'}}>
                        <Dropdown
                            value={cleaningOption}
                            options={cleaningOptions}
                            onChange={(e) => setCleaningOption(e.value)}
                            tooltip="Empty cells cleaning method. Only applies to the stratified columns."
                            tooltipOptions={{position: "top"}}
                            style={{margin: "10px"}}
                        />
                        <InputText
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="Holdout set name"
                            style={{
                                margin: "10px",
                                fontSize: "1rem",
                                width: "160px",
                                marginTop: "20px"
                            }}
                        />
                        <Button
                            icon="pi pi-plus"
                            style={{margin: "10px", fontSize: "1rem", marginTop: "20px"}} // Increased margin
                            onClick={() => {
                            }}
                            tooltip="Create holdout set "
                            tooltipOptions={{position: "top"}}
                            disabled={newCollectionName === ""}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HoldoutSetCreationToolsDB