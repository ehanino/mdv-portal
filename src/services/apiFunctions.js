export const apiBaseURL = import.meta.env.VITE_API_BASE_URL

export function getFullImageUrl(imagePath) {
  // console.log('getFullImageUrl', imagePath)
  if (imagePath) {
    return apiBaseURL + imagePath
  }
  return null
}
