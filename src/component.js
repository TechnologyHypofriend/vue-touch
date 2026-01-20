import Hammer from "hammerjs";
import { h } from "vue";

import {
  createProp,
  capitalize,
  guardDirections,
  gestures,
  gestureMap,
  assign,
  config,
  customEvents,
} from "./utils";

export default {
  props: {
    options: createProp(),
    tapOptions: createProp(),
    panOptions: createProp(),
    pinchOptions: createProp(),
    pressOptions: createProp(),
    rotateOptions: createProp(),
    swipeOptions: createProp(),
    tag: { type: String, default: "div" },
    enabled: {
      default: true,
      type: [Boolean, Object],
    },
  },

  emits: [
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
  ],

  mounted() {
    if (typeof window !== "undefined") {
      this.hammer = new Hammer.Manager(this.$el, this.options);
      this.recognizers = {};
      this.setupBuiltinRecognizers();
      this.setupCustomRecognizers();
      this.updateEnabled(this.enabled);
    }
  },

  beforeUnmount() {
    if (typeof window !== "undefined" && this.hammer) {
      this.hammer.destroy();
    }
  },

  watch: {
    enabled: {
      deep: true,
      handler(...args) {
        this.updateEnabled(...args);
      },
    },
  },

  methods: {
    /**
     * Check if a gesture has a listener attached
     * Vue 3 uses $attrs with onEventName format
     */
    hasListener(gesture) {
      const eventName = "on" + capitalize(gesture);
      return this.$attrs[eventName] !== undefined;
    },

    setupBuiltinRecognizers() {
      for (let i = 0; i < gestures.length; i++) {
        const gesture = gestures[i];
        if (this.hasListener(gesture)) {
          const mainGesture = gestureMap[gesture];
          const options = assign(
            {},
            config[mainGesture] || {},
            this[`${mainGesture}Options`],
          );
          this.addRecognizer(mainGesture, options);
          this.addEvent(gesture);
        }
      }
    },

    setupCustomRecognizers() {
      const customGestures = Object.keys(customEvents);

      for (let i = 0; i < customGestures.length; i++) {
        const gesture = customGestures[i];

        if (this.hasListener(gesture)) {
          const opts = customEvents[gesture];
          const localCustomOpts = this[`${gesture}Options`] || {};
          const options = assign({}, opts, localCustomOpts);
          this.addRecognizer(gesture, options, { mainGesture: options.type });
          this.addEvent(gesture);
        }
      }
    },

    addRecognizer(gesture, options, { mainGesture } = {}) {
      if (!this.recognizers[gesture]) {
        const recognizer = new Hammer[capitalize(mainGesture || gesture)](
          guardDirections(options),
        );
        this.recognizers[gesture] = recognizer;
        this.hammer.add(recognizer);
        recognizer.recognizeWith(this.hammer.recognizers);
      }
    },

    addEvent(gesture) {
      this.hammer.on(gesture, (e) => this.$emit(gesture, e));
    },

    updateEnabled(newVal, oldVal) {
      if (newVal === true) {
        this.enableAll();
      } else if (newVal === false) {
        this.disableAll();
      } else if (typeof newVal === "object") {
        const keys = Object.keys(newVal);

        for (let i = 0; i < keys.length; i++) {
          const event = keys[i];

          if (this.recognizers[event]) {
            newVal[event] ? this.enable(event) : this.disable(event);
          }
        }
      }
    },

    enable(r) {
      const recognizer = this.recognizers[r];
      if (recognizer && !recognizer.options.enable) {
        recognizer.set({ enable: true });
      }
    },

    disable(r) {
      const recognizer = this.recognizers[r];
      if (recognizer && recognizer.options.enable) {
        recognizer.set({ enable: false });
      }
    },

    toggle(r) {
      const recognizer = this.recognizers[r];
      if (recognizer) {
        recognizer.options.enable ? this.disable(r) : this.enable(r);
      }
    },

    enableAll() {
      this.toggleAll({ enable: true });
    },

    disableAll() {
      this.toggleAll({ enable: false });
    },

    toggleAll({ enable }) {
      const keys = Object.keys(this.recognizers);
      for (let i = 0; i < keys.length; i++) {
        const r = this.recognizers[keys[i]];
        if (r.options.enable !== enable) {
          r.set({ enable: enable });
        }
      }
    },

    isEnabled(r) {
      return this.recognizers[r] && this.recognizers[r].options.enable;
    },
  },

  render() {
    // Handle both Vue 3 native (function) and Vue 2 compat mode (array)
    const defaultSlot = this.$slots.default;
    const children = typeof defaultSlot === "function" ? defaultSlot() : defaultSlot || [];
    return h(this.tag, {}, children);
  },
};
