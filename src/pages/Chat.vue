<template>
  <div class="container">
    <ContactsList />

    <div class="main">
      <div class="messages">
        <Message
          v-for="message of messages"
          :key="`${message.date.getTime()}`"
          :text="message.text"
          :date="message.date"
          :hour="message.hour"
          :isMine="message.isMine"
          :isNewDay="message.isNewDay"
        />
      </div>
      <Typing :setMessage="setMessage" />
    </div>
  </div>
</template>

<script>
// Components
import ContactsList from '../components/ContactsList.vue';
import Message from '../components/Message.vue';
import Typing from '../components/Typing.vue';

import api from '../services/api';
import store from '../services/store';
import { getSocket } from '../services/socket';
import authMiddleware from '../middlewares/auth';
import { format, utcToZonedTime } from 'date-fns-tz';

const socket = getSocket();

export default {
  name: 'Chat',
  components: {
    ContactsList,
    Message,
    Typing,
  },

  data() {
    return {
      text: '',
      offset: 0,
      loggedUser: store.get('loggedUser'),
      messagesEl: null,
      messages: [],
      currentContact: store.get('currentContact'),
    };
  },

  watch: {
    currentContact: async function (currentContact) {
      this.messages = await this.getMessages(currentContact);
    },
  },

  beforeCreate() {
    authMiddleware();

    store.update('currentContact', null);
  },

  async created() {
    // Set listener to current Contact
    store.listen('currentContact', (contact) => {
      this.currentContact = contact;
    });

    // On receive message
    socket.on('receive-message', (message) => {
      if (!this.currentContact) {
        return;
      }

      if (this.currentContact.id === message.sender_id) {
        const date = utcToZonedTime(message.date, 'America/Sao_Paulo');

        // Add Hour format
        const hour = format(date, 'HH:mm');

        this.messages.push({
          ...message,
          isNewDay: false,
          date,
          hour,
          isMine: false,
        });
      }
    });
  },

  updated() {
    this.scrollToBottom();
  },

  mounted() {
    // Define elements
    this.messagesEl = document.getElementsByClassName('messages')[0];
  },
  methods: {
    getMessages: async function (contact) {
      const response = await api
        .get(`/messages/${this.loggedUser.id}/${contact.id}/${this.offset}`)
        .catch((error) => {
          console.log(error);
          this.$router.push('/');
        });

      let lastMessageDay = null; //eslint-disable-line

      // Set date object and add isNewDay prop
      const messages = response.data.map((message) => {
        // Change to zoned time
        const date = utcToZonedTime(message.date, 'America/Sao_Paulo');

        // Verify if message its in a new day
        const currentDay = `${date.getDay()}/${date.getMonth()}`;
        const isNewDay = currentDay !== lastMessageDay;
        lastMessageDay = currentDay;

        // Verify if message is mine
        const isMine = message.sender_id === this.loggedUser.id;

        // Add Hour format
        const hour = format(date, 'HH:mm');

        return {
          ...message,
          isNewDay,
          hour,
          date,
          isMine,
        };
      });

      return messages;
    },

    scrollToBottom() {
      this.messagesEl.scrollTo(0, this.messagesEl.scrollHeight);
    },

    setMessage(message) {
      this.messages.push(message);
      this.scrollToBottom();
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100%;
}

.main {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
}

.messages {
  height: 100%;
  overflow-y: auto;
  padding: 0px 2% 20px;
  background-color: var(--messages-bg);
}
</style>
