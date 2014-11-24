
import { Vector2d } from "./vector2d.js";


export const SHAPES = /** @type {const} */ ([
  "triangle",
  "circle",
  "square",
  "diamond",
]);
/** @typedef {typeof SHAPES[number]} Shape*/


export class LoadableShape {
  /**
   * @param {Vector2d} pos
   * @param {Shape} shape
   */
  constructor(pos, shape) {
    this.pos = pos;
    this.shape = shape;
  }
}


export function randomShape() {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}
