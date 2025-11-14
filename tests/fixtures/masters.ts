/**
 * マスタデータのフィクスチャ
 * ジャンル、エリアなどのテストデータを定義
 */

export const mockGenres = [
  { code: 'G001', name: '居酒屋' },
  { code: 'G002', name: 'イタリアン・フレンチ' },
  { code: 'G003', name: '中華' },
  { code: 'G004', name: '和食' },
  { code: 'G005', name: '焼肉・ホルモン' },
]

export const mockGenresResponse = {
  genres: mockGenres,
}

export const mockLargeAreas = [
  { code: 'Z011', name: '東京' },
  { code: 'Z012', name: '神奈川' },
  { code: 'Z013', name: '埼玉' },
]

export const mockLargeAreasResponse = {
  areas: mockLargeAreas,
}

export const mockMiddleAreas = [
  { code: 'Y005', name: '渋谷', parentLarge: { code: 'Z011', name: '東京' } },
  { code: 'Y007', name: '新宿', parentLarge: { code: 'Z011', name: '東京' } },
  { code: 'Y010', name: '銀座・有楽町', parentLarge: { code: 'Z011', name: '東京' } },
]

export const mockMiddleAreasResponse = {
  areas: mockMiddleAreas,
}

export const mockSmallAreas = [
  { code: 'X010', name: '渋谷駅周辺', parentMiddle: { code: 'Y005', name: '渋谷' } },
  { code: 'X011', name: '神泉・代官山', parentMiddle: { code: 'Y005', name: '渋谷' } },
  { code: 'X012', name: '恵比寿・代官山', parentMiddle: { code: 'Y005', name: '渋谷' } },
]

export const mockSmallAreasResponse = {
  areas: mockSmallAreas,
}
