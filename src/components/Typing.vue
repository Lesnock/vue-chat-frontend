<template>
  <div class="typing" v-if="currentContact">
    <input v-model="text" @keydown.enter="sendMessage" />

    <img class="send-icon" src="../assets/icons/send-icon.svg" alt="Send" @click="sendMessage" />
  </div>
</template>

<script>
import { format, zonedTimeToUtc } from 'date-fns-tz';
import { v4 as uuid } from 'uuid';
import store from '../services/store';
import { getSocket } from '../services/socket';

const socket = getSocket();

export default {
  props: {
    addMessage: Function,
    scrollToBottom: Function,
  },

  data() {
    return {
      text: '',
      loggedUser: store.get('loggedUser'),
      currentContact: store.get('currentContact'),
    };
  },

  created() {
    // Listeners
    store.listen('currentContact', (contact) => {
      this.currentContact = contact;
    });

    store.listen('loggedUser', (user) => {
      this.loggedUser = user;
    });
  },

  methods: {
    sendMessage: async function (event) {
      if (event.shiftKey) {
        return;
      }

      if (!this.text.length || !this.currentContact) {
        return;
      }

      // Change to UTC
      const date = zonedTimeToUtc(new Date(), 'America/Sao_Paulo');

      const message = {
        uuid: uuid(),
        sender_id: this.loggedUser.id,
        recipient_id: this.currentContact.id,
        text: this.text,
        date,
      };

      // Send message
      socket.emit('send-message', message);

      message.hour = format(date, 'HH:mm');
      message.isMine = true;

      this.addMessage(message);

      this.$nextTick(this.scrollToBottom);

      this.clearInput();
    },

    clearInput() {
      this.text = '';
    },
  },
};
</script>

<style scoped>
.typing {
  height: 10%;
  padding: 0px 20px;
  position: relative;
  background: #eee;

  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.typing input {
  width: 100%;
  height: 80%;
  border-radius: 30px;
  border: 1px solid #ccc;
  outline: 0;
  padding-left: 20px;
  padding-right: 50px;
  font-size: 20px;
  color: #333;
  resize: none;
}

.typing .send-icon {
  position: absolute;
  right: 35px;
  width: 25px;
  cursor: pointer;
}
</style>
