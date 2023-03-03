/**
 * A simple 2D vector, with an x and y coordinate, and some basic operations
 *
 * @export
 * @class Vector2d
 */
export class Vector2d {
  /**
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static zero() {
    return new Vector2d(0, 0);
  }

  /**
   * @param {Vector2d} other
   */
  add(other) {
    return new Vector2d(this.x + other.x, this.y + other.y);
  }

  /** @param {Vector2d} other */
  subtract(other) {
    return new Vector2d(this.x - other.x, this.y - other.y);
  }

  /** @param {number} scalar */
  multiply(scalar) {
    return new Vector2d(this.x * scalar, this.y * scalar);
  }

  /** @param {number} scalar */
  divide(scalar) {
    return new Vector2d(this.x / scalar, this.y / scalar);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    if (this.isZero()) {
      return new Vector2d(0.0, 0.0);
    }
    return this.divide(this.length());
  }

  /** @param {Vector2d} other */
  distance(other) {
    return this.subtract(other).length();
  }

  /** @param {Vector2d} other */
  manhattanDistance(other) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  isZero() {
    return this.x === 0.0 && this.y === 0.0;
  }

  /** @param {Vector2d} other */
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
}

export const LEFT = new Vector2d(-1.0, 0.0);
export const RIGHT = new Vector2d(1.0, 0.0);
export const UP = new Vector2d(0.0, -1.0);
export const DOWN = new Vector2d(0.0, 1.0);
