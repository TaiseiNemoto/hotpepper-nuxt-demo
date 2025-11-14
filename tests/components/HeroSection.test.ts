import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import HeroSection from '~/components/HeroSection.vue'

describe('HeroSectionコンポーネント', () => {
  describe('表示内容', () => {
    it('ページタイトル（h1）が表示される', async () => {
      const wrapper = await mountSuspended(HeroSection)

      const heading = wrapper.find('h1')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('HotPepper Gourmet 飲食店検索')
    })

    it('キャッチコピーが表示される', async () => {
      const wrapper = await mountSuspended(HeroSection)

      expect(wrapper.text()).toContain('あなたにぴったりのお店を見つけよう')
    })

    it('説明文が表示される', async () => {
      const wrapper = await mountSuspended(HeroSection)

      expect(wrapper.text()).toContain(
        'エリアやジャンルから、あなたの好みに合ったお店を簡単に探せます。',
      )
    })
  })
})
