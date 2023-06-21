import uuid from "react-native-uuid";


/**
 * @returns {string} new id
 *
 * @description
 * This function returns a new id for a node.
 */
export const getId = () => `node_${uuid.v4()}`;


export const deepCopy = (obj) => JSON.parse(JSON.stringify(obj))

/**
 * 
 * @param {*} array input array
 * @returns an array without duplicates
 */
export const removeDuplicates = (array) => {
	var a = array.concat();
	for (var i = 0; i < a.length; ++i) {
		for (var j = i + 1; j < a.length; ++j) {
			if (a[i].targetId == a[j].targetId && a[i].sourceId == a[j].sourceId)
				a.splice(j--, 1);
		}
	}

	return a;
}
