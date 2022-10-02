import Express, { json } from "express";
import handlebars from "express-handlebars";
import apiRouter from "./router/products.router.js";
import http from "http";
import fs from "fs";
import Contenedor from "./api/container.js";
import { Server as Socket } from "socket.io";
import moment from "moment";

const app = Express();
const server = http.Server(app);
const port = 8080;
const Container = new Contenedor();

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use("/api/productos", apiRouter);
app.use(Express.static("public"));

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

// Websocket ----------------------------------------------------------------------------

const io = new Socket(server);
const route = `./chat${moment().format("DD-MM-YYYY")}.txt`;

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
