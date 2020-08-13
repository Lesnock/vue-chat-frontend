import axios from 'axios'
import store from './store'

const api = axios.create({
  baseURL: 'http://10.0.2.34:3000'
})

api.interceptors.request.use(request => {
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

  if (errors[error.response.status]) {
    throw new Error(errors[error.response.status])
  }

  throw new Error('Erro não identificado')
})

export default api
