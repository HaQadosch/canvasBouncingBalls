import { ICircle } from './../canvas/draw';
const g = 9.81

export const falling = ({ timestamp, y, ...circle }: ICircle) => {
  const seconds = (Date.now() - (timestamp || 0)) / 200
  const dy = 0.5 * g * (seconds ** 2)
  return { ...circle, y: y + dy, timestamp }
}

export const speed = ({ x, y, timestamp, ...circle }: ICircle) => {
  const stamp = timestamp || 0
  const time = (Date.now() - stamp) / 10
  const odd = stamp % 2 === 0
  const dx = time * (odd ? 1 : -1)
  const dy = -1 * time / 3
  return { ...circle, y: y + dy, x: x + dx, timestamp }
}