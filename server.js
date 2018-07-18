const express = require('express');
const mongoose = require('mongoose');

// require routes
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// DB config
const db = require('./config/keys').mongoURI;

mongoose
    .connect(db)
    .then(()=>console.log('connected to mongo db'))
    .catch(err => console.log(err));

app.get('/', (req,res)=>{res.send('hello lan')});

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, ()=>{console.log(`server listenin on port: ${port}`)});