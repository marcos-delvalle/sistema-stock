export const categorias = [
    {id: 1, nombre:"Tóner"},
    {id: 2, nombre:"Cartucho"},
    {id: 3, nombre:"Mouse"},
    {id: 4, nombre:"Teclado"},
    {id: 5, nombre:"Cable"}
]

// export const impresoras = [
//     {id: 1, modelo:"M320F", marca:"", ubicacion="", tipo:"", activo=true},
//     {id: 2, modelo:"M430", marca:"", ubicacion="", tipo:"", activo=true},
//     {id: 3, modelo:"HP", marca:"", ubicacion="", tipo:"", activo=true},
//     {id: 4, modelo:"", marca:"", ubicacion="", tipo:"", activo=true},
//     {id: 5, modelo:"", marca:"", ubicacion="", tipo:"", activo=true}
// ]

export const articulos = [
    {id: 1, nombre:"Toner HP 26A", categoria_id: 1, sn:"asdfasfas" , stock_actual: 2, stock_minimo: 3, activo:true},
    {id: 2, nombre:"Teclado usb", categoria_id: 4, sn:"" , stock_actual: 26, stock_minimo: 3, activo:true},
    {id: 3, nombre:"Mouse usb", categoria_id: 3, sn:"" , stock_actual: 23, stock_minimo: 3, activo:true},
    {id: 4, nombre:"Cable HDMI 2mts", categoria_id: 5, sn:"" , stock_actual: 7, stock_minimo: 3, activo:true},
    {id: 5, nombre:"Toner 258A", categoria_id: 1, sn:"" , stock_actual: 11, stock_minimo: 3, activo:true},
]

export const movimientos = [
    {id: 1, articulo_id: 2, tipo:"salida", cantidad:1, destino:"Contaduría", fecha: 2026-9-29},
    {id: 2, articulo_id: 4, tipo:"entrada", cantidad:10, destino:"Informática", fecha: 2026-9-28},
    {id: 3, articulo_id: 3, tipo:"salida", cantidad:1, destino:"Prensa", fecha: 2026-9-27},
    {id: 4, articulo_id: 1, tipo:"salida", cantidad:1, destino:"Omic", fecha:2026-9-26 }
]