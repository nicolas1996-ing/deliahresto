const express = require("express");
const auth = require("../security/auth");
const actions = require("../database/actions");
const { response } = require("express");

const router = express.Router();

// obtener lista de usuarios
/**
 * @swagger
 * /users:
 *  get:
 *      tags:
 *      - Users
 *      description: Trae todos los usuarios del sitema o db
 *      parameters:
 *          - in header:
 *            name: token
 *            description: Identificador de usuario
 *            schema:
 *                  type: string
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Todos los usuarios del sistema
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/User"
 *          500:
 *              description: No se puede procesar, solicitud no encontrada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowuser"
 */

router.get("/users", auth.auth, auth.rol, async (req, res) => {
  // retorna un arreglo de objetos
  const result = await actions.Select("SELECT * FROM usuarios", {});

  if (result.error) {
    res.status(500).json({
      message: "usuarios no encontrados",
      error: result.error,
      details: result.message.original,
    });
  } else {
    res.status(200).json({ messasge: "usuarios encontrados", users: result });
  }
});

// obtener usuario por Id

/**
 * @swagger
 * /user/:id:
 *  get:
 *      tags:
 *      - Users
 *      description: Trae un usuario del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de usuario
 *            schema:
 *                  type: string
 *          - in: path
 *            name: id
 *            description: Identificador unico del usuario
 *            schema:
 *                  type: string
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: usuario encontrado db
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/User"
 *          500:
 *              description: No se puede procesar, solicitud no encontrada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowuser"
 *
 */
router.get("/user/:id", auth.auth, auth.rol, async (req, res) => {
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${req.params.id}`,
    {}
  );

  // retonrna [{count : x}] ; x: numero de elementos encontrados

  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      const result = await actions.Select(
        "SELECT * FROM usuarios WHERE id = :id",
        { id: req.params.id }
      );

      if (result.error) {
        res.status(500).json({
          message: "Solicitud no encontrado",
          error: result.error,
          details: result.message.original,
        });
      } else {
        res
          .status(200)
          .json({ message: "Usuarios encontrados", user: result[0] });
      }
    } else {
      res.status(404).json({ message: "Solicitud no encontrada" });
    }
  } else {
    res.status(404).json({ message: "Solicitud no encontrada" });
  }
});

// registrar nuevo usuario

/**
 * @swagger
 * /user:
 *  post:
 *      tags:
 *      - Users
 *      description: trae todos los usuarios del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de usuario
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del usuario
 *            schema:
 *                  $ref: "#/components/schemas/User"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Usuario Creado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/User"
 *          500:
 *              description: Error creando usuario
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowuser"
 */
router.post(
  "/user",
  auth.auth,
  auth.rol,
  auth.emailValid,
  auth.phoneValid,
  auth.passwordValid,
  async (req, res) => {
    const user = { ...req.body, idRole: 2 };
    console.log(req.body.idRole ? true : false);

    if (req.body.idRole) {
      res.status(500).json({
        message: "datos invalidos - no puede asignar un idRol",
        error: user,
      });
    } else {
      let result;
      user.nombreUsuario = user.nombreUsuario.toLowerCase();
      result = await actions.Insert(
        `INSERT INTO usuarios (nombreUsuario, nombreCompleto, email, telefono, direccion, contrasena, idRole) 
        VALUES (:nombreUsuario, :nombreCompleto, :email, :telefono, :direccion, :contrasena, :idRole)`,
        user
      );

      if (result.error) {
        res.status(500).json({
          message: "el usuario no ha sido creado",
          error: result.error,
          details: result.message.original,
          user: user,
        });
      } else {
        res.status(200).json({
          message: "usuario fue creado con éxito",
          result: result[0],
          user: user,
        });
      }
    }
  }
);

// modificar un usuario
/**
 * @swagger
 * /user/:id:
 *  put:
 *      tags:
 *      - Users
 *      description: Actualiza un usuario del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de usuario
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del usuario a actualizar
 *            schema:
 *                  $ref: "#/components/schemas/User"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Usuario Actualizado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/User"
 *
 */
router.put("/user/:id", auth.auth, auth.rol, async (req, res) => {
  const user = req.body;
  const id = req.params.id;

  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${req.params.id}`,
    {}
  );

  // verificar existencia de usuario
  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      if (
        user.nombreUsuario &&
        user.nombreCompleto &&
        user.email &&
        user.direccion &&
        user.contrasena &&
        user.telefono &&
        user.idRole
      ) {
        if (!phoneValid(user.telefono)) {
          res.status(500).json({ message: "telefono invalido", error: user });
        }

        if (!passwordValid(user.contrasena)) {
          res.status(500).json({ message: "contraseña invalida", error: user });
        }

        let result;
        result = await actions.Update(
          `UPDATE usuarios 
                SET nombreUsuario = :nombreUsuario, nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena, idRole = :idRole
                WHERE id = ${id}`,
          user
        );

        if (result.error) {
          res.status(500).json({
            message: "el usuario no ha sido actualizado",
            error: result.error,
            details: result.message.original,
            user: user,
          });
        } else {
          res.status(200).json({
            message: "usuario fue modificado con éxito",
            result: result,
            user: user,
          });
        }
      } else {
        res.status(500).json({
          message: "faltan datos por actualizar",
          error: true,
          user: user,
        });
      }
    } else {
      res.status(404).json({ message: "usuario no encontrado" });
    }
  } else {
    res.status(404).json({ message: "usuario no encontrado" });
  }
});

// modificar parcialmente un usuario

/**
 * @swagger
 * /user/:id:
 *  patch:
 *      tags:
 *      - Users
 *      description: Actualiza un usuario del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de usuario
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del usuario a actualizar
 *            schema:
 *                  $ref: "#/components/schemas/User"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Usuario Actualizado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/User"
 *          500:
 *              description: todos los usuarios del sistema
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowuser"
 */
router.patch("/user/:id", auth.auth, auth.rol, async (req, res) => {
  const newData = req.body;
  const id = req.params.id;
  const oldData = await actions.Select(
    `SELECT * FROM usuarios WHERE id = :id`,
    { id: req.params.id }
  );
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${req.params.id}`,
    {}
  );

  // verificar existencia de usuario
  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      // verificar propiedad a modificar
      if (newData.telefono) {
        if (phoneValid(newData.telefono)) {
          console.log(phoneValid(newData.telefono));
          oldData[0].telefono = newData.telefono
            ? newData.telefono
            : oldData[0].telefono;
        } else {
          res
            .status(500)
            .json({ message: "telefono invalido", error: newData });
        }
      }

      if (newData.contrasena) {
        if (passwordValid(newData.contrasena)) {
          oldData[0].contrasena = newData.contrasena
            ? newData.contrasena
            : oldData[0].contrasena;
        } else {
          res
            .status(500)
            .json({ message: "contraseña invalida", error: newData });
        }
      }

      // actulizar propiedades
      oldData[0].nombreUsuario = newData.nombreUsuario
        ? newData.nombreUsuario
        : oldData[0].nombreUsuario;
      oldData[0].nombreCompleto = newData.nombreCompleto
        ? newData.nombreCompleto
        : oldData[0].nombreCompleto;
      oldData[0].email = newData.email ? newData.email : oldData[0].email;
      oldData[0].direccion = newData.direccion
        ? newData.direccion
        : oldData[0].direccion;
      oldData[0].idRole = newData.idRole ? newData.idRole : oldData[0].idRole;

      let result;
      result = await actions.Update(
        `UPDATE usuarios 
                SET nombreUsuario = :nombreUsuario, nombreCompleto = :nombreCompleto, email = :email, telefono = :telefono, direccion = :direccion, contrasena = :contrasena, idRole = :idRole
                WHERE id = ${id}`,
        oldData[0]
      );

      if (result.error) {
        res.status(500).json({
          message: "el usuario no ha sido actualizado",
          error: result.error,
          details: result.message.original,
          user: oldData,
        });
      } else {
        res.status(200).json({
          message: "usuario fue modificado con éxito",
          result: result,
          user: oldData,
        });
      }
    } else {
      res.status(404).json({ message: "usuario no encontrado" });
    }
  } else {
    res.status(404).json({ message: "usuario no encontrado" });
  }
});

// eliminar un usuario

/**
 * @swagger
 * /user/:id:
 *  delete:
 *      tags:
 *      - Users
 *      description: Elimina un usuario del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de usuario
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del usuario a eliminar
 *            schema:
 *                  $ref: "#/components/schemas/User"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: usuario eliminado con éxito
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/User"
 *          500:
 *              description: Revisar la informacion ingresada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowuser"
 *          404:
 *              description: Revisar la informacion ingresada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowuser"
 */
router.delete("/user/:id", auth.auth, auth.rol, async (req, res) => {
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count 
    FROM usuarios
    WHERE id = :id`,
    { id: req.params.id }
  );

  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      let result = await actions.Delete(`DELETE FROM usuarios WHERE id = :id`, {
        id: req.params.id,
      });

      if (!result) {
        res.status(200).json({
          message: "usuario eliminado con éxito",
          result: result,
          userId: req.params.id,
        });
      } else {
        res.status(500).json({
          message: "usuario no encontrado",
          error: result.error,
          details: result.message.original,
          userId: req.params.id,
        });
      }
    } else {
      res.status(404).json("usuario no encontrado");
    }
  } else {
    res.status(404).json("usuario no encontrado");
  }
});

function passwordValid(password) {
  if (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/i.test(password)) {
    return true;
  } else {
    return false;
  }
}

function phoneValid(phone) {
  if (/^[(]{0,1}[0-9]{1,4}[)]{0,1}[\s\./0-9]*$/i.test(phone)) {
    return true;
  } else {
    return false;
  }
}

module.exports = router;

// 317 642 0045 José Zapata
/**
 * @swagger
 * components:
 *   schemas:
 *      User:
 *        type: object
 *        properties:
 *          id:
 *              type: integer
 *              description: id usuario
 *              example: 1
 *          nombreUsuario:
 *              type: string
 *              description: Nombre de usuario, Nota no es el nombre completo
 *              example: 'Luis_23'
 *          nombreCompleto:
 *              type: string
 *              description: Nombre completo usuario
 *              example: 'Luis ernesto alvarez sevilla'
 *          email:
 *              type: string
 *              description: email usuario
 *              example: 'luis_erne@gmail.com'
 *          telefono:
 *              type: string
 *              description: telefono usuario
 *              example: '3233278193'
 *          ireccion:
 *              type: string
 *              description: direccion usuario
 *              example: 'carrera 10 30b12'
 *          contrasena:
 *              type: string
 *              description: direccion usuario
 *              example: '123456789Q@'
 *          idRole:
 *              type: integer
 *              description: idRole usuario
 *              example: '1'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *      unknowuser:
 *        type: object
 *        properties:
 *          informacion:
 *              type: string
 *              description: El usuario no se a encuentra
 *              example: 'El usuario no se a encuentra en db verifica la informacion '
 *
 */
