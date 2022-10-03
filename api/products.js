class Contenedor {
    static products = [];

    getAll() {
        return Contenedor.products;
    }
    getById(num) {
        let findProduct = Contenedor.products.find(
            (product) => product.id == num
        );
        if (findProduct === undefined) return null;
        return findProduct;
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
