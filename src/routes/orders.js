const express = require("express");
const router = express.Router();
const actions = require("../database/actions");
const auth = require("../security/auth");

/**
 * @swagger
 * /orders:
 *  get:
 *      tags:
 *      - Orders
 *      description: Trae todas las ordenes del sitema o db En un array
 *      parameters:
 *          - in header:
 *            name: token
 *            description: Identificador de orden
 *            schema:
 *                  type: string
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Todas las ordenes del sistema
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/Order"
 *          500:
 *              description: No se puede procesar, solicitud no encontrada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowOrder"
 */

router.get("/orders", auth.auth, auth.rol, async (req, res) => {
  const result = await actions.Select(
    `SELECT * 
    FROM ordenes`,
    {}
  );

  if (result.error) {
    res.status(500).json({
      message: "ordenes no encontradas",
      error: result.error,
      details: result.message.original,
    });
  } else {
    res.status(200).json({ messasge: "ordenes encontradas", orders: result });
  }
});

/**
 * @swagger
 * /order/:id:
 *  get:
 *      tags:
 *      - Orders
 *      description: Trae una orden del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de la orden
 *            schema:
 *                  type: string
 *          - in: path
 *            name: id
 *            description: Identificador unico del orden
 *            schema:
 *                  type: string
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Orden encontrada en db
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/Order"
 *          500:
 *              description: No se puede procesar, solicitud no encontrada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowOrder"
 *          404:
 *              description: No se puede encontrar la solicitud verifica la informacion
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowOrder"
 *
 */

router.get("/order/:id", auth.auth, auth.rol, async (req, res) => {
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM ordenes 
    WHERE id = ${req.params.id}`,
    {}
  );

  // retonrna [{count : x}] ; x: numero de elementos encontrados
  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      const result = await actions.Select(
        `SELECT * FROM ordenes 
            WHERE id = :id`,
        { id: req.params.id }
      );

      if (result.error) {
        res.status(500).json({
          message: "orden no encontrada",
          error: result.error,
          details: result.message.original,
        });
      } else {
        res.status(200).json({ message: "orden encontrada", user: result[0] });
      }
    } else {
      res.status(404).json({ message: "orden no encontrada" });
    }
  } else {
    res.status(404).json({ message: "orden no encontrada" });
  }
});

/*
       Esquema de datos :
       {
           "order":{
               "tipoPago" : 1,
               "IdUser" : 22,
               "estado" : 1
           },
           "detalleOrder":[
               {"idProducto":1,"cant":7},
               {"idProducto":2,"cant":16},
               {"idProducto":4,"cant":2}
           ]
       }
   */

/**
 * @swagger
 * /order:
 *  post:
 *      tags:
 *      - Orders
 *      description: Crea una Orden en sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Informacion de la orden crada en el sistema
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion con la cual se creara la orden
 *            schema:
 *                  $ref: "#/components/schemas/Order"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Orden Creada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/Order"
 *          500:
 *              description: Error en la solicitud verifica la informacion
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowOrder"
 */

router.post("/order", auth.auth, async (req, res) => {
  const reqComplete = req.body;
  const orderInfoInic = reqComplete.order; // tipoPago, IdUser, estado
  const detallesOrderInfo = reqComplete.detalleOrder; // idOrden, idProducto, cant

  console.log(orderInfoInic.IdUser);

  // 1. verificar que el 'id' exista
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${orderInfoInic.IdUser}`,
    {}
  );

  // retonrna [{count : x}] ; x: numero de elementos encontrados
  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 0) {
      res.status(404).json({ message: "usuario no encontrado" });
    }
  }

  // const result = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: orderInfoInic.idUser });

  // if (result.error) {
  //     res.status(404).json({ message: "Id de usuario no encontrado", error: result.error, details: result.message.original })
  // }

  // 2. el estado inicial es 1 (nuevo)
  const orderInfo = { estado: 1, ...orderInfoInic };

  // se genera la orden
  const resultOrderInsert = await actions.Insert(
    `INSERT INTO ordenes
    (hora, tipoPago, IdUser, estado)
    VALUES(NOW(), :tipoPago, :IdUser, :estado)`,
    orderInfo
  );

  // resultOrderInsert retorna un array [ id, cantObjetoInsertados]
  const idOrden = resultOrderInsert[0];

  // se detalla la orden con los productos
  for (const detalleOrder of detallesOrderInfo) {
    await actions.Insert(
      `INSERT INTO detallesordenes
        (idOrden, idProducto, cant)
        VALUE(:idOrden, :idProducto, :cant)`,
      { idOrden: idOrden, ...detalleOrder }
    );
  }

  // se construye la estructura de nombre/precio de la tabla detallesordenes
  const resultQueryName = await actions.Select(
    `
    SELECT SUM(do.cant*p.valor) as total,
    GROUP_CONCAT(do.cant, "x", p.nombre, " ") as name 
    FROM detallesordenes do
    INNER JOIN producto p ON (p.id = do.idProducto)
    WHERE do.idOrden = :idOrder;`,
    { idOrder: idOrden }
  );

  console.log(resultQueryName); // arreglo con objeto que contiene la info de la tabla seleccionada : name/total

  // se actuliza la orden
  const resultOrderUpdate = await actions.Update(
    `UPDATE ordenes
    SET nombre = :nombre, total = :total 
    WHERE id = :idOrden`,
    {
      idOrden: idOrden,
      nombre: resultQueryName[0].name,
      total: resultQueryName[0].total,
    }
  );

  if (resultOrderUpdate.error) {
    res.status(500).json({
      message: "no se pudo actualizar la orden",
      error: resultOrderUpdate,
    });
  } else {
    res
      .status(200)
      .json({ message: "acción exitosa", order: resultOrderUpdate });
  }
});

/**
 * @swagger
 * /order/:id:
 *  patch:
 *      tags:
 *      - Orders
 *      description: Actualiza una Orden en el sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de la orden
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion de la orden a actualizar
 *            schema:
 *                  $ref: "#/components/schemas/Order"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Orden Actualizada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/Order"
 *          500:
 *              description: La Solicitud no pudo completar verifica la informacion proporcionada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowOrder"
 *          404:
 *              description: Id de la orden no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowOrder"
 */

router.patch("/order/:id", auth.auth, auth.rol, async (req, res) => {
  const nuevoEstado = req.body;
  const idOrder = req.params.id;

  if (!nuevoEstado.estado) {
    res.status(500).json({
      message:
        "no se encuentra la propiedad ESTADO, ésta es la unica que se puede actualizar",
      error: true,
    });
  }

  const order = await actions.Select(
    `SELECT COUNT(*) as count
    FROM ordenes
    WHERE id = :id`,
    { id: idOrder }
  );

  if (order && Array.isArray(order) && order.length > 0) {
    if (order[0].count == 1) {
      let result = await acionts.Update(
        `UPDATE ordenes
            SET estado = :estado
            WHERE id = :id`,
        { id: id, estado: nuevoEstado.estado }
      );

      if (result.error) {
        res.status(500).json({
          message: "El estado de la orden no puedo ser actualizado",
          error: result.error,
          details: result.message.original,
        });
      } else {
        res.status(200).json({
          message: "El estado de la orden ha sido actualizado",
          orderId: idOrder,
          newState: nuevoEstado.estado,
        });
      }
    }
  } else {
    res.status(500).json({ message: "id de orden no encontrado" });
  }
});

/**
 * @swagger
 * /order/:id:
 *  delete:
 *      tags:
 *      - Orders
 *      description: Elimina la orden del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de la orden a eliminar
 *            schema:
 *                  type: string
 *          - in: body
 *            description: Informacion del orden a eliminar
 *            schema:
 *                  $ref: "#/components/schemas/Order"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Orden eliminado con éxito
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/Order"
 *          500:
 *              description: Revisar la informacion ingresada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowOrder"
 *          404:
 *              description: Revisar la informacion ingresada no se encontro la orden
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowOrder"
 */

router.delete("/order/:id", auth.auth, auth.rol, async (req, res) => {
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count 
    FROM ordenes
    WHERE id = :id`,
    { id: req.params.id }
  );

  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      let detOrden = await actions.Delete(
        `DELETE 
            FROM detallesordenes
            WHERE idOrden =  :idOrden`,
        { idOrden: req.params.id }
      );

      if (detOrden) {
        res.status(500).json({
          message: "La orden no pudo ser eliminada con éxito",
          error: true,
        });
      }

      let delOrden = await actions.Delete(
        `DELETE FROM ordenes WHERE id = :id`,
        { id: req.params.id }
      );

      if (!delOrden) {
        res.status(200).json({
          message: "orden y detalles eliminadas con éxito",
          error: true,
          idOrden: req.params.id,
        });
      } else {
        res
          .status(500)
          .json({ message: "id de orden no encontrado", error: false });
      }
    } else {
      res.status(404).json("orden no encontrada");
    }
  } else {
    res.status(404).json("orden no encontrada");
  }
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *      Order:
 *        type: object
 *        properties:
 *          id:
 *              type: integer
 *              description: id producto
 *              example: 1
 *          nombre:
 *              type: string
 *              description: Nombre del producto
 *              example: 'hamburger'
 *          hora:
 *              type: time
 *              description: Hora en la que se realiza la orden
 *              example: '10:00:25 '
 *          total:
 *              type: double
 *              description: valor total de la orden realizada
 *              example: '100000'
 *          tipoPago:
 *              type: tinyint
 *              description: Medio de pago para completar el pago de la orden
 *              example: '1'
 *          IdUser:
 *              type: integer
 *              description: Id del usuario que realiza la orden
 *              example: '5'
 *          estado:
 *              type: integer
 *              description: Estado de la orden realizada
 *              example: '5'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *      unknowOrder:
 *        type: object
 *        properties:
 *          informacion:
 *              type: string
 *              description: La orden no se a encuentrado
 *              example: 'La orden no se a encuentra en db verifica la informacion '
 *
 */
