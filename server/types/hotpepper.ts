// HotPepper Gourmet APIのレスポンス型定義
export interface HotpepperResultsBase {
  api_version?: string
  results_available: number
  results_returned: number
  results_start: number
}

export type HotpepperEnvelope<T extends HotpepperResultsBase> = {
  results: T
}

export type HotpepperResultsField<TField extends string, TValue> = HotpepperResultsBase & {
  [K in TField]?: TValue
}

export type HotpepperSearchResults = HotpepperResultsField<'shop', HotpepperShopRaw[]>
export type HotpepperGenreResults = HotpepperResultsField<'genre', HotpepperGenreRaw[]>
export type HotpepperLargeAreaResults = HotpepperResultsField<'large_area', HotpepperLargeAreaRaw[]>
export type HotpepperMiddleAreaResults = HotpepperResultsField<
  'middle_area',
  HotpepperMiddleAreaRaw[]
>
export type HotpepperSmallAreaResults = HotpepperResultsField<'small_area', HotpepperSmallAreaRaw[]>

export interface HotpepperGenreRaw {
  code: string
  name: string
  catch?: string
}

export interface HotpepperLargeAreaRaw {
  code: string
  name: string
}

export interface HotpepperMiddleAreaRaw {
  code: string
  name: string
  large_area: Pick<HotpepperLargeAreaRaw, 'code' | 'name'>
}

export interface HotpepperSmallAreaRaw {
  code: string
  name: string
  middle_area: Pick<HotpepperMiddleAreaRaw, 'code' | 'name'>
}

export interface HotpepperPhotoUrls {
  s?: string
  m?: string
  l?: string
}

export interface HotpepperPhotoSet {
  pc?: HotpepperPhotoUrls
  mobile?: HotpepperPhotoUrls
}

export interface HotpepperBudgetRaw {
  code?: string
  name?: string
  average?: string
}

export interface HotpepperUrlsRaw {
  pc?: string
  mobile?: string
}

export interface HotpepperShopRaw {
  id: string
  name: string
  name_kana?: string
  address?: string
  lat?: string | number
  lng?: string | number
  station_name?: string
  access?: string
  mobile_access?: string
  open?: string
  close?: string
  catch?: string
  budget?: HotpepperBudgetRaw
  genre?: HotpepperGenreRaw
  large_area?: HotpepperLargeAreaRaw
  middle_area?: HotpepperMiddleAreaRaw
  small_area?: HotpepperSmallAreaRaw
  photo?: HotpepperPhotoSet
  urls?: HotpepperUrlsRaw
  non_smoking?: string
  parking?: string
  card?: string
  private_room?: string
  charter?: string
  capacity?: number | string
}

export interface HotpepperErrorDetail {
  code: string
  message: string
}

export type HotpepperErrorResults = HotpepperResultsField<'error', HotpepperErrorDetail[]>

export type HotpepperQueryValue = string | number | boolean | undefined
export type HotpepperRequestQuery = Record<string, HotpepperQueryValue>
