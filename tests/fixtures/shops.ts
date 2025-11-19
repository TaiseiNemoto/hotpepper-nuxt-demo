/**
 * 店舗データのフィクスチャ
 * テストで使用するモックデータを定義
 */

export const mockShopSummary = {
  id: 'J001234567',
  name: 'テスト飲食店',
  address: '東京都渋谷区道玄坂1-2-3',
  lat: 35.658034,
  lng: 139.701636,
  genre: { code: 'G001', name: '居酒屋' },
  catch: '美味しい料理とお酒を楽しめるお店',
  photo: {
    s: 'https://placehold.co/100x100/f97316/white?text=Shop',
    m: 'https://placehold.co/200x200/f97316/white?text=Shop',
    l: 'https://placehold.co/400x400/f97316/white?text=Shop',
  },
  urlPc: 'https://www.hotpepper.jp/strJ001234567/',
}

export const mockShopDetail = {
  ...mockShopSummary,
  nameKana: 'てすといんしょくてん',
  access: 'JR渋谷駅より徒歩5分',
  stationName: '渋谷',
  open: '月~金: 17:00~23:00 (料理L.O. 22:00 ドリンクL.O. 22:30) 土日祝: 16:00~23:00',
  close: '年末年始(12/31~1/2)',
  capacity: 50,
  nonSmoking: '禁煙席あり',
  parking: 'なし',
  card: '利用可',
  charter: '貸切可',
  privateRoom: 'あり',
  budget: {
    code: 'B003',
    name: '3001~4000円',
    average: '3500円',
  },
}

export const mockShopList = [
  mockShopSummary,
  {
    ...mockShopSummary,
    id: 'J001234568',
    name: 'テスト飲食店2',
    address: '東京都新宿区新宿3-4-5',
    lat: 35.690921,
    lng: 139.700258,
    genre: { code: 'G002', name: 'イタリアン・フレンチ' },
  },
  {
    ...mockShopSummary,
    id: 'J001234569',
    name: 'テスト飲食店3',
    address: '東京都港区六本木6-7-8',
    lat: 35.664069,
    lng: 139.729489,
    genre: { code: 'G008', name: '焼肉・ホルモン' },
  },
]

export const mockSearchResponse = {
  total: 100,
  start: 1,
  returned: 3,
  shops: mockShopList,
}

export const mockSearchResponseEmpty = {
  total: 0,
  start: 1,
  returned: 0,
  shops: [],
}

export const mockShopDetailResponse = {
  shop: mockShopDetail,
}

export const mockShopDetailNotFound = {
  notFound: true,
}
