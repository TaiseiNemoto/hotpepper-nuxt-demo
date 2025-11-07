// 内部API（/api/hp/*）がクライアントへ返却する共通型
export interface ShopSummary {
  id: string
  name: string
  address?: string
  lat?: number
  lng?: number
  genre?: { code?: string; name?: string }
  catch?: string
  photo?: { s?: string; m?: string; l?: string }
  urlPc?: string
}

// 店舗詳細レスポンス用の拡張フィールド
export interface ShopDetail extends ShopSummary {
  nameKana?: string
  access?: string
  stationName?: string
  open?: string
  close?: string
  capacity?: number
  nonSmoking?: string
  parking?: string
  card?: string
  charter?: string
  privateRoom?: string
  budget?: {
    code?: string
    name?: string
    average?: string
  }
}

// HP-01 店舗検索レスポンス
export interface ShopSearchResponse {
  total: number
  start: number
  returned: number
  shops: ShopSummary[]
}

// HP-02 店舗詳細レスポンス
export interface ShopDetailResponse {
  shop?: ShopDetail
  notFound?: boolean
}

// HP-03 ジャンルマスタレスポンス
export interface GenresResponse {
  total: number
  returned: number
  start: number
  genres: { code: string; name: string }[]
}

// HP-04 大エリアマスタレスポンス
export interface LargeAreasResponse {
  total: number
  returned: number
  start: number
  areas: { code: string; name: string }[]
}

// HP-05 中エリアマスタレスポンス
export interface MiddleAreasResponse {
  total: number
  returned: number
  start: number
  areas: {
    code: string
    name: string
    parentLarge: { code: string; name: string }
  }[]
}

// HP-06 小エリアマスタレスポンス
export interface SmallAreasResponse {
  total: number
  returned: number
  start: number
  areas: {
    code: string
    name: string
    parentMiddle?: { code: string; name: string }
  }[]
}
