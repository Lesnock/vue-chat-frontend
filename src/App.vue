<template>
  <div id="app">
    <Chat />
  </div>
</template>

<script>
import store from './services/store';
// import socket from './services/socket';
import api from './services/api';
import Chat from './components/Chat.vue';

export default {
  name: 'App',
  components: {
    Chat,
  },
  data() {
    return {
      loggedUser: store.get('loggedUser'),
    };
  },

  methods: {
    getUser(username) {
      return api.get(`/users/${username}`);
    },
  },
};
</script>

<style>
/* Variables */
:root {
  --header-bg: linear-gradient(
    90deg,
    rgba(219, 255, 80, 1) 0%,
    rgba(44, 236, 173, 1) 100%
  );
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
}
</style>
