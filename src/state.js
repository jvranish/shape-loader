import { Vector2d } from "./vector2d.js";
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

const numberOfShapesNeeded = 4;

export class State {
  #truck;
  #loadableShapes;
  #lastTime;
  #loader;
  #boardSize;
  constructor() {
    this.#boardSize = new Vector2d(15, 15);

    // No shapes on the top and left, and right edges, and no shapes on the bottom 3 rows
    const shapeAreaTopLeft = new Vector2d(1, 1);
    const shapeArea = this.#boardSize.subtract(new Vector2d(1, 3));
    // No shapes immediately next to each other
    const incBy = new Vector2d(2, 2);
    /** @type {Vector2d[]} */
    const positions = [];
    shapeArea.eachGrid(
      (pos) => {
        positions.push(pos);
      },
      shapeAreaTopLeft,
      incBy
    );
    shuffle(positions);

    /** @type {LoadableShape[]} */
    const loadableShapes = [];

    // Add 4 shapes of each type (makes sure we always have enough shapes to
    // fully load the truck with only a single shape type)
    for (let i = 0; i < numberOfShapesNeeded; i++) {
      for (const shape of SHAPES) {
        const pos = positions.shift();
        if (!pos) {
          throw new Error("positions is empty");
        }
        loadableShapes.push({ pos, shape });
      }
    }

    // 4 random shapes needed
    const shapesNeeded = new Array(numberOfShapesNeeded)
      .fill(null)
      .map(() => randomShape());

    // put the truck one row from the bottom, and one column from the left
    const truckPosition = new Vector2d(1, this.#boardSize.y - 2);
    const loaderPosition = new Vector2d(
      this.#boardSize.x - 5,
      this.#boardSize.y - 2
    );

    this.#truck = new Truck(truckPosition, shapesNeeded);
    this.#loadableShapes = loadableShapes;
    this.#lastTime = performance.now();
    this.#loader = new Loader(loaderPosition);
  }

  /** @param {Vector2d} vel */
  moveLoader(vel) {
    this.#loader.move(vel);
  }

  getLoaderCenter() {
    return this.#loader.getDrawPos().add(new Vector2d(1.0, 1.0));
  }

  #checkLoadUnload() {
    const nextNeededShape = this.#truck.nextNeededShape();
    if (!nextNeededShape) {
      // If we don't need any more shapes, drive off screen
      if (this.#truck.driveOffScreen() === "done") {
        return true;
      }
      return false;
    }
    const loadedShape = this.#loader.getLoadedShape();
    if (!loadedShape) {
      // If we don't have a shape loaded, try to load one
      for (const i in this.#loadableShapes) {
        const loadableShape = this.#loadableShapes[i];
        if (nextNeededShape === loadableShape.shape) {
          const loadingState = this.#loader.tryLoading(loadableShape);
          if (loadingState === "moving") {
            break;
          } else if (loadingState === "loaded") {
            // Remove the shape from the list of loadable shapes
            this.#loadableShapes.splice(Number(i), 1);
            break;
          }
        }
      }
    } else {
      // If we have a shape loaded, try to unload it
      const unloadingState = this.#loader.tryUnloading(this.#truck.unloadPos());
      if (unloadingState === "unloaded") {
        this.#truck.loadShape(loadedShape);
      }
    }
    return false;
  }

  /**
   * Calculates the time difference between the last frame and the current frame
   * @param {number} time
   * @returns {number} The time difference in seconds
   */
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
      boardSize: this.#boardSize,
    };
  }

  /** @param {number} time */
  update(time) {
    const dt = this.#calculateDt(time);
    this.#truck.step(dt);
    this.#loader.step(dt, this.#boardSize);
    return this.#checkLoadUnload();
  }
}
