export const categorias = [
    {id: 1, nombre:"Tóner"},
    {id: 2, nombre:"Periféricos"},
    {id: 3, nombre:"Cable"}
]

export const impresoras = [
    {id: 1, marca:"Ricoh", modelo:"M320F", ubicacion:"Contaduria", activo:true},
    {id: 2, marca:"Ricoh", modelo:"M430", ubicacion:"Juzgado de faltas 1", activo:true},
    {id: 3, marca:"HP", modelo:"1102", ubicacion:"Obras públicas", activo:true},
    {id: 4, marca:"HP", modelo:"M605", ubicacion:"Prensa", activo:true},
    {id: 5, marca:"Samsung", modelo:"M2020", ubicacion:"Notificaciones", activo:true}
]

export const articulos = [
    {id: 1, nombre:"Toner HP 26A", categoria_id: 1, stock_actual: 2, stock_minimo: 3, activo:true},
    {id: 2, nombre:"Teclado usb", categoria_id: 2, stock_actual: 1, stock_minimo: 3, activo:true},
    {id: 3, nombre:"Mouse usb", categoria_id: 2, stock_actual: 23, stock_minimo: 3, activo:true},
    {id: 4, nombre:"Cable HDMI 2mts", categoria_id: 3, stock_actual: 7, stock_minimo: 3, activo:true},
    {id: 5, nombre:"Toner 258A", categoria_id: 1, stock_actual: 11, stock_minimo: 3, activo:true},
]

export const movimientos = [
    {id: 1, articulo_id: 2, tipo:"salida", cantidad:1, oficina_id:1, fecha:'2026-09-29'},
    {id: 2, articulo_id: 4, tipo:"entrada", cantidad:10, oficina_id:null, fecha:'2026-09-28'},
    {id: 3, articulo_id: 3, tipo:"salida", cantidad:1, oficina_id:3, fecha:'2026-09-27'},
    {id: 4, articulo_id: 1, tipo:"salida", cantidad:1, oficina_id:4, fecha:'2026-09-26' },

    // Historial de ejemplo de los últimos 6 meses (mayo a octubre 2026)
    {id: 5, articulo_id: 1, tipo:"entrada", cantidad:10, oficina_id:null, fecha:'2026-05-05'},
    {id: 6, articulo_id: 1, tipo:"salida", cantidad:2, oficina_id:1, fecha:'2026-05-12'},
    {id: 7, articulo_id: 4, tipo:"salida", cantidad:3, oficina_id:2, fecha:'2026-05-20'},
    {id: 8, articulo_id: 3, tipo:"entrada", cantidad:15, oficina_id:null, fecha:'2026-05-22'},

    {id: 9, articulo_id: 3, tipo:"salida", cantidad:4, oficina_id:3, fecha:'2026-06-03'},
    {id: 10, articulo_id: 2, tipo:"salida", cantidad:2, oficina_id:1, fecha:'2026-06-11'},
    {id: 11, articulo_id: 2, tipo:"entrada", cantidad:8, oficina_id:null, fecha:'2026-06-15'},
    {id: 12, articulo_id: 1, tipo:"salida", cantidad:1, oficina_id:2, fecha:'2026-06-24'},

    {id: 13, articulo_id: 5, tipo:"entrada", cantidad:12, oficina_id:null, fecha:'2026-07-02'},
    {id: 14, articulo_id: 5, tipo:"salida", cantidad:1, oficina_id:1, fecha:'2026-07-09'},
    {id: 15, articulo_id: 4, tipo:"salida", cantidad:2, oficina_id:4, fecha:'2026-07-16'},
    {id: 16, articulo_id: 3, tipo:"salida", cantidad:3, oficina_id:3, fecha:'2026-07-28'},

    {id: 17, articulo_id: 1, tipo:"entrada", cantidad:6, oficina_id:null, fecha:'2026-08-04'},
    {id: 18, articulo_id: 1, tipo:"salida", cantidad:3, oficina_id:2, fecha:'2026-08-12'},
    {id: 19, articulo_id: 2, tipo:"salida", cantidad:1, oficina_id:4, fecha:'2026-08-19'},
    {id: 20, articulo_id: 4, tipo:"entrada", cantidad:5, oficina_id:null, fecha:'2026-08-25'},

    {id: 21, articulo_id: 5, tipo:"salida", cantidad:2, oficina_id:1, fecha:'2026-09-04'},
    {id: 22, articulo_id: 2, tipo:"entrada", cantidad:5, oficina_id:null, fecha:'2026-09-10'},
    {id: 23, articulo_id: 3, tipo:"salida", cantidad:2, oficina_id:2, fecha:'2026-09-18'},

    {id: 24, articulo_id: 3, tipo:"entrada", cantidad:10, oficina_id:null, fecha:'2026-10-01'},
    {id: 25, articulo_id: 4, tipo:"salida", cantidad:1, oficina_id:1, fecha:'2026-10-06'},
    {id: 26, articulo_id: 2, tipo:"salida", cantidad:2, oficina_id:3, fecha:'2026-10-09'},
    {id: 27, articulo_id: 5, tipo:"salida", cantidad:1, oficina_id:4, fecha:'2026-10-14'},
    {id: 28, articulo_id: 1, tipo:"entrada", cantidad:4, oficina_id:null, fecha:'2026-10-16'}
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
    {id: 1, modelo_id: 1, nombre:"HP M605", oficina_id: 1, ip: "192.168.0.10", estado:"activa"},
    {id: 2, modelo_id: 1, nombre:"HP M605", oficina_id: 2, ip: "192.168.0.20", estado:"activa"},
    {id: 3, modelo_id: 2, nombre:"Ricoh M320F", oficina_id: 4, ip: "192.168.0.30", estado:"activa"},
]
