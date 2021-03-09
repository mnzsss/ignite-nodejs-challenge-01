const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((fUser) => fUser.username === username);

  if (!userExists) {
    return response.status(400).json({ error: 'User not found.' });
  }

  request.user = userExists;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;


  const userExists = users.some((fUser) => fUser.username === username);

  if (userExists) {
    return response.status(400).send({ error: 'User already exists.' });
  }

  const user = {
    id: v4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const newTodo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;
  const { title, deadline } = request.body;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: 'Todo not exists.' });
  }

  const updatedTodo = {
    ...findTodo,
    title,
    deadline: new Date(deadline),
  };

  user.todos = user.todos.map((todo) => todo.id === id && updatedTodo);

  return response.json(updatedTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: 'Todo not exists.' });
  }

  const updatedTodo = {
    ...findTodo,
    done: true,
  };


  user.todos = user.todos.map((todo) => todo.id === id && updatedTodo);

  return response.json(updatedTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({ error: 'Todo not exists.' });
  }

  user.todos = user.todos.filter((todo) => todo.id !== findTodo.id);

  return response.status(204).send();
});

module.exports = app;
