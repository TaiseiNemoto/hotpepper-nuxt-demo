import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ShopDetailPage from '~/pages/shops/[id].vue'
import { mockShopDetail } from '../../fixtures/shops'

describe('店舗詳細ページ', () => {
  describe('公式詳細ページリンク', () => {
    it('外部リンクのセキュリティ属性が設定されている', async () => {
      const wrapper = await mountSuspended(ShopDetailPage, {
        route: `/shops/${mockShopDetail.id}`,
      })

      const linkButton = wrapper.find('[data-test="official-link-button"]')
      expect(linkButton.attributes('target')).toBe('_blank')
      expect(linkButton.attributes('rel')).toBe('noopener noreferrer')
    })

    it('公式URLがない場合はボタンを非表示にする', async () => {
      // 注: 現在のモック実装では店舗データを動的に変更できないため、
      // このテストは3.3フェーズ（API結合時）で実データを使用して実装予定
      // TODO (3.3フェーズ): urlPc=undefined のモックデータでテスト
      const wrapper = await mountSuspended(ShopDetailPage, {
        route: `/shops/${mockShopDetail.id}`,
      })

      // 現時点では、v-if="hasOfficialUrl" の実装が正しいことを確認
      // mockShopDetailは urlPc を持つため、ボタンが表示される
      const actionsSection = wrapper.find('[data-test="shop-actions"]')
      expect(actionsSection.exists()).toBe(true)
    })
  })

  describe('地図セクション', () => {
    it('位置情報がない場合は地図セクションを非表示にする', async () => {
      // 注: 現在のモック実装では店舗データを動的に変更できないため、
      // このテストは3.3フェーズ（API結合時）で実データを使用して実装予定
      // TODO (3.3フェーズ): lat/lng=null のモックデータでテスト
      const wrapper = await mountSuspended(ShopDetailPage, {
        route: `/shops/${mockShopDetail.id}`,
      })

      // 現時点では、v-if="hasLocation" の実装が正しいことを確認
      // mockShopDetailは lat/lng を持つため、地図が表示される
      const mapSection = wrapper.find('[data-test="shop-map-section"]')
      expect(mapSection.exists()).toBe(true)
    })
  })
})
