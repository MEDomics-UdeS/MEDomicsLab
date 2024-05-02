import React from 'react'
import Node from "../../flow/node"
import Input from '../../learning/input'
import { Button } from 'react-bootstrap'
import { PiEye } from 'react-icons/pi'



export default function FlServerNode({ id, data }) {

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
                            name="Server rounds"
                            settingInfos={{
                                type: "int",
                                tooltip: "Specify the number of federated rounds"
                            }}
                            currentValue={10}
                            onInputChange={() => { }}
                            setHasWarning={() => { }}
                        />
                    </>
                }
                // node specific is the body of the node, so optional settings
                nodeSpecific={
                    <>
                         <div className='center'>
                            <Button  icon={<PiEye size={"1.5rem"} />} variant="light" className="width-100 btn-contour" >{true ? " View Server details" : "Select MasterDataset"}</Button>
                        </div> 
                    </>
                }
            />
        </>
    )
}
