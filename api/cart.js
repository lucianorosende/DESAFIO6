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
        let fsData = await fs.promises.readFile(route, "utf-8");
        let cart = JSON.parse(fsData);
        let data = {
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
    getCartByID(id) {
        let findCart = this.cart.find((c) => c.id == id);
        if (findCart === undefined) return null;
        return findCart;
    }
    deleteCart(id) {
        let filter = this.cart.filter((c) => c.id != id);
        this.cart = filter;
        return this.cart;
    }
    async saveProductInCart(cID, pID) {
        let dataCart = this.getCartByID(cID);
        let dataProduct = await this.products.getById(pID);
        if (!dataProduct || !dataCart) {
            return null;
        } else {
            dataCart.productos.push(dataProduct);
            return dataCart;
        }
    }
    deleteProductInCart(cID, pID) {
        let dataCart = this.getCartByID(cID);
        if (!dataCart) {
            return null;
        } else {
            let newData = dataCart.productos.filter((p) => p.id != pID);
            dataCart.productos = newData;
            return dataCart;
        }
    }
}
export default Cart;
