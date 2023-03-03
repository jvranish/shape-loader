import { Vector2d, RIGHT, LEFT } from "./vector2d.js";
/** @typedef {import("./shapes.js").Shape} Shape */

export class Truck {
  #pos;
  #vel;
  #shapesNeeded;
  #shapesLoaded;
  /**
   * @param {Vector2d} pos
   * @param {Vector2d} vel
   * @param {Shape[]} shapesNeeded
   * @param {Shape[]} shapesLoaded
   */
  constructor(pos, vel, shapesNeeded, shapesLoaded) {
    this.#pos = pos;
    this.#vel = vel;
    this.#shapesNeeded = shapesNeeded;
    this.#shapesLoaded = shapesLoaded;
  }

  /** @return {Shape | null} */
  nextNeededShape() {
    return this.#shapesNeeded[0] || null;
  }

  getShapesLoaded() {
    return this.#shapesLoaded;
  }

  getShapesNeeded() {
    return this.#shapesNeeded;
  }

  driveOffScreen() {
      this.#vel = LEFT;
      if (this.#pos.x < -1) {
        return "done";
      } else {
        return "driving";
      }
  }

  drawPos() {
    return this.#pos.add(LEFT.multiply(4))
  }

  unloadPos() {
    return this.#pos
      .add(RIGHT.multiply(1))
      .add(LEFT.multiply(this.#shapesNeeded.length));
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
