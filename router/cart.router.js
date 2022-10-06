import Express from "express";
import Cart from "../api/cart.js";
import fs from "fs";

const CartClass = new Cart();
const CartRouter = Express.Router();
export const route = "./cart.txt";

CartRouter.get("/", async (req, res) => {
    let getCarts = await CartClass.getAllCarts();
    getCarts === undefined
        ? res.send("No hay carritos para cargar")
        : res.send(await CartClass.getAllCarts());
});

CartRouter.get("/:id", (req, res) => {
    let getCart = CartClass.getCartByID(req.params.id);
    getCart === null
        ? res.send(`No hay ningun carrito con id ${req.params.id}`)
        : res.send(getCart);
});

CartRouter.get("/:id/productos", (req, res) => {
    let newCart = CartClass.getCartByID(req.params.id);
    newCart === null
        ? res.send(`No hay ningun carrito con id ${req.params.id}`)
        : res.send(newCart.productos);
});

CartRouter.post("/", async (req, res) => {
    let newCart = await CartClass.createCart();
    res.send(`carrito creado con id ${newCart}`);
});

CartRouter.post("/:id/productos/:idPrd", async (req, res) => {
    let saveProduct = await CartClass.saveProductInCart(
        req.params.id,
        req.params.idPrd
    );
    await fs.promises.writeFile(
        route,
        JSON.stringify(CartClass.getAllCarts(), null, 2)
    );
    saveProduct === null
        ? res.send("no hay productos para agregar")
        : res.send(saveProduct);
});

CartRouter.delete("/:id", async (req, res) => {
    let getID = CartClass.getCartByID(req.params.id);
    let newCarts = CartClass.deleteCart(req.params.id);
    await fs.promises.writeFile(route, JSON.stringify(newCarts, null, 2));
    getID === null
        ? res.send(`No hay ningun carrito con id ${req.params.id}`)
        : res.send(newCarts);
});

CartRouter.delete("/:id/productos/:idPrd", async (req, res) => {
    let deleteProduct = CartClass.deleteProductInCart(
        req.params.id,
        req.params.idPrd
    );
    await fs.promises.writeFile(
        route,
        JSON.stringify(CartClass.getAllCarts(), null, 2)
    );
    deleteProduct === null
        ? res.send("no hay productos para eliminar")
        : res.send(deleteProduct);
});

export default CartRouter;
