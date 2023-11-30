/**
 * Generate random color
 * @returns {string} - Random color
 * @summary This function is used to generate a random color
 */
const generateRandomColor = () => {
  let color = "#" + Math.floor(Math.random() * 16777215).toString(16)
  return color
}

export { generateRandomColor }
