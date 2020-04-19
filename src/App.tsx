import React, { useState, useEffect } from 'react'
import { schemePaired } from "d3-scale-chromatic"

import './App.css'
import { draw, createCircles } from './canvas/draw'

const onResize = (foo: React.Dispatch<React.SetStateAction<[number, number]>>) => (ev: UIEvent) => {
  foo([
    (ev.currentTarget as Window).innerWidth - 10,
    (ev.currentTarget as Window).innerHeight - 10
  ])
}

/**
 * Make sure the Canvas cover the whole page.
 */
const useResizeListener = (): [number, number] => {
  const [[width, height], setCanvasSize] = useState([window.innerWidth - 10, window.innerHeight - 10])

  useEffect(() => {
    window.addEventListener('resize', onResize(setCanvasSize), true);
    return () => {
      window.removeEventListener('resize', onResize(setCanvasSize))
    }
  }, [])

  return [width, height]
}

export const App: React.FC = () => {
  const canvasRef = React.createRef<HTMLCanvasElement>()
  const [width, height] = useResizeListener()
  const [onDelete, setOnDelete] = useState<Array<() => void>>([])
  const [context, setContext] = useState<CanvasRenderingContext2D | null>()

  useEffect(() => {
    setContext(() => canvasRef.current?.getContext('2d'))
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (context) {
      const circles = createCircles(context, schemePaired)
      draw({ context, circles, setOnDelete })
    }
    return () => {
      onDelete.forEach(foo => foo())
    }
    // eslint-disable-next-line
  }, [context])

  return <canvas ref={ canvasRef } id="bounce" width={ width } height={ height }>
    Whenever the user clicks on the page, a circle is 'fired' from the clicked position at a random speed and angle.
    When the projectile reaches the bottom of the browser window it should bounce until it stops.
  </canvas>
}
