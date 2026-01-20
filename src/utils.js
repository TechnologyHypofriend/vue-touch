import Hammer from "hammerjs";

/**
 * Tiny Object.assign replacement
 */
export function assign(target, ...sources) {
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const keys = Object.keys(source);
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Small helper method to generate prop options
 */
export function createProp() {
  return {
    type: Object,
    default: function () {
      return {};
    },
  };
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Directions that VueTouch understands
 */
export const directions = [
  "up",
  "down",
  "left",
  "right",
  "horizontal",
  "vertical",
  "all",
];

/**
 * Translates VueTouch direction names into Hammer Direction numbers
 */
export function guardDirections(options) {
  var dir = options.direction;
  if (typeof dir === "string") {
    var hammerDirection = "DIRECTION_" + dir.toUpperCase();
    if (
      directions.indexOf(dir) > -1 &&
      Hammer.hasOwnProperty(hammerDirection)
    ) {
      options.direction = Hammer[hammerDirection];
    } else {
      console.warn("[vue-touch] invalid direction: " + dir);
    }
  }
  return options;
}

/**
 * Global options for recognizers
 */
export const config = {};

/**
 * Recognizer options for custom events
 */
export const customEvents = {};

/**
 * Names of all the builtin gestures of Hammer
 */
export const gestures = [
  "pan",
  "panstart",
  "panmove",
  "panend",
  "pancancel",
  "panleft",
  "panright",
  "panup",
  "pandown",
  "pinch",
  "pinchstart",
  "pinchmove",
  "pinchend",
  "pinchcancel",
  "pinchin",
  "pinchout",
  "press",
  "pressup",
  "rotate",
  "rotatestart",
  "rotatemove",
  "rotateend",
  "rotatecancel",
  "swipe",
  "swipeleft",
  "swiperight",
  "swipeup",
  "swipedown",
  "tap",
];

/**
 * Maps gestures to their "main gesture" (recognizer name)
 */
export const gestureMap = {
  pan: "pan",
  panstart: "pan",
  panmove: "pan",
  panend: "pan",
  pancancel: "pan",
  panleft: "pan",
  panright: "pan",
  panup: "pan",
  pandown: "pan",
  pinch: "pinch",
  pinchstart: "pinch",
  pinchmove: "pinch",
  pinchend: "pinch",
  pinchcancel: "pinch",
  pinchin: "pinch",
  pinchout: "pinch",
  press: "press",
  pressup: "press",
  rotate: "rotate",
  rotatestart: "rotate",
  rotatemove: "rotate",
  rotateend: "rotate",
  rotatecancel: "rotate",
  swipe: "swipe",
  swipeleft: "swipe",
  swiperight: "swipe",
  swipeup: "swipe",
  swipedown: "swipe",
  tap: "tap",
};
