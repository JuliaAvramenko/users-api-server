const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')


const users = [{
  id: 1,
  name: "Mark Fahrheit",
  profession: 'engineer',
  email: "mark@gmail.com",
  lastLogin: "12:11:08, 2 Oct, 2023",
  status: 'active',
  password: createPasswordHash("1")
},
{
  id: 2,
  name: "Mary Lasson",
  profession: 'dancer',
  email: "mary@gmail.com",
  lastLogin: "05:10:08, 4 Jun, 2023",
  status: 'blocked',
  password: createPasswordHash("2")
},
{
  id: 3,
  name: "Chris Brown",
  profession: 'economist',
  email: "brown@gmail.com",
  lastLogin: "07:01:18, 14 Jan, 2024",
  status: 'active',
  password: createPasswordHash("3")
},
{
  id: 4,
  name: "Kira Blossom",
  profession: 'designer',
  email: "kirbloss@gmail.com",
  lastLogin: "10:51:08, 17 Jan, 2024",
  status: 'active',
  password: createPasswordHash("4")
}]

const app = express()
const port = 8080
// x-form-www-urlencoded
const urlencodedParser = express.urlencoded({ extended: false });
// application/json
const jsonParser = bodyParser.json()

function createPasswordHash(fv) {
  const hash = crypto.createHash("SHA3-256")
  const finalHex = hash.update(fv).digest("hex")
  return finalHex
}
let maxId = 4

// Add headers before the routes are defined
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/users', (req, res) => {

  if (!users) {
    res.status(404).json({ error: 'Пользователи не найдены' });
  } else {
    res.status(200).json(users);
  }
})

app.put('/users/:id/block', (req, res) => {

  const { id } = req.params;
  const userIndex = users.findIndex(user => user.id === Number(id));
  if (userIndex >= 0) {
    users[userIndex].status = "blocked"

  }
  return res.send(JSON.stringify(users))
})

app.put('/users/:id/unblock', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(user => user.id === Number(id));
  if (userIndex >= 0) {
    users[userIndex].status = "active"
  }
  return res.send(JSON.stringify(users));
})

app.post("/users/create", jsonParser, (req, res) => {


  // 1. check all params in body
  if (!req.body || !req.body.name || !req.body.profession || !req.body.email || !req.body.password) {

    res.sendStatus(400)
    return
  }

  // 2. if ok, add new user to users
  const newUser = {
    id: maxId + 1,
    name: req.body.name,
    profession: req.body.profession,
    email: req.body.email,
    lastLogin: new Date(),
    password: createPasswordHash(req.body.password),
    status: "active"
  }
  maxId = maxId + 1

  users.push(newUser)

  res.json(newUser)
});



app.post("/auth", jsonParser, (req, res, next) => {

  const email = req.body.email
  const password = req.body.password

  const userIndex = users.findIndex(user => user.email === email);


  if (userIndex < 0) {
    res.sendStatus(401)
    return
  }

  if (users[userIndex].password !== createPasswordHash(password)) {
    res.sendStatus(401)
    return
  }

  res.json(users[userIndex])

});

app.get('/logout', (req, res) => {
  const email = req.query.email
  res.sendStatus(200)
})

app.delete("/users/:id/delete", (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex(user => user.id === Number(id));
  if (userIndex >= 0) {
    users.splice(userIndex, 1)
  }
  return res.send(JSON.stringify(users));
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
