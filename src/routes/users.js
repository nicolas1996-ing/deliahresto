const express = require('express');
const auth = require('../security/auth');
const actions = require('../database/actions');
const { response } = require('express');

const router = express.Router();

// obtener lista de usuarios 
router.get('/users', auth.auth, auth.rol, async (req, res) => {
    // retorna un arreglo de objetos
    const result = await actions.Select('SELECT * FROM usuarios', {});

    if (result.error) {
        res.status(500).json({ message: "usuarios no encontrados", error: result.error, details: result.message.original });
    } else {
        res.status(200).json({ messasge: "usuarios encontrados", users: result });
    }

});

// obtener usuario por Id 
router.get('/user/:id', auth.auth, auth.rol, async (req, res) => {

    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${req.params.id}`, {});

    // retonrna [{count : x}] ; x: numero de elementos encontrados 

    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {
            const result = await actions.Select('SELECT * FROM usuarios WHERE id = :id', { id: req.params.id });

            if (result.error) {
                res.status(500).json({ message: "usuario no encontrado", error: result.error, details: result.message.original });
            } else {
                res.status(200).json({ message: "usuario encontrado", user: result[0] });
            }
        } else {
            res.status(404).json({ message: "usuario no encontrado" });
        }
    } else {
        res.status(404).json({ message: "usuario no encontrado" });
    }
});

// registrar nuevo usuario 
router.post('/user', auth.auth, auth.rol, auth.emailValid, auth.phoneValid, auth.passwordValid, async (req, res) => {
    const user = { ...req.body, idRole: 2 };
    console.log(req.body.idRole ? true : false)

    if (req.body.idRole) {
        res.status(500).json({ message: "datos invalidos - no puede asignar un idRol", error: user });
    } else {
        let result;
        user.nombreUsuario = user.nombreUsuario?.toLowerCase();
        result = await actions.Insert(`INSERT INTO usuarios (nombreUsuario, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
        VALUES (:nombreUsuario, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`, user);

        if (result.error) {
            res.status(500).json({ message: "el usuario no ha sido creado", error: result.error, details: result.message.original, user: user });
        } else {
            res.status(201).json({ message: "usuario fue creado con éxito", result: result[0], user: user });
        }
    }

});


// modificar parcialmente un usuario 
router.patch('/user/:id', auth.auth, auth.rol, async (req, res) => {
    const newData = req.body
    const id = req.params.id
    const oldData = await actions.Select(`SELECT * FROM usuarios WHERE id = :id`, { id: req.params.id })
    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${req.params.id}`, {});

    // verificar existencia de usuario 
    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {
            // verificar propiedad a modificar 
            if (newData.telefono) {
                if (phoneValid(newData.telefono)) {
                    console.log(phoneValid(newData.telefono))
                    oldData[0].telefono = newData.telefono ? newData.telefono : oldData[0].telefono
                } else {
                    res.status(500).json({ message: "telefono invalido", error: newData })
                }
            }

            if (newData.contrasena) {
                if (passwordValid(newData.contrasena)) {
                    oldData[0].contrasena = newData.contrasena ? newData.contrasena : oldData[0].contrasena
                } else {
                    res.status(500).json({ message: "contraseña invalida", error: newData })
                }
            }

            // actulizar propiedades 
            oldData[0].nombreUsuario = newData.nombreUsuario ? newData.nombreUsuario : oldData[0].nombreUsuario
            oldData[0].nombreCompleto = newData.nombreCompleto ? newData.nombreCompleto : oldData[0].nombreCompleto
            oldData[0].email = newData.email ? newData.email : oldData[0].email
            oldData[0].direccion = newData.direccion ? newData.direccion : oldData[0].direccion
            oldData[0].idRole = newData.idRole ? newData.idRole : oldData[0].idRole


            let result;
            result = await actions.Update(`UPDATE usuarios 
                SET nombreUsuario = :nombreUsuario, nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena, idRole = :idRole
                WHERE id = ${id}`, oldData[0])

            if (result.error) {
                res.status(500).json({ message: "el usuario no ha sido actualizado", error: result.error, details: result.message.original, user: oldData });
            } else {
                res.status(200).json({ message: "usuario fue modificado con éxito", result: result, user: oldData });
            }
        } else {
            res.status(404).json({ message: "usuario no encontrado" });
        }
    } else {
        res.status(404).json({ message: "usuario no encontrado" });
    }
});

// modificar un usuario 
router.put('/user/:id', auth.auth, auth.rol, async (req, res) => {
    const user = req.body;
    const id = req.params.id

    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${req.params.id}`, {});

    // verificar existencia de usuario 
    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {

            if (user.nombreUsuario && user.nombreCompleto && user.email && user.direccion && user.contrasena && user.telefono && user.idRole) {

                if (!phoneValid(user.telefono)) {
                    res.status(500).json({ message: "telefono invalido", error: user })
                }

                if (!passwordValid(user.contrasena)) {
                    res.status(500).json({ message: "contraseña invalida", error: user })
                }

                let result;
                result = await actions.Update(`UPDATE usuarios 
                SET nombreUsuario = :nombreUsuario, nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena, idRole = :idRole
                WHERE id = ${id}`, user)

                if (result.error) {
                    res.status(500).json({ message: "el usuario no ha sido actualizado", error: result.error, details: result.message.original, user: user });
                } else {
                    res.status(200).json({ message: "usuario fue modificado con éxito", result: result, user: user });
                }

            } else {
                res.status(500).json({ message: "faltan datos por actualizar", error: true, user: user })
            }

        } else {
            res.status(404).json({ message: "usuario no encontrado" });
        }
    } else {
        res.status(404).json({ message: "usuario no encontrado" });
    }
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
                res.status(200).json({ message: "usuario eliminado con éxito", result: result, userId: req.params.id })
            } else {
                res.status(500).json({ message: "usuario no encontrado", error: result.error, details: result.message.original, userId: req.params.id });
            }

        } else {
            res.status(404).json('usuario no encontrado');
        }
    } else {
        res.status(404).json('usuario no encontrado');
    }

});


function passwordValid(password) {
    if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/i.test(password)) {
        return true
    } else {
        return false
    }
}

function phoneValid(phone) {

    if (/^[(]{0,1}[0-9]{1,4}[)]{0,1}[\s\./0-9]*$/i.test(phone)) {
        return true
    } else {
        return false
    }
}


module.exports = router;

// 317 642 0045 José Zapata 