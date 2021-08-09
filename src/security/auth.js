const jwt = require('jsonwebtoken');
const actions = require('../database/actions');
const firma = 'Firma_para_proyecto';

module.exports.generateToken = (data) => {
    return jwt.sign(data, firma);
}

module.exports.auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const tokenVerificado = jwt.verify(token, firma);
        if (tokenVerificado) {
            req.user = tokenVerificado;
            return next();
        }
    } catch (error) {
        res.json({
            error: 'El usuario que esta intentando ingresar no tiene privilegios suficientes token',
            codeError: 01
        })
    }
};

module.exports.emailValid = (req, res, next) => {
    const email = req.body.email

    if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/i.test(email)) {
        next();
    } else {
        res.status(500).json({ message: "usuario no creado, email invalido", error: email });
    }
}

module.exports.passwordValid = (req, res, next) => {
    const password = req.body.contrasena

    if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/i.test(password)) {
        next();
    } else {
        res.status(500).json({ message: "usuario no creado, contraseña invalida", error: password });
    }
}

module.exports.phoneValid = (req, res, next) => {
    const telefono = req.body.telefono
    if (/^[(]{0,1}[0-9]{1,4}[)]{0,1}[\s\./0-9]*$/i.test(telefono)) {
        next();
    } else {
        res.status(500).json({ message: "usuario no creado, telefono invalido", error: telefono });
    }
}

module.exports.rol = async (req, res, next) => {

    // console.log(req.user.userName)
    const user = {
        userName: req.user.userName
    };

    const verRol = await actions.Select(`SELECT *
        FROM usuarios 
        WHERE nombreUsuario = :userName`, user);

    // verificación 
    if (verRol && Array.isArray(verRol) && verRol.length > 0) {
        if (verRol[0].idRole == 1) {
            return next();
        }
    }

    if (verRol.error) {
        res.status(500).json({ message: "el usuario no tiene permisos de administrador", error: user });
    }

}