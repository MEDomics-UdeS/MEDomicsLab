import React, { useState, useContext } from "react"
import ProgressBar from "react-bootstrap/ProgressBar";
import useInterval from "@khalidalansi/use-interval"
import { requestJson } from "../../utilities/requests";
import { FlowInfosContext } from "./context/flowInfosContext";

const ProgressBarRequests = ({isUpdating, setIsUpdating}) => {
	// const [isUpdating, setIsUpdating] = useState(true);
	const { flowInfos } = useContext(FlowInfosContext);		// used to get the flow infos
	const [progress, setProgress] = useState(
		{
			now: 0,
			currentName: ""
		}
	);

	useInterval(
		() => {
			requestJson(
				5000,
				"/learning/progress",
				{experimentId: flowInfos.id},
				(data) => {
					setProgress(
						{
							now: data.progress,
							currentName: data.cur_node
						}
					);
					if(data.progress === 100){
						setIsUpdating(false);
						setProgress(
							{
								now: data.progress,
								currentName: "Done!"
							}
						);
					}
				},
				() => console.log("Error")
			)
		},
		isUpdating ? 50 : null
	);

	return (
		<>
			<label>{progress.currentName || ""}</label>
			<ProgressBar
				variant="success"
				animated
				now={progress.now}
				label={`${progress.now}%`}
			/>
		</>
	)
}

export default ProgressBarRequests
