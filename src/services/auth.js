import api from './api'
import store from './store';

export function checkToken() {
  return new Promise(resolve => {
    if (!store.get('token')) {
      resolve(false)
    }

    api.get('/check-token')
      .then(() => resolve(true))
      .catch(error => {
        if (error.message === 'Token inválido') {
          resolve(false)
        }
      })
  })
}

export async function publicPage() {
  const isAuthenticated = await checkToken();

  if (isAuthenticated) {
    location.href = '/chat'
  }
}

export async function privatePage() {
  if (! await checkToken()) {
    location.href = '/'
  }
}
