<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
// Hack for make real height 100% on mobiles
// Creates our own 'vh' and set to document properties
const vh = window.innerHeight / 100;
document.documentElement.style.setProperty('--vh', vh + 'px');
</script>

<style>
/* Variables */
:root {
  --header-bg: #322f3d;
  --messages-bg: #4b5d67;
  --contact-bg: #322f3d;
  --contact-selected-bg: #322f3d;
  --check-color: #32cf5b;
}

/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
}

html,
body,
#app {
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #333;
}
</style>
