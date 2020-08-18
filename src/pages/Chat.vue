<template>
  <div class="container" :class="[isMobile ? 'is-mobile' : '']">
    <ContactsList v-if="shouldShowContacts" />

    <div class="main" v-if="shouldShowMain">
      <ContactHeader v-if="currentContact !== null" />
      <div class="messages">
        <Loading :isLoading="loading" />
        <span class="load-more" v-if="!hasLoadedAll" @click="getMoreMessages">Carregar mais</span>
        <Message
          v-for="message of messages"
          :key="`${message.uuid}`"
          :text="message.text"
          :date="message.date"
          :hour="message.hour"
          :isMine="message.isMine"
          :isNewDay="message.isNewDay"
          :isReceived="Boolean(message.received)"
          :isViewed="Boolean(message.viewed)"
        />
        <IsTyping v-if="contactIsTyping" :name="currentContact.name" />
      </div>
      <Typing :addMessage="addMessage" :scrollToBottom="scrollToBottom" />
    </div>
  </div>
</template>

<script>
// Components
import ContactsList from '../components/ContactsList.vue';
import Message from '../components/Message.vue';
import Loading from '../components/Loading.vue';
import Typing from '../components/Typing.vue';
import IsTyping from '../components/IsTyping.vue';
import ContactHeader from '../components/ContactHeader.vue';

import api from '../services/api';
import { delay } from '../helpers';
import store from '../services/store';
import { getSocket } from '../services/socket';
import { privatePage } from '../services/auth';
import { format, utcToZonedTime } from 'date-fns-tz';

const socket = getSocket();

export default {
  name: 'Chat',
  components: {
    ContactsList,
    Message,
    Loading,
    Typing,
    IsTyping,
    ContactHeader,
  },

  data() {
    return {
      loading: false,
      offset: 0,
      messages: [],
      totalMessages: 0,
      contactIsTyping: false,
      isMobile: store.get('isMobile'),
      loggedUser: store.get('loggedUser'),
      currentContact: store.get('currentContact'),
    };
  },

  computed: {
    messagesEl() {
      return document.getElementsByClassName('messages')[0];
    },

    hasLoadedAll() {
      return this.messages.length === this.totalMessages;
    },

    lastMessage() {
      return this.messages[this.messages.length - 1];
    },

    shouldShowMain() {
      if (!this.isMobile) {
        return true;
      }

      return this.currentContact !== null;
    },

    shouldShowContacts() {
      if (!this.isMobile) {
        return true;
      }

      return this.currentContact === null;
    },
  },

  watch: {
    currentContact: async function (currentContact) {
      this.messages = await this.getMessages(currentContact);
      this.totalMessages = await this.getTotalMessages();
      this.scrollToBottom();
    },
  },

  beforeCreate() {
    privatePage();
    store.update('currentContact', null);
  },

  async created() {
    // Set listener to current Contact
    store.listen('currentContact', (contact) => {
      this.currentContact = contact;
      this.offset = 0;
    });

    store.listen('isMobile', (isMobile) => {
      this.isMobile = isMobile;
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

        socket.emit('user-viewed-messages', this.currentContact.id);

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    });

    socket.on('message-delivered', (messageUuid) => {
      this.messages = this.messages.map((message) => {
        if (message.uuid === messageUuid) {
          message.received = true;
        }

        return message;
      });
    });

    socket.on('new-user-online', (contactId) => {
      if (this.currentContact && this.currentContact.id === contactId) {
        this.messages = this.messages.map((message) => {
          return {
            ...message,
            received: true,
          };
        });
      }
    });

    socket.on('user-viewed-messages', (contactId) => {
      if (this.currentContact && this.currentContact.id === contactId) {
        this.messages = this.messages.map((message) => {
          return {
            ...message,
            viewed: true,
          };
        });
      }
    });

    socket.on('contact-is-typing', (contactId) => {
      if (!this.currentContact) return;
      if (this.currentContact.id !== contactId) return;

      this.contactIsTyping = true;
    });

    socket.on('contact-stopped-typing', (contactId) => {
      if (!this.currentContact) return;
      if (this.currentContact.id !== contactId) return;

      this.contactIsTyping = false;
    });
  },

  // mounted() {
  //   // Define elements
  //   this.messagesEl = document.getElementsByClassName('messages')[0];
  // },

  methods: {
    getMessages: async function (contact) {
      const response = await api
        .get(`/messages/${contact.id}?offset=${this.offset}`)
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

    getMoreMessages: async function () {
      if (this.hasLoadedAll) {
        return;
      }

      this.loading = true;
      this.offset += 50;
      const messages = await this.getMessages(this.currentContact);

      let topMessage = document.getElementsByClassName('message-container')[0];

      await delay(500);

      this.messages.unshift(...messages);
      this.loading = false;

      // Scroll to bottom only when messages is loaded
      function scrollToBottom() {
        if (this.messagesEl) {
          return this.messagesEl.scrollTo(0, topMessage.offsetTop);
        }

        this.$nextTick(() => {
          scrollToBottom();
        });
      }

      scrollToBottom();
    },

    getTotalMessages: async function () {
      const total = await api
        .get(`/messages/count/${this.currentContact.id}`)
        .catch((error) => {
          console.log(error);
          alert('Não foi possível carregar o total de mensagens...');
        });

      return total.data.count;
    },

    scrollToBottom() {
      if (this.messagesEl) {
        return this.messagesEl.scrollTo(0, this.messagesEl.scrollHeight);
      }

      // Only scrolls when messages is loaded
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    addMessage(message) {
      this.messages.push(message);
      this.scrollToBottom();
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;

  max-width: 1600px;
  margin: 0px auto;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.5);
}

.main {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--messages-bg);

  display: flex;
  flex-direction: column;
  position: relative;
}

.messages {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  /* margin-top: auto; */
  padding: 0px 2% 20px;
  background-color: var(--messages-bg);
}

.load-more {
  text-align: center;
  padding: 15px;
  cursor: pointer;
}
</style>
