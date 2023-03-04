import { RIGHT, Vector2d } from "./vector2d.js";
import { Truck } from "./truck.js";
import { Loader } from "./loader.js";
import { State } from "./state.js";
import { LoadableShape } from "./shapes.js";

/** @typedef {import("./shapes.js").Shape} Shape */

const TILE_SIZE = 32;

/** @param {string} id */
function getImageElement(id) {
  const img = document.getElementById(id);
  if (!(img instanceof HTMLImageElement)) {
    throw new Error(`img is not an HTMLImageElement: ${id}`);
  }
  return img;
}

export function getImageElements() {
  return {
    loader: getImageElement("loader"),
    loaderArm: getImageElement("loaderArm"),
    loaderScoop: getImageElement("loaderScoop"),
    dirt1: getImageElement("dirt1"),
    dirt2: getImageElement("dirt2"),
    dirt3: getImageElement("dirt3"),
    circle: getImageElement("circle"),
    square: getImageElement("square"),
    triangle: getImageElement("triangle"),
    diamond: getImageElement("diamond"),
    circleNeeded: getImageElement("circleNeeded"),
    squareNeeded: getImageElement("squareNeeded"),
    triangleNeeded: getImageElement("triangleNeeded"),
    diamondNeeded: getImageElement("diamondNeeded"),
    truck: getImageElement("truck"),
  };
}

/** @typedef {ReturnType<getImageElements>} Images */

/** @param {Shape} shape */
function neededFromShape(shape) {
  switch (shape) {
    case "circle":
      return "circleNeeded";
    case "square":
      return "squareNeeded";
    case "triangle":
      return "triangleNeeded";
    case "diamond":
      return "diamondNeeded";
    default:
      throw new Error("unknown shape: " + shape);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} image
 * @param {Vector2d} pos
 */
function drawImage(ctx, image, pos) {
  ctx.drawImage(image, pos.x * TILE_SIZE, pos.y * TILE_SIZE);
}

/**
 * @param {number} time
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {Truck} truck
 */
function drawTruck(time, ctx, images, truck) {
  const truckPos = truck.drawPos();
  drawImage(ctx, images.truck, truckPos);

  const shapesLoaded = truck.getShapesLoaded();

  shapesLoaded.forEach((shape, i) => {
    const shapePos = truckPos.add(RIGHT.multiply(1 + i));
    drawImage(ctx, images[shape], shapePos);
  });

  const nextNeededShape = truck.nextNeededShape();
  if (nextNeededShape !== null) {
    const shapePos = truckPos.add(RIGHT.multiply(1 + shapesLoaded.length));
    // draw the shape needed with a pulsing alpha
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(time / 100);
    drawImage(ctx, images[neededFromShape(nextNeededShape)], shapePos);
    ctx.globalAlpha = 1.0;
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {Loader} loader
 */
function drawLoader(ctx, images, loader) {
  const loaderPos = loader.getDrawPos();
  // draw loader
  drawImage(ctx, images.loader, loaderPos);
  const bucketPos = loader.getBucketDrawPos();

  const loadedShape = loader.getLoadedShape();
  if (loadedShape !== null) {
    const shapePos = bucketPos.add(loader.getBucketArmOffset());
    // draw shape in bucket
    drawImage(ctx, images[loadedShape], shapePos);
  }

  // draw bucket
  drawImage(ctx, images.loaderArm, bucketPos);
  drawImage(ctx, images.loaderScoop, bucketPos);
}

/**
 * Draw the shapes available to load.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {LoadableShape[]} loadableShapes
 */
function drawLoadableShapes(ctx, images, loadableShapes) {
  for (const loadableShape of loadableShapes) {
    drawImage(ctx, images[loadableShape.shape], loadableShape.pos);
  }
}

/**
 * Draw the ground.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {Vector2d} boardSize

 */
function drawDirt(ctx, images, boardSize) {
  const dirts = [images.dirt1, images.dirt2, images.dirt3];
  boardSize.eachGrid((pos) => {
    // draw a pseudo random dirt
    const dirt = dirts[(pos.x + pos.y) % dirts.length];
    drawImage(ctx, dirt, pos);
  });
}

/**
 * @param {number} time
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {State} state
 */
export function drawFrame(time, ctx, images, state) {
  let { loader, truck, loadableShapes, boardSize } = state.getDrawables();
  if (ctx.canvas.width !== boardSize.x * TILE_SIZE) {
    ctx.canvas.width = boardSize.x * TILE_SIZE;
  }
  if (ctx.canvas.height !== boardSize.y * TILE_SIZE) {
    ctx.canvas.height = boardSize.y * TILE_SIZE;
  }
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  drawDirt(ctx, images, boardSize);
  drawLoadableShapes(ctx, images, loadableShapes);
  drawLoader(ctx, images, loader);
  drawTruck(time, ctx, images, truck);
}
