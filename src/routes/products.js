const express = require("express");
const router = express.Router();
const auth = require("../security/auth");
const actions = require("../database/actions");

/**
 * @swagger
 * /products:
 *  get:
 *      tags:
 *      - Products
 *      description: Trae todos los productos del sitema o db
 *      parameters:
 *          - in header:
 *            name: token
 *            description: Identificador de producto
 *            schema:
 *                  type: string
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Todos los Productos del sistema
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/products"
 *          500:
 *              description: No se puede procesar, solicitud no encontrada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowproduct"
 */

router.get("/products", auth.auth, async (req, res) => {
  const result = await actions.Select("SELECT * FROM producto", {});

  if (result.error) {
    res.status(500).json({
      message: "productos no encontrados",
      error: result.error,
      details: result.message.original,
    });
  } else {
    res
      .status(200)
      .json({ message: "productos encontrados", products: result });
  }
});

/**
 * @swagger
 * /product/:id:
 *  get:
 *      tags:
 *      - Products
 *      description: Trae un Producto del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de Producto
 *            schema:
 *                  type: string
 *          - in: path
 *            name: id
 *            description: Identificador unico del Producto
 *            schema:
 *                  type: string
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Producto encontrado db
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/products"
 *          500:
 *              description: No se puede procesar, solicitud no encontrada
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowproduc"
 *
 */
router.get("/product/:id", auth.auth, async (req, res) => {
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`,
    {}
  );

  // retonrna [{count : x}] ; x: numero de elementos encontrados

  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      const result = await actions.Select(
        "SELECT * FROM producto WHERE id = :id",
        { id: req.params.id }
      );

      if (result.error) {
        res.status(500).json({
          message: "producto no encontrado",
          error: result.error,
          details: result.message.original,
        });
      } else {
        res
          .status(200)
          .json({ message: "prodcuto encontrado", product: result });
      }
    } else {
      res.status(404).json({ message: "Id de producto no encontrado" });
    }
  } else {
    res.status(404).json({ message: "Id de producto no encontrado" });
  }
});

/**
 * @swagger
 * /product:
 *  post:
 *      tags:
 *      - Products
 *      description: Crea un los Producto en sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de Producto
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del Producto
 *            schema:
 *                  $ref: "#/components/schemas/products"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Producto Creado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/products"
 *          500:
 *              description: Error en la solicitud verifica la informacion
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowproduct"
 */

router.post("/product", auth.auth, auth.rol, async (req, res) => {
  const product = req.body;
  product.nombre = product.nombre.toLowerCase();

  const result = await actions.Insert(
    `INSERT INTO producto (nombre, valor, foto)
        VALUES (:nombre, :valor, :foto)`,
    product
  );

  if (result.error) {
    res.status(500).json({
      message: "error al crear producto",
      error: result.error,
      details: result.message.original,
    });
  } else {
    res
      .status(200)
      .json({ message: "prodcuto creado con éxito", result: result });
  }
});

// modifica todo el registro
/**
 * @swagger
 * /product/:id:
 *  put:
 *      tags:
 *      - Products
 *      description: Actualiza un Product del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de Product
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del Producto a actualizar
 *            schema:
 *                  $ref: "#/components/schemas/products"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Producto Actualizado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/products"
 *          500:
 *              description: El producto no pudo ser actualizado, faltan propiedades
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowProduct"
 *          404:
 *              description: Id de producto no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowProduct"
 */
router.put("/product/:id", auth.auth, auth.rol, async (req, res) => {
  const newProduct = req.body;
  const id = req.params.id;
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`,
    {}
  );

  // verificar existencia de usuario
  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      const result = await actions.Update(
        `UPDATE producto 
                SET nombre = :nombre, valor = :valor, foto = :foto 
                WHERE id = ${id}`,
        newProduct
      );

      if (result.error) {
        res.status(500).json({
          message: "el producto no pudo ser actualizado, faltan propiedades",
          error: result.error,
          details: result.message.original,
          product: newProduct,
        });
      } else {
        res.status(200).json({
          message: "prodcuto actualizado con éxito",
          result: result,
          product: newProduct,
        });
      }
    } else {
      res.status(404).json({ message: "Id de producto no encontrado" });
    }
  } else {
    res.status(404).json({ message: "Id de producto no encontrado" });
  }
});

// modifica parcialmente un registro
/**
 * @swagger
 * /product/:id:
 *  patch:
 *      tags:
 *      - Products
 *      description: Actualiza un Producto del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de Producto
 *            schema:
 *                  type: string
 *          - in: body
 *            description: informacion del Producto a actualizar
 *            schema:
 *                  $ref: "#/components/schemas/products"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Producto Actualizado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/products"
 *          500:
 *              description: El producto no pudo ser actualizado
 *              content:
 *                  application/json:
 *                      schema:
 *                         type: "array"
 *                         items:
 *                            $ref: "#/components/schemas/unknowProduct"
 *          404:
 *              description: Id de producto no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowProduct"
 */

router.patch("/product/:id", auth.auth, auth.rol, async (req, res) => {
  const newProduct = req.body;
  const id = req.params.id;

  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`,
    {}
  );

  // verificar existencia de usuario
  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      let oldProduct = await actions.Select(
        `SELECT * FROM producto 
            WHERE id = ${id}`,
        {}
      );

      // oldProduct retorna 'error' u array de objetos [{}]

      if (oldProduct.error) {
        res.status(500).json({
          message: "id de producto no encontrado",
          error: oldProduct.error,
          details: oldProduct.message.original,
          idProduct: id,
        });
      }

      oldProduct[0].nombre = newProduct.nombre
        ? newProduct.nombre
        : oldProduct[0].nombre;
      oldProduct[0].valor = newProduct.valor
        ? newProduct.valor
        : oldProduct[0].valor;
      oldProduct[0].foto = newProduct.foto
        ? newProduct.foto
        : oldProduct[0].foto;

      const result = await actions.Update(
        `UPDATE producto 
            SET nombre = :nombre, valor = :valor, foto = :foto 
            WHERE id = :id`,
        oldProduct[0]
      );

      console.log(result);

      if (result.error) {
        res.status(500).json({
          message: "el producto no pudo ser actualizado",
          error: result.error,
          details: result.message.original,
          product: oldProduct,
        });
      } else {
        res.status(200).json({
          message: "prodcuto actualizado con éxito",
          result: result,
          product: oldProduct,
        });
      }
    } else {
      res.status(404).json({ message: "Id producto no encontrado" });
    }
  } else {
    res.status(404).json({ message: "Id producto no encontrado" });
  }
});

/**
 * @swagger
 * /product/:id:
 *  delete:
 *      tags:
 *      - Products
 *      description: Elimina un Producto del sitema o db
 *      parameters:
 *          - in: header
 *            name: token
 *            description: Identificador de Producto
 *            schema:
 *                  type: string
 *          - in: body
 *            description: Informacion del Product a eliminar
 *            schema:
 *                  $ref: "#/components/schemas/products"
 *      produces:
 *          - aplication/json
 *      responses:
 *          200:
 *              description: Producto eliminado con éxito
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/products"
 *          500:
 *              description: Revisar la informacion ingresada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowProduct"
 *          404:
 *              description: Revisar la informacion ingresada
 *              content:
 *                  application/json:
 *                      schema:
 *                         $ref: "#/components/schemas/unknowProduct"
 */

router.delete("/product/:id", auth.auth, auth.rol, async (req, res) => {
  const verificar = await actions.Select(
    `SELECT COUNT(*) as count
    FROM producto 
    WHERE id = ${req.params.id}`,
    {}
  );

  if (verificar && Array.isArray(verificar) && verificar.length > 0) {
    if (verificar[0].count == 1) {
      const result = await actions.Delete(
        `DELETE FROM producto
            WHERE id = :id`,
        { id: req.params.id }
      );

      // result retorna 'undefined'

      if (!result) {
        res.status(200).json({
          message: "producto eliminado con éxito",
          idProduct: req.params.id,
        });
      } else {
        res.status(500).json({
          message: "el producto no pudo ser eliminado",
          error: result.error,
          details: result.message.original,
        });
      }
    } else {
      res.status(404).json({
        message: "id producto no encontrado ",
        error: verificar.error,
        details: verificar.message,
      });
    }
  } else {
    res.status(404).json({
      message: "id producto no encontrado ",
      error: verificar.error,
      details: verificar.message,
    });
  }
});
module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *      products:
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
 *          valor:
 *              type: integer
 *              description: Valor En Pesos Del Producto
 *              example: '10000'
 *          foto:
 *              type: string
 *              description: Foto Procuto
 *              example: 'homburger.jpg'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *      unknowProduct:
 *        type: object
 *        properties:
 *          informacion:
 *              type: string
 *              description: El Producto no se a encuentrado
 *              example: 'El Producto no se a encuentra en db verifica la informacion '
 *
 */
