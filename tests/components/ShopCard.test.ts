import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ShopCard from '~/components/ShopCard.vue'
import { mockShopSummary } from '../fixtures/shops'

const createWrapper = (shopOverride = {}) =>
  mountSuspended(ShopCard, {
    props: {
      shop: {
        ...mockShopSummary,
        ...shopOverride,
      },
    },
  })

describe('ShopCardコンポーネント', () => {
  it('店舗情報を表示できる', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.get('[data-test="shop-card-name"]').text()).toBe(mockShopSummary.name)
    expect(wrapper.get('[data-test="shop-card-genre"]').text()).toBe(mockShopSummary.genre?.name)
    expect(wrapper.get('[data-test="shop-card-link"]').attributes('href')).toBe(
      `/shops/${mockShopSummary.id}`,
    )
  })

  it('画像とalt属性を設定する', async () => {
    const wrapper = await createWrapper()

    const img = wrapper.get('[data-test="shop-card-photo"] img')
    expect(img.attributes('src')).toBe(mockShopSummary.photo?.m)
    expect(img.attributes('alt')).toBe(`${mockShopSummary.name} の写真`)
  })

  it('キャッチコピーがある場合は表示、ない場合は非表示にする', async () => {
    // ある場合
    const wrapperWithCatch = await createWrapper()
    expect(wrapperWithCatch.get('[data-test="shop-card-catch"]').text()).toBe(mockShopSummary.catch)

    // ない場合
    const wrapperWithoutCatch = await createWrapper({ catch: undefined })
    expect(wrapperWithoutCatch.find('[data-test="shop-card-catch"]').exists()).toBe(false)
  })

  it('画像が無い場合は「画像なし」を表示する', async () => {
    const wrapper = await createWrapper({ photo: undefined })

    expect(wrapper.find('[data-test="shop-card-photo"] img').exists()).toBe(false)
    expect(wrapper.get('[data-test="shop-card-photo"]').text()).toBe('画像なし')
  })

  it('ジャンル未設定の場合は「ジャンル未設定」を表示する', async () => {
    const wrapper = await createWrapper({ genre: undefined })

    expect(wrapper.get('[data-test="shop-card-genre"]').text()).toBe('ジャンル未設定')
  })
})
