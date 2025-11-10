import type {
  HotpepperGenreResults,
  HotpepperLargeAreaResults,
  HotpepperMiddleAreaResults,
  HotpepperSearchResults,
  HotpepperShopRaw,
  HotpepperSmallAreaResults,
} from '../../server/types/hotpepper'

const baseShop: HotpepperShopRaw = {
  id: 'J001234567',
  name: 'テスト居酒屋',
  name_kana: 'てすといざかや',
  address: '東京都渋谷区1-2-3',
  lat: '35.658034',
  lng: '139.701636',
  catch: 'テストキャッチ',
  station_name: '渋谷',
  access: '渋谷駅徒歩5分',
  budget: { code: 'B003', name: '3001~4000円', average: '3500円' },
  genre: { code: 'G001', name: '居酒屋' },
  photo: {
    pc: {
      s: 'https://example.com/s.jpg',
      m: 'https://example.com/m.jpg',
      l: 'https://example.com/l.jpg',
    },
  },
  urls: { pc: 'https://example.com/shop' },
}

export const mockHpSearchResults: HotpepperSearchResults = {
  results_available: 120,
  results_returned: 1,
  results_start: 1,
  shop: [baseShop],
}

export const mockHpSearchResultsEmpty: HotpepperSearchResults = {
  results_available: 0,
  results_returned: 0,
  results_start: 1,
  shop: [],
}

export const mockHpGenreResults: HotpepperGenreResults = {
  results_available: 5,
  results_returned: 5,
  results_start: 1,
  genre: [
    { code: 'G001', name: '居酒屋' },
    { code: 'G002', name: '和食' },
  ],
}

export const mockHpLargeAreaResults: HotpepperLargeAreaResults = {
  results_available: 2,
  results_returned: 2,
  results_start: 1,
  large_area: [
    { code: 'Z011', name: '東京' },
    { code: 'Z012', name: '神奈川' },
  ],
}

export const mockHpMiddleAreaResults: HotpepperMiddleAreaResults = {
  results_available: 2,
  results_returned: 2,
  results_start: 1,
  middle_area: [
    { code: 'Y005', name: '渋谷', large_area: { code: 'Z011', name: '東京' } },
    { code: 'Y010', name: '恵比寿', large_area: { code: 'Z011', name: '東京' } },
  ],
}

export const mockHpSmallAreaResults: HotpepperSmallAreaResults = {
  results_available: 2,
  results_returned: 2,
  results_start: 1,
  small_area: [
    { code: 'X010', name: '渋谷駅周辺', middle_area: { code: 'Y005', name: '渋谷' } },
    { code: 'X011', name: '神南', middle_area: { code: 'Y005', name: '渋谷' } },
  ],
}
