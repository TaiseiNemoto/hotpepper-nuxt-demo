import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import PaginationControl from '~/components/PaginationControl.vue'

type PaginationProps = {
  currentPage?: number
  pageCount?: number
  total?: number
}

const createWrapper = (props: PaginationProps = {}) =>
  mountSuspended(PaginationControl, {
    props: {
      currentPage: props.currentPage ?? 1,
      pageCount: props.pageCount ?? 5,
      total: props.total ?? 100,
    },
  })

describe('Paginationコンポーネント', () => {
  describe('表示/非表示条件', () => {
    it('total=0 のとき非表示', async () => {
      const wrapper = await createWrapper({ total: 0, pageCount: 0 })
      expect(wrapper.find('[data-test="pagination"]').exists()).toBe(false)
    })

    it('pageCount=1 のとき非表示', async () => {
      const wrapper = await createWrapper({ total: 10, pageCount: 1 })
      expect(wrapper.find('[data-test="pagination"]').exists()).toBe(false)
    })

    it('pageCount>=2 のとき表示', async () => {
      const wrapper = await createWrapper({ total: 40, pageCount: 2 })
      expect(wrapper.find('[data-test="pagination"]').exists()).toBe(true)
    })
  })

  describe('前へ/次へボタン', () => {
    it('1ページ目で「前へ」が無効', async () => {
      const wrapper = await createWrapper({ currentPage: 1, pageCount: 5 })
      const prevBtn = wrapper.find('[data-test="pagination-prev"]')
      expect(prevBtn.attributes('disabled')).toBeDefined()
    })

    it('最終ページで「次へ」が無効', async () => {
      const wrapper = await createWrapper({ currentPage: 5, pageCount: 5 })
      const nextBtn = wrapper.find('[data-test="pagination-next"]')
      expect(nextBtn.attributes('disabled')).toBeDefined()
    })

    it('中間ページで両ボタンが有効', async () => {
      const wrapper = await createWrapper({ currentPage: 3, pageCount: 5 })
      const prevBtn = wrapper.find('[data-test="pagination-prev"]')
      const nextBtn = wrapper.find('[data-test="pagination-next"]')
      expect(prevBtn.attributes('disabled')).toBeUndefined()
      expect(nextBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('ページ番号表示', () => {
    it('7ページ以下で全ページ表示', async () => {
      const wrapper = await createWrapper({ currentPage: 1, pageCount: 7, total: 140 })
      for (let i = 1; i <= 7; i++) {
        expect(wrapper.find(`[data-test="pagination-page-${i}"]`).exists()).toBe(true)
      }
      // 省略記号は表示されない
      expect(wrapper.find('[data-test="pagination-ellipsis-start"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="pagination-ellipsis-end"]').exists()).toBe(false)
    })

    it('先頭付近でウィンドウ表示（1 2 3 4 5 … 20）', async () => {
      const wrapper = await createWrapper({ currentPage: 2, pageCount: 20, total: 400 })
      // 1, 2, 3, 4, 5, 20 が表示
      expect(wrapper.find('[data-test="pagination-page-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-5"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-20"]').exists()).toBe(true)
      // 末尾側の省略記号のみ表示
      expect(wrapper.find('[data-test="pagination-ellipsis-start"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="pagination-ellipsis-end"]').exists()).toBe(true)
    })

    it('末尾付近でウィンドウ表示（1 … 16 17 18 19 20）', async () => {
      const wrapper = await createWrapper({ currentPage: 19, pageCount: 20, total: 400 })
      expect(wrapper.find('[data-test="pagination-page-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-16"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-20"]').exists()).toBe(true)
      // 先頭側の省略記号のみ表示
      expect(wrapper.find('[data-test="pagination-ellipsis-start"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-ellipsis-end"]').exists()).toBe(false)
    })

    it('中央でウィンドウ表示（1 … 9 10 11 … 20）', async () => {
      const wrapper = await createWrapper({ currentPage: 10, pageCount: 20, total: 400 })
      expect(wrapper.find('[data-test="pagination-page-1"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-9"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-10"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-11"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-page-20"]').exists()).toBe(true)
      // 6, 7, 8 は非表示
      expect(wrapper.find('[data-test="pagination-page-6"]').exists()).toBe(false)
      // 両側の省略記号が表示
      expect(wrapper.find('[data-test="pagination-ellipsis-start"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="pagination-ellipsis-end"]').exists()).toBe(true)
    })
  })

  describe('イベント発火', () => {
    it('ページ番号クリックでupdate:pageを発火', async () => {
      const wrapper = await createWrapper({ currentPage: 1, pageCount: 5 })
      await wrapper.find('[data-test="pagination-page-3"]').trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[3]])
    })

    it('「次へ」クリックでupdate:pageを発火', async () => {
      const wrapper = await createWrapper({ currentPage: 2, pageCount: 5 })
      await wrapper.find('[data-test="pagination-next"]').trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[3]])
    })

    it('「前へ」クリックでupdate:pageを発火', async () => {
      const wrapper = await createWrapper({ currentPage: 3, pageCount: 5 })
      await wrapper.find('[data-test="pagination-prev"]').trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[2]])
    })

    it('現在ページのボタンはクリックしてもイベント発火しない', async () => {
      const wrapper = await createWrapper({ currentPage: 3, pageCount: 5 })
      await wrapper.find('[data-test="pagination-page-3"]').trigger('click')
      expect(wrapper.emitted('update:page')).toBeUndefined()
    })
  })

  describe('アクセシビリティ', () => {
    it('現在ページにaria-current="page"が設定される', async () => {
      const wrapper = await createWrapper({ currentPage: 3, pageCount: 5 })
      const currentPageBtn = wrapper.find('[data-test="pagination-page-3"]')
      expect(currentPageBtn.attributes('aria-current')).toBe('page')
    })

    it('他のページにはaria-currentがない', async () => {
      const wrapper = await createWrapper({ currentPage: 3, pageCount: 5 })
      const otherPageBtn = wrapper.find('[data-test="pagination-page-2"]')
      expect(otherPageBtn.attributes('aria-current')).toBeUndefined()
    })

    it('nav要素にaria-labelが設定される', async () => {
      const wrapper = await createWrapper()
      const nav = wrapper.find('nav')
      expect(nav.attributes('aria-label')).toBe('ページネーション')
    })
  })
})
