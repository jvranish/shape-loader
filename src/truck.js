import { Vector2d, RIGHT, LEFT } from "./vector2d.js";
/** @typedef {import("./shapes.js").Shape} Shape */

const TRUCK_WIDTH = 5;

export class Truck {
  #pos;
  #vel;
  #shapesNeeded;
  #shapesLoaded;
  /**
   * @param {Vector2d} pos
   * @param {Shape[]} shapesNeeded
   */
  constructor(pos, shapesNeeded) {
    this.#pos = pos;
    this.#vel = new Vector2d(0, 0);
    this.#shapesNeeded = shapesNeeded;
    this.#shapesLoaded = /** @type {Shape[]} */ ([]);
  }

  /** @return {Shape | null} */
  nextNeededShape() {
    return this.#shapesNeeded[0] ?? null;
  }

  getShapesLoaded() {
    return this.#shapesLoaded;
  }

  getShapesNeeded() {
    return this.#shapesNeeded;
  }

  driveOffScreen() {
      this.#vel = LEFT;
      if (this.#pos.x < -TRUCK_WIDTH) {
        return "done";
      } else {
        return "driving";
      }
  }

  drawPos() {
    return this.#pos;
  }

  /**
   * This is the position where the loader should unload the next shape.
   */
  unloadPos() {
    return this.#pos
      .add(RIGHT.multiply(1))
      .add(RIGHT.multiply(this.#shapesLoaded.length));
  }

  /** @param {Shape} shape */
  loadShape(shape) {
    this.#shapesLoaded.push(shape);
    this.#shapesNeeded.shift();
  }

  /** @param {number} dt */
  step(dt) {
    this.#pos = this.#pos.add(this.#vel.multiply(dt));
  }
}
