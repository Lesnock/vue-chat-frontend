import io from 'socket.io-client'
import store from './store'

const socket = {}

export function connectSocket() {
  socket.connection = io('http://10.0.2.34:3000')

  socket.connection.on('connect', () => {
    if (store.get('loggedUser')) {
      socket.connection.emit('user-id', store.get('loggedUser').id)
    }
  })
}

export function getSocket() {
  return socket.connection
}

export default socket
