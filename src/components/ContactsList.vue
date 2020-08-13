<template>
  <div class="container">
    <audio id="notification-sound" :src="require('../assets/sounds/notification.mp3')"></audio>
    <ul class="list" v-if="contacts.length > 0">
      <li
        v-for="contact in contacts"
        :key="contact.id"
        :class="[currentContact && contact.id === currentContact.id ? 'selected' : '']"
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
    };
  },

  async created() {
    const res = await api.get('/users');

    this.contacts = res.data;

    this.contacts = this.contacts.filter((contact) => {
      return contact.id !== this.loggedUser.id;
    });

    // Create listener
    store.listen(
      'currentContact',
      (contact) => (this.currentContact = contact)
    );

    // on Receive Message
    socket.on('receive-message', (message) => {
      // If user is in other contact
      if (this.currentContact.id !== message.sender_id) {
        if (!this.notViewed[message.sender_id]) {
          this.notViewed = { ...this.notViewed, [message.sender_id]: 1 };
        } else {
          const currentnotViewed = this.notViewed[message.sender_id];
          this.notViewed = {
            ...this.notViewed,
            [message.sender_id]: currentnotViewed + 1,
          };
        }
      }

      const notificationSound = document.getElementById('notification-sound');
      notificationSound.play();
    });
  },

  methods: {
    setCurrentContact(contact) {
      store.update('currentContact', contact);
      if (this.notViewed[contact.id]) {
        this.notViewed[contact.id] = 0;
      }
    },
  },
};
</script>

<style scoped>
.container {
  height: 100%;
  width: 30vw;
  border-right: 1px solid #ccc;
}

.list {
  width: 100%;
  height: 100%;
}

.list li {
  padding: 10px;
  cursor: pointer;
  background: #fff;

  display: flex;
  align-items: center;
}

.list li.selected {
  background: #ccc;
}

.list > li + li {
  border-top: 1px solid #ccc;
}

.list li:hover {
  background: #ccc;
  transition: background-color 0.2s;
}

.list img {
  object-fit: cover;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
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
