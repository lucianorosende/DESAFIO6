import Express from "express";
import Contenedor from "../api/container.js";

//Router --------------------------------------------------------------------------------

const Container = new Contenedor();
const apiRouter = Express.Router();

const isAdmin = (req, res, next) => {
    if (req.query.admin === "true") {
        next();
    } else {
        res.send({ error: "You are not allowed to access this" });
    }
};

// get Products
apiRouter.get("/", (req, res) => {
    let PRODUCTS = Container.getAll();

    !PRODUCTS.length
        ? res.json({ error: "No products found" })
        : res.json(PRODUCTS);
});

// get Products based off id
apiRouter.get("/:id", (req, res) => {
    const { id } = req.params;
    let product = Container.getById(id);
    res.json(product);
});

// add products and add id
apiRouter.post("/", isAdmin, (req, res) => {
    let PRODUCTS = Container.getAll();
    const { title, price, thumbnail } = req.body;
    if (!title || !price || !thumbnail) {
        return res.send("completar todo el formulario");
    }
    if (req.body.id === undefined) {
        req.body.id = 1;
        if (PRODUCTS.length > 0) {
            let findId = PRODUCTS.find((p) => p.id === PRODUCTS.length).id;

            req.body.id = findId + 1;
        }
    }

    PRODUCTS.push(req.body);
    res.send("producto con id: " + req.body.id);
});

// update product based off id
apiRouter.put("/:id", isAdmin, (req, res) => {
    let { title, price, thumbnail } = req.body;
    let producto = Container.update(req.params.id, {
        title,
        price,
        thumbnail,
    });

    producto
        ? res.json(producto)
        : res.json({ error: "producto no encontrado" });
});

// delete product based off id
apiRouter.delete("/:id", isAdmin, (req, res) => {
    const result = Container.delete(req.params.id);

    if (result === null) {
        res.send(`no hay producto con id: ${req.params.id}`);
    } else {
        res.send(result);
    }
});

export default apiRouter;
