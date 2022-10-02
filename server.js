import Express, { json } from "express";
import handlebars from "express-handlebars";
import Contenedor from "./api/container.js";
import http from "http";
import { Server as Socket } from "socket.io";
import fs from "fs";
import moment from "moment";

const route = `./chat${moment().format("DD-MM-YYYY")}.txt`;
const app = Express();
const server = http.Server(app);
const io = new Socket(server);

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
const port = 8080;

// Handlebars engine ------------------------------------------------------------------
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

// Websocket ----------------------------------------------------------------------------

const messages = [];

function fileExists() {
    try {
        return fs.statSync(route).isFile();
    } catch (error) {
        return false;
    }
}

io.on("connection", async (socket) => {
    let content;
    console.log("new connection");
    socket.emit("products", Container.getAll());
    socket.on("update", (data) => {
        if ((data = "ok")) {
            io.sockets.emit("products", Container.getAll());
        }
    });

    if (fileExists()) {
        content = await fs.promises.readFile(route, "utf-8");
        socket.emit("messages", JSON.parse(content));
    } else {
        await fs.promises.writeFile(route, JSON.stringify(messages));
        content = await fs.promises.readFile(route, "utf-8");
        socket.emit("messages", JSON.parse(content));
    }

    socket.on("newMsg", async (data) => {
        content = await fs.promises.readFile(route, "utf-8");
        const contentParse = JSON.parse(content);
        contentParse.push(data);
        let JSONobj = JSON.stringify(contentParse, null, 2);
        await fs.promises.writeFile(route, JSONobj);
        content = await fs.promises.readFile(route, "utf-8");
        io.sockets.emit("messages", JSON.parse(content));
    });
});

//Router --------------------------------------------------------------------------------

export let products = [];
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

    !products.length
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
    const { title, price, thumbnail } = req.body;
    if (!title || !price || !thumbnail) {
        return res.send("completar todo el formulario");
    }
    if (req.body.id === undefined) {
        req.body.id = 1;
        if (products.length > 0) {
            let findId = products.find((p) => p.id == products.length).id;
            req.body.id = findId + 1;
        }
    }

    products.push(req.body);
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
        products = result;
        res.send(products);
    }
});

app.use("/api/productos", apiRouter);
