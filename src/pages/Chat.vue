<template>
  <div class="container">
    <header class="top">
      <span class="user-name">{{ loggedUser.name }}</span>
      <img class="avatar" src="../assets/avatar.jpg" alt="Avatar" />
      <span class="logout-button" @click="logout">Sair</span>
    </header>

    <div class="bottom">
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
import ContactsList from '../components/ContactsList.vue';
import Message from '../components/Message.vue';
import { getSocket } from '../services/socket';
import store from '../services/store';
import api from '../services/api';
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const socket = getSocket();

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
    store.update('currentContact', null);
  },

  async created() {
    if (!this.loggedUser) {
      return this.$router.push('/');
    }

    // Set listener to current Contact
    store.listen(
      'currentContact',
      (contact) => (this.currentContact = contact)
    );

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
    async getMessages(contact) {
      const response = await api
        .get(`/messages/${this.loggedUser.id}/${contact.id}`)
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

    clearInput() {
      this.text = '';
    },

    scrollToBottom() {
      this.messagesEl.scrollTo(0, this.messagesEl.scrollHeight);
    },

    async sendMessage() {
      if (!this.text.length || !this.currentContact) {
        return;
      }

      // Change to UTC
      const date = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');

      const message = {
        sender_id: this.loggedUser.id,
        recipient_id: this.currentContact.id,
        text: this.text,
        date,
      };

      // Send message
      socket.emit('send-message', message);

      message.hour = format(date, 'HH:mm');
      message.isMine = true;
      await this.messages.push(message);

      this.clearInput();

      this.scrollToBottom();
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

.logout-button {
  margin-left: 20px;
  cursor: pointer;
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
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex-grow: 1;
  flex-shrink: 1;
  padding: 0px 2% 20px;
  overflow-y: auto;
  height: 0px;
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
