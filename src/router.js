import VueRouter from 'vue-router'

// Components
import Login from './pages/Login.vue'
import Chat from './pages/Chat.vue'

const routes = [
  {
    path: '/',
    component: Login,
  },
  {
    path: '/chat/',
    component: Chat,
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
