import Express from "express";
import Contenedor from "../api/products.js";
import fs from "fs";

//Router --------------------------------------------------------------------------------

const Container = new Contenedor();
const apiRouter = Express.Router();
export const route = "./productos.txt";

const isAdmin = (req, res, next) => {
    if (req.query.admin === "true") {
        next();
    } else {
        res.send({ error: "You are not allowed to access this" });
    }
};

// get Products
apiRouter.get("/", async (req, res) => {
    let PRODUCTS = await Container.getWithFs();

    PRODUCTS === undefined
        ? res.json({ error: "No products found" })
        : res.json({ PRODUCTS: PRODUCTS });
});

// get Products based off id
apiRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    let product = await Container.getById(id);
    product === null
        ? res.json({ error: "Product not found" })
        : res.json(product);
});

// add products and add id
apiRouter.post("/", isAdmin, async (req, res) => {
    let PRODUCTS = await Container.getWithFs();
    const { nombre, descripcion, codigo, foto, precio, stock } = req.body;
    if (!nombre || !descripcion || !codigo || !foto || !precio || !stock) {
        return res.send("completar todo el formulario");
    }
    if (req.body.id === undefined) {
        req.body.id = 1;
        if (PRODUCTS.length > 0) {
            req.body.id = PRODUCTS[PRODUCTS.length - 1].id + 1;
        }
    }
    req.body.timestamp = new Date().toLocaleTimeString();
    PRODUCTS.push(req.body);
    let stringify = JSON.stringify(PRODUCTS, null, 2);
    await fs.promises.writeFile(route, stringify);
    res.send("producto con id: " + req.body.id);
});

// update product based off id
apiRouter.put("/:id", isAdmin, async (req, res) => {
    const { nombre, descripcion, codigo, foto, precio, stock } = req.body;
    let producto = await Container.update(req.params.id, {
        nombre,
        descripcion,
        codigo,
        foto,
        precio,
        stock,
    });
    producto !== null
        ? res.json(producto)
        : res.json({ error: "producto no encontrado" });
});

// delete product based off id
apiRouter.delete("/:id", isAdmin, async (req, res) => {
    const result = await Container.delete(req.params.id);

    if (result === null) {
        res.send(`no hay producto con id: ${req.params.id}`);
    } else {
        res.send(result);
    }
});

export default apiRouter;
