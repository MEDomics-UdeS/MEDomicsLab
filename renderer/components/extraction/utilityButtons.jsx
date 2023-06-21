import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  use,
  MouseEvent,
} from "react";
import { Button } from "react-bootstrap";

const UtilityButtons = ({ run, clear, save, load }) => {
  /**
   * Execute the whole workflow
   */
  const onRun = useCallback(() => {
    console.log("Run workflow");
  }, []);

  /**
   * Clear the canvas if the user confirms
   */
  const onClear = useCallback(() => {
    console.log("Clear workflow");
  }, []);

  /**
   * Save the workflow as a json file
   */
  const onSave = useCallback(() => {
    console.log("Save workflow");
  }, []);

  /**
   * Load json file to workflow
   */
  const onLoad = useCallback(() => {
    console.log("Load workflow");
  }, []);

  return (
    <div className="btn-panel-top-corner-right">
      <>
        <Button
          variant="outline margin-left-10 padding-5"
          onClick={run || onRun}
        >
          <img
            src={"/icon/play.png"}
            alt="run"
            width="30px"
            className="runCanvas"
          />
        </Button>
        <Button
          variant="outline margin-left-10 padding-5"
          onClick={clear || onClear}
        >
          <img
            src={"/icon/clear.png"}
            alt="save"
            width="30px"
            className="clearCanvas"
          />
        </Button>
        <Button
          variant="outline margin-left-10 padding-5"
          onClick={save || onSave}
        >
          <img
            src={"/icon/save.png"}
            alt="save"
            width="30px"
            className="saveCanvas"
          />
        </Button>
        <Button
          variant="outline margin-left-10 padding-5"
          onClick={load || onLoad}
        >
          <img
            src={"/icon/import.png"}
            alt="import"
            width="30px"
            className="loadCanvas"
          />
        </Button>
      </>
    </div>
  );
};
export default UtilityButtons;
