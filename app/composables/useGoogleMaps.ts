/// <reference types="@types/google.maps" />

/**
 * Google Maps JavaScript APIを利用するためのComposable
 *
 * @returns Google Maps APIの初期化とユーティリティ関数
 *
 * @example
 * ```vue
 * <script setup>
 * const { apiKey, waitForGoogleMaps } = useGoogleMaps()
 *
 * onMounted(async () => {
 *   await waitForGoogleMaps()
 *   // Google Maps APIが利用可能
 * })
 * </script>
 * ```
 */
export const useGoogleMaps = () => {
  const config = useRuntimeConfig()
  const apiKey = config.public.googleMapsApiKey

  // Google Maps APIスクリプトを読み込み
  if (apiKey) {
    useHead({
      script: [
        {
          key: 'google-maps-script',
          src: `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`,
          async: true,
          defer: true,
        },
      ],
    })
  }

  /**
   * Google Maps APIの読み込みを待機
   *
   * @returns Google Maps APIの読み込み完了を示すPromise
   * @throws {Error} APIの読み込みがタイムアウトした場合
   */
  const waitForGoogleMaps = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 50
      let attempts = 0

      const checkGoogleMaps = () => {
        if (typeof google !== 'undefined' && google.maps) {
          resolve()
        } else if (attempts >= maxAttempts) {
          reject(new Error('Google Maps API の読み込みがタイムアウトしました'))
        } else {
          attempts++
          setTimeout(checkGoogleMaps, 100)
        }
      }

      checkGoogleMaps()
    })
  }

  return {
    apiKey,
    waitForGoogleMaps,
  }
}
