const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const connectDB = require('./config/db');

//Conectando a la base de datos
connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'))

app.listen(PORT, ()=>{
    console.log(`Aplicación CoffeWork corriendo en ${PORT}` )
})