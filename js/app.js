  
const API_URL = "https://jsonblob.com/01a1796a-cc95-7b87-a928-3e5526e49c21/json";
// Si la API falla, se usa el mismo JSON incluido en el proyecto.
const FALLBACK_URL = "./productos.json";

let carrito;

const $listado = document.getElementById("listado-productos");
const $resumen = document.getElementById("resumen-lineas");
const $total = document.getElementById("total");
const $error = document.getElementById("mensaje-error");

const formatear = (numero, moneda) => `${Number(numero).toFixed(2)}${moneda}`;

async function obtenerProductos() {
  for (const url of [API_URL, FALLBACK_URL]) {
    try {
      const respuesta = await fetch(url);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      return await respuesta.json();
    } catch (error) {
      console.warn(`No se pudo cargar ${url}:`, error.message);
    }
  }
  throw new Error("No se pudieron cargar los productos");
}

/** Crea las filas del listado de productos en el DOM. */
function pintarProductos(productos, moneda) {
  $listado.innerHTML = "";

  productos.forEach((p) => {
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.dataset.sku = p.SKU;
    fila.innerHTML = `
      <div class="col-producto">
        <h3>${p.title}</h3>
        <span class="ref">REF: ${p.SKU}</span>
      </div>
      <div class="col-cantidad">
        <button type="button" class="btn-menos" aria-label="Quitar una unidad de ${p.title}">-</button>
        <input type="number" min="0" step="1" value="0" aria-label="Unidades de ${p.title}">
        <button type="button" class="btn-mas" aria-label="Añadir una unidad de ${p.title}">+</button>
      </div>
      <div class="col-precio">${formatear(p.price, moneda)}</div>
      <div class="col-total">${formatear(0, moneda)}</div>
    `;

    const input = fila.querySelector("input");
    const btnMenos = fila.querySelector(".btn-menos");
    const btnMas = fila.querySelector(".btn-mas");

    btnMenos.addEventListener("click", () => cambiarUnidades(p.SKU, Number(input.value) - 1));
    btnMas.addEventListener("click", () => cambiarUnidades(p.SKU, Number(input.value) + 1));
    // "input": se actualiza mientras escribes (y con las flechas del campo).
    input.addEventListener("input", () => cambiarUnidades(p.SKU, input.value, false));
    // "change": al salir del campo se normaliza el valor mostrado.
    input.addEventListener("change", () => cambiarUnidades(p.SKU, input.value));

    $listado.appendChild(fila);
  });
}

function cambiarUnidades(sku, unidades, reescribirInput = true) {
  carrito.actualizarUnidades(sku, unidades);
  actualizarVista(reescribirInput ? null : sku);
}

/** Actualiza filas, resumen y TOTAL a partir de los datos del carrito. */
function actualizarVista(skuSinReescribir = null) {
  const datos = carrito.obtenerCarrito();
  const moneda = datos.currency;

  $listado.querySelectorAll(".fila").forEach((fila) => {
    const info = carrito.obtenerInformacionProducto(fila.dataset.sku);
    // No se reescribe el campo que el usuario está tecleando.
    if (fila.dataset.sku !== skuSinReescribir) {
      fila.querySelector("input").value = info.quantity;
    }
    fila.querySelector(".btn-menos").disabled = info.quantity === 0;
    fila.querySelector(".col-total").textContent = formatear(info.total, moneda);
  });

  $resumen.innerHTML = "";
  datos.products.forEach((p) => {
    const linea = document.createElement("div");
    linea.className = "linea-resumen";
    linea.innerHTML = `<span>${p.quantity} x ${p.title}</span><span>${formatear(p.total, moneda)}</span>`;
    $resumen.appendChild(linea);
  });

  $total.textContent = formatear(datos.total, moneda);
}

async function iniciar() {
  try {
    const datos = await obtenerProductos();
    carrito = new Carrito(datos.products, datos.currency);
    pintarProductos(datos.products, datos.currency);
    actualizarVista();
  } catch (error) {
    $error.hidden = false;
    $error.textContent = "No se han podido cargar los productos. Inténtalo de nuevo más tarde.";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", iniciar);
