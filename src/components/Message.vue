<template>
  <div class="message-container">
    <span v-if="isNewDay" class="day">{{ dayAndMonth }}</span>

    <div class="message" :class="[isMine ? 'mine' : '']">
      <div class="caret" :class="[isMine ? 'right' : 'left']"></div>
      <div class="text">{{ text }}</div>
      <div class="hour">{{ hour }}</div>
      <div class="checks" :class="[isViewed ? 'viewed' : '']" v-if="isMine" >
        <Check class="check-icon"/>
        <Check class="check-icon" v-if="isReceived" />
      </div>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';
import Check from './Icons/Check'

export default {
  name: 'Message',
  props: {
    text: String,
    date: Date,
    hour: String,
    isMine: Boolean,
    isNewDay: Boolean,
    isViewed: Boolean,
    isReceived: Boolean,
  },
  components: {
    Check,
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
}

.message {
  position: relative;
  max-width: 50%;
  padding: 20px;
  background: #eee;
  margin: 20px 20px 0px;
  border-radius: 10px;
  font-size: 14px;
  align-self: flex-start;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, .3);
}

.message.mine {
  align-self: flex-end;
}

.text {
  margin-right: 40px;
  font-size: 14px;
  line-height: 20px;
}

.hour {
  position: absolute;
  bottom: 7px;
  right: 10px;
  font-size: 12px;
  color: #777;
}

.message.mine .text {
  margin-right: 80px;
}

.message.mine .hour {
  right: 35px;
}

.day {
  text-align: center;
  background: #eee;
  padding: 8px;
  border-radius: 5px;
  margin: 15px auto;
}

.checks {
  position: absolute;
  bottom: 5px;
  right: 10px;
}

.check-icon {
  width: 10px;
  height: 10px;
  fill: #777;
}

.checks.viewed .check-icon {
  fill: #4fc3f7;
}

.check-icon:last-child {
  margin-left: -5px;
}

.caret {
  position: absolute;
  border-bottom: 20px solid transparent;
  width: 0px;
  height: 0px;
  top: 0px;
}

.caret.left {
  border-right: 20px solid #eee;
  left: -10px;
}

.caret.right {
  border-left: 20px solid #eee;
  right: -10px;
}
</style>
