import { describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'

import SearchForm from '~/components/SearchForm.vue'
import { mockGenres, mockLargeAreas, mockMiddleAreas, mockSmallAreas } from '../fixtures/masters'

// navigateToをモック（vi.hoisted()を使用）
const mockNavigateTo = vi.hoisted(() => vi.fn())
mockNuxtImport('navigateTo', () => mockNavigateTo)

const createWrapper = (propsOverride = {}) =>
  mountSuspended(SearchForm, {
    props: {
      genres: mockGenres,
      largeAreas: mockLargeAreas,
      middleAreas: mockMiddleAreas,
      smallAreas: mockSmallAreas,
      ...propsOverride,
    },
  })

describe('SearchFormコンポーネント', () => {
  describe('キーワード入力フィールド', () => {
    it('キーワードを入力できる', async () => {
      const wrapper = await createWrapper()
      const input = wrapper.get<HTMLInputElement>('#sf-keyword')

      await input.setValue('焼肉')
      expect(input.element.value).toBe('焼肉')
    })

    it('最大100文字の制限がある', async () => {
      const wrapper = await createWrapper()
      const input = wrapper.get('#sf-keyword')

      expect(input.attributes('maxlength')).toBe('100')
    })
  })

  describe('ジャンル選択UI', () => {
    it('ジャンルを選択してバッジ表示できる', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.get<HTMLSelectElement>('select')

      // ジャンルを選択
      await select.setValue('G001')
      await select.trigger('change')

      // バッジが表示される
      expect(wrapper.text()).toContain('居酒屋')
    })

    it('選択済みジャンルをバッジから削除できる', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.get<HTMLSelectElement>('select')

      // ジャンルを選択
      await select.setValue('G001')
      await select.trigger('change')
      expect(wrapper.text()).toContain('居酒屋')

      // バッジの削除ボタンをクリック
      const badges = wrapper.findAll('button[type="button"]')
      const genreBadge = badges.find((b) => b.text().includes('居酒屋'))
      await genreBadge?.trigger('click')

      // バッジエリアから削除される（ドロップダウンには残る）
      const badgesAfter = wrapper.findAll('button[type="button"]')
      const genreBadgeAfter = badgesAfter.find((b) => b.text().includes('居酒屋'))
      expect(genreBadgeAfter).toBeUndefined()
    })

    it('最大2件まで選択できる', async () => {
      const wrapper = await createWrapper()
      const select = wrapper.get<HTMLSelectElement>('select')

      // 2件選択
      await select.setValue('G001')
      await select.trigger('change')
      await select.setValue('G002')
      await select.trigger('change')

      // セレクトボックスが無効化される
      expect(select.attributes('disabled')).toBeDefined()
    })
  })

  describe('エリア選択UI', () => {
    it('大エリアを選択してバッジ表示できる', async () => {
      const wrapper = await createWrapper()
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')

      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')

      expect(wrapper.text()).toContain('東京')
    })

    it('大エリア選択後に中エリアが選択可能になる', async () => {
      const wrapper = await createWrapper()
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')
      const middleSelect = wrapper.get<HTMLSelectElement>('#sf-middle-area')

      // 初期状態では中エリアは無効
      expect(middleSelect.element.disabled).toBe(true)

      // 大エリアを選択
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')

      // 中エリアが活性化
      expect(middleSelect.element.disabled).toBe(false)
    })

    it('中エリア選択後に小エリアが選択可能になる', async () => {
      const wrapper = await createWrapper()
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')
      const middleSelect = wrapper.get<HTMLSelectElement>('#sf-middle-area')
      const smallSelect = wrapper.get<HTMLSelectElement>('#sf-small-area')

      // 初期状態では小エリアは無効
      expect(smallSelect.element.disabled).toBe(true)

      // 大エリアを選択
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')

      // 中エリアを選択
      await middleSelect.setValue('Y005')
      await middleSelect.trigger('change')

      // 小エリアが活性化
      expect(smallSelect.element.disabled).toBe(false)
    })

    it('中エリア選択時に親の大エリアを自動選択する', async () => {
      const wrapper = await createWrapper()
      const middleSelect = wrapper.get<HTMLSelectElement>('#sf-middle-area')

      // まず大エリアを選択して中エリアを活性化
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')

      // 中エリアを選択
      await middleSelect.setValue('Y005')
      await middleSelect.trigger('change')

      // 親の大エリア「東京」がバッジ表示される
      expect(wrapper.text()).toContain('東京')
      expect(wrapper.text()).toContain('渋谷')
    })

    it('小エリア選択時に親の中・大エリアを自動選択する', async () => {
      const wrapper = await createWrapper()

      // 大エリアを選択
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')

      // 中エリアを選択
      const middleSelect = wrapper.get<HTMLSelectElement>('#sf-middle-area')
      await middleSelect.setValue('Y005')
      await middleSelect.trigger('change')

      // 小エリアを選択
      const smallSelect = wrapper.get<HTMLSelectElement>('#sf-small-area')
      await smallSelect.setValue('X010')
      await smallSelect.trigger('change')

      // すべての階層がバッジ表示される
      expect(wrapper.text()).toContain('東京')
      expect(wrapper.text()).toContain('渋谷')
      expect(wrapper.text()).toContain('渋谷駅周辺')
    })

    it('親エリア削除時に配下のエリアを自動削除する', async () => {
      const wrapper = await createWrapper()

      // 大エリアを選択
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')

      // 中エリアを選択
      const middleSelect = wrapper.get<HTMLSelectElement>('#sf-middle-area')
      await middleSelect.setValue('Y005')
      await middleSelect.trigger('change')

      // 小エリアを選択
      const smallSelect = wrapper.get<HTMLSelectElement>('#sf-small-area')
      await smallSelect.setValue('X010')
      await smallSelect.trigger('change')

      // バッジが表示されていることを確認
      expect(wrapper.text()).toContain('東京')
      expect(wrapper.text()).toContain('渋谷')
      expect(wrapper.text()).toContain('渋谷駅周辺')

      // 大エリアのバッジを削除
      const badges = wrapper.findAll('button[type="button"]')
      const largeBadge = badges.find((b) => b.text().includes('東京') && b.text().includes('削除'))
      await largeBadge?.trigger('click')

      // すべてのバッジが削除される（ドロップダウンには残る）
      const badgesAfter = wrapper.findAll('button[type="button"]')
      const tokyoBadge = badgesAfter.find(
        (b) => b.text().includes('東京') && b.text().includes('削除'),
      )
      const shibuyaBadge = badgesAfter.find(
        (b) => b.text().includes('渋谷') && b.text().includes('削除'),
      )
      const shibuyaStationBadge = badgesAfter.find(
        (b) => b.text().includes('渋谷駅周辺') && b.text().includes('削除'),
      )
      expect(tokyoBadge).toBeUndefined()
      expect(shibuyaBadge).toBeUndefined()
      expect(shibuyaStationBadge).toBeUndefined()
    })

    it('大エリアは最大3件まで選択できる', async () => {
      const wrapper = await createWrapper()
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')

      // 3件選択
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')
      await largeSelect.setValue('Z012')
      await largeSelect.trigger('change')
      await largeSelect.setValue('Z013')
      await largeSelect.trigger('change')

      // セレクトボックスが無効化される
      expect(largeSelect.attributes('disabled')).toBeDefined()
    })
  })

  describe('検索ボタンとバリデーション', () => {
    it('すべてのフィールドが空の場合は検索ボタンが無効化される', async () => {
      const wrapper = await createWrapper()
      const submitButton = wrapper.get('button[type="submit"]')

      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('キーワードを入力すると検索ボタンが有効化される', async () => {
      const wrapper = await createWrapper()
      const input = wrapper.get('#sf-keyword')
      const submitButton = wrapper.get('button[type="submit"]')

      await input.setValue('焼肉')

      expect(submitButton.attributes('disabled')).toBeUndefined()
    })

    it('検索ボタンクリック時に正しいURLで遷移する（キーワードのみ）', async () => {
      mockNavigateTo.mockClear()

      const wrapper = await createWrapper()
      const input = wrapper.get('#sf-keyword')
      const submitButton = wrapper.get('button[type="submit"]')

      await input.setValue('焼肉')
      await submitButton.trigger('submit')

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/shops',
        query: { q: '焼肉' },
      })
    })

    it('検索ボタンクリック時に正しいURLで遷移する（すべての条件）', async () => {
      mockNavigateTo.mockClear()

      const wrapper = await createWrapper()
      const keywordInput = wrapper.get('#sf-keyword')
      const genreSelect = wrapper.get<HTMLSelectElement>('select')
      const largeSelect = wrapper.get<HTMLSelectElement>('#sf-large-area')
      const middleSelect = wrapper.get<HTMLSelectElement>('#sf-middle-area')
      const smallSelect = wrapper.get<HTMLSelectElement>('#sf-small-area')
      const submitButton = wrapper.get('button[type="submit"]')

      // キーワード入力
      await keywordInput.setValue('焼肉')

      // ジャンル選択
      await genreSelect.setValue('G001')
      await genreSelect.trigger('change')

      // エリア選択
      await largeSelect.setValue('Z011')
      await largeSelect.trigger('change')
      await middleSelect.setValue('Y005')
      await middleSelect.trigger('change')
      await smallSelect.setValue('X010')
      await smallSelect.trigger('change')

      // 検索実行
      await submitButton.trigger('submit')

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/shops',
        query: {
          q: '焼肉',
          genres: 'G001',
          area_l: 'Z011',
          area_m: 'Y005',
          area_s: 'X010',
        },
      })
    })

    it('キーワードの前後の空白をトリムして遷移する', async () => {
      mockNavigateTo.mockClear()

      const wrapper = await createWrapper()
      const input = wrapper.get('#sf-keyword')
      const submitButton = wrapper.get('button[type="submit"]')

      await input.setValue('  焼肉  ')
      await submitButton.trigger('submit')

      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/shops',
        query: { q: '焼肉' },
      })
    })
  })
})
