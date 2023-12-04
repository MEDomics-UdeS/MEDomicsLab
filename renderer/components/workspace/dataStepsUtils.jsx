import React from "react"

export const TYPE = {
  TS: "TS",
  IMAGE: "IMAGE",
  TEXT: "TEXT",
  MASTERTABLE: "MASTERTABLE",
  COLRENAME: "COLRENAME",
  COLDROP: "COLDROP"
}

/**
 * This Object contains all the steps that can be used in the pipeline
 * Each step has two functions:
 * - exec: this function is called when the pipeline step is executed.
 * - display: this function is called when the pipeline step is displayed in the application module
 *
 * This Object is related to the addStep function of MedDataObject.jsx, this function takes 2 parameters:
 * - type: the type of the step to add (the key of the step in this Object)
 * - settings: the settings of the step executed
 *
 * @example
 * pipeStep[type].exec(settings) or pipeStep[type].display(settings)
 */
export const pipeStep = {
  TS: {
    exec: (settings) => {
      console.log("executing... ", "TS", settings)
    },
    display: (settings) => {
      return <div>TS</div>
    }
  },
  IMAGE: {
    exec: (settings) => {
      console.log("executing... ", "IMAGE", settings)
    },
    display: (settings) => {
      return <div>IMAGE</div>
    }
  },
  TEXT: {
    exec: (settings) => {
      console.log("executing... ", "TEXT", settings)
    },
    display: (settings) => {
      return <div>TEXT</div>
    }
  },
  MASTERTABLE: {
    exec: (settings) => {
      console.log("executing... ", "MASTERTABLE", settings)
    },
    display: (settings) => {
      return <div>MASTERTABLE</div>
    }
  },
  COLRENAME: {
    exec: (settings) => {
      console.log("executing... ", "COLRENAME", settings)
    },
    display: (settings) => {
      return <div>COLRENAME</div>
    }
  },
  COLDROP: {
    exec: (settings) => {
      console.log("executing... ", "COLDROP", settings)
    },
    display: (settings) => {
      return <div>COLDROP</div>
    }
  }
}
