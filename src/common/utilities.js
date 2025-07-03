/**
 * Extrae y formatea un mensaje de error legible de un objeto de error de API de DRF.
 * Puede manejar errores de detalle, errores de campo y múltiples errores.
 * @param {any} errorData - El objeto de error, usualmente error.response.data.
 * @returns {string} Un mensaje de error listo para mostrar al usuario.
 */
export const extractErrorMessage = (errorData) => {
  const defaultMessage =
    'Ocurrió un error inesperado. Por favor, revise los datos e intente de nuevo.'

  if (!errorData) {
    return defaultMessage
  }

  // Caso 1: Error de detalle principal (muy común en DRF para autenticación, permisos, etc.)
  // ej: { "detail": "Credenciales inválidas." }
  if (typeof errorData.detail === 'string') {
    return errorData.detail
  }

  // Caso 2: Errores de validación de campos (puede haber uno o varios)
  // ej: { "email": ["Este email ya existe."], "password": ["Contraseña muy corta."] }
  if (typeof errorData === 'object' && !Array.isArray(errorData)) {
    const errorMessages = []

    // Recorremos TODAS las claves del objeto de error
    for (const field in errorData) {
      const messages = Array.isArray(errorData[field]) ? errorData[field] : [errorData[field]]
      // Añadimos cada mensaje de error a nuestra lista
      messages.forEach((msg) => errorMessages.push(`- ${msg}`))
    }

    if (errorMessages.length > 0) {
      // Si hay múltiples errores, los unimos con saltos de línea
      // El \n se interpretará como un salto de línea en los diálogos de SweetAlert2
      return `Por favor, corrija los siguientes errores:\n${errorMessages.join('\n')}`
    }
  }

  // Caso 3: El error es simplemente un string
  if (typeof errorData === 'string') {
    return errorData
  }

  // Si no se pudo determinar el error, devolvemos un mensaje genérico.
  return defaultMessage
}

export function formatearConSeparadorMiles(numero) {
  const num = Number(numero) // Intenta convertir el valor a número
  if (isNaN(num)) {
    console.error('El valor proporcionado no es un número válido.')
    return '' // Devuelve un valor vacío o maneja el error según tu caso
  }
  const numx = num.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  // console.log("NNNNNNNN", numx)
  return numx
}

export function formatearFecha(fechaString) {
  return fechaString.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')
}
