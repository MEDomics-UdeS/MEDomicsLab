import React from "react"
import { Typography, Grid } from "@mui/material"
import { MdOutlineQueryStats } from "react-icons/md"
import { CiBookmarkCheck } from "react-icons/ci"

/**
 *
 * @param {Object} loadedFile  An object where keys are evaluation names and values are objects containing metric data.
 * @returns {JSX.Element} The rendered component displaying model evaluations.
 *
 *
 * @description
 * Component to display the evaluation metrics for MED3PA models: IPC Model and APC Model.
 */
const PaModelsEval = ({ loadedFile }) => {
  /**
   *
   * @param {Object} evaluation - The metrics for a specific evaluation.
   * @param {string} title - The name of the evaluation model.
   * @returns {JSX.Element} A grid item containing the title and metrics.
   *
   *
   * @description
   * A function that renders a grid item displaying metrics for a given evaluation.
   */
  const renderEvaluation = (evaluation, title) => {
    return (
      <Grid item xs={12} sm={6} key={title}>
        <Typography variant="h6" style={{ color: "#555" }}>
          <CiBookmarkCheck style={{ marginRight: "1rem", color: "#555" }} />
          {title.replace("_", " ")}
        </Typography>
        {Object.keys(evaluation).map((metric) => (
          <Typography variant="body1" style={{ color: "#777" }} key={metric}>
            {metric}: {evaluation[metric].toFixed(3)}
          </Typography>
        ))}
      </Grid>
    )
  }

  return (
    <div className="card-paresults">
      <Typography variant="h6" style={{ color: "#868686", fontSize: "1.2rem", display: "flex", alignItems: "center" }}>
        <MdOutlineQueryStats style={{ marginRight: "0.5rem", fontSize: "1.4rem" }} />
        MED3pa Models Evaluation
      </Typography>
      <hr style={{ borderColor: "#868686", borderWidth: "0.5px" }} />

      {loadedFile && (
        <Grid container spacing={2}>
          {Object.keys(loadedFile).map((evaluationKey) => renderEvaluation(loadedFile[evaluationKey], evaluationKey))}
        </Grid>
      )}
    </div>
  )
}

export default PaModelsEval
