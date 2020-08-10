<template>
  <div class="container">
    <header class="top">
      <span class="user-name">Caio Lesnock</span>
      <img class="avatar" src="../assets/avatar.jpg" alt="Avatar" />
    </header>

    <div class="bottom">
      <ContactsList />
      <div class="main">
        <div class="messages">
          <Message
            v-for="message of messages"
            :key="message.text"
            :text="message.text"
            hour="10:00"
            :isMine="true"
          />

        </div>
        <div class="typing">

          <input
            type="text"
            v-model="text"
            @keydown.enter="sendMessage"
          />

          <img class="send-icon" src="../assets/icons/send-icon.svg" alt="Send" @click="sendMessage"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContactsList from './ContactsList.vue';
import Message from './Message.vue';
import socket from '../services/socket';

export default {
  name: 'Chat',
  props: {},
  components: {
    ContactsList,
    Message,
  },
  data() {
    return {
      text: '',
      messagesDivEl: null,
      messages: []
    };
  },
  methods: {
    clearInput() {
      this.text = ''
    },
    scrollToBottom() {
      this.messagesDivEl.scrollTo(0, this.messagesDivEl.scrollHeight);
    },
    async sendMessage() {
      if (!this.text.length) {
        return
      }

      const message = {
        text: this.text,
        date: new Date(),
      }

      socket.emit('send-message', {
        username: 'caio',
        message
      })

      await this.messages.push(message)

      this.clearInput()

      this.scrollToBottom()
    }
  },
  mounted() {
    // Define elements
    this.messagesDivEl = document.getElementsByClassName('messages')[0]

    this.scrollToBottom()
  },
};
</script>

<style scoped>
.container {
  height: 100%;

  display: flex;
  flex-direction: column;
}

.top {
  height: 80px;
  background: var(--header-bg);
  color: #fff;
  padding: 20px;

  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.bottom {
  height: 100%;

  display: flex;
}

.avatar {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  background: #fff;
  margin-left: 15px;
}

.user-name {
  font-size: 24px;
}

.main {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
}

.messages {
  flex-grow: 1;
  height: 0px; /* Hack for use flexbox and overflow */
  display: flex;
  flex-direction: column;
  padding: 0px 2% 20px;
  overflow-y: scroll;
}

.typing {
  height: 10%;
  padding: 0px 20px;
  position: relative;
  background: #eee;

  display: flex;
  align-items: center;
}

.typing input {
  width: 100%;
  height: 80%;
  border-radius: 30px;
  border: 1px solid #ccc;
  outline: 0;
  padding: 0px 20px;
  font-size: 20px;
  color: #333;

  display: flex;
  align-items: center;
}

.typing .send-icon {
  position: absolute;
  right: 35px;
  width: 25px;
  cursor: pointer;
}
</style>
