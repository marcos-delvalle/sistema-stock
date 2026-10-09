export const categorias = [
    {id: 1, nombre:"Tóner"},
    {id: 2, nombre:"Cartucho"},
    {id: 3, nombre:"Mouse"},
    {id: 4, nombre:"Teclado"},
    {id: 5, nombre:"Cable"}
]

export const impresoras = [
    {id: 1, marca:"Ricoh", modelo:"M320F", ubicacion:"Contaduria", activo:true},
    {id: 2, marca:"Ricoh", modelo:"M430", ubicacion:"Juzgado de faltas 1", activo:true},
    {id: 3, marca:"HP", modelo:"1102", ubicacion:"Obras públicas", activo:true},
    {id: 4, marca:"HP", modelo:"M605", ubicacion:"Prensa", activo:true},
    {id: 5, marca:"Samsung", modelo:"M2020", ubicacion:"Notificaciones", activo:true}
]

// export const compatibilidades = [
//     {impresora_id: 1, articulo_id:  1},
//     {impresora_id: 2, articulo_id:  1},
//     {impresora_id: 3, articulo_id:  1},
//     {impresora_id: 4, articulo_id:  5},
//     {impresora_id: 5, articulo_id:  5},
// ]

export const articulos = [
    {id: 1, nombre:"Toner HP 26A", categoria_id: 1, stock_actual: 2, stock_minimo: 3, activo:true},
    {id: 2, nombre:"Teclado usb", categoria_id: 4 , stock_actual: 1, stock_minimo: 3, activo:true},
    {id: 3, nombre:"Mouse usb", categoria_id: 3, stock_actual: 23, stock_minimo: 3, activo:true},
    {id: 4, nombre:"Cable HDMI 2mts", categoria_id: 5, stock_actual: 7, stock_minimo: 3, activo:true},
    {id: 5, nombre:"Toner 258A", categoria_id: 1, stock_actual: 11, stock_minimo: 3, activo:true},
]

export const movimientos = [
    {id: 1, articulo_id: 2, tipo:"salida", cantidad:1, oficina_id:1, fecha: 2026-9-29},
    {id: 2, articulo_id: 4, tipo:"entrada", cantidad:10, oficina_id:2, fecha: 2026-9-28},
    {id: 3, articulo_id: 3, tipo:"salida", cantidad:1, oficina_id:3, fecha: 2026-9-27},
    {id: 4, articulo_id: 1, tipo:"salida", cantidad:1, oficina_id:4, fecha:2026-9-26 }
]

export const dependencias = [
    {id: 1, nombre:"Palacio"},
    {id: 2, nombre:"Rivadavia 80"},
    {id: 3, nombre:"España 37"},
]

export const oficinas = [
    {id: 1, dependencia_id: 1, nombre:"Educación"},
    {id: 2, dependencia_id: 1, nombre:"Obras Públicas"},
    {id: 3, dependencia_id: 2, nombre:"Compras"},
    {id: 4, dependencia_id: 3, nombre:"Producción"},
]

export const modelos = [
    {id: 1, marca:"HP", modelo:"M605", articulo_id: 1},
    {id: 2, marca:"Ricoh", modelo:"M320F", articulo_id: 5}
]

export const unidades = [
    {id: 1, articulo_id: 1, oficina_id: 1, ip: "192.168.0.10", estado:"activa"},
    {id: 2, articulo_id: 1, oficina_id: 2, ip: "192.168.0.20", estado:"activa"},
    {id: 3, articulo_id: 5, oficina_id: 4, ip: "192.168.0.30", estado:"activa"},
]
