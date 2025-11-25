import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ShopHeader from '~/components/ShopHeader.vue'
import { mockShopDetail } from '../fixtures/shops'

const createWrapper = (shopOverride = {}) =>
  mountSuspended(ShopHeader, {
    props: {
      shop: {
        ...mockShopDetail,
        ...shopOverride,
      },
    },
  })

describe('ShopHeaderコンポーネント', () => {
  it('店舗情報を表示できる', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.get('[data-test="shop-header-name"]').text()).toBe(mockShopDetail.name)
    expect(wrapper.get('[data-test="shop-header-genre"]').text()).toBe(mockShopDetail.genre?.name)
    expect(wrapper.get('[data-test="shop-header-catch"]').text()).toBe(mockShopDetail.catch)
  })

  it('店名をH1タグで表示する', async () => {
    const wrapper = await createWrapper()

    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe(mockShopDetail.name)
  })

  it('画像とalt属性を設定する', async () => {
    const wrapper = await createWrapper()

    const img = wrapper.get('[data-test="shop-header-photo"] img')
    expect(img.attributes('src')).toBe(mockShopDetail.photo?.l)
    expect(img.attributes('alt')).toBe(`${mockShopDetail.name} の写真`)
  })

  it('キャッチコピーがある場合は表示、ない場合は非表示にする', async () => {
    // ある場合
    const wrapperWithCatch = await createWrapper()
    expect(wrapperWithCatch.get('[data-test="shop-header-catch"]').text()).toBe(
      mockShopDetail.catch,
    )

    // ない場合
    const wrapperWithoutCatch = await createWrapper({ catch: undefined })
    expect(wrapperWithoutCatch.find('[data-test="shop-header-catch"]').exists()).toBe(false)
  })

  it('画像が無い場合は「画像なし」を表示する', async () => {
    const wrapper = await createWrapper({ photo: undefined })

    expect(wrapper.find('[data-test="shop-header-photo"] img').exists()).toBe(false)
    expect(wrapper.get('[data-test="shop-header-photo"]').text()).toBe('画像なし')
  })

  it('ジャンル未設定の場合は「ジャンル未設定」を表示する', async () => {
    const wrapper = await createWrapper({ genre: undefined })

    expect(wrapper.get('[data-test="shop-header-genre"]').text()).toBe('ジャンル未設定')
  })
})
