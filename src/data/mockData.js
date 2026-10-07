export const categorias = [
    {id: 1, nombre:"Tóner"},
    {id: 2, nombre:"Cartucho"},
    {id: 3, nombre:"Mouse"},
    {id: 4, nombre:"Teclado"},
    {id: 5, nombre:"Cable"}
]

export const impresoras = [
    {id: 1, marca:"Ricoh", modelo:"M320F", ubicacion:"Contaduria", tipo:"Láser", activo:true, foto:"https://pe-media.hptiendaenlinea.com/catalog/product/cache/b3b166914d87ce343d4dc5ec5117b502/C/F/CF226A-1_T1679073255.png"},
    {id: 2, marca:"Ricoh", modelo:"M430", ubicacion:"Juzgado de faltas 1", tipo:"Láser", activo:true},
    {id: 3, marca:"HP", modelo:"1102", ubicacion:"Obras públicas", tipo:"Láser", activo:true},
    {id: 4, marca:"HP", modelo:"M605", ubicacion:"Prensa", tipo:"Láser", activo:true},
    {id: 5, marca:"Samsung", modelo:"M2020", ubicacion:"Notificaciones", tipo:"Láser", activo:true}
]

export const compatibilidades = [
    {impresora_id: 1, articulo_id:  1},
    {impresora_id: 2, articulo_id:  1},
    {impresora_id: 3, articulo_id:  1},
    {impresora_id: 4, articulo_id:  5},
    {impresora_id: 5, articulo_id:  5},
]

export const articulos = [
    {id: 1, nombre:"Toner HP 26A", categoria_id: 1, stock_actual: 2, stock_minimo: 3, activo:true},
    {id: 2, nombre:"Teclado usb", categoria_id: 4 , stock_actual: 26, stock_minimo: 3, activo:true},
    {id: 3, nombre:"Mouse usb", categoria_id: 3, stock_actual: 23, stock_minimo: 3, activo:true},
    {id: 4, nombre:"Cable HDMI 2mts", categoria_id: 5, stock_actual: 7, stock_minimo: 3, activo:true},
    {id: 5, nombre:"Toner 258A", categoria_id: 1, stock_actual: 11, stock_minimo: 3, activo:true},
]

export const movimientos = [
    {id: 1, articulo_id: 2, tipo:"salida", cantidad:1, destino:"Contaduría", fecha: 2026-9-29},
    {id: 2, articulo_id: 4, tipo:"entrada", cantidad:10, destino:"Informática", fecha: 2026-9-28},
    {id: 3, articulo_id: 3, tipo:"salida", cantidad:1, destino:"Prensa", fecha: 2026-9-27},
    {id: 4, articulo_id: 1, tipo:"salida", cantidad:1, destino:"Omic", fecha:2026-9-26 }
]