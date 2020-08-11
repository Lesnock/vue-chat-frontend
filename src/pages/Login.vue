<template>
  <div class="login-container">
    <h1>#Chat</h1>
    <span class="error">{{ error }}</span>
    <form action="/" @submit="onSubmit">
      <input type="text" name="username" v-model="username" placeholder="Usuário" />
      <input type="password" name="password" v-model="password" placeholder="Senha" />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
import api from '../services/api';
import store from '../services/store';

export default {
  name: 'Login',

  data() {
    return {
      username: '',
      password: '',
      error: '',
    };
  },

  beforeCreate() {
    if (store.get('isLogged')) {
      this.$router.push('/chat');
    }
  },

  methods: {
    async onSubmit(event) {
      event.preventDefault();

      try {
        const loggedUser = await api.post('/login', {
          username: this.username,
          password: this.password,
        });

        // Update Global State
        store.update('isLogged', true);
        store.update('loggedUser', loggedUser.data);

        this.$router.push('/chat');
      } catch (error) {
        this.$vToastify.error({
          title: 'Erro:',
          body: error.response.data.error,
        });
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
  background: red;
  color: #fff;
  /* text-align: center; */
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
