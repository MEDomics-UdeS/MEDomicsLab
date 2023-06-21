import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import Container from "react-bootstrap/Container";
import Switch from "react-switch";


const MedNavbar = ({ onNavItemSelect }) => {
    const [checked, setChecked] = useState(false);
    const [mode, setMode] = useState('Normal Mode');
    const handleChange = (nextChecked) => {
        setChecked(nextChecked);
    };
    return (
        <Navbar bg="light" expand="lg" style={{ height: '4rem' }}>
            <Container>
                <Navbar bg="light" expand="md">
                    <Navbar.Brand href="/">MedomicsLab</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="mr-auto" variant="tabs" defaultActiveKey="#home">
                            <Nav.Item>
                                <Nav.Link href="#home" onClick={() => onNavItemSelect('home')}>
                                    Home
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link href="#input" onClick={() => onNavItemSelect('input')}>
                                    Input
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link href="#learning" onClick={() => onNavItemSelect('learning')}>
                                    Learning
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link href="#extraction" onClick={() => onNavItemSelect('extraction')}>
                                    Extraction
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
                <div className='center'>
                    <label className='label-mode' htmlFor="material-switch">{checked ? "Dev Mode" : "Normal Mode"}</label>
                    <Switch
                        checked={checked}
                        onChange={handleChange}
                        onColor="#86d3ff"
                        onHandleColor="#2693e6"
                        handleDiameter={30}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={20}
                        width={48}
                        className="react-switch"
                        id="material-switch"
                    />
                </div>
            </Container>
        </Navbar>
    );
}
