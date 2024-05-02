import React from 'react'
import Node from "../../flow/node"
import Input from '../../learning/input'
import { Button } from 'react-bootstrap'



export default function FlClientNode({ id, data }) {

    // context

    return (
        <>

            {/* build on top of the Node component */}
            <Node
                key={id}
                id={id}
                data={data}
                setupParam={data.setupParam}
                // the body of the node is a form select (particular to this node)
                nodeBody={
                    <>

                    </>
                }
                // default settings are the default settings of the node, so mandatory settings
                defaultSettings={
                    <>
                        <Input
                            name="Node's type"
                            settingInfos={{
                                type: "list",
                                tooltip: "Specify the number of federated rounds",
                                choices: { "Train Node": "train", "Test Node": "test", "Hybrid (Train + Test)": "hybrid" }
                            }}
                            currentValue={10}
                            onInputChange={() => { }}
                            setHasWarning={() => { }}
                        />
                           <Input
                  name="Node Dataset"
                  settingInfos={{
                    type: "data-input",
                    tooltip: "<p>Specify a data file (xlsx, csv, json)</p>"
                  }}
                  currentValue={data.internal.settings.files || {}}
                  onInputChange={() => { }}
                  setHasWarning={() => { }}
                />
                    </>
                }
                // node specific is the body of the node, so optional settings
                nodeSpecific={
                    <>
                        <div className='center'>
                            <Button variant="light" className="width-100 btn-contour" >{true ? " View Dataset" : "Select MasterDataset"}</Button>
                        </div>
                    </>
                }
            />
        </>
    )
}
