import Contenedor from "./products.js";
import fs from "fs";
import { route } from "../router/cart.router.js";

function fileExists() {
    try {
        return fs.statSync(route).isFile();
    } catch (error) {
        return false;
    }
}

class Cart {
    constructor() {
        this.cart = [];
        this.products = new Contenedor();
    }
    async createCart() {
        let cart = await this.getAllCarts();
        let data = {
            id: undefined,
            timestamp: new Date().toLocaleDateString(),
            productos: [],
        };

        if (cart.length === 0) {
            data.id = 1;
            cart.push(data);
            await fs.promises.writeFile(route, JSON.stringify(cart, null, 2));
            return data.id;
        } else {
            data.id = cart[cart.length - 1].id + 1;
            cart.push(data);
            await fs.promises.writeFile(route, JSON.stringify(cart, null, 2));
        }

        return cart[cart.length - 1].id;
    }
    async getAllCarts() {
        if (fileExists()) {
            let data = await fs.promises.readFile(route, "utf-8");
            let newCarts = JSON.parse(data);
            return newCarts;
        } else {
            await fs.promises.writeFile(route, JSON.stringify([]));
        }
    }
    async getCartByID(id) {
        let cart = await this.getAllCarts();
        let findCart = cart.find((c) => c.id == id);
        if (findCart === undefined) return null;
        return findCart;
    }
    async saveProductInCart(cID, pID) {
        let cart = await this.getAllCarts();
        let dataCart = await this.getCartByID(cID);
        let dataProduct = await this.products.getById(pID);
        let index = cart.findIndex((product) => product.id == cID);
        if (!dataProduct || !dataCart) return null;
        if (index >= 0) {
            dataCart.productos.push(dataProduct);
            cart.splice(index, 1, dataCart);

            await fs.promises.writeFile(route, JSON.stringify(cart, null, 2));
        }
        return dataCart;
    }
    async deleteCart(id) {
        let cart = await this.getAllCarts();
        let dataCart = await this.getCartByID(id);
        let filter = cart.filter((c) => c.id != id);
        if (dataCart === null) {
            return null;
        }
        await fs.promises.writeFile(route, JSON.stringify(filter, null, 2));
        return filter;
    }

    async deleteProductInCart(cID, pID) {
        let dataCart = await this.getCartByID(cID);
        let cart = await this.getAllCarts();
        let index = cart.findIndex((product) => product.id == cID);
        if (!dataCart) {
            return null;
        }
        if (dataCart.productos.length === 0) return null;
        if (index >= 0) {
            let newData = dataCart.productos.filter((p) => p.id != pID);
            dataCart.productos = newData;
            cart.splice(index, 1, dataCart);
            await fs.promises.writeFile(route, JSON.stringify(cart, null, 2));
        }

        return dataCart;
    }
}
export default Cart;
