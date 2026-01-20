# vue-touch (Vue 3)

> Touch events plugin for Vue.js 3

This is a directive wrapper for Hammer.js 2.0, updated for Vue 3 compatibility.

## Install

```bash
npm install vue-touch-vue3 hammerjs
```

## Setup

```js
import { createApp } from "vue";
import VueTouch from "vue-touch-vue3";
import App from "./App.vue";

const app = createApp(App);
app.use(VueTouch);
app.mount("#app");
```

#### Direct include

Include Vue, Hammer.js, and vue-touch-vue3.js via `<script>` tags:

```html
<script src="https://unpkg.com/vue@3"></script>
<script src="https://unpkg.com/hammerjs@2"></script>
<script src="vue-touch-vue3.js"></script>

<script>
  const app = Vue.createApp({
    /* ... */
  });
  app.use(VueTouch);
  app.mount("#app");
</script>
```

## Usage

#### Using the `v-touch` directive

```html
<template>
  <a v-touch:tap="onTap">Tap me!</a>
  <div v-touch:swipeleft="onSwipeLeft">Swipe me!</div>
</template>

<script setup>
  function onTap(e) {
    console.log("Tapped!", e);
  }

  function onSwipeLeft(e) {
    console.log("Swiped left!", e);
  }
</script>
```

#### Available Events

Built-in gesture events:

- `tap`
- `pan`, `panstart`, `panmove`, `panend`, `panleft`, `panright`, `panup`, `pandown`
- `pinch`, `pinchstart`, `pinchmove`, `pinchend`, `pinchin`, `pinchout`
- `press`, `pressup`
- `rotate`, `rotatestart`, `rotatemove`, `rotateend`
- `swipe`, `swipeleft`, `swiperight`, `swipeup`, `swipedown`

#### Configuring Recognizer Options

**Global options:**

```js
import VueTouch from "vue-touch-vue3";

// Change the threshold for all swipe recognizers
VueTouch.config.swipe = {
  threshold: 200,
};

app.use(VueTouch);
```

**Per-element options with `v-touch-options`:**

```html
<!-- detect only horizontal pans with a threshold of 100 -->
<div
  v-touch:pan="onPan"
  v-touch-options:pan="{ direction: 'horizontal', threshold: 100 }"
>
  Pan me horizontally
</div>
```

Note: `v-touch-options` must be placed before or alongside `v-touch` on the same element.

#### Registering Custom Events

```js
import VueTouch from "vue-touch-vue3";

// Register a custom doubletap event
// `type` indicates the base recognizer to use
VueTouch.registerCustomEvent("doubletap", {
  type: "tap",
  taps: 2,
});

app.use(VueTouch);
```

```html
<a v-touch:doubletap="onDoubleTap">Double tap me!</a>
```

## Example Component

```vue
<template>
  <div class="touch-demo">
    <div
      v-touch:pan="onPan"
      v-touch:tap="onTap"
      v-touch:swipeleft="onSwipeLeft"
      v-touch:swiperight="onSwipeRight"
      v-touch-options:pan="{ direction: 'all' }"
      class="touch-area"
      :style="{ transform: `translate(${x}px, ${y}px)` }"
    >
      Touch me!
    </div>
    <p>Last event: {{ lastEvent }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const x = ref(0);
const y = ref(0);
const lastEvent = ref("none");

function onPan(e) {
  x.value = e.deltaX;
  y.value = e.deltaY;
  lastEvent.value = `pan (${e.deltaX}, ${e.deltaY})`;
}

function onTap() {
  lastEvent.value = "tap";
}

function onSwipeLeft() {
  lastEvent.value = "swipe left";
}

function onSwipeRight() {
  lastEvent.value = "swipe right";
}
</script>

<style scoped>
.touch-area {
  width: 150px;
  height: 150px;
  background: #42b883;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
}
</style>
```

## Migration from Vue 1.x/2.x

The API remains largely the same. Main changes:

1. **Installation**: Use `app.use(VueTouch)` instead of `Vue.use(VueTouch)`
2. **Import**: Update your import path to the Vue 3 version

## License

[MIT](http://opensource.org/licenses/MIT)
