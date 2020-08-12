import io from 'socket.io-client'
import store from './store'

const socket = io('http://localhost:3000')

socket.on('connect', () => {
  if (store.get('loggedUser')) {
    socket.emit('user-id', store.get('loggedUser').id)
  }
})

export default socket
