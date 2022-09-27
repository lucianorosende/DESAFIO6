import Express from "express";
import handlebars from "express-handlebars";
import Contenedor from "./api/container.js";
import http from "http";
import { Server as Socket } from "socket.io";

const app = Express();
const server = http.Server(app);
const io = new Socket(server);

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
const port = 8080;

// Handlebars engine
app.engine(
    "hbs",
    handlebars({
        extname: ".hbs",
        defaultLayout: "index.hbs",
    })
);
app.set("view engine", "hbs");
app.set("views", "./views-hbs");

// Levanta el server -----------------------------------------------------------------
const srv = server.listen(port, () => {
    console.log(`server up on ${srv.address().port}`);
});
srv.on("error", (err) => console.log("server error: " + err));

app.use(Express.static("public"));

export let products = [];
const Container = new Contenedor();

// Websocket ----------------------------------------------------------------------------

io.on("connection", (socket) => {
    console.log("new connection");
    socket.emit("products", Container.getAll());

    socket.on("update", (data) => {
        if ((data = "ok")) {
            io.sockets.emit("products", Container.getAll());
        }
    });
});

//Router --------------------------------------------------------------------------------
const apiRouter = Express.Router();

// get Products
apiRouter.get("/productos/listar", (req, res) => {
    let PRODUCTS = Container.getAll();

    !products.length
        ? res.json({ error: "No products found" })
        : res.json(PRODUCTS);
});

// get Products based off id
apiRouter.get("/productos/listar/:id", (req, res) => {
    const { id } = req.params;
    let product = Container.getById(id);
    res.json(product);
});

// add products and add id
apiRouter.post("/productos/guardar", (req, res) => {
    const { title, price, thumbnail } = req.body;
    if (!title || !price || !thumbnail) {
        return res.send("completar todo el formulario");
    }
    if (req.body.id === undefined) {
        req.body.id = 1;
        if (products.length > 0) {
            let findId = products.find((p) => p.id === products.length).id;
            req.body.id = findId + 1;
        }
    }

    products.push(req.body);
    // res.send("producto con id: " + req.body.id);
    res.redirect("/api/productos/vista");
});

// update product based off id
apiRouter.put("/productos/actualizar/:id", (req, res) => {
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
apiRouter.delete("/productos/borrar/:id", (req, res) => {
    const result = Container.delete(req.params.id);

    if (result === null) {
        res.send(`no hay producto con id: ${req.params.id}`);
    } else {
        products = result;
        res.send(products);
    }
});

apiRouter.get("/productos/vista", (req, res) => {
    let prods = Container.getAll();

    res.render("vista", {
        productos: prods,
        hayProductos: prods.length,
    });
});

app.use("/api", apiRouter);
