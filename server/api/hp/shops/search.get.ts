import { defineEventHandler, getValidatedQuery } from 'h3'
import { type ShopSearchParams, createHotpepperClient } from '../../../utils/hotpepper-client'
import {
  ValidationError,
  extractValidationError,
  respondWithUpstreamError,
  respondWithValidationError,
} from '../../../utils/api-response'
import { createSuccessResult } from '../../../types/api'
import { toSearchResponse } from '../../../utils/hp-transformers'

// HP-01 店舗検索API: クエリ正規化→HotPepper呼び出し→レスポンス整形を担当

type RangeOption = 1 | 2 | 3 | 4 | 5

interface NormalizedSearchQuery {
  keyword?: string
  genres: string[]
  largeAreas: string[]
  middleAreas: string[]
  smallAreas: string[]
  lat?: number
  lng?: number
  range?: RangeOption
  order: 1 | 2 | 3 | 4
  page: number
  perPage: number
}

const MAX_GENRES = 2
const MAX_LARGE_AREAS = 3
const MAX_MIDDLE_AREAS = 5
const MAX_SMALL_AREAS = 5
const DEFAULT_PER_PAGE = 20
const MAX_PER_PAGE = 100
const DEFAULT_RANGE: RangeOption = 3

export default defineEventHandler(async (event) => {
  let normalized: NormalizedSearchQuery
  try {
    normalized = await getValidatedQuery<NormalizedSearchQuery>(event, (query) =>
      normalizeSearchQuery(asRecord(query)),
    )
  } catch (error) {
    const validationError = extractValidationError(error)
    if (validationError) {
      return respondWithValidationError(event, validationError)
    }
    throw error
  }

  const client = createHotpepperClient(event)
  const hpResult = await client.searchShops(buildShopSearchParams(normalized))
  if (!hpResult.success) {
    return respondWithUpstreamError(event, hpResult.error)
  }

  return createSuccessResult(toSearchResponse(hpResult.data))
})

// クエリパラメータをAPI設計書準拠の形に整える
const normalizeSearchQuery = (raw: Record<string, unknown>): NormalizedSearchQuery => {
  const keyword = normalizeKeyword(raw.q)
  const genres = normalizeMultiValue(raw.genres, MAX_GENRES)
  const largeAreas = normalizeMultiValue(raw['areas.large'], MAX_LARGE_AREAS)
  const middleAreas = normalizeMultiValue(raw['areas.middle'], MAX_MIDDLE_AREAS)
  const smallAreas = normalizeMultiValue(raw['areas.small'], MAX_SMALL_AREAS)
  const lat = normalizeCoordinate(raw.lat)
  const lng = normalizeCoordinate(raw.lng)

  if ((lat === undefined) !== (lng === undefined)) {
    throw new ValidationError('latとlngは同時に指定してください')
  }

  const range = normalizeRange(raw.range)
  if ((lat === undefined || lng === undefined) && range) {
    throw new ValidationError('rangeはlat/lngと併用してください')
  }

  const isLocationSearch = lat !== undefined && lng !== undefined
  const resolvedRange = isLocationSearch ? (range ?? DEFAULT_RANGE) : undefined
  const perPage = clampInteger(raw.perPage, 1, MAX_PER_PAGE, DEFAULT_PER_PAGE)
  const page = clampInteger(raw.page, 1, Number.MAX_SAFE_INTEGER, 1)
  const order = resolveOrder(raw.order, isLocationSearch)

  return {
    keyword,
    genres,
    largeAreas,
    middleAreas,
    smallAreas,
    lat,
    lng,
    range: resolvedRange,
    order,
    page,
    perPage,
  }
}

// HotPepper API用のクエリを構築
const buildShopSearchParams = (query: NormalizedSearchQuery): ShopSearchParams => {
  const start = (query.page - 1) * query.perPage + 1
  const base: ShopSearchParams = {
    keyword: query.keyword,
    genre: joinList(query.genres),
    large_area: joinList(query.largeAreas),
    middle_area: joinList(query.middleAreas),
    small_area: joinList(query.smallAreas),
    count: query.perPage,
    start,
    order: query.order,
  }

  if (query.lat !== undefined && query.lng !== undefined) {
    base.lat = query.lat
    base.lng = query.lng
    base.range = query.range
  }

  return base
}

// フリーワードの空白正規化
const normalizeKeyword = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.replace(/\s+/g, ' ').trim()
  return trimmed.length ? trimmed : undefined
}

// ジャンル/エリア配列を重複排除＆件数制限
const normalizeMultiValue = (value: unknown, limit: number) => {
  const pool = Array.isArray(value) ? value : value == null ? [] : [value]
  const result: string[] = []

  for (const item of pool) {
    if (Array.isArray(item)) {
      for (const nested of item) {
        if (typeof nested !== 'string') {
          continue
        }
        for (const token of nested.split(',')) {
          const trimmed = token.trim()
          if (!trimmed || result.includes(trimmed)) {
            continue
          }
          result.push(trimmed)
          if (result.length >= limit) {
            return result
          }
        }
      }
      continue
    }

    if (typeof item !== 'string') {
      continue
    }
    for (const token of item.split(',')) {
      const trimmed = token.trim()
      if (!trimmed || result.includes(trimmed)) {
        continue
      }
      result.push(trimmed)
      if (result.length >= limit) {
        return result
      }
    }
  }

  return result
}

// 緯度経度をnumber化（異常値は破棄）
const normalizeCoordinate = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return undefined
}

// rangeは1-5の整数のみ許可
const normalizeRange = (value: unknown): RangeOption | undefined => {
  if (value === undefined) {
    return undefined
  }
  const parsed = Number.parseInt(String(value), 10)
  return [1, 2, 3, 4, 5].includes(parsed) ? (parsed as RangeOption) : undefined
}

// ページング系数値を範囲内に丸める
const clampInteger = (value: unknown, min: number, max: number, fallback: number) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (Number.isFinite(parsed) && parsed >= min) {
    return Math.min(parsed, max)
  }
  return fallback
}

// 位置検索時は距離順固定、それ以外は指定値を採用
const resolveOrder = (value: unknown, forceDistance: boolean): 1 | 2 | 3 | 4 => {
  if (forceDistance) {
    return 4
  }
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if ([1, 2, 3, 4].includes(parsed)) {
    return parsed as 1 | 2 | 3 | 4
  }
  return 4
}

const joinList = (values: string[]) => (values.length ? values.join(',') : undefined)

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>
  }
  return {}
}
