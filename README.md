# Semilla

Tienda de mixes saludables. El cliente ve el stock del lote, arma el carrito y paga. Al confirmar, esas bolsas dejan de estar disponibles.

El dueño carga el catálogo desde `/admin`: nombre, precio, stock y foto. Esa dirección no está en el menú de la tienda.

## Dónde está cada cosa

Las páginas viven en `app`: `(shop)` es la tienda, `admin` es el dueño y `api` entrega el stock y las fotos. `proxy.ts` pide la sesión antes de dejar entrar a `/admin`.

La interfaz está en `components`: `ui` son las piezas (botón, campo, tarjeta), `shop` es la tienda, `admin` son los formularios del dueño, y `product` es la foto y el cartel de stock, que usan las dos pantallas.

La lógica está en `lib`, separada por tema: `auth` (clave y sesión), `catalog` (mixes de ejemplo y validación del formulario), `checkout` (reglas del pago, sin base de datos), `db` (Postgres, productos y pedidos), `media` (fotos) y `format` (precios y el texto del stock).

## Cómo correrla

npm install
npm run dev

Abrí [http://localhost:3000](http://localhost:3000).

La administración está en [http://localhost:3000/admin](http://localhost:3000/admin).

En tu máquina, si no definiste una clave, el usuario es `dueno` y la contraseña es `semilla-dev`. Para usar otra, copiá `.env.example` a `.env.local`, completá `ADMIN_PASSWORD` y `SESSION_SECRET`, y reiniciá.

npm test
npm run lint

## Pago de prueba

No hay cargo real. En el checkout:

- `4242 4242 4242 4242` confirma el pedido y descuenta stock.
- `4000 0000 0000 0002` la rechaza el banco y el stock no cambia.

Cualquier otra tarjeta con número válido y vencimiento vigente también confirma.

## Datos

La base es Postgres, embebida en el proceso (PGlite). No hay que instalar un servidor. Catálogo, stock, pedidos, la cuenta del dueño y las fotos viven en la carpeta temporal del sistema (`semilla`), fuera del proyecto, para que guardar un mix no reinicie el servidor de desarrollo.

La primera vez se cargan los ocho mixes de ejemplo. Después el dueño los edita desde `/admin`.

Para usar otra carpeta:

SEMILLA_DATA_DIR=./data npm run dev

Esa carpeta no debería estar dentro de lo que observa Next, o el servidor se va a reiniciar en cada pedido.
