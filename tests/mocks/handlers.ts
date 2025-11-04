import { HttpResponse, http } from 'msw'
import {
  mockSearchResponse,
  mockSearchResponseEmpty,
  mockShopDetailNotFound,
  mockShopDetailResponse,
} from '../fixtures/shops'
import {
  mockGenresResponse,
  mockLargeAreasResponse,
  mockMiddleAreasResponse,
  mockSmallAreasResponse,
} from '../fixtures/masters'
import { mockApiError, mockNotFoundError } from '../fixtures/errors'

/**
 * MSW APIモックハンドラー
 * 各内部APIエンドポイントのモックレスポンスを定義
 */
export const handlers = [
  // HP-01: 店舗検索
  http.get('/api/hp/shops/search', ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get('page')
    const q = url.searchParams.get('q')

    // エラーケーステスト用
    if (q === 'error') {
      return HttpResponse.json(mockApiError, { status: 500 })
    }

    // 0件ケーステスト用
    if (q === 'empty') {
      return HttpResponse.json(mockSearchResponseEmpty)
    }

    // ページング対応（デフォルトは1ページ目）
    if (page && parseInt(page) > 1) {
      return HttpResponse.json({
        ...mockSearchResponse,
        start: (parseInt(page) - 1) * 20 + 1,
        shops: [],
        returned: 0,
      })
    }

    return HttpResponse.json(mockSearchResponse)
  }),

  // HP-02: 店舗詳細取得
  http.get('/api/hp/shops/:id', ({ params }) => {
    const { id } = params

    // エラーケーステスト用
    if (id === 'error') {
      return HttpResponse.json(mockApiError, { status: 500 })
    }

    // 404ケーステスト用
    if (id === 'notfound') {
      return HttpResponse.json(mockShopDetailNotFound, { status: 404 })
    }

    // 正常ケース
    if (id === 'J001234567') {
      return HttpResponse.json(mockShopDetailResponse)
    }

    // デフォルトは404
    return HttpResponse.json(mockNotFoundError, { status: 404 })
  }),

  // HP-03: ジャンルマスタ取得
  http.get('/api/hp/genres', ({ request }) => {
    const url = new URL(request.url)
    const testError = url.searchParams.get('testError')

    if (testError === 'true') {
      return HttpResponse.json(mockApiError, { status: 500 })
    }

    return HttpResponse.json(mockGenresResponse)
  }),

  // HP-04: 大エリアマスタ取得
  http.get('/api/hp/areas/large', ({ request }) => {
    const url = new URL(request.url)
    const testError = url.searchParams.get('testError')

    if (testError === 'true') {
      return HttpResponse.json(mockApiError, { status: 500 })
    }

    return HttpResponse.json(mockLargeAreasResponse)
  }),

  // HP-05: 中エリアマスタ取得
  http.get('/api/hp/areas/middle', ({ request }) => {
    const url = new URL(request.url)
    const testError = url.searchParams.get('testError')
    const largeAreaCode = url.searchParams.get('largeAreaCode')

    if (testError === 'true') {
      return HttpResponse.json(mockApiError, { status: 500 })
    }

    // largeAreaCodeでフィルタリング
    if (largeAreaCode) {
      const filtered = mockMiddleAreasResponse.areas.filter(
        (area) => area.largeAreaCode === largeAreaCode,
      )
      return HttpResponse.json({ areas: filtered })
    }

    return HttpResponse.json(mockMiddleAreasResponse)
  }),

  // HP-06: 小エリアマスタ取得
  http.get('/api/hp/areas/small', ({ request }) => {
    const url = new URL(request.url)
    const testError = url.searchParams.get('testError')
    const middleAreaCode = url.searchParams.get('middleAreaCode')

    if (testError === 'true') {
      return HttpResponse.json(mockApiError, { status: 500 })
    }

    // middleAreaCodeでフィルタリング
    if (middleAreaCode) {
      const filtered = mockSmallAreasResponse.areas.filter(
        (area) => area.middleAreaCode === middleAreaCode,
      )
      return HttpResponse.json({ areas: filtered })
    }

    return HttpResponse.json(mockSmallAreasResponse)
  }),
]
