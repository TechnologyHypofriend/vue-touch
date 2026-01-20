import Component from "./component";
import { assign, config, customEvents } from "./utils";

let installed = false;

const vueTouch = { config, customEvents };

// Plugin API
vueTouch.install = function install(app, opts = {}) {
  const name = opts.name || "v-touch";
  app.component(name, assign({}, Component, { name }));
  installed = true;
};

vueTouch.registerCustomEvent = function registerCustomEvent(
  event,
  options = {},
) {
  if (installed) {
    console.warn(`
      [vue-touch]: Custom Event '${event}' couldn't be added to vue-touch.
      Custom Events have to be registered before installing the plugin.
    `);
    return;
  }
  options.event = event;
  customEvents[event] = options;
  Component.props[`${event}Options`] = {
    type: Object,
    default() {
      return {};
    },
  };
  // Add to emits array
  if (Component.emits && !Component.emits.includes(event)) {
    Component.emits.push(event);
  }
};

vueTouch.component = Component;

// UMD export
if (typeof exports === "object" && typeof module !== "undefined") {
  module.exports = vueTouch;
} else if (typeof define === "function" && define.amd) {
  define([], function () {
    return vueTouch;
  });
} else if (typeof window !== "undefined") {
  window.VueTouch = vueTouch;
}

export default vueTouch;
