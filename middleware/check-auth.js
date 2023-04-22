const httpError = require("../models/http-error");
const jwt = require('jsonwebtoken')
const secret_key = 'secret-key';

module.exports = (req,res,next)=>{
    if(req.method === 'OPTIONS'){
        return next()
    }
    try{
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token,secret_key);
        req.userEmail = decodedToken.email;
        next();
    }catch(err){
        return  next((new httpError('Authentication failed!'), 403));
    }
}