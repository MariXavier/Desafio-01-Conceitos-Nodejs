const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  //recebe username no header
  const { username } = request.headers;

  //verifica se existe
  const user = users.find(user => user.username === username);
  if(!user)
  {
    return response.status(404).json({error:"User not found"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => 
{
  const { name, username } = request.body;

  //verifica se usuário já existe
  const userAlreadyExists = users.some(user => user.username===username);
  if(userAlreadyExists)
  {
    return response.status(400).json({error:"User already exists"});
  }
  
  //cria novo usuario
  const user =
  { 
    id:uuidv4(),
    name,
    username,
    todos:[]
  }

  //guarda na memória
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const todo =
  {
    id:uuidv4(),
    title,
    done:false,
    deadline:new Date(deadline),
    created_at:new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
 
  const {title, deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  //verifica se todo existe
  const todoExists = user.todos.some(todo => todo.id === id);
  if(!todoExists)
  {
    return response.status(404).json({error:"Todo not found"});
  }

  const todo = user.todos.find(todo => todo.id === id);
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const {id} = request.params;
  const {user} = request;

  //verifica se todo existe
  const todoExists = user.todos.some(todo => todo.id === id);
  if(!todoExists)
  {
    return response.status(404).json({error:"Todo not found"});
  }

  const todo = user.todos.find(todo => todo.id === id);
  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  //verifica se todo existe
  const todoExists = user.todos.some(todo => todo.id === id);
  if(!todoExists)
  {
    return response.status(404).json({error:"Todo not found"});
  }

  const todo = user.todos.find(todo => todo.id === id);
  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;