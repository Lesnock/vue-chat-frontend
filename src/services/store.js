import Store from '@lesnock/simple-store'

const store = new Store({
  persist: true
})

// Login
!store.has('token') && store.add('token', null);
!store.has('loggedUser') && store.add('loggedUser', null);

!store.has('currentContact') && store.add('currentContact', null);

!store.has('isMobile') && store.add('isMobile', window.innerWidth <= 900)

const mobileMaxWidth = 800

// Reset isMobile value
store.delete('isMobile')
store.add('isMobile', window.innerWidth <= mobileMaxWidth)

window.onresize = () => {
  store.update('isMobile', window.innerWidth <= mobileMaxWidth);
};

export default store
