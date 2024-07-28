/* eslint-disable camelcase */
/* 
    JS File containing different static variable and functions to use between the CompareResults Components.

 */
import { GrConfigure } from "react-icons/gr"
import { MdQueryStats } from "react-icons/md"
import { GrDocumentPerformance } from "react-icons/gr"
import { RiUserSearchFill } from "react-icons/ri"
import { BiSearchAlt } from "react-icons/bi"

/**
 *
 * @param {string} type The type for which to get the icon and name.
 * @returns {object} An object containing the icon and name.
 *
 *
 * @description
 * This function maps different types to their corresponding icon and name.
 */
export const getIconAndNameByType = (type) => {
  const mappings = {
    experiment_config_comparaison: {
      icon: <GrConfigure style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />,
      name: "Configuration Comparison"
    },
    global_metrics_comparaison: {
      icon: <GrDocumentPerformance style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />,
      name: "Global Metrics Comparison"
    },
    models_evaluation_comparaison: {
      icon: <MdQueryStats style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />,
      name: "Models Evaluation Comparison"
    },
    profiles_metrics_comparaison: {
      icon: <RiUserSearchFill style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />,
      name: "Profiles Metrics Comparison"
    },
    detectron_results_comparaison: {
      icon: <BiSearchAlt style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />,
      name: "Detectron Results Comparison"
    }
    // Add more mappings here as needed
  }

  return mappings[type] || { icon: null, name: "Unknown Type" } // Return a default value if the type is not found
}

/**
 *
 * @param {string} key The key to be transformed.
 * @returns {string} The transformed key.
 *
 *
 * @description
 * Transforms a given key by removing trailing numbers and capitalizing each word.
 */
export const transformKey = (key) => {
  const trimmedKey = key.replace(/1$/, "").replace(/2$/, "") // Remove trailing 1 or 2
  return trimmedKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
