import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ShopsIndexPage from '~/pages/shops/index.vue'

describe('検索結果ページ', () => {
  describe('ページ見出しの動的生成', () => {
    it('クエリなしの場合、デフォルト見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('検索結果')
    })

    it('キーワードクエリがある場合、キーワード入り見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「ラーメン」の検索結果')
    })

    it('ジャンルクエリがある場合、ジャンル名入り見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?genres=G001',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「居酒屋」の検索結果')
    })

    it('複数ジャンルの場合、中黒で連結した見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?genres=G001,G002',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toContain('居酒屋・イタリアン')
    })

    it('小エリアクエリがある場合、エリア名入り見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?area_s=X010',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「渋谷駅周辺」エリアの検索結果')
    })

    it('中エリアクエリがある場合、エリア名入り見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?area_m=Y005',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「渋谷」エリアの検索結果')
    })

    it('大エリアクエリがある場合、エリア名入り見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?area_l=Z011',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.text()).toBe('「東京」エリアの検索結果')
    })
  })

  describe('タブ切替UI', () => {
    it('デフォルトで一覧タブが選択されている', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')

      expect(listTab.attributes('aria-selected')).toBe('true')
      expect(mapTab.attributes('aria-selected')).toBe('false')
    })

    it('地図タブをクリックすると地図が表示される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // 初期状態: 一覧が表示
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(true)

      // 地図タブをクリック
      await wrapper.find('[data-test="tab-map"]').trigger('click')

      // タブの選択状態が変更される
      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')
      expect(listTab.attributes('aria-selected')).toBe('false')
      expect(mapTab.attributes('aria-selected')).toBe('true')

      // 一覧が非表示になる
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(false)
    })

    it('一覧タブに戻ると一覧が表示される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // 地図タブに切り替え
      await wrapper.find('[data-test="tab-map"]').trigger('click')

      // 一覧タブに戻る
      await wrapper.find('[data-test="tab-list"]').trigger('click')

      // タブの選択状態が変更される
      const listTab = wrapper.find('[data-test="tab-list"]')
      expect(listTab.attributes('aria-selected')).toBe('true')

      // 一覧が表示される
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(true)
    })
  })

  describe('コンポーネント表示', () => {
    it('SearchFormが表示される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // SearchFormコンポーネントが存在する
      const searchForm = wrapper.findComponent({ name: 'SearchForm' })
      expect(searchForm.exists()).toBe(true)
    })

    it('一覧タブでResultListとPaginationが表示される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // ResultListが表示される
      expect(wrapper.find('[data-test="result-list"]').exists()).toBe(true)

      // Paginationが表示される
      expect(wrapper.find('[data-test="pagination"]').exists()).toBe(true)
    })

    it('地図タブでPaginationが非表示になる', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // 地図タブに切り替え
      await wrapper.find('[data-test="tab-map"]').trigger('click')

      // Paginationが非表示
      expect(wrapper.find('[data-test="pagination"]').exists()).toBe(false)
    })
  })

  describe('アクセシビリティ', () => {
    it('タブにrole="tab"が設定される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')

      expect(listTab.attributes('role')).toBe('tab')
      expect(mapTab.attributes('role')).toBe('tab')
    })

    it('タブリストにrole="tablist"が設定される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const tablist = wrapper.find('[role="tablist"]')
      expect(tablist.exists()).toBe(true)
      expect(tablist.attributes('aria-label')).toBe('表示切替')
    })

    it('選択されたタブはtabindex=0、非選択はtabindex=-1', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const listTab = wrapper.find('[data-test="tab-list"]')
      const mapTab = wrapper.find('[data-test="tab-map"]')

      // 初期状態: 一覧タブが選択
      expect(listTab.attributes('tabindex')).toBe('0')
      expect(mapTab.attributes('tabindex')).toBe('-1')

      // 地図タブに切り替え
      await mapTab.trigger('click')

      expect(listTab.attributes('tabindex')).toBe('-1')
      expect(mapTab.attributes('tabindex')).toBe('0')
    })

    it('h1見出しが存在する', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const h1 = wrapper.find('h1')
      expect(h1.exists()).toBe(true)
      expect(h1.text()).toBeTruthy()
    })
  })
})
