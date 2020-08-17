<template>
  <div class="login-container">
    <h1>#Chat</h1>
    <form action="/" @submit="onSubmit">
      <div class="error" v-show="error">{{ error }}</div>
      <input type="text" name="username" v-model="username" placeholder="Usuário" />
      <input type="password" name="password" v-model="password" placeholder="Senha" />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import api from '../services/api';
import store from '../services/store';
import { publicPage } from '../services/auth';
import { connectSocket, getSocket } from '../services/socket';

connectSocket();
const socket = getSocket();

export default {
  name: 'Login',

  data() {
    return {
      username: '',
      password: '',
      error: '',
    };
  },

  beforeCreate: async function () {
    publicPage();
  },

  methods: {
    async onSubmit(event) {
      event.preventDefault();

      try {
        const response = await api.post('/login', {
          username: this.username,
          password: this.password,
        });

        const { user, token } = response.data;

        // Update Global State
        store.update('token', token);
        store.update('loggedUser', user);

        socket.emit('user-id', user.id);

        this.$router.push('/chat');
      } catch (error) {
        this.error = error.message;
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  height: 100%;
  width: 100%;
  background: linear-gradient(
    45deg,
    rgba(219, 255, 80, 1) 0%,
    rgba(44, 236, 173, 1) 100%
  );

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

form {
  display: flex;
  flex-direction: column;
}

.error {
  display: block;
  background: #f8d7da;
  color: #721c24;
  border-radius: 5px;
  text-align: center;
  padding: 10px;
  margin: 10px 0px;
}

input {
  height: 40px;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 300px;
  margin-top: 10px;
  outline: 0;
  font-size: 16px;
  color: #333;
  padding: 0 15px;
}

button {
  margin-top: 15px;
  height: 40px;
  border-radius: 5px;
  border: none;
  background: #0388fc;
  color: #fff;
  font-size: 16px;
  font-weight: bolder;
  cursor: pointer;
}
</style>
