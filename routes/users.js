const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const {
    check, validationResult
} = require('express-validator');

const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const User = require('./../models/User');

//@route POST api/users

router.post('/', [
    check('name', 'El nombre es requerido.').not().isEmpty(),
    check('password', 'Por favor introduzca una contraseña con 6 o más caracteres').isLength({
        min: 6
    })
],
async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        name, email, password 
    } = req.body;

    //Ver si existe el usuario
    try{
        let user = await User.findOne({
            email
        })
        if(user){
            res.status(400).json({
                errors: [{
                    msg: 'El usuario existe'
                }]
            })
        }

    //Sacar el avatar de gravatar
    const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
    })


    //Nuevo usuario
    user = new User({
        name,
        email,
        avatar,
        password
    })

    //Encriptar contraseña
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt)

    await user.save();

    //Retornar jsonwebtoken
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(
        payload,
        config.get('jwtSecret'), {
            expiresIn: 360000
        },
        (err, token)=>{
            if(err)throw err;
            res.json({
                token
            });
        }
    );
    } catch(err){
        console.error(err.message);
        res.status(500).send('Error en el servidor')
    }

    
})

module.exports = router;