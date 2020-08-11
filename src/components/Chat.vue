<template>
  <div class="container">
    <header class="top">
      <span class="user-name">{{ loggedUser.name }}</span>
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
            :hour="`${message.date.getHours()}:${message.date.getMinutes()}`"
            :isMine="true"
          />
        </div>
        <div class="typing" v-if="currentContact">
          <input type="text" v-model="text" @keydown.enter="sendMessage" />

          <img
            class="send-icon"
            src="../assets/icons/send-icon.svg"
            alt="Send"
            @click="sendMessage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ContactsList from './ContactsList.vue';
import Message from './Message.vue';
import socket from '../services/socket';
import store from '../services/store';
import api from '../services/api';

export default {
  name: 'Chat',
  components: {
    ContactsList,
    Message,
  },

  data() {
    return {
      text: '',
      offset: 0,
      loggedUser: store.get('loggedUser'),
      messagesDivEl: null,
      messages: [],
      currentContact: null,
    };
  },

  watch: {
    currentContact: async function (contact) {
      const messages = await api.get(
        `/messages/${this.loggedUser.id}/${contact.id}`
      );

      this.messages = messages.data.map((message) => ({
        ...message,
        date: new Date(message.date),
      }));
    },
  },

  created() {
    store.listen(
      'currentContact',
      (contact) => (this.currentContact = contact)
    );
  },

  async mounted() {
    // Define elements
    this.messagesDivEl = document.getElementsByClassName('messages')[0];
    this.scrollToBottom();
  },
  methods: {
    clearInput() {
      this.text = '';
    },
    scrollToBottom() {
      this.messagesDivEl.scrollTo(0, this.messagesDivEl.scrollHeight);
    },
    async sendMessage() {
      if (!this.text.length || !this.currentContact) {
        return;
      }

      const message = {
        sender_id: this.loggedUser.id,
        recipient_id: this.currentContact.id,
        text: this.text,
        date: new Date(),
      };

      // Send message
      socket.emit('send-message', message);

      await this.messages.push(message);

      this.clearInput();

      this.scrollToBottom();
    },
    setRecipient(recipient) {
      this.recipient = recipient;
    },
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
  justify-content: flex-end;
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
