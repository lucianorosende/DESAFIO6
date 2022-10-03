import Express, { json } from "express";
import handlebars from "express-handlebars";
import apiRouter from "./router/products.router.js";
import CartRouter from "./router/cart.router.js";
import http from "http";
import { Server as Socket } from "socket.io";
import Connect from "./api/websocket.js";

const app = Express();
const server = http.Server(app);
const port = 8080;

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use("/api/productos", apiRouter);
app.use("/api/carrito", CartRouter);
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

// Websocket Runtime ------------------------------------------------------------------

export const io = new Socket(server);
Connect();
