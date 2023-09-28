import React, { useRef, useEffect } from "react"
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import Image from "next/image"
import { Button } from "react-bootstrap"
import { ZoomIn, ZoomOut, XSquare } from "react-bootstrap-icons"
const nativeImage = require("electron").nativeImage

const Controls = ({ zoomIn, zoomOut, resetTransform }) => (
  <>
    <button onClick={() => zoomIn()}>+</button>
    <button onClick={() => zoomOut()}>-</button>
    <button onClick={() => resetTransform()}>x</button>
  </>
)

const ZoomPanPinchComponent = ({ imagePath, options = undefined, image, height, width }) => {
  return (
    <TransformWrapper initialScale={1} initialPositionX={200} initialPositionY={100}>
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          <div className="tools">
            <Button onClick={() => zoomIn()}>
              <ZoomIn />
            </Button>
            <Button onClick={() => zoomOut()}>
              <ZoomOut />
            </Button>
            <Button onClick={() => resetTransform()}>
              <XSquare />
            </Button>
          </div>
          <TransformComponent>
            <img className="imageViewer" src={image} alt="test" width={width} height={height} style={{ height: height, width: width }} />
          </TransformComponent>
        </React.Fragment>
      )}
    </TransformWrapper>
  )
}

export default ZoomPanPinchComponent
