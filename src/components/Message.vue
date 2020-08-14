<template>
  <div class="message-container">
    <span v-if="isNewDay" class="day">{{ dayAndMonth }}</span>

    <div class="message" :class="[isMine ? 'mine' : '']">
      <div class="text">{{ text }}</div>
      <div class="hour">{{ hour }}</div>
      <div class="viewd"></div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  name: 'Message',
  props: {
    text: String,
    date: Date,
    hour: String,
    isMine: Boolean,
    isNewDay: Boolean,
  },

  data() {
    return {
      dayAndMonth: null,
    };
  },

  created() {
    this.dayAndMonth = format(this.date, 'dd/MM/yyyy');
  },
};
</script>

<style scoped>
.message-container {
  display: flex;
  flex-direction: column;
  /* min-height: 70px; */
  /*
  flex-grow: 1;
  flex-shrink: 1;
  margin-top: auto; */
}

.message {
  max-width: 50%;
  padding: 20px;
  background: #eee;
  margin: 20px 20px 0px;
  border-radius: 10px;
  font-size: 14px;
  align-self: flex-start;
}

.message.mine {
  align-self: flex-end;
}

.day {
  text-align: center;
  background: #eee;
  padding: 8px;
  border-radius: 5px;
  margin: 15px auto;
}

.text {
  margin-right: 40px;
  font-size: 14px;
}

.hour {
  position: absolute;
  bottom: 7px;
  right: 7px;
  font-size: 12px;
  color: #333;
}
</style>
