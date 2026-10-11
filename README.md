# Semilla

Tienda de mixes saludables. El cliente ve el stock del lote, arma el carrito y paga. Al confirmar, esas bolsas dejan de estar disponibles.

Este corte es la vidriera: catálogo, ficha, carrito y pago. Recetas, producción y compras a proveedores quedan para después. El catálogo ya trae el stock inicial de cada mix.

## Cómo correrla

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run lint
```

## Pago de prueba

No hay cargo real. En el checkout:

- `4242 4242 4242 4242` confirma el pedido y descuenta stock.
- `4000 0000 0000 0002` la rechaza el banco y el stock no cambia.

Cualquier otra tarjeta con número válido y vencimiento vigente también confirma.

## Stock

El stock vive en un archivo fuera del proyecto (`/tmp/semilla-store.json`) para que cada venta no reinicie el servidor de desarrollo. Si el archivo no existe, se crea con el stock inicial del catálogo.

Para usar otra carpeta:

```bash
SEMILLA_DATA_DIR=./data npm run dev
```

Esa carpeta no debería estar dentro de lo que observa Next, o el servidor se va a reiniciar en cada pedido.
