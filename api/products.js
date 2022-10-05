import fs from "fs";
import { route } from "../router/products.router.js";

function fileExists() {
    try {
        return fs.statSync(route).isFile();
    } catch (error) {
        return false;
    }
}

class Contenedor {
    static products = [];

    getAll() {
        return Contenedor.products;
    }
    async getWithFs() {
        if (fileExists()) {
            let content = await fs.promises.readFile(route, "utf-8");
            content = JSON.parse(content);
            return content;
        } else {
            return null;
        }
    }
    async getById(num) {
        if (fileExists()) {
            let data = await fs.promises.readFile(route, "utf-8");
            data = JSON.parse(data);
            let findProduct = data.find((product) => product.id == num);
            if (findProduct === undefined) return null;
            return findProduct;
        } else {
            return null;
        }
    }
    update(id, obj) {
        let newData = this.getAll();
        let index = newData.findIndex((product) => product.id == id);
        if (index >= 0) {
            newData.splice(index, 1, { ...obj, id: parseInt(id) });
            Contenedor.products = newData;
            return obj;
        } else {
            return null;
        }
    }
    delete(id) {
        const getItem = this.getById(id);
        let filter = Contenedor.products.filter((product) => product.id != id);
        Contenedor.products = filter;
        if (getItem === null) {
            return null;
        }
        return Contenedor.products;
    }
}

export default Contenedor;
