(function () {
  var vueTouch = {};
  var Hammer =
    typeof require === "function" ? require("hammerjs") : window.Hammer;
  var gestures = ["tap", "pan", "pinch", "press", "rotate", "swipe"];
  var directions = [
    "up",
    "down",
    "left",
    "right",
    "horizontal",
    "vertical",
    "all",
  ];
  var customEvents = {};

  if (!Hammer) {
    throw new Error("[vue-touch] cannot locate Hammer.js.");
  }

  // exposed global options
  vueTouch.config = {};

  vueTouch.install = function (app) {
    app.directive("touch", {
      mounted: function (el, binding) {
        if (!el.hammer) {
          el.hammer = new Hammer.Manager(el);
        }
        var mc = el.hammer;
        var event = binding.arg;

        if (!event) {
          console.warn("[vue-touch] event type argument is required.");
          return;
        }

        var recognizerType, recognizer;

        if (customEvents[event]) {
          // custom event
          var custom = customEvents[event];
          recognizerType = custom.type;
          recognizer = new Hammer[capitalize(recognizerType)](custom);
          recognizer.recognizeWith(mc.recognizers);
          mc.add(recognizer);
        } else {
          // built-in event
          for (var i = 0; i < gestures.length; i++) {
            if (event.indexOf(gestures[i]) === 0) {
              recognizerType = gestures[i];
              break;
            }
          }
          if (!recognizerType) {
            console.warn("[vue-touch] invalid event type: " + event);
            return;
          }
          recognizer = mc.get(recognizerType);
          if (!recognizer) {
            recognizer = new Hammer[capitalize(recognizerType)]();
            recognizer.recognizeWith(mc.recognizers);
            mc.add(recognizer);
          }
          // apply global options
          var globalOptions = vueTouch.config[recognizerType];
          if (globalOptions) {
            guardDirections(globalOptions);
            recognizer.set(globalOptions);
          }
          // apply local options from modifiers or hammerOptions
          var localOptions =
            el.hammerOptions && el.hammerOptions[recognizerType];
          if (localOptions) {
            guardDirections(localOptions);
            recognizer.set(localOptions);
          }
        }

        el._vueTouch = el._vueTouch || {};
        el._vueTouch[event] = { recognizer: recognizer };

        // set up handler
        if (typeof binding.value === "function") {
          el._vueTouch[event].handler = binding.value;
          mc.on(event, binding.value);
        } else {
          console.warn(
            "[vue-touch] invalid handler function for v-touch:" + event,
          );
        }
      },

      updated: function (el, binding) {
        var mc = el.hammer;
        var event = binding.arg;

        if (!mc || !el._vueTouch || !el._vueTouch[event]) return;

        var oldHandler = el._vueTouch[event].handler;

        // teardown old handler
        if (oldHandler) {
          mc.off(event, oldHandler);
        }

        if (typeof binding.value === "function") {
          el._vueTouch[event].handler = binding.value;
          mc.on(event, binding.value);
        } else {
          el._vueTouch[event].handler = null;
          console.warn(
            "[vue-touch] invalid handler function for v-touch:" + event,
          );
        }
      },

      unmounted: function (el, binding) {
        var event = binding.arg;
        var mc = el.hammer;

        if (!mc || !el._vueTouch || !el._vueTouch[event]) return;

        var handler = el._vueTouch[event].handler;
        if (handler) {
          mc.off(event, handler);
        }

        delete el._vueTouch[event];

        // destroy manager if no handlers left
        if (!Object.keys(mc.handlers).length) {
          mc.destroy();
          el.hammer = null;
        }
      },
    });

    app.directive("touch-options", {
      created: function (el, binding) {
        var opts = el.hammerOptions || (el.hammerOptions = {});
        if (!binding.arg) {
          console.warn(
            "[vue-touch] recognizer type argument for v-touch-options is required.",
          );
        } else {
          opts[binding.arg] = binding.value;
        }
      },
      updated: function (el, binding) {
        var opts = el.hammerOptions || (el.hammerOptions = {});
        if (binding.arg) {
          opts[binding.arg] = binding.value;
        }
      },
    });
  };

  /**
   * Register a custom event.
   *
   * @param {String} event
   * @param {Object} options - a Hammer.js recognizer option object.
   *                           required fields:
   *                           - type: the base recognizer to use for this event
   */
  vueTouch.registerCustomEvent = function (event, options) {
    options.event = event;
    customEvents[event] = options;
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

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
  }

  // ES Module export
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = vueTouch;
  } else if (typeof define === "function" && define.amd) {
    define([], function () {
      return vueTouch;
    });
  } else if (typeof window !== "undefined") {
    window.VueTouch = vueTouch;
  }
})();
