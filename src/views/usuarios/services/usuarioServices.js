const apiBaseURL = import.meta.env.VITE_API_BASE_URL

export function getFullImageUrl(imagePath) {
  if (!imagePath) {
    return null
  }

  // If the image path is already a full URL, return it directly.
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Otherwise, prepend the base URL.
  return apiBaseURL + imagePath
}
