import { falling, speed } from './../utils/physics';
import { getRandomArbitrary, shuffle } from "../utils/shuffle";

export interface ICircle {
  x: number,
  y: number,
  color?: string,
  radius?: number,
  timestamp?: number,
}

interface ICircleHandler {
  add: (c: ICircle) => number
  circles: ICircle[]
  drawCircle: (transform: (before: ICircle) => ICircle) => (circle: ICircle) => void
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

  const addToCircles = (c: ICircle) => circles.push({
    ...c,
    radius: radii[getRandomArbitrary(0, radii.length)],
    color: randomColors(),
    timestamp: Date.now()
  })

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

  const drawCircle = (transform: (before: ICircle) => ICircle) => ({ x, y, radius = 0, color = '#FFF', timestamp = Date.now() }: ICircle): void => {
    const { x: offsetX, y: offsetY } = transform({ x: 0, y: 0, timestamp, radius })
    ctx.beginPath();
    const withinBorderX = (x: number) => Math.max(radius, Math.min(x, ctx.canvas.width - radius))
    const withinBorderY = (y: number) => Math.max(radius, Math.min(y, ctx.canvas.height - radius))
    ctx.arc(withinBorderX(x + offsetX), withinBorderY(y + offsetY), radius, 0, 2 * Math.PI, true);
    ctx.fillStyle = color;
    ctx.fill()
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
    drawCircle(c => falling(speed(c)))(circle)
  })
}

interface drawArgs {
  context: CanvasRenderingContext2D,
  circles: ICircleHandler,
  setOnDelete: React.Dispatch<React.SetStateAction<(() => void)[]>>
}

export const draw = ({ context, circles, setOnDelete }: drawArgs): void => {
  const handleClick = ({ clientX, clientY }: MouseEvent) => {
    circles.add({ x: clientX, y: clientY })
  }

  const handleInterval = () => {
    animate(circles, context)
  }

  window.addEventListener('click', handleClick)
  setOnDelete(foos => [...foos, () => window.removeEventListener('click', handleClick)])

  const intervalId = window.setInterval(handleInterval, 60)
  setOnDelete(foos => [...foos, () => () => window.clearInterval(intervalId)])
}
