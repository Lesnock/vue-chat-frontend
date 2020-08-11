import Vue from 'vue'
import VueRouter from 'vue-router'
import VueToastify from 'vue-toastify'
import router from './router'
import App from './App.vue'

// Plugins
Vue.use(VueRouter)
Vue.use(VueToastify, {
  position: 'top-right'
})

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
