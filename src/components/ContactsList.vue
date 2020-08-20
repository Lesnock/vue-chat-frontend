<template>
  <div class="contacts-list-container">
    <audio id="notification-sound" :src="require('../assets/sounds/notification.mp3')"></audio>

    <header>
      <div class="logged-user">
        <img
          class="logged-user-avatar"
          :src="require('../assets/' + loggedUser.avatar)"
          alt="Avatar"
        />
        <span class="user-name">{{ loggedUser.name }}</span>
        <span class="logout-button" @click="logout">Sair</span>
      </div>
      <div class="search">
        <input type="text" placeholder="Pesquisar contato..." v-model="searchText" />
      </div>
    </header>

    <Loading :isLoading="isLoading === true" />

    <ul class="list" v-if="contacts.length > 0">
      <li
        v-for="contact in contactList"
        :key="contact.id"
        :class="[
          currentContact && contact.id === currentContact.id ? 'selected' : '',
          onlineUsers.includes(contact.id) ? 'online' : ''
        ]"
        @click="setCurrentContact(contact)"
      >
        <img :src="require('../assets/' + contact.avatar)" alt="Contact" />
        <div class="name-status">
          <span>{{contact.name}}</span>
          <span>{{ onlineUsers.includes(contact.id) ? 'Online' : 'Offline' }}</span>
        </div>
        <span v-show="notViewed[contact.id]" class="not-viewed-number">{{ notViewed[contact.id] }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../services/api';
import store from '../services/store';
import { getSocket } from '../services/socket';
import Loading from './Loading.vue';

const socket = getSocket();

export default {
  name: 'ContactsList',

  components: {
    Loading,
  },

  data() {
    return {
      contacts: [],
      filteredContacts: [],
      notViewed: {},
      searchText: '',
      isLoading: true,
      onlineUsers: store.get('onlineUsers'),
      loggedUser: store.get('loggedUser'),
      currentContact: store.get('currentContact'),
    };
  },

  computed: {
    contactList() {
      if (this.searchText.length > 0) {
        return this.filteredContacts;
      }

      return this.contacts;
    },
  },

  watch: {
    searchText(text) {
      if (text.length > 0) {
        this.filteredContacts = this.contacts.filter((contact) =>
          contact.name.includes(text)
        );
      } else {
        this.filteredContacts = [];
      }
    },

    currentContact(contact) {
      store.update('currentContact', contact);

      if (contact === null) return;

      if (this.notViewed[contact.id]) {
        this.notViewed[contact.id] = 0;
        this.markContactMessagesAsViewed(contact.id);
        socket.emit('user-viewed-messages', contact.id);
      }
    },

    onlineUsers(users) {
      store.update('onlineUsers', users);
    },
  },

  async created() {
    this.isLoading = true;

    const contacts = await api.get('/users');
    this.contacts = contacts.data;

    this.contacts = this.contacts.filter((contact) => {
      return contact.id !== this.loggedUser.id;
    });

    this.notViewed = await this.getMessagesNotViewedCount();

    this.isLoading = false;

    // Create listener
    store.listen('currentContact', (contact) => {
      this.currentContact = contact;
    });

    store.listen('onlineUsers', (users) => {
      this.onlineUsers = users;
    });

    socket.emit('get-online-users');
    socket.on('online-users', (connections) => {
      for (const socketId in connections) {
        this.onlineUsers.push(connections[socketId]);
      }
    });

    socket.on('new-user-online', (contactId) => {
      if (!this.onlineUsers.includes(contactId)) {
        this.onlineUsers.push(contactId);
      }
    });

    socket.on('user-disconnected', (contactId) => {
      this.onlineUsers = this.onlineUsers.filter(
        (userId) => userId !== contactId
      );
    });

    // on Receive Message
    socket.on('receive-message', (message) => {
      // If user is in other contact
      if (
        !this.currentContact ||
        this.currentContact.id !== message.sender_id
      ) {
        if (!this.notViewed[message.sender_id]) {
          this.notViewed[message.sender_id] = 0;
        }

        this.notViewed[message.sender_id]++;
      } else {
        // Its inside the conversation
        this.notViewed[message.sender_id] = 0;
        this.markMessageAsViewed(message.uuid);
      }

      // Play audio ever when a message is received
      this.playNotificationSound();
      this.markMessagesAsReceived(message.uuid);

      this.$forceUpdate();
    });
  },

  methods: {
    setCurrentContact(contact) {
      this.currentContact = contact;
    },

    playNotificationSound() {
      const notificationSound = document.getElementById('notification-sound');

      if (notificationSound.currentTime > 0 && !notificationSound.paused) {
        notificationSound.pause();
      }

      notificationSound.play();
      notificationSound.currentTime = 0;
    },

    getMessagesNotViewedCount: async function () {
      const response = await api.get(`/messages/count-not-viewed-messages`);

      return response.data;
    },

    markMessageAsViewed: async function (messageUuid) {
      try {
        api.put(`/messages/${messageUuid}`, {
          viewed: true,
        });
      } catch (error) {
        console.log(error);
      }
    },

    markContactMessagesAsViewed: async function (contactId) {
      try {
        api.patch(
          `/messages/mark?sender_id=${contactId}&recipient_id=${this.loggedUser.id}`,
          {
            viewed: true,
          }
        );
      } catch (error) {
        console.log(error);
      }
    },

    markMessagesAsReceived: async function () {
      try {
        api.patch(`/messages/mark?recipient_id=${this.loggedUser.id}`, {
          received: true,
        });
      } catch (error) {
        console.log(error);
      }
    },

    logout() {
      store.update('token', null);
      store.update('loggedUser', null);

      socket.emit('logout');

      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.contacts-list-container {
  width: 30vw;
  height: 100%;
  height: calc(var(--vh, 1vh) * 100);
  min-width: 300px;
  background-color: var(--header-bg);
  border-right: 1px solid #444;
  flex-grow: 1;

  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  flex-direction: column;
}

header .logged-user {
  display: flex;
  align-items: center;
  padding: 15px;
  color: #fff;
  border-bottom: 1px solid #444;
}

header .logged-user .logout-button {
  margin-left: auto;
  cursor: pointer;
  background: var(--messages-bg);
  border-radius: 50%;
  padding: 10px 5px;
}

header .search {
  color: #fff;
  border-bottom: 1px solid #444;
  height: 70px;
  display: flex;
  padding: 0px 15px;
  align-items: center;
}

header .search input {
  width: 100%;
  height: 40px;
  border-radius: 15px;
  outline: 0;
  border: 1px solid #444;
  background: transparent;
  padding-left: 20px;
  font-size: 14px;
  color: #ddd;
}

.logged-user-avatar {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.user-name {
  font-size: 18px;
}

.loading-container {
  margin-top: 20px;
}

.list {
  width: 100%;
  overflow-y: scroll;
}

.list li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #444;
  background: var(--contact-bg);
  color: #fff;

  display: flex;
  align-items: center;
}

.list li.selected {
  background: var(--messages-bg);
}

.list li .name-status {
  display: flex;
  flex-direction: column;
}

.list li .name-status :first-child {
  margin-bottom: 5px;
}

.list li .name-status :last-child {
  font-size: 13px;
}

.list li img {
  object-fit: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  border: 3px solid #ccc;
}

.list li.online img {
  border: 3px solid rgba(04, 196, 133, 1);
}

.list li .not-viewed-number {
  background: rgba(04, 196, 133, 1);
  border-radius: 50%;
  color: white;
  width: 20px;
  height: 20px;
  margin-left: auto;

  display: flex;
  justify-content: center;
  align-items: center;
  justify-self: flex-end;
}
</style>
