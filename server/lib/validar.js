import { ErrorHttp } from './http.js'

export function idDesdeParams(valor, campo = 'id') {
  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorHttp(400, `El ${campo} debe ser un entero positivo`)
  }

  return numero
}

export function enteroOpcional(valor, campo) {
  if (valor === undefined || valor === '') return null

  const numero = Number(valor)

  if (!Number.isInteger(numero)) {
    throw new ErrorHttp(400, `El filtro "${campo}" debe ser un entero`)
  }

  return numero
}

export function booleanoOpcional(valor, campo) {
  if (valor === undefined || valor === '') return null
  if (valor === 'true') return true
  if (valor === 'false') return false

  throw new ErrorHttp(400, `El filtro "${campo}" debe ser true o false`)
}

export function fechaOpcional(valor, campo) {
  if (valor === undefined || valor === '') return null

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new ErrorHttp(400, `El filtro "${campo}" debe tener formato YYYY-MM-DD`)
  }

  return valor
}

export function textoObligatorio(valor, campo, maximo = 200) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new ErrorHttp(400, `El campo "${campo}" es obligatorio`)
  }

  const texto = valor.trim()

  if (texto.length > maximo) {
    throw new ErrorHttp(400, `El campo "${campo}" no puede superar ${maximo} caracteres`)
  }

  return texto
}

export function enteroNoNegativo(valor, campo) {
  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero < 0) {
    throw new ErrorHttp(400, `El campo "${campo}" debe ser un entero mayor o igual a 0`)
  }

  return numero
}

export function enteroPositivo(valor, campo) {
  const numero = Number(valor)

  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorHttp(400, `El campo "${campo}" debe ser un entero mayor a 0`)
  }

  return numero
}
