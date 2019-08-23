const express = require('express');
const router = express.Router();
const auth = require('./../middleware/auth');
const User = require('./../models/User');
const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
    check,
    validationResult
} = require('express-validator');

// @route GET api/auth
router.get('/', auth, async(req,res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err){
        console.error(err.message);
        res.status(500).send('Server error')
    }
});

// @route POST api/auth
router.post('/', [
    check('email', 'Suministre un email valido').isEmail(),
    check('password','Se necesita la contraseña').exists({
        min:6
    })
],
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const {
        email, password
    } = req.body;

    try {
        let user = await User.findOne({
            email
        });

        if(!user){
            res.status(400).json({
                errors: [{
                    msg: 'Credenciales inválidas'
                }]
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.status(400).json({
                errors: [{
                    msg: 'Credenciales inválidas'
                }]
            })
        }

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
            (err, token) => {
                if(err) throw err;
                res.json({
                    token
                });
            }
        );
    }
        catch(err){
            console.error(err.message);
            res.status(500).send('Error de servidor')
        }
    
});


module.exports = router;