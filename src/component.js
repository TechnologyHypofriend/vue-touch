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
    to: { type: [String, Object], default: null },
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
      // Use TouchMouseInput to support both touch and mouse events
      var hammerOptions = assign({}, this.options);
      // Enable mouse input for desktop support
      if (Hammer.TouchMouseInput) {
        hammerOptions.inputClass = Hammer.TouchMouseInput;
      }
      this.hammer = new Hammer.Manager(this.$el, hammerOptions);
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
     * Supports Vue 3 native ($attrs) and Vue 2 compat mode (_events)
     */
    hasListener(gesture) {
      // Vue 3 native: listeners are in $attrs as onEventName
      const eventName = "on" + capitalize(gesture);
      if (this.$attrs && this.$attrs[eventName] !== undefined) {
        return true;
      }
      // Vue 2 compat mode: listeners are in _events
      if (this._events && this._events[gesture] && this._events[gesture].length > 0) {
        return true;
      }
      // Also check $listeners for Vue 2 compat
      if (this.$listeners && this.$listeners[gesture] !== undefined) {
        return true;
      }
      return false;
    },

    setupBuiltinRecognizers() {
      for (let i = 0; i < gestures.length; i++) {
        const gesture = gestures[i];
        // Always setup tap recognizer for click/tap support
        // Also setup recognizer if `to` prop is set for navigation
        const isTapGesture = gesture === 'tap';
        const needsRecognizer = this.hasListener(gesture) || (isTapGesture && this.to) || isTapGesture;
        if (needsRecognizer) {
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
      this.hammer.on(gesture, (e) => {
        this.$emit(gesture, e);
        // Handle router navigation on tap
        if (gesture === 'tap' && this.to) {
          this.navigate();
        }
      });
    },

    navigate() {
      if (this.$router && this.to) {
        this.$router.push(this.to);
      }
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
