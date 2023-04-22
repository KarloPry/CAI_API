//Dependencias
const express = require('express');
const app = express();
//Middleware
const cors = require('./middleware/cors');
const notFound = require('./middleware/notFound');
//Routes
const auth = require('./routes/auth');
const docs = require('./routes/docs');
//App Logic
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
//App routes
app.use('/api/auth', auth);
app.use('/api/docs', docs);

app.use(notFound);
app.listen(process.env.PORT || 5000, ()=>{
    console.log('API working!');
})