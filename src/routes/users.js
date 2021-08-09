const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');

const router = express.Router();

// obtener lista de usuarios 
router.get('/users', auth.auth, auth.rol, async (req, res) => {
    const result = await actions.Select('SELECT * FROM usuarios', {});
    res.json(result);
});

// obtener usuario por Id 
router.get('/user/:id', auth.auth, auth.rol, async (req, res) => {
    const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });

    if (result.error) {
        res.status(401).json({ message: "usuario no encontrado", error: result })
    } else {
        res.status(200).json(result);
    }
});

// registrar nuevo usuario 
router.post('/user', auth.emailValid, auth.phoneValid, auth.passwordValid, async (req, res) => {
    const user = { ...req.body, idRole: 2 };
    console.log(req.body.idRole ? true : false)

    if (req.body.idRole) {
        res.status(500).json({ message: "datos invalidos - no puede asignar un idRol", error: user });
    } else {
        let result;
        user.nombreUsuario = user.nombreUsuario.toLowerCase();
        result = await actions.Insert(`INSERT INTO usuarios (nombreUsuario, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
        VALUES (:nombreUsuario, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);

        if (result.error) {
            res.status(500).json({ message: "datos invalidos", error: user });
        } else {
            res.status(200).json({ message: "usuario fue creado con éxito", result: result });
        }
    }

});


// modificar un usuario 
router.put('/user/:id', auth.auth, auth.rol, async (req, res) => {
    const newData = req.body
    const oldData = await actions.Select(`SELECT * FROM usuarios WHERE id = :id`, { id: req.params.id })

    // verificar propiedad a modificar 
    oldData.nombreUsuario = newData.nombreUsuario ? newData.nombreUsuario : oldData.nombreUsuario

    oldData.nombreCompleto = newData.nombreCompleto ? newData.nombreCompleto : oldData.nombreCompleto

    oldData.email = newData.email ? newData.email : oldData.email

    oldData.telefono = newData.telefono ? newData.telefono : oldData.telefono

    oldData.direccion = newData.direccion ? newData.direccion : oldData.direccion

    oldData.contrasena = newData.contrasena ? newData.contrasena : oldData.contrasena

    oldData.idRole = newData.idRole ? newData.idRole : oldData.idRole

    let result;
    result = await actions.Update(`UPDATE usuarios SET (nombreUsuario = :nombreUsuario, nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena`, oldData)

    if (result.error) {
        res.status(500).json({ message: "datos invalidos", error: user });
    } else {
        res.status(200).json({ message: "usuario fue modificado con éxito", result: result });
    }

});

// modificar parcialmente un usuario 
router.patch('/user/:id', auth.auth, async (req, res) => {
    const user = req.body;
    const result = await actions.Update(`UPDATE usuarios SET email = :email WHERE id = :id`, user);
    res.json(result);
});


// eliminar un usuario 
router.delete('/user/:id', auth.auth, auth.rol, async (req, res) => {

    const verificar = await actions.Select(`SELECT COUNT(*) as count 
    FROM usuarios
    WHERE id = :id`, { id: req.params.id });

    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {

            let result = await actions.Delete(`DELETE FROM usuarios WHERE id = :id`, { id: req.params.id })

            if (!result) {
                res.status(200).json({ message: "usuario eliminado con éxito" })
            } else {
                res.status(500).json({ message: "id no encontrado" })
            }

        } else {
            res.status(404).json('usuario no encontrado');
        }
    } else {
        res.status(404).json('usuario no encontrado');
    }

});

module.exports = router;