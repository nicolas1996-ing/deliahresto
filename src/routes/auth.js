const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

router.post('/login', async (req, res) => {
    const params = req.body;
    const user = {
        userName: params.userName,
        password: params.password
    };
    const result = await actions.Select(`SELECT COUNT(*) as count 
    FROM usuarios
    WHERE nombreUsuario = :userName AND contrasena = :password`, user);

    const userInfo = await actions.Select(`SELECT *
    FROM usuarios
    WHERE nombreUsuario = :userName AND contrasena = :password`, user)

    // console.log(userInfo)

    if (result && Array.isArray(result) && result.length > 0) {
        if (result[0].count == 1) {
            res.status(200).json({ message: "acceso concedido", token: auth.generateToken({ userName: userInfo.nombreUsuario, id: userInfo.idRole }) });
        } else {
            res.status(404).json('Usuario no encontrado');
        }
    } else {
        res.status(404).json('Usuario no encontrado');
    }
});

module.exports = router;