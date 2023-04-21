//Dependencias
const express = require('express');
const app = express();
//Middleware
const cors = require('./middleware/cors');
const notFound = require('./middleware/notFound');
//Routes
const users = require('./routes/auth');
//App Logic
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//App routes
app.use('/api/auth', users);

app.use(notFound);
app.listen(process.env.PORT || 5000, ()=>{
    console.log('API working!');
})