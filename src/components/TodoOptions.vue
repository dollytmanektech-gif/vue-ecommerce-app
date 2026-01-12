<template>
  <div class="app">
    <h1>TODO – Options API</h1>

    <input v-model="newTodo" placeholder="Enter task" />
    <button @click="addTodo">Add</button>

    <p>Pending tasks: {{ pendingCount }}</p>

    <ul>
      <li v-for="(todo, index) in todos" :key="index">
        <input type="checkbox" v-model="todo.completed" />

        <!-- View mode -->
        <span
          v-if="!todo.isEditing"
          :class="{ done: todo.completed }"
          @dblclick="editTodo(todo)"
        >
          {{ todo.text }}
        </span>

        <!-- Edit mode -->
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

<script>
export default {
  name: "TodoOptions",
  data() {
    return {
      newTodo: "",
      todos: [],
    };
  },
  computed: {
    pendingCount() {
      return this.todos.filter((t) => !t.completed).length;
    },
  },
  methods: {
    addTodo() {
      if (!this.newTodo.trim()) return;
      this.todos.push({
        text: this.newTodo,
        completed: false,
        isEditing: false,
      });
      this.newTodo = "";
    },
    removeTodo(index) {
      this.todos.splice(index, 1);
    },
    editTodo(todo) {
      todo.isEditing = true;
    },
    saveTodo(todo) {
      todo.isEditing = false;
    },
  },
  mounted() {
    const saved = localStorage.getItem("todos-options");
    if (saved) {
      this.todos = JSON.parse(saved);
    }
  },
  watch: {
  todos: {
    handler(newTodos) {
      localStorage.setItem(
        'todos-options',
        JSON.stringify(newTodos)
      )
    },
    deep: true
  }
}
};
</script>

<style>
.done {
  text-decoration: line-through;
  color: gray;
}
</style>
