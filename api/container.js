import { products } from "../server.js";

class Contenedor {
    constructor(products) {
        this.products = products;
    }
    save(obj) {
        for (let i = 0; i < obj.length; i++) {
            if (obj[i].id === undefined) {
                obj[i].id = i;
                products.push(obj[i]);
            }
        }
        return products;
    }
    getAll() {
        return products;
    }
    getById(num) {
        let findProduct = products.find((product) => product.id == num);
        if (findProduct === undefined)
            return `no existe ningun producto para el valor que deseas`;
        return findProduct;
    }
    update(id, obj) {
        let newData = this.getAll();
        let index = newData.findIndex((product) => product.id == id);
        if (index >= 0) {
            newData.splice(index, 1, { ...obj, id: parseInt(id) });
            this.products = newData;
            return obj;
        } else {
            return null;
        }
    }
    delete(id) {
        let newData = this.getAll();
        const getItem = this.getById(id);
        let filter = newData.filter((product) => product.id != id);

        if (getItem === "no existe ningun producto para el valor que deseas") {
            return null;
        }
        return filter;
    }
}

export default Contenedor;
