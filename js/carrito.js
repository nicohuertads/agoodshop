/**
 * Clase Carrito
 * Guarda la información de los productos y realiza los cálculos.
 * No conoce el HTML ni interactúa con el DOM.
 */ 
class Carrito {
  /**
   * @param {Array<{SKU: string, title: string, price: string|number}>} productos
   * @param {string} moneda
   */
  constructor(productos = [], moneda = "€") {
    this.moneda = moneda;
    // Map: sku -> { sku, title, price, quantity }
    this.productos = new Map();

    productos.forEach((p) => {
      this.productos.set(p.SKU, {
        sku: p.SKU,
        title: p.title,
        price: parseFloat(p.price),
        quantity: 0,
      });
    });
  }

  /** Redondea a 2 decimales evitando errores de coma flotante. */
  static redondear(numero) {
    return Math.round((numero + Number.EPSILON) * 100) / 100;
  }

  /**
   * Actualiza el número de unidades que se quieren comprar de un producto.
   * Las unidades nunca pueden ser negativas ni decimales.
   * @returns {number} las unidades finales del producto
   */
  actualizarUnidades(sku, unidades) {
    const producto = this.productos.get(sku);
    if (!producto) {
      throw new Error(`El producto con SKU ${sku} no existe`);
    }
    const n = Math.floor(Number(unidades));
    producto.quantity = Number.isFinite(n) && n > 0 ? n : 0;
    return producto.quantity;
  }

  /**
   * Devuelve los datos de un producto además de las unidades seleccionadas.
   */
  obtenerInformacionProducto(sku) {
    const producto = this.productos.get(sku);
    if (!producto) {
      return null;
    }
    return {
      sku: producto.sku,
      title: producto.title,
      price: producto.price,
      quantity: producto.quantity,
      total: Carrito.redondear(producto.price * producto.quantity),
    };
  }

  /**
   * Devuelve los productos añadidos al carrito (unidades > 0)
   * junto con el total calculado.
   */
  obtenerCarrito() {
    const products = [];
    let total = 0;

    this.productos.forEach((_, sku) => {
      const info = this.obtenerInformacionProducto(sku);
      if (info.quantity > 0) {
        products.push(info);
        total += info.total;
      }
    });

    return {
      total: Carrito.redondear(total).toFixed(2),
      currency: this.moneda,
      products,
    };
  }
}
