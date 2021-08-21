const express = require('express');
const router = express.Router();
const auth = require('../security/auth');
const actions = require('../database/actions');


router.get('/products', auth.auth, async (req, res) => {
    const result = await actions.Select('SELECT * FROM producto', {});

    if (result.error) {
        res.status(500).json({ message: "productos no encontrados", error: result.error, details: result.message.original });
    } else {
        res.status(200).json({ message: "productos encontrados", products: result });
    }


});

router.get('/product/:id', auth.auth, async (req, res) => {

    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`, {});

    // retonrna [{count : x}] ; x: numero de elementos encontrados 

    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {

            const result = await actions.Select('SELECT * FROM producto WHERE id = :id', { id: req.params.id });

            if (result.error) {
                res.status(500).json({ message: "producto no encontrado", error: result.error, details: result.message.original });
            } else {
                res.status(200).json({ message: "prodcuto encontrado", product: result });
            }
        } else {
            res.status(404).json({ message: "Id de producto no encontrado" });
        }
    } else {
        res.status(404).json({ message: "Id de producto no encontrado" });
    }

});

router.post('/product', auth.auth, auth.rol, async (req, res) => {
    const product = req.body;
    product.nombre = product.nombre.toLowerCase();

    const result = await actions.Insert(`INSERT INTO producto (nombre, valor, foto)
        VALUES (:nombre, :valor, :foto)`, product)

    if (result.error) {
        res.status(500).json({ message: "error al crear producto", error: result.error, details: result.message.original })
    } else {
        res.status(200).json({ message: "prodcuto creado con éxito", result: result });
    }

});

// modifica todo el registro 
router.put('/product/:id', auth.auth, auth.rol, async (req, res) => {
    const newProduct = req.body;
    const id = req.params.id;
    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`, {});

    // verificar existencia de usuario 
    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {

            const result = await actions.Update(`UPDATE producto 
                SET nombre = :nombre, valor = :valor, foto = :foto 
                WHERE id = ${id}`, newProduct);

            if (result.error) {
                res.status(500).json({ message: "el producto no pudo ser actualizado, faltan propiedades", error: result.error, details: result.message.original, product: newProduct })
            } else {
                res.status(200).json({ message: "prodcuto actualizado con éxito", result: result, product: newProduct });
            }

        } else {
            res.status(404).json({ message: "Id de producto no encontrado" });
        }
    } else {
        res.status(404).json({ message: "Id de producto no encontrado" });
    }
});

// modifica parcialmente un registro 
router.patch('/product/:id', auth.auth, auth.rol, async (req, res) => {
    const newProduct = req.body;
    const id = req.params.id;

    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`, {});

    // verificar existencia de usuario 
    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {
            let oldProduct = await actions.Select(`SELECT * FROM producto 
            WHERE id = ${id}`, {});

            // oldProduct retorna 'error' u array de objetos [{}]

            if (oldProduct.error) {
                res.status(500).json({ message: "id de producto no encontrado", error: oldProduct.error, details: oldProduct.message.original, idProduct: id })
            }

            oldProduct[0].nombre = newProduct.nombre ? newProduct.nombre : oldProduct[0].nombre;
            oldProduct[0].valor = newProduct.valor ? newProduct.valor : oldProduct[0].valor;
            oldProduct[0].foto = newProduct.foto ? newProduct.foto : oldProduct[0].foto;

            const result = await actions.Update(`UPDATE producto 
            SET nombre = :nombre, valor = :valor, foto = :foto 
            WHERE id = :id`, oldProduct[0]);

            console.log(result)

            if (result.error) {
                res.status(500).json({ message: "el producto no pudo ser actualizado", error: result.error, details: result.message.original, product: oldProduct })
            } else {
                res.status(200).json({ message: "prodcuto actualizado con éxito", result: result, product: oldProduct });
            }

        } else {
            res.status(404).json({ message: "Id producto no encontrado" });
        }
    } else {
        res.status(404).json({ message: "Id producto no encontrado" });
    }



});


router.delete('/product/:id', auth.auth, auth.rol, async (req, res) => {
    const verificar = await actions.Select(`SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`, {})

    if (verificar && Array.isArray(verificar) && verificar.length > 0) {
        if (verificar[0].count == 1) {
            const result = await actions.Delete(`DELETE FROM producto
            WHERE id = :id`, { id: req.params.id })

            // result retorna 'undefined' 

            if (!result) {
                res.status(200).json({ message: "producto eliminado con éxito", idProduct: req.params.id });
            } else {
                res.status(500).json({ message: "el producto no pudo ser eliminado", error: result.error, details: result.message.original });
            }

        } else {
            res.status(404).json({ message: "id producto no encontrado ", error: verificar.error, details: verificar.message })
        }
    } else {
        res.status(404).json({ message: "id producto no encontrado ", error: verificar.error, details: verificar.message })
    }

});
module.exports = router;