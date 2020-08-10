import Store from '@lesnock/simple-store'

const store = new Store()

!store.has('loggedUser') &&
  store.add('loggedUser', {
    id: 1,
    username: 'caio',
    name: 'Caio Lesnock',
    email: 'caio.dev@outlook.com',
    password: '123',
  });

store.add('currentContact', null);

export default store
