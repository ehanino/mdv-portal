const apiBaseURL = import.meta.env.VITE_API_BASE_URL

export function getFullImageUrl(imagePath) {
  console.log('getFullImageUrl', imagePath)
  if (imagePath) {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      const imagePath1 = apiBaseURL + imagePath.replace('https://apps.muniventanilla.gob.pe/', '/')
      console.log('BUBU 1', imagePath1)
      return imagePath1
    } else {
      console.log('BUBU')
      return apiBaseURL + imagePath
    }
  }
  return null
}
