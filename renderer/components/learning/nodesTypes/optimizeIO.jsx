import React from "react"

/**
 * 
 * @param {string} id used to identify the node
 * @returns {JSX.Element} A OptimizeIO node
 * 
 * @description
 * This component is used to display a OptimizeIO node.
 * it is simply a container with a label
 * its purpose is to be used in a subflow as visual marker of connection to the main flow
 */
const OptimizeIO = ({ id, data }) => {
	return (
		<>
			<div className={`${id} optimize-io text-center node`}>
				<label>
					{data.internal.name}
				</label>
			</div>
		</>
	)
}

export default OptimizeIO
