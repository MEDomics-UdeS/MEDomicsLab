// BEGIN: ed8c6549bwf9

const PopupMenu = (props) => {
	const { title, items, onHide } = props;

	const onItemClick = (item, event) => {
		onHide(item);
		event.stopPropagation();
	};

	const itemElements = items.map((item) => (
		<div key={item}
			className="popup_menu_item"
			onClick={(event) => onItemClick(item, event)}>
			{item}
		</div>
	));

	return (
		<div className="popup_menu">
			<div className="popup_menu_title">{title}</div>
			{itemElements}
		</div>);
};
// END: ed8c6549bwf9