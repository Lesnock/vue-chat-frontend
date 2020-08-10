<template>
  <div class="message" :class="[isMine ? 'mine' : '']">
    <div class="text">{{ text }}</div>
    <div class="hour">{{ hour }}</div>
    <div class="viewd"></div>
  </div>
</template>

<script>
export default {
  name: 'Message',
  props: {
    text: String,
    isMine: Boolean,
    date: Date,
    hour: String,
  },
};
</script>

<style scoped>
.message {
  max-width: 50%;
  padding: 20px;
  background: #eee;
  margin: 20px 20px 0px;
  border-radius: 10px;
  font-size: 14px;
  position: relative;

  align-self: flex-start;
}

.message.mine {
  align-self: flex-end;
}

.text {
  margin-right: 40px;
}

.hour {
  position: absolute;
  bottom: 7px;
  right: 7px;
  font-size: 12px;
  color: #333;
}
</style>
