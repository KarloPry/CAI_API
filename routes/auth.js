const express = require('express');
const users = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const secret_key = 'secret-key';
//Crear usuario
users.post('/signup', async (req,res,next)=>{
    try{
        let queryEmail = await db.query(`SELECT user_email FROM users WHERE user_email = "${req.body.email}"`);
        console.log(queryEmail.length)
        if(queryEmail.length>=1){
            return res.status(422).json({code:422, message: 'Una cuenta con este correo ya existe'});
        }
        let query = `INSERT INTO users( user_name, user_email, user_password) VALUES ("${req.body.name}","${req.body.email}","${jwt.sign(req.body.password, secret_key)}")`
        const request = await db.query(query);
        return res.status(201).json({code:201, message: 'Todo cool', data: request});
    }catch(err){
        console.log(err);
        return res.status(422).json({code:422, message: 'Error en la request, intente otra vez'})
    }
})
//Inicio de sesion
users.post('/login', async (req,res,next)=>{
    try{
        let query_password = await db.query(`SELECT user_password FROM users WHERE user_email = "${req.body.email}"`);
        const hashedPass = jwt.sign(req.body.password, secret_key);
        if(hashedPass==query_password[0].user_password){
            return res.status(201).json({code:201, message:'Autorizado', valid: 'true'});
        }
        else {
            return res.status(422).json({code:422, message:'No Autorizado', valid: 'false'});
        }
    } catch(err){
        console.log(err);
        return res.status(500).json({code:500, message: "Hubo un error con el servidor"});
    }
})

module.exports =  users;