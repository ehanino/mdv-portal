import { jwtDecode } from 'jwt-decode'
import { showMessageDialog } from './messageUtils'

export const handleError = (error) => {
	const errorMessage = extractErrorMessage(error.response?.data || error.message)
	showMessageDialog(errorMessage)
}

/**
 * Decodifica un token JWT
 * @param {string} token - El token JWT
 * @returns {Object|null} El payload decodificado o null si ocurre un error
 */
export function decodeJwt(token) {
	try {
		if (!token) {
			console.error('El token proporcionado está vacío')
			return null
		}
		const decoded = jwtDecode(token)
		return decoded
	} catch (error) {
		console.error('Error al decodificar el token JWT:', error.message)
		return null
	}
}