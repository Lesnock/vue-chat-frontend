import Store from '@lesnock/simple-store'

const store = new Store({
  persist: true
})

// Login
!store.has('token') && store.add('token', null);
!store.has('loggedUser') && store.add('loggedUser', null);

!store.has('currentContact') && store.add('currentContact', null);

export default store
