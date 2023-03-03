import { Vector2d, UP, DOWN, LEFT, RIGHT } from "./vector2d.js";
import {State} from "./state.js";
import { drawFrame, getImageElements } from "./draw.js";
/** @typedef {import("./draw.js").Images} Images */

/** @typedef {Map<KeyboardEvent["key"], boolean>} KeyStates */

/** @param {KeyStates} keyStates */
function inputDirection(keyStates) {
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
 * @param {Images} images
 * @param {CanvasRenderingContext2D} ctx
 * @param {State} state
 */
function onFrame(time, keyStates, images, ctx, state) {
  // update loader velocity
  const vel = inputDirection(keyStates).multiply(2);
  state.moveLoader(vel);

  // update state
  const reset = state.update(time);
  if (reset) {
    state = new State();
  }

  drawFrame(time, ctx, images, state);

  requestAnimationFrame((time) => onFrame(time, keyStates, images, ctx, state));
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
  /** @type {KeyStates} */
  const keyStates = new Map();

  /** @param {Event} event */
  function onKeyUp(event) {
    if (!(event instanceof KeyboardEvent)) {
      throw new Error("event is not a KeyboardEvent");
    }
    // clear key state
    keyStates.set(event.key, false);
  }
  /** @param {Event} event */
  function onKeyDown(event) {
    if (!(event instanceof KeyboardEvent)) {
      throw new Error("event is not a KeyboardEvent");
    }
    // set key state
    keyStates.set(event.key, true);
  }

  // add event listeners
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  const state = new State();

  requestAnimationFrame((time) => onFrame(time, keyStates, images, ctx, state));
}

main();
