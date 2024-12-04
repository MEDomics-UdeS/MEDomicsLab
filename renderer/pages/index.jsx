import React from "react";
import Container from "react-bootstrap/Container";

export default function Home() {
	return (
		<>
			<Container fluid>
				<h1>This is index.jsx, this is not supposed to be rendered </h1>
				<h2>Maybe, you wonder why we keep a file which is not supposed to be use. </h2>
				<h3>well, fear to break something is the reason.</h3>
			</Container>
		</>
	);
}

