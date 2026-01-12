<template>
  <div class="app">
    <h1>TODO – Composition API</h1>

    <input v-model="newTodo" placeholder="Enter task" />
    <button @click="addTodo">Add</button>

    <p>Pending tasks: {{ pendingCount }}</p>

    <ul>
      <li v-for="(todo, index) in todos" :key="index">
        <input type="checkbox" v-model="todo.completed" />

        <span
          v-if="!todo.isEditing"
          :class="{ done: todo.completed }"
          @dblclick="editTodo(todo)"
        >
          {{ todo.text }}
        </span>

        <input
          v-else
          v-model="todo.text"
          @keyup.enter="saveTodo(todo)"
          @blur="saveTodo(todo)"
        />

        <button @click="removeTodo(index)">❌</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed,watch, onMounted } from "vue";

const newTodo = ref("");
const todos = ref([]);

onMounted(() => {
  const saved = localStorage.getItem('todos-composition')
  if (saved) {
    todos.value = JSON.parse(saved)
  }
})
watch(
  todos,
  (val) => {
    localStorage.setItem('todos-composition', JSON.stringify(val))
  },
  { deep: true }
)

function addTodo() {
  if (!newTodo.value.trim()) return;

  todos.value.push({
    text: newTodo.value,
    completed: false,
    isEditing: false,
  });

  newTodo.value = "";
}

function removeTodo(index) {
  todos.value.splice(index, 1);
}
function editTodo(todo) {
  todo.isEditing = true
}

function saveTodo(todo) {
  todo.isEditing = false
}


const pendingCount = computed(() => {
  return todos.value.filter((todo) => !todo.completed).length;
});
</script>

<style>
.done {
  text-decoration: line-through;
  color: gray;
}
</style>
