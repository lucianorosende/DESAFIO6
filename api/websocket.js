import fs from "fs";
import { io } from "../server.js";
import Contenedor from "./products.js";
import moment from "moment";

// Websocket ----------------------------------------------------------------------------

const messages = [];
const Container = new Contenedor();
const route = `./chat${moment().format("DD-MM-YYYY")}.txt`;

function fileExists() {
    try {
        return fs.statSync(route).isFile();
    } catch (error) {
        return false;
    }
}

const Connect = () => {
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
};

export default Connect;
