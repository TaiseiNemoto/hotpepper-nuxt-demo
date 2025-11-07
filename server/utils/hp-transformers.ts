/**
 * HotPepperの生レスポンスを内部API用のプレーンな構造に変換する関数群
 *
 * HotPepper Gourmet APIのレスポンス型を、クライアントに返却する内部API型に変換します。
 * 各関数は以下の責務を持ちます：
 * - フィールド名のリネーミング（snake_case → camelCase）
 * - 不要なフィールドの除外
 * - データ型の正規化（文字列→数値変換など）
 * - ネストされた構造の平坦化または整形
 */
import type {
  HotpepperGenreResults,
  HotpepperLargeAreaResults,
  HotpepperMiddleAreaResults,
  HotpepperSearchResults,
  HotpepperShopRaw,
  HotpepperSmallAreaResults,
} from '../types/hotpepper'
import type {
  GenresResponse,
  LargeAreasResponse,
  MiddleAreasResponse,
  ShopDetail,
  ShopSearchResponse,
  ShopSummary,
  SmallAreasResponse,
} from '../types/hp-internal'

// 文字列/数値混在の緯度経度などを安全にnumberへ寄せる
const toNumber = (value?: string | number | null) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

// photo.pc.* の有無チェックとリネーム
const mapPhoto = (shop: HotpepperShopRaw) => {
  const pc = shop.photo?.pc
  if (!pc) {
    return undefined
  }
  const photo = {
    s: pc.s,
    m: pc.m,
    l: pc.l,
  }
  return photo
}

// ジャンル情報は存在しない場合があるため安全に切り出す
const mapGenre = (shop: HotpepperShopRaw) => {
  if (!shop.genre) {
    return undefined
  }
  return {
    code: shop.genre.code,
    name: shop.genre.name,
  }
}

/**
 * HotPepper店舗データを店舗サマリー情報に変換する（HP-01/HP-02共通）
 *
 * @param shop - HotPepper APIの生店舗データ
 * @returns 一覧表示向けの店舗サマリー情報
 */
export const toShopSummary = (shop: HotpepperShopRaw): ShopSummary => {
  return {
    id: shop.id,
    name: shop.name,
    address: shop.address,
    lat: toNumber(shop.lat),
    lng: toNumber(shop.lng),
    genre: mapGenre(shop),
    catch: shop.catch,
    photo: mapPhoto(shop),
    urlPc: shop.urls?.pc,
  }
}

/**
 * HotPepper店舗データを店舗詳細情報に変換する（HP-02専用）
 *
 * @param shop - HotPepper APIの生店舗データ
 * @returns 詳細表示向けの店舗情報（サマリー情報 + 追加フィールド）
 */
export const toShopDetail = (shop: HotpepperShopRaw): ShopDetail => {
  return {
    ...toShopSummary(shop),
    nameKana: shop.name_kana,
    access: shop.access ?? shop.mobile_access,
    stationName: shop.station_name,
    open: shop.open,
    close: shop.close,
    capacity: toNumber(shop.capacity),
    nonSmoking: shop.non_smoking,
    parking: shop.parking,
    card: shop.card,
    charter: shop.charter,
    privateRoom: shop.private_room,
    budget: shop.budget
      ? {
          code: shop.budget.code,
          name: shop.budget.name,
          average: shop.budget.average,
        }
      : undefined,
  }
}

/**
 * HotPepper検索結果を店舗検索レスポンスに変換する（HP-01）
 *
 * @param results - HotPepper APIの検索結果
 * @returns 内部API用の店舗検索レスポンス（ページング情報 + 店舗リスト）
 */
export const toSearchResponse = (results: HotpepperSearchResults): ShopSearchResponse => {
  return {
    total: results.results_available,
    start: results.results_start,
    returned: results.results_returned,
    shops: (results.shop ?? []).map(toShopSummary),
  }
}

/**
 * HotPepperジャンルマスタをレスポンス形式に変換する（HP-03）
 *
 * @param results - HotPepper APIのジャンルマスタ結果
 * @returns 内部API用のジャンルマスタレスポンス
 */
export const toGenresResponse = (results: HotpepperGenreResults): GenresResponse => {
  return {
    total: results.results_available,
    start: results.results_start,
    returned: results.results_returned,
    genres: (results.genre ?? []).map((genre) => ({
      code: genre.code,
      name: genre.name,
    })),
  }
}

/**
 * HotPepper大エリアマスタをレスポンス形式に変換する（HP-04）
 *
 * @param results - HotPepper APIの大エリアマスタ結果
 * @returns 内部API用の大エリアマスタレスポンス
 */
export const toLargeAreasResponse = (results: HotpepperLargeAreaResults): LargeAreasResponse => {
  return {
    total: results.results_available,
    start: results.results_start,
    returned: results.results_returned,
    areas: (results.large_area ?? []).map((area) => ({
      code: area.code,
      name: area.name,
    })),
  }
}

/**
 * HotPepper中エリアマスタをレスポンス形式に変換する（HP-05）
 *
 * @param results - HotPepper APIの中エリアマスタ結果
 * @returns 内部API用の中エリアマスタレスポンス（親大エリア情報付き）
 */
export const toMiddleAreasResponse = (results: HotpepperMiddleAreaResults): MiddleAreasResponse => {
  return {
    total: results.results_available,
    start: results.results_start,
    returned: results.results_returned,
    areas: (results.middle_area ?? []).map((area) => ({
      code: area.code,
      name: area.name,
      parentLarge: {
        code: area.large_area.code,
        name: area.large_area.name,
      },
    })),
  }
}

/**
 * HotPepper小エリアマスタをレスポンス形式に変換する（HP-06）
 *
 * @param results - HotPepper APIの小エリアマスタ結果
 * @returns 内部API用の小エリアマスタレスポンス（親中エリア情報付き）
 */
export const toSmallAreasResponse = (results: HotpepperSmallAreaResults): SmallAreasResponse => {
  return {
    total: results.results_available,
    start: results.results_start,
    returned: results.results_returned,
    areas: (results.small_area ?? []).map((area) => ({
      code: area.code,
      name: area.name,
      parentMiddle: area.middle_area
        ? {
            code: area.middle_area.code,
            name: area.middle_area.name,
          }
        : undefined,
    })),
  }
}
