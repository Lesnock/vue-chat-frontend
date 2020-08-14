import axios from 'axios'
import store from './store'

const debug = false

const api = axios.create({
  baseURL: 'http://localhost:3000',
})

api.interceptors.request.use(request => {
  if (debug) {
    console.log('api -- ', request.url)
  }

  const token = store.get('token')

  if (token) {
    request.headers.authorization = `Bearer ${token}`
  }

  return request
})

api.interceptors.response.use((response) => response, error => {
  const errors = {
    401: 'Credenciais incorretas',
    498: 'Token inválido',
    500: 'Erro interno no servidor'
  }

  if (error.response.status === 498) {
    store.update('token', null)
  }

  if (errors[error.response.status]) {
    throw new Error(errors[error.response.status])
  }

  throw new Error(error.response)
})

export default api


