import { ToastContainer } from "react-toastify";
import React, { useState } from "react";
import Head from "next/head";

// CSS
import "bootstrap/dist/css/bootstrap.min.css";
// import 'bootswatch/dist/lux/bootstrap.min.css';
import "react-toastify/dist/ReactToastify.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-simple-tree-menu/dist/main.css";
// my styles (priority over bootstrap and other dist styles)
import "../styles/flow/reactFlow.css";
import "../styles/globals.css";
import "../styles/learning/learning.css";
import "../styles/learning/learningTree.css";
import "../styles/extraction/extraction.css";
import "flexlayout-react/style/light.css";
import "../styles/workspaceSidebar.css";
import "../styles/iconSidebar.css";
import LayoutManager from "../components/layout/LayoutManager";
import LayoutContextProvider from "../components/layout/LayoutContext";
import { useEffect } from "react";

// utilities

/**
 * This is the main app component. It is the root component of the app.
 * It is the parent of all other components.
 * It is the parent of the LayoutContextProvider, which provides the layout model to all components.
 * @constructor
 */
export default function App() {
	let initialLayout = {
		// this is the intial layout model for flexlayout model that is passed to the LayoutManager -- See flexlayout-react docs for more info
		global: { tabEnableClose: true }, // this is a global setting for all tabs in the layout, it enables the close button on all tabs
		borders: [
			// this is the border model for the layout, it defines the borders and their children
			{
				type: "border",
				location: "bottom",
				size: 100,
				children: [
					{
						type: "tab",
						name: "four",
						component: "text",
					},
				],
			},
		],
		layout: {
			// the layout item contains the tabsets and the tabs inside them
			type: "row",
			weight: 100,
			children: [
				{
					type: "tabset",
					weight: 50,
					selected: 0,
					children: [
						{
							type: "tab",
							name: "Learning",
							component: "grid",
						},
					],
				},
				{
					type: "tabset",
					weight: 50,
					selected: 0,
					children: [
						{
							type: "tab",
							name: "Discovery",
							enableClose: true,
							component: "grid",
						},
						{
							type: "tab",
							name: "Application",
							component: "grid",
						},
					],
				},
			],
		},
	};

	/**
   * This is the state for the layout model. It is passed to the LayoutContextProvider, which provides the layout model to all components.
   * @param {Object} layoutModel - The layout model for the LayoutContextProvider
   * @param {Function} setLayoutModel - The function to set the layout model for the LayoutContextProvider
   * @description Using the useState hook, the layout model is set to the initial layout model. Then, ever
   */
	const [layoutModel, setLayoutModel] = useState(initialLayout);

	useEffect(() => {
		// This is a hook that is called whenever the layoutModel state variable changes
		// Log a message to the console whenever the layoutModel state variable changes
		console.log("layoutModel changed");
		console.log(layoutModel);
	}, [layoutModel]); // Here, we specify that the hook should only be called when the layoutModel state variable changes

	return (
		<>
			<Head>
				<title>MedomicsLab App</title>
				<meta name="viewport" content="initial-scale=1.0, width=device-width" />
				{/* <script src="http://localhost:8097"></script> */}
				{/* Uncomment if you want to use React Dev tools */}
			</Head>
			<div style={{ height: "100%" }}>
				<LayoutContextProvider
					layoutModel={layoutModel}
					setLayoutModel={setLayoutModel}
				>
					{" "}
					{/* This is the LayoutContextProvider, which provides the layout model to all the children components of the LayoutManager */}
					<LayoutManager layout={initialLayout} />{" "}
					{/** We pass the initialLayout as a parameter */}
				</LayoutContextProvider>

				<ToastContainer
					position="bottom-right"
					autoClose={2000}
					limit={3}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
				/>
			</div>
		</>
	);
}
