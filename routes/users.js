const express = require("express");
const db = require("../config/db");
const checkAuth = require("../middleware/check-auth");
const users = express.Router();
const app = express();

app.use(checkAuth);
users.post('/contractor',async(req,res,next)=>{
    
    try{
        let query = `SELECT * FROM users WHERE user_email = '${req.body.email}'`
        const response = await db.query(query);
        const data = response[0]
        console.log(data.user_email)
        return res.status(200).json({code:200, message: 'Usuario encontrado!', data: data.user_email});
    }catch(err){
        console.log(err);
        return res.status(404).json({code: 404, message: 'Usuario no encontrado'});
    }
        

});

module.exports = users;