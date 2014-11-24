import { Vector2d, RIGHT } from "./vector2d.js";
import { LoadableShape } from "./shapes.js";
/** @typedef {import("./shapes.js").Shape} Shape */

export class Loader {
  #pos;
  #vel;
  #bucketOffset;
  #targetBucketOffset;
  #loadedShape;
  #bucketSpeed;
  /**
   * @param {Vector2d} pos
   * @param {Vector2d} vel
   */
  constructor(pos, vel) {
    this.#pos = pos;
    this.#vel = vel;
    this.#bucketOffset = Vector2d.zero();
    this.#targetBucketOffset = Vector2d.zero();
    this.#loadedShape = /** @type {Shape | null} */ (null);
    this.#bucketSpeed = 5.0;
  }

  /** @param {Vector2d} vel */
  move(vel) {
    this.#vel = vel;
  }

  getDrawPos() {
    return this.#pos;
  }

  getBucketDrawPos() {
    return this.#pos.add(this.#bucketOffset);
  }

  /**
   * @template T
   * @param {Vector2d} pos
   * @param {() => "moving" | "unable" | T} onReachPos
   */
  #moveBucket(pos, onReachPos) {
    if (this.#loadableDistance(pos)) {
      if (this.#bucketAtTarget()) {
        this.#returnBucket();
        return onReachPos();
      }
      return "moving";
    }
    this.#returnBucket();
    return "unable";

  }

  /** @param {LoadableShape} shape */
  tryLoading(shape) {
    return this.#moveBucket(shape.pos, () => {
      this.#loadedShape = shape.shape;
      return "loaded";
    });
  }

  /** @param {Vector2d} pos */
  tryUnloading(pos) {
    return this.#moveBucket(pos, () => {
      this.#loadedShape = null;
      return "unloaded";
    });
  }

  /** @param {Vector2d} pos */
  #loadableDistance(pos) {
    if (pos.add(RIGHT.multiply(0.6)).manhattanDistance(this.#pos) <= 0.6) {
      this.#targetBucketOffset = pos
        .subtract(new Vector2d(-0.32, 0.32))
        .subtract(this.#pos);
      return true;
    }
    return false;
  }

  #returnBucket() {
    this.#targetBucketOffset = Vector2d.zero();
  }

  getLoadedShape() {
    return this.#loadedShape;
  }

  #bucketAtTarget() {
    return (
      !this.#targetBucketOffset.isZero() &&
      this.#bucketOffset.equals(this.#targetBucketOffset)
    );
  }

  /** @param {number} dt */
  #stepBucket(dt) {
    const offsetError = this.#targetBucketOffset.subtract(this.#bucketOffset);

    if (!offsetError.isZero()) {
      const bucketVel = offsetError.normalize().multiply(this.#bucketSpeed * dt);
      if (
        this.#bucketOffset.distance(this.#targetBucketOffset) < bucketVel.length()
      ) {
        this.#bucketOffset = this.#targetBucketOffset;
      } else {
        this.#bucketOffset = this.#bucketOffset.add(bucketVel);
      }
    }
  }

  /**
   * @param {number} dt
   */
  step(dt) {
    this.#pos = this.#pos.add(this.#vel.multiply(dt));

    if (this.#pos.x < 0.0) {
      this.#pos = new Vector2d(0.0, this.#pos.y);
    }

    if (this.#pos.y < 0.0) {
      this.#pos = new Vector2d(this.#pos.x, 0.0);
    }

    if (this.#pos.x > 14.0) {
      this.#pos = new Vector2d(14.0, this.#pos.y);
    }

    if (this.#pos.y > 13.0) {
      this.#pos = new Vector2d(this.#pos.x, 13.0);
    }
    this.#stepBucket(dt);
  }
}
