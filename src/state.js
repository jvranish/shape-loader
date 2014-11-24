
import { Vector2d  } from "./vector2d.js";
import { Loader } from "./loader.js";
import { Truck } from "./truck.js";
import { LoadableShape, SHAPES, randomShape } from "./shapes.js";
/** @typedef {import("./shapes.js").Shape} Shape */

/**
 * @template T
 * @param {T[]} array
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export class State {
  #truck;
  #loadableShapes;
  #lastTime;
  #loader;
  constructor() {
    const shapesNeeded = [
      randomShape(),
      randomShape(),
      randomShape(),
      randomShape(),
    ];
    this.#truck = new Truck(
      new Vector2d(6.0, 13.0),
      new Vector2d(0, 0),
      shapesNeeded,
      []
    );
    this.#loadableShapes = State.initialShapes();
    this.#lastTime = performance.now();
    this.#loader = new Loader(new Vector2d(10, 13), new Vector2d(0, 0));
  }

  static initialShapes() {
    const positions = [];
    for (let x = 1; x <= 13; x += 2) {
      for (let y = 1; y <= 11; y += 2) {
        positions.push(new Vector2d(x, y));
      }
    }
    shuffle(positions);

    /** @type {LoadableShape[]} */
    const shapes = [];
    for (let i = 0; i < 4; i++) {
      for (const shape of SHAPES) {
        const pos = positions.shift();
        if (!pos) {
          throw new Error("positions is empty");
        }
        shapes.push({ pos, shape });
      }
    }
    return shapes;
  }

  /** @param {Vector2d} vel */
  moveLoader(vel) {
    this.#loader.move(vel);
  }

  #checkLoadUnload() {
    const nextNeededShape = this.#truck.nextNeededShape();
    if (!nextNeededShape) {
      if (this.#truck.driveOffScreen() === "done") {
        return true
      }
      return false;
    }
    const loadedShape = this.#loader.getLoadedShape();
    if (!loadedShape) {
      for (const i in this.#loadableShapes) {
        const loadableShape = this.#loadableShapes[i];
        if (nextNeededShape === loadableShape.shape) {
          const loadingState = this.#loader.tryLoading(loadableShape);
          if (loadingState === "moving") {
            break;
          } else if (loadingState === "loaded") {
            this.#loadableShapes.splice(Number(i), 1);
            break;
          }
        }
      }
    } else {
      const unloadingState = this.#loader.tryUnloading(this.#truck.unloadPos());
      if (unloadingState === "unloaded") {
        this.#truck.loadShape(loadedShape);
      }
    }
    return false;
  }

  /** @param {number} time */
  #calculateDt(time) {
      const dt = (time - this.#lastTime) / 1000;
      this.#lastTime = time;
      return dt;
  }

  getDrawables() {
    return {
      truck: this.#truck,
      loader: this.#loader,
      loadableShapes: this.#loadableShapes,
    };
  }

  /** @param {number} time */
  update(time) {
    const dt = this.#calculateDt(time);
    this.#truck.step(dt);
    this.#loader.step(dt);
    return this.#checkLoadUnload();
  }
}
