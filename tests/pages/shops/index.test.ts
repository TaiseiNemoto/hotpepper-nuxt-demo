import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ShopsIndexPage from '~/pages/shops/index.vue'

describe('検索結果ページ', () => {
  describe('ページ見出しの動的生成', () => {
    it('デフォルト見出しを表示', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('検索結果')
    })

    it('URLクエリに応じて見出しが変化する', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?q=ラーメン',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      // 具体的な文字列ではなく、パターンをテスト
      expect(heading.text()).toContain('ラーメン')
      expect(heading.text()).toContain('検索結果')
    })

    it('複数条件の見出しを生成する', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops?genres=G001,G002',
      })

      const heading = wrapper.find('[data-test="page-heading"]')
      // 複数ジャンルが中黒で連結されることを確認（具体値は問わない）
      expect(heading.text()).toMatch(/・/)
      expect(heading.text()).toContain('検索結果')
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

    it('タブクリックで表示切替とaria-selected更新', async () => {
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

    it('地図タブでPaginationが非表示になる', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      // 地図タブに切り替え
      await wrapper.find('[data-test="tab-map"]').trigger('click')

      // Paginationが非表示（v-if による条件分岐）
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

    it('タブリストにrole="tablist"とaria-labelが設定される', async () => {
      const wrapper = await mountSuspended(ShopsIndexPage, {
        route: '/shops',
      })

      const tablist = wrapper.find('[role="tablist"]')
      expect(tablist.exists()).toBe(true)
      expect(tablist.attributes('aria-label')).toBe('表示切替')
    })

    it('選択状態でtabindex切替', async () => {
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
  })
})
