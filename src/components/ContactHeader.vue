<template>
  <div class="contact-header-container">
    <div class="contact" :class="[onlineUsers.includes(this.currentContact.id) ? 'online' : '']">
      <div class="arrow-back" v-if="isMobile === true" @click="goBack">
        <ArrowLeft />
      </div>
      <div class="name-status">
        <span>{{this.currentContact.name}}</span>
        <span>{{ this.status }}</span>
      </div>
      <img :src="require('../assets/' + this.currentContact.avatar)" alt="Contact Avatar" />
    </div>
  </div>
</template>

<script>
import store from '../services/store';
import { getSocket } from '../services/socket';

// Components
import ArrowLeft from './Icons/ArrowLeft.vue';

const socket = getSocket();

export default {
  components: {
    ArrowLeft,
  },

  data() {
    return {
      contactIsTyping: false,
      isMobile: store.get('isMobile'),
      onlineUsers: store.get('onlineUsers'),
      currentContact: store.get('currentContact'),
    };
  },

  computed: {
    isOnline() {
      return this.onlineUsers.includes(this.currentContact.id);
    },

    status() {
      if (this.contactIsTyping) {
        return 'Digitando...';
      }

      return this.isOnline ? 'Online' : 'Offline';
    },
  },

  created() {
    store.listen('currentContact', (contact) => {
      this.currentContact = contact;
    });

    store.listen('onlineUsers', (users) => {
      this.onlineUsers = users;
    });

    store.listen('isMobile', (isMobile) => {
      this.isMobile = isMobile;
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

  methods: {
    goBack() {
      store.update('currentContact', null);
    },
  },
};
</script>

<style scoped>
.contact-header-container {
  width: 100%;
  flex-shrink: 0;
  background: var(--header-bg);
  border-bottom: 1px solid #444;
  z-index: 10;
}

.contact {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 15px;
  color: #fff;
  text-align: right;
}

.contact .arrow-back {
  fill: #fff;
  margin-right: auto;
  margin-left: 10px;
  cursor: pointer;
}

.contact img {
  height: 50px;
  width: 50px;
  margin-right: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ccc;
}

.contact .name-status {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
}

.contact .name-status :first-child {
  margin-bottom: 5px;
}

.contact .name-status :last-child {
  font-size: 13px;
}

.contact.online img {
  border: 3px solid rgba(04, 196, 133, 1);
}
</style>
