const express = require('express');
const router = express.Router();
const actions = require('../database/actions');
const auth = require('../security/auth');


router.get('/orders', auth.auth, auth.rol, async (req, res) => {

    const result = await actions.Select(`SELECT * 
    FROM ordenes`, {});

    if (result.error) {
        res.status(500).json({ message: "ordenes no encontradas", error: result.error, details: result.message.original });
    } else {
        res.status(200).json({ messasge: "ordenes encontradas", orders: result });
    }
});

router.get('/order/:id', auth.auth, auth.rol, async (req, res) => {

    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM ordenes 
    WHERE id = ${req.params.id}`, {});

    // retonrna [{count : x}] ; x: numero de elementos encontrados 
    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {
            const result = await actions.Select(`SELECT * FROM ordenes 
            WHERE id = :id`, { id: req.params.id });

            if (result.error) {
                res.status(500).json({ message: "orden no encontrada", error: result.error, details: result.message.original });
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

router.post('/order', auth.auth, async (req, res) => {

    const reqComplete = req.body;
    const orderInfoInic = reqComplete.order; // tipoPago, IdUser, estado
    const detallesOrderInfo = reqComplete.detalleOrder; // idOrden, idProducto, cant

    console.log(orderInfoInic.IdUser)

    // 1. verificar que el 'id' exista 
    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM usuarios 
    WHERE id = ${orderInfoInic.IdUser}`, {});

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
    const resultOrderInsert = await actions.Insert(`INSERT INTO ordenes
    (hora, tipoPago, IdUser, estado)
    VALUES(NOW(), :tipoPago, :IdUser, :estado)`, orderInfo);

    // resultOrderInsert retorna un array [ id, cantObjetoInsertados]
    const idOrden = resultOrderInsert[0];

    // se detalla la orden con los productos 
    for (const detalleOrder of detallesOrderInfo) {
        await actions.Insert(`INSERT INTO detallesordenes
        (idOrden, idProducto, cant)
        VALUE(:idOrden, :idProducto, :cant)`, { idOrden: idOrden, ...detalleOrder });
    }

    // se construye la estructura de nombre/precio de la tabla detallesordenes
    const resultQueryName = await actions.Select(`
    SELECT SUM(do.cant*p.valor) as total,
    GROUP_CONCAT(do.cant, "x", p.nombre, " ") as name 
    FROM detallesordenes do
    INNER JOIN producto p ON (p.id = do.idProducto)
    WHERE do.idOrden = :idOrder;`, { idOrder: idOrden });


    console.log(resultQueryName) // arreglo con objeto que contiene la info de la tabla seleccionada : name/total

    // se actuliza la orden 
    const resultOrderUpdate = await actions.Update(`UPDATE ordenes
    SET nombre = :nombre, total = :total 
    WHERE id = :idOrden`, { idOrden: idOrden, nombre: resultQueryName[0].name, total: resultQueryName[0].total });

    if (resultOrderUpdate.error) {
        res.status(500).json({ message: "no se pudo actualizar la orden", error: resultOrderUpdate })
    } else {
        res.status(200).json({ message: "acción exitosa", order: resultOrderUpdate })
    }


});

router.patch('/order/:id', auth.auth, auth.rol, async (req, res) => {
    const nuevoEstado = req.body;
    const idOrder = req.params.id;

    if (!nuevoEstado.estado) {
        res.status(500).json({ message: "no se encuentra la propiedad ESTADO, ésta es la unica que se puede actualizar", error: true })
    }

    const order = await actions.Select(`SELECT COUNT(*) as count
    FROM ordenes
    WHERE id = :id`, { id: idOrder });

    if (order && Array.isArray(order) && order.length > 0) {
        if (order[0].count == 1) {
            let result = await acionts.Update(`UPDATE ordenes
            SET estado = :estado
            WHERE id = :id`, { id: id, estado: nuevoEstado.estado })

            if (result.error) {
                res.status(500).json({ message: "El estado de la orden no puedo ser actualizado", error: result.error, details: result.message.original })
            } else {
                res.status(200).json({ message: "El estado de la orden ha sido actualizado", orderId: idOrder, newState: nuevoEstado.estado })
            }

        }
    } else {
        res.status(500).json({ message: "id de orden no encontrado" });
    }
});

router.delete('/order/:id', auth.auth, auth.rol, async (req, res) => {
    const verificar = await actions.Select(`SELECT COUNT(*) as count 
    FROM ordenes
    WHERE id = :id`, { id: req.params.id });

    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {

            let detOrden = await actions.Delete(`DELETE 
            FROM detallesordenes
            WHERE idOrden =  :idOrden`, { idOrden: req.params.id });

            if (detOrden) {
                res.status(500).json({ message: "La orden no pudo ser eliminada con éxito", error: true });
            }

            let delOrden = await actions.Delete(`DELETE FROM ordenes WHERE id = :id`, { id: req.params.id });

            if (!delOrden) {
                res.status(200).json({ message: "orden y detalles eliminadas con éxito", error: true, idOrden: req.params.id });
            } else {
                res.status(500).json({ message: "id de orden no encontrado", error: false });
            }

        } else {
            res.status(404).json('orden no encontrada');
        }
    } else {
        res.status(404).json('orden no encontrada');
    }

});

module.exports = router;