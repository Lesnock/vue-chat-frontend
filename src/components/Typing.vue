<template>
  <div class="typing" v-if="currentContact">
    <input id="typer" v-model="text" @keydown.enter="sendMessage" />

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
      if (this.text.length > 0) {
        socket.emit('stopped-typing', {
          from: this.loggedUser.id,
          to: this.currentContact.id,
        });
      }

      this.currentContact = contact;
    });

    store.listen('loggedUser', (user) => {
      this.loggedUser = user;
    });
  },

  watch: {
    text(text) {
      if (text.length > 0) {
        socket.emit('typing', {
          from: this.loggedUser.id,
          to: this.currentContact.id,
        });
      } else {
        socket.emit('stopped-typing', {
          from: this.loggedUser.id,
          to: this.currentContact.id,
        });
      }
    },
  },

  methods: {
    sendMessage: async function () {
      // if (event.shiftKey) {
      //   return;
      // }

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
      this.clearInput();

      this.$nextTick(() => {
        this.scrollToBottom();
        this.focusOnInput();
      });
    },

    clearInput() {
      this.text = '';
    },

    focusOnInput() {
      const typer = document.getElementById('typer');
      typer.focus();
    },
  },
};
</script>

<style scoped>
.typing {
  min-height: 10%;
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
