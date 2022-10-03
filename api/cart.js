import Contenedor from "./products.js";

class Cart {
    constructor() {
        this.id = 0;
        this.cart = [];
        this.products = new Contenedor();
    }
    createCart() {
        this.id++;
        let data = {
            id: this.id,
            timestamp: new Date().toLocaleDateString(),
            productos: [],
        };
        this.cart.push(data);
        return this.id;
    }
    getAllCarts() {
        return this.cart.length
            ? this.cart
            : { error: "no hay carritos cargados" };
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
    saveProductInCart(cID, pID) {
        let dataCart = this.getCartByID(cID);
        let dataProduct = this.products.getById(pID);
        if (!dataProduct || !dataCart) {
            return null;
        } else {
            dataCart.productos.push(dataProduct);
            return dataCart;
        }
    }
}
export default Cart;
