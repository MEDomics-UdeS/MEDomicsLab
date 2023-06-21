import React from 'react';
import { Button } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';

const BtnDiv = ({ buttonsList }) => {
	return (
		<>
			{buttonsList.map((button) => {
				return buttonType[button.type](button.onClick);
			})}
		</>
	);
};
export default BtnDiv;

const buttonType = {
	clear: (onClear) => {
		return (
			<Button key='clear' variant="outline margin-left-10 padding-5" onClick={onClear}>
				<Icon.Trash width="30px" height="30px" />
			</Button>
		);
	},
	save: (onSave) => {
		return (
			<Button key='save' variant="outline margin-left-10 padding-5" onClick={onSave}>
				<Icon.Upload width="30px" height="30px" />
			</Button>
		);
	},
	load: (onLoad) => {
		return (
			<Button key='load' variant="outline margin-left-10 padding-5" onClick={onLoad}>
				<Icon.Download width="30px" height="30px" />
			</Button>
		);
	},
	run: (onRun) => {
		return (
			<Button key='run' variant="outline margin-left-10 padding-5" onClick={onRun}>
				<Icon.PlayCircle width="30px" height="30px" />
			</Button>
		);
	},
	back: (onBack) => {
		return (
			<Button key='back' variant="outline margin-left-10 padding-5" onClick={onBack}>
				<Icon.Backspace width="30px" height="30px" />
			</Button>
		);
	},
};
