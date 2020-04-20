import { falling } from './../utils/physics';
import { getRandomArbitrary, shuffle } from "../utils/shuffle";

export interface ICircle {
  origX: number,
  origY: number,
  posX: number,
  posY: number,
  dx: number
  dy: number
  color?: string,
  radius?: number,
  timestamp?: number,
}

interface ICircleHandler {
  add: (c: Pick<ICircle, 'origX' | 'origY'>) => number
  circles: ICircle[]
  drawCircle: (transform: (before: Pick<ICircle, 'timestamp' | 'origY'>) => Partial<ICircle>) => (circle: ICircle) => void
}

/**
 * 
 * @param ctx the canvas context.
 * @param colorRange the range of random colors to pick from.
 * @returns a function that will generate a circle of random size and color.
 * 
 */
export const createCircles = (ctx: CanvasRenderingContext2D, colorRange: Readonly<Array<string>>): ICircleHandler => {
  const circles: Array<ICircle> = []

  const addToCircles = (c: Pick<ICircle, 'origX' | 'origY'>) => {

    return circles.push({
      ...c,
      posX: c.origX,
      posY: c.origY,
      dx: getRandomArbitrary(-10, 10),
      dy: getRandomArbitrary(-50, -20),
      radius: radii[getRandomArbitrary(0, radii.length)],
      color: randomColors(),
      timestamp: Date.now(),
    })
  }

  const updateCircle = (targetCircle: ICircle, newCircle: ICircle) => {
    circles[circles.findIndex(elt => Object.is(elt, targetCircle))] = newCircle
  }

  /**
   * @returns a function that will pick a color at random from the colorRange.
   * 
   * Randomize the colors with as much variaty as possible.
   * 
   *  - shuffle the colors
   *  - pick the colors one after the other
   *  - when all colors have been picked, reshuffle and start over
   */
  const randomColors = (() => {
    let i = 0
    let newRange = shuffle(colorRange)
    return () => {
      i++
      if (i > colorRange.length) {
        i = 0
        newRange = shuffle(colorRange)
      }
      return newRange[i]
    }
  })()

  const drawCircle: ICircleHandler['drawCircle'] = transform => (currentCircle: ICircle): void => {
    const { posX, radius = 0, color = '#FFF', timestamp = Date.now(), origY, dy, dx } = currentCircle
    const { posY } = transform({ timestamp, origY })
    const offsetX = 0
    const withinBorderX = (x: number) => Math.max(radius, Math.min(x, ctx.canvas.width - radius))
    const withinBorderY = (y: number) => Math.max(radius, Math.min(y, ctx.canvas.height - radius))
    const safeX = withinBorderX(posX + offsetX + dx)
    const safeY = withinBorderY((posY || 0) + dy)

    ctx.beginPath();
    ctx.arc(safeX, safeY, radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = color;
    ctx.fill()

    if ((posY || 0) > ctx.canvas.height) {
      updateCircle(currentCircle, { ...currentCircle, posY: safeY, timestamp: Date.now() })
    } else {
      updateCircle(currentCircle, { ...currentCircle, posY: safeY, posX: safeX })
    }
  }

  const radii = [5, 10, 15, 20, 25]

  return {
    add: addToCircles,
    circles,
    drawCircle
  }

}

const animate = ({ circles, drawCircle }: ICircleHandler, context: CanvasRenderingContext2D) => {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  circles.forEach(circle => {
    drawCircle(falling)(circle)
  })
}

interface drawArgs {
  context: CanvasRenderingContext2D,
  circles: ICircleHandler,
  setOnDelete: React.Dispatch<React.SetStateAction<(() => void)[]>>
}

export const draw = ({ context, circles, setOnDelete }: drawArgs): void => {
  const handleClick = ({ clientX, clientY }: MouseEvent) => {
    circles.add({ origX: clientX, origY: clientY })
  }

  const handleInterval = () => {
    animate(circles, context)
  }

  window.addEventListener('click', handleClick)
  setOnDelete(foos => [...foos, () => window.removeEventListener('click', handleClick)])

  const intervalId = window.setInterval(handleInterval, 60)
  setOnDelete(foos => [...foos, () => () => window.clearInterval(intervalId)])
}
