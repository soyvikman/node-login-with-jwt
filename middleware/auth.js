const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req,res,next){
    //Tomar el token del header
    const token = req.header('x-auth-token');

    //Checkear si no hay token
    if(!token){
        return res.status(401).json({
            msg: 'No hay token, autorización denegada.'
        })
    }

    //Verificar token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    } catch(err){
        res.status(401).json({
            msg: 'Token no valido.'
        })
    }
}