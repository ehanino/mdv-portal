import Swal from 'sweetalert2'

/**
 * Muestra un diálogo de confirmación con botones Sí / No.
 * Evita que el usuario cierre el diálogo por clic fuera o presionando ESC.
 *
 * @param {string} title - Título del diálogo
 * @param {string} text - Texto o mensaje explicativo
 * @returns {Promise<boolean>} - Devuelve true si el usuario confirma, false si cancela
 */
export const showConfirmDialog = async (title, text) => {
	const { isConfirmed } = await Swal.fire({
		title,
		text,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Sí',
		cancelButtonText: 'No',
		allowOutsideClick: false, // Evita cerrar al hacer clic fuera
		allowEscapeKey: false, // Evita cerrar con ESC
	})
	return isConfirmed
}

export const showMessageDialog = (title, text, icon = 'info') => {
	return Swal.fire({
		title,
		text,
		icon,
		confirmButtonText: 'Aceptar',
	})
}

/**
 * Muestra un diálogo de error con estilo rojo y botón de aceptar.
 * @param {string} title - Título del error (ej: "¡Error!")
 * @param {string} text - Mensaje detallado del error
 * @param {string} [confirmText="Aceptar"] - Texto del botón
 * @returns {Promise<void>}
 */
export const showErrorDialog = (title, text, confirmText = 'Aceptar') => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonText: confirmText,
    confirmButtonColor: '#d33', // Rojo para acciones críticas
    backdrop: `
      rgba(255, 0, 0, 0.1)
      url("/images/error-icon.png")
      center top
      no-repeat
    `,
    allowOutsideClick: false, // Evita cerrar al hacer clic fuera
  });
};