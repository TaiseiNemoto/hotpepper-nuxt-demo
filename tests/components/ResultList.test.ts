import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ResultList from '~/components/ResultList.vue'
import { mockShopList } from '../fixtures/shops'

const createWrapper = (props: { shops?: typeof mockShopList; isLoading?: boolean } = {}) =>
  mountSuspended(ResultList, {
    props: {
      shops: props.shops ?? mockShopList,
      isLoading: props.isLoading ?? false,
    },
  })

describe('ResultListコンポーネント', () => {
  it('店舗リストを表示できる', async () => {
    const wrapper = await createWrapper()

    // リストコンテナが表示される
    expect(wrapper.find('[data-test="result-list-items"]').exists()).toBe(true)

    // 各店舗カードが表示される
    for (const shop of mockShopList) {
      expect(wrapper.find(`[data-test="result-list-item-${shop.id}"]`).exists()).toBe(true)
    }

    // 店舗数と一致する
    const items = wrapper.findAll('[data-test^="result-list-item-"]')
    expect(items.length).toBe(mockShopList.length)
  })

  it('0件時にメッセージを表示する', async () => {
    const wrapper = await createWrapper({ shops: [] })

    // 空結果のメッセージが表示される
    const emptyMessage = wrapper.find('[data-test="result-list-empty"]')
    expect(emptyMessage.exists()).toBe(true)
    expect(emptyMessage.text()).toContain('検索条件に一致する店舗が見つかりませんでした')
    expect(emptyMessage.text()).toContain('条件を変更して再検索してください')

    // リストは表示されない
    expect(wrapper.find('[data-test="result-list-items"]').exists()).toBe(false)
  })

  it('ローディング状態でスケルトンを表示する', async () => {
    const wrapper = await createWrapper({ shops: [], isLoading: true })

    // スケルトンが表示される
    expect(wrapper.find('[data-test="result-list-loading"]').exists()).toBe(true)

    // 10件のスケルトンカードが表示される
    const skeletons = wrapper.findAll('[data-test="result-list-loading"] > div')
    expect(skeletons.length).toBe(10)

    // リストや空結果は表示されない
    expect(wrapper.find('[data-test="result-list-items"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="result-list-empty"]').exists()).toBe(false)
  })

  it('ローディング中は店舗があってもスケルトンを優先表示する', async () => {
    const wrapper = await createWrapper({ shops: mockShopList, isLoading: true })

    // スケルトンが表示される
    expect(wrapper.find('[data-test="result-list-loading"]').exists()).toBe(true)

    // リストは表示されない
    expect(wrapper.find('[data-test="result-list-items"]').exists()).toBe(false)
  })
})
