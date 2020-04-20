import { ICircle } from './../canvas/draw';
const g = 9.81

export const falling = ({ timestamp, origY }: Pick<ICircle, 'timestamp' | 'origY'>): Pick<ICircle, 'posY'> => {
  const magicNumber = 200 // lower the number to make the balls fall faster
  const seconds = (Date.now() - (timestamp || 0)) / magicNumber
  const dy = 0.5 * g * (seconds ** 2)
  return { posY: origY + dy }
}
