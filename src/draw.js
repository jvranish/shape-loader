import { RIGHT, Vector2d } from "./vector2d.js";
import { Truck } from "./truck.js";
import { Loader } from "./loader.js";
import { State } from "./state.js";
import { LoadableShape } from "./shapes.js";

/** @typedef {import("./shapes.js").Shape} Shape */

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
 * @param {number} time
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {Truck} truck
 */
function drawTruck(time, ctx, images, truck) {
  const truckPos = truck.drawPos();
  ctx.drawImage(images.truck, truckPos.x * 32, truckPos.y * 32);

  const shapesLoaded = truck.getShapesLoaded();

  shapesLoaded.forEach((shape, i) => {
    const shapePos = truckPos.add(RIGHT.multiply(1 + i));
      ctx.drawImage(images[shape], shapePos.x * 32, shapePos.y * 32);
  });

  const nextNeededShape = truck.nextNeededShape();
  if (nextNeededShape !== null) {
    const shapePos = truckPos.add(RIGHT.multiply(1 + shapesLoaded.length));
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(time / 100);
    ctx.drawImage(
      images[neededFromShape(nextNeededShape)],
      shapePos.x * 32,
      shapePos.y * 32
    );
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
  ctx.drawImage(images.loader, loaderPos.x * 32, loaderPos.y * 32);
  const bucketPos = loader.getBucketDrawPos();

  const loadedShape = loader.getLoadedShape();
  if (loadedShape !== null) {
    const shapePos = bucketPos.add(new Vector2d(-0.32, 0.32));
    // draw shape in bucket
    ctx.drawImage(images[loadedShape], shapePos.x * 32, shapePos.y * 32);
  }

  // draw bucket
  ctx.drawImage(images.loaderArm, bucketPos.x * 32, loaderPos.y * 32);
  ctx.drawImage(images.loaderScoop, bucketPos.x * 32, bucketPos.y * 32);
}

/**
 * Draw the shapes available to load.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 * @param {LoadableShape[]} loadableShapes
 */
function drawLoadableShapes(ctx, images, loadableShapes) {
  for (const loadableShape of loadableShapes) {
    const { x, y } = loadableShape.pos;
    ctx.drawImage(images[loadableShape.shape], x * 32, y * 32);
  }
}

/**
 * Draw the floor.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Images} images
 */
function drawDirt(ctx, images) {
  const dirts = [images.dirt1, images.dirt2, images.dirt3];
  for (let x = 0; x < 15; x++) {
    for (let y = 0; y < 15; y++) {
      // draw a pseudo random dirt
      const dirt = dirts[(x + y) % dirts.length];
      ctx.drawImage(dirt, x * 32, y * 32);
    }
  }
}

/**
  * @param {number} time
  * @param {CanvasRenderingContext2D} ctx
  * @param {Images} images
  * @param {State} state
*/
export function drawFrame(time, ctx, images, state) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  let { loader, truck, loadableShapes } = state.getDrawables();
  drawDirt(ctx, images);
  drawLoadableShapes(ctx, images, loadableShapes);
  drawLoader(ctx, images, loader);
  drawTruck(time, ctx, images, truck);
}
