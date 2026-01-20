(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('vue'), require('hammerjs')) :
  typeof define === 'function' && define.amd ? define(['vue', 'hammerjs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.VueTouch = factory(global.Vue, global.Hammer));
})(this, (function (vue, Hammer) { 'use strict';

  Hammer = Hammer && Object.prototype.hasOwnProperty.call(Hammer, 'default') ? Hammer['default'] : Hammer;

  function assign(target, ...sources) {
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

  function createProp() {
    return {
      type: Object,
      default: function () {
        return {};
      },
    };
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const directions = [
    "up",
    "down",
    "left",
    "right",
    "horizontal",
    "vertical",
    "all",
  ];

  function guardDirections(options) {
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

  const config = {};
  const customEvents = {};

  const gestures = [
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

  const gestureMap = {
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

  const Component = {
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
              this[`${mainGesture}Options`]
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
            guardDirections(options)
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
    const children = typeof defaultSlot === 'function' ? defaultSlot() : defaultSlot || [];
    return vue.h(this.tag, {}, children);
  },
  };

  let installed = false;

  const vueTouch = { config, customEvents };

  vueTouch.install = function install(app, opts = {}) {
    const name = opts.name || "v-touch";
    app.component(name, assign({}, Component, { name }));
    installed = true;
  };

  vueTouch.registerCustomEvent = function registerCustomEvent(event, options = {}) {
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
    if (Component.emits && !Component.emits.includes(event)) {
      Component.emits.push(event);
    }
  };

  vueTouch.component = Component;

  return vueTouch;

}));
