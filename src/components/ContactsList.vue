<template>
  <div class="container">
    <ul class="list">
      <li>
        <img src="../assets/avatar.jpg" alt="Contact" />
        <span>Gabriela Lesnock</span>
      </li>

      <li>
        <img src="../assets/avatar.jpg" alt="Contact" />
        <span>John Doe</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 30vw;
  border-right: 1px solid #ccc;
}

.list {
  width: 100%;
  height: 100%;
}

.list li {
  padding: 10px;
  cursor: pointer;
  background: #fff;

  display: flex;
  align-items: center;
}

.list > li + li {
  border-top: 1px solid #ccc;
}

.list li:hover {
  background: #ccc;
  transition: background-color 0.2s;
}

.list img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
}
</style>
