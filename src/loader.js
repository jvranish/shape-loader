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
   * Returns true if the given position is within the bucket's reach.
   * @param {Vector2d} pos
   */
  #tryUpdateTarget(pos) {
    if (pos.add(RIGHT.multiply(0.6)).manhattanDistance(this.#pos) <= 0.6) {
      if (this.#isBucketAtTarget()) {
        // If we are already at the target, don't update the target (if we don't
        // do this we can't complete a load or unload while the loader is
        // moving)
        return true;
      }
      this.#targetBucketOffset = pos
        .subtract(new Vector2d(-0.32, 0.32))
        .subtract(this.#pos);
      return true;
    }
    return false;
  }

  /**
   * This method controls the state machine of the loader's bucket. It returns
   * "unable" if the position is too far away from the loader, "moving" if the
   * position is close enough, and the bucket is moving toward the target
   * position, and if the bucket has reached the target position it runs the
   * given callback and returns its result.
   * @template T
   * @param {Vector2d} pos
   * @param {() => "moving" | "unable" | T} onReachPos
   */
  #tryMoveBucket(pos, onReachPos) {
    if (this.#tryUpdateTarget(pos)) {
      if (this.#isBucketAtTarget()) {
        this.#returnBucket();
        return onReachPos();
      }
      return "moving";
    }
    return "unable";
  }

  /** @param {LoadableShape} shape */
  tryLoading(shape) {
    return this.#tryMoveBucket(shape.pos, () => {
      this.#loadedShape = shape.shape;
      return "loaded";
    });
  }

  /** @param {Vector2d} pos */
  tryUnloading(pos) {
    return this.#tryMoveBucket(pos, () => {
      this.#loadedShape = null;
      return "unloaded";
    });
  }

  #returnBucket() {
    this.#targetBucketOffset = Vector2d.zero();
  }

  getLoadedShape() {
    return this.#loadedShape;
  }

  #isBucketAtTarget() {
    return (
      !this.#targetBucketOffset.isZero() &&
      this.#bucketOffset.equals(this.#targetBucketOffset)
    );
  }

  /** @param {number} dt */
  #stepBucket(dt) {
    // Move the bucket towards the target
    const offsetError = this.#targetBucketOffset.subtract(this.#bucketOffset);

    const bucketVel = offsetError.normalize().multiply(this.#bucketSpeed * dt);

    // If the bucket is close enough to the target, just set it to the target
    // (prevents oscillation)
    if (
      this.#bucketOffset.distance(this.#targetBucketOffset) < bucketVel.length()
    ) {
      this.#bucketOffset = this.#targetBucketOffset;
    } else {
      this.#bucketOffset = this.#bucketOffset.add(bucketVel);
    }
  }

  /**
   * @param {number} dt
   */
  step(dt) {
    this.#stepBucket(dt);
    this.#pos = this.#pos.add(this.#vel.multiply(dt));

    // Prevent the loader from leaving the screen
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
  }
}
