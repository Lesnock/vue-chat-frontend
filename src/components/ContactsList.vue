<template>
  <div class="contacts-list-container">
    <audio id="notification-sound" :src="require('../assets/sounds/notification.mp3')"></audio>

    <header class="top">
      <img class="avatar" src="../assets/avatar.jpg" alt="Avatar" />
      <span class="user-name">{{ loggedUser.name }}</span>
      <span class="logout-button" @click="logout">Sair</span>
    </header>

    <ul class="list" v-if="contacts.length > 0">
      <li
        v-for="contact in contacts"
        :key="contact.id"
        :class="[
          currentContact && contact.id === currentContact.id ? 'selected' : '',
          onlineUsers.includes(contact.id) ? 'online' : ''
        ]"
        @click="setCurrentContact(contact)"
      >
        <img :src="require('../assets/' + contact.avatar)" alt="Contact" />
        <span>{{contact.name}}</span>
        <span v-show="notViewed[contact.id]" class="not-viewed-number">{{ notViewed[contact.id] }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../services/api';
import store from '../services/store';
import { getSocket } from '../services/socket';

const socket = getSocket();

export default {
  name: 'ContactsList',
  data() {
    return {
      contacts: [],
      loggedUser: store.get('loggedUser'),
      currentContact: store.get('currentContact'),
      notViewed: {},
      onlineUsers: [],
    };
  },

  async created() {
    const contacts = await api.get('/users');
    this.contacts = contacts.data;

    this.contacts = this.contacts.filter((contact) => {
      return contact.id !== this.loggedUser.id;
    });

    this.notViewed = await this.getMessagesNotViewedCount();

    // Create listener
    store.listen(
      'currentContact',
      (contact) => (this.currentContact = contact)
    );

    socket.emit('get-online-users');
    socket.on('online-users', (onlineUsers) => {
      for (const socketId in onlineUsers) {
        this.onlineUsers.push(onlineUsers[socketId]);
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

  mounted() {
    //
  },

  methods: {
    setCurrentContact(contact) {
      store.update('currentContact', contact);

      if (this.notViewed[contact.id]) {
        this.notViewed[contact.id] = 0;
        this.markContactMessagesAsViewed(contact.id);
        socket.emit('user-viewed-messages', contact.id);
      }
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
  min-width: 300px;
  background-color: var(--header-bg);
  flex-grow: 1;

  display: flex;
  flex-direction: column;
}

header {
  height: 100px;
  background: var(--header-bg);
  color: #fff;
  border-bottom: 1px solid #444;
  padding: 15px;

  display: flex;
  align-items: center;
}

.avatar {
  height: 60px;
  width: 60px;
  border-radius: 50%;
  background: #fff;
  margin-right: 10px;
}

.user-name {
  font-size: 18px;
}

.logout-button {
  margin-left: auto;
  cursor: pointer;
}

.list {
  width: 100%;
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
