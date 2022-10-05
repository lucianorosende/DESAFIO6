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
            await fs.promises.writeFile(route, JSON.stringify([]));
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
            await fs.promises.writeFile(route, JSON.stringify([]));
            return null;
        }
    }
    async update(id, obj) {
        let newData = await this.getWithFs();
        newData = JSON.parse(JSON.stringify(newData));
        let index = newData.findIndex((product) => product.id == id);
        if (index >= 0) {
            newData.splice(index, 1, { ...obj, id: parseInt(id) });
            await fs.promises.writeFile(
                route,
                JSON.stringify(newData, null, 2)
            );
            return newData[index];
        } else {
            return null;
        }
    }
    async delete(id) {
        let newData = await this.getWithFs();
        const getItem = await this.getById(id);
        let filter = newData.filter((product) => product.id != id);
        if (getItem === null) {
            return null;
        }
        await fs.promises.writeFile(route, JSON.stringify(filter, null, 2));
        return filter;
    }
}

export default Contenedor;
