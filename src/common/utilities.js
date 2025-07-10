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

// ADDED: Reusable function to export data to Excel from a backend endpoint
import apiService from '@/services/apiService'
import { showErrorDialog } from '@/common/messageUtils'

/**
 * Exports data to an Excel file by making a GET request to a backend endpoint.
 * Handles file download and error display.
 * @param {string} endpoint The API endpoint to request the Excel file from.
 * @param {object} params Query parameters to send with the request (e.g., search filters).
 * @param {string} filename The name for the downloaded Excel file (e.g., 'usuarios.xlsx').
 */
export const exportDataToExcel = async (endpoint, params = {}, filename = 'export.xlsx') => {
  try {
    const response = await apiService.get(endpoint, {
      params,
      responseType: 'blob', // Important: responseType must be 'blob' for file downloads
    })

    // Create a Blob from the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] })

    // Create a link element, set its href to the Blob, and simulate a click
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL object
    window.URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Error exporting data to Excel:', error)
    let errorMessage = 'Ocurrió un error al exportar los datos a Excel.'
    if (error.response && error.response.data) {
      // Try to parse error message from blob if available
      try {
        const errorBlob = new Blob([error.response.data], { type: 'application/json' })
        const reader = new FileReader()
        reader.onload = function () {
          const errorJson = JSON.parse(reader.result)
          errorMessage = errorJson.detail || errorJson.message || errorMessage
          showErrorDialog('Error de Exportación', errorMessage)
        }
        reader.readAsText(errorBlob)
        return // Exit to prevent default error dialog until blob is read
      } catch (e) {
        // Fallback to generic message if blob is not JSON
        console.log('Error parsing error response:', e)
      }
    }
    showErrorDialog('Error de Exportación', errorMessage)
  }
}
