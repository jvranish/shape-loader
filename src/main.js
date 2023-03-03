import { Vector2d, UP, DOWN, LEFT, RIGHT } from "./vector2d.js";
import { State } from "./state.js";
import { drawFrame, getImageElements } from "./draw.js";
/** @typedef {import("./draw.js").Images} Images */

/** @typedef {Map<KeyboardEvent["key"], boolean>} KeyStates */

/**
 * @param {KeyStates} keyStates
 * @param {{dragPos: Vector2d | null}} mouseStates
 * @param {Vector2d} loaderPos
 */
function inputDirection(keyStates, mouseStates, loaderPos) {
  if (mouseStates.dragPos) {
    return mouseStates.dragPos.subtract(loaderPos.multiply(32)).normalize();
  }

  let vel = new Vector2d(0, 0);
  if (keyStates.get("ArrowUp")) {
    vel = vel.add(UP);
  }
  if (keyStates.get("ArrowDown")) {
    vel = vel.add(DOWN);
  }
  if (keyStates.get("ArrowLeft")) {
    vel = vel.add(LEFT);
  }
  if (keyStates.get("ArrowRight")) {
    vel = vel.add(RIGHT);
  }
  return vel;
}

/**
 * @param {number} time
 * @param {KeyStates} keyStates
 * @param {{dragPos: Vector2d | null}} mouseStates
 * @param {Images} images
 * @param {CanvasRenderingContext2D} ctx
 * @param {State} state
 */
function onFrame(time, keyStates, mouseStates, images, ctx, state) {
  // update loader velocity
  const vel = inputDirection(
    keyStates,
    mouseStates,
    state.getLoaderCenter()
  ).multiply(2);
  state.moveLoader(vel);

  // update state
  const reset = state.update(time);
  if (reset) {
    state = new State();
  }

  drawFrame(time, ctx, images, state);

  requestAnimationFrame((time) =>
    onFrame(time, keyStates, mouseStates, images, ctx, state)
  );
}

function main() {
  // draw positions every frame
  const canvas = document.getElementById("canvas");
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("canvas is not an HTMLCanvasElement");
  }
  const ctx = canvas.getContext("2d");
  if (!(ctx instanceof CanvasRenderingContext2D)) {
    throw new Error("ctx is not a CanvasRenderingContext2D");
  }

  const images = getImageElements();

  /** @type {{dragPos: Vector2d | null}} */
  let mouseStates = { dragPos: null };
  canvas.addEventListener("mousemove", (event) => {
    if (!(event instanceof MouseEvent)) {
      throw new Error("event is not a MouseEvent");
    }
    if (mouseStates.dragPos) {
      mouseStates.dragPos = new Vector2d(event.offsetX, event.offsetY);
    }
  });
  canvas.addEventListener("mousedown", (event) => {
    if (!(event instanceof MouseEvent)) {
      throw new Error("event is not a MouseEvent");
    }
    mouseStates.dragPos = new Vector2d(event.offsetX, event.offsetY);
  });
  canvas.addEventListener("mouseup", (event) => {
    if (!(event instanceof MouseEvent)) {
      throw new Error("event is not a MouseEvent");
    }
    mouseStates.dragPos = null;
  });

  /** @type {KeyStates} */
  const keyStates = new Map();
  document.addEventListener("keyup", (event) => {
    if (!(event instanceof KeyboardEvent)) {
      throw new Error("event is not a KeyboardEvent");
    }
    // set key state
    keyStates.set(event.key, false);
  });

  document.addEventListener("keydown", (event) => {
    if (!(event instanceof KeyboardEvent)) {
      throw new Error("event is not a KeyboardEvent");
    }
    // set key state
    keyStates.set(event.key, true);
  });

  const state = new State();

  requestAnimationFrame((time) =>
    onFrame(time, keyStates, mouseStates, images, ctx, state)
  );
}

main();
