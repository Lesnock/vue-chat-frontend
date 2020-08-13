import store from '../services/store'

export default function authMiddleware() {
  if (!store.get('loggedUser') || !store.get('token')) {
    location.href = '/';
  }
}
