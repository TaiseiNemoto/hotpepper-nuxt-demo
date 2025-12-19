import { beforeEach, describe, expect, it } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { AREA_LIMITS, useAreaSelection } from '~/composables/useAreaSelection'
import { mockLargeAreas, mockMiddleAreas, mockSmallAreas } from '../fixtures/masters'
import type { MiddleArea, SmallArea } from '../../server/types/hp-internal'

// useMiddleAreasとuseSmallAreasをモック
const mockMiddleAreasState = ref<MiddleArea[]>([])
const mockSmallAreasState = ref<SmallArea[]>([])
const mockIsLoadingMiddle = ref(false)
const mockIsLoadingSmall = ref(false)

mockNuxtImport('useMiddleAreas', () => {
  return (largeAreaCodes?: Ref<string[]>) => {
    // 大エリアコードが変更されたら中エリアを更新
    watch(
      () => largeAreaCodes?.value ?? [],
      (codes) => {
        if (codes.length > 0) {
          mockMiddleAreasState.value = mockMiddleAreas.filter((area) =>
            codes.includes(area.parentLarge.code),
          )
        } else {
          mockMiddleAreasState.value = []
        }
      },
      { immediate: true },
    )

    return {
      areas: computed(() => mockMiddleAreasState.value),
      isLoading: mockIsLoadingMiddle,
      apiError: computed(() => null),
      errorMessage: computed(() => ''),
    }
  }
})

mockNuxtImport('useSmallAreas', () => {
  return (middleAreaCodes?: Ref<string[]>) => {
    // 中エリアコードが変更されたら小エリアを更新
    watch(
      () => middleAreaCodes?.value ?? [],
      (codes) => {
        if (codes.length > 0) {
          mockSmallAreasState.value = mockSmallAreas.filter(
            (area) => area.parentMiddle && codes.includes(area.parentMiddle.code),
          )
        } else {
          mockSmallAreasState.value = []
        }
      },
      { immediate: true },
    )

    return {
      areas: computed(() => mockSmallAreasState.value),
      isLoading: mockIsLoadingSmall,
      apiError: computed(() => null),
      errorMessage: computed(() => ''),
    }
  }
})

describe('useAreaSelection', () => {
  beforeEach(() => {
    mockMiddleAreasState.value = []
    mockSmallAreasState.value = []
    mockIsLoadingMiddle.value = false
    mockIsLoadingSmall.value = false
  })

  describe('エリア選択', () => {
    it('大エリアを選択できる', () => {
      const { selectedLargeAreas, addLargeAreaByCode } = useAreaSelection(mockLargeAreas)

      addLargeAreaByCode('Z011')

      expect(selectedLargeAreas.value).toEqual(['Z011'])
    })

    it('中エリアを選択できる', () => {
      const { selectedLargeAreas, selectedMiddleAreas, addLargeAreaByCode, addMiddleAreaByCode } =
        useAreaSelection(mockLargeAreas)

      // 大エリアを選択
      addLargeAreaByCode('Z011')

      // 中エリアを選択
      addMiddleAreaByCode('Y005')

      expect(selectedLargeAreas.value).toEqual(['Z011'])
      expect(selectedMiddleAreas.value).toEqual(['Y005'])
    })

    it('小エリアを選択できる', () => {
      const {
        selectedLargeAreas,
        selectedMiddleAreas,
        selectedSmallAreas,
        addLargeAreaByCode,
        addMiddleAreaByCode,
        addSmallAreaByCode,
      } = useAreaSelection(mockLargeAreas)

      // 大エリアを選択
      addLargeAreaByCode('Z011')

      // 中エリアを選択
      addMiddleAreaByCode('Y005')

      // 小エリアを選択
      addSmallAreaByCode('X010')

      expect(selectedLargeAreas.value).toEqual(['Z011'])
      expect(selectedMiddleAreas.value).toEqual(['Y005'])
      expect(selectedSmallAreas.value).toEqual(['X010'])
    })
  })

  describe('上限チェック', () => {
    it('大エリアは最大3件まで選択できる', () => {
      const { selectedLargeAreas, addLargeAreaByCode } = useAreaSelection(mockLargeAreas)

      // 3件選択
      addLargeAreaByCode('Z011')
      addLargeAreaByCode('Z012')
      addLargeAreaByCode('Z013')

      expect(selectedLargeAreas.value).toHaveLength(AREA_LIMITS.LARGE_AREAS)

      // 4件目は追加されない
      addLargeAreaByCode('Z014')
      expect(selectedLargeAreas.value).toHaveLength(AREA_LIMITS.LARGE_AREAS)
    })

    it('中エリアは最大5件まで選択できる', () => {
      const { selectedMiddleAreas, addLargeAreaByCode, addMiddleAreaByCode } =
        useAreaSelection(mockLargeAreas)

      // 大エリアを選択
      addLargeAreaByCode('Z011')

      // 5件の中エリアを選択
      const middleAreaCodes = ['Y005', 'Y010', 'Y015', 'Y020', 'Y025']
      middleAreaCodes.forEach((code) => {
        addMiddleAreaByCode(code)
      })

      expect(selectedMiddleAreas.value).toHaveLength(AREA_LIMITS.MIDDLE_AREAS)

      // 6件目は追加されない
      addMiddleAreaByCode('Y030')
      expect(selectedMiddleAreas.value).toHaveLength(AREA_LIMITS.MIDDLE_AREAS)
    })
  })

  describe('連鎖削除', () => {
    it('大エリア削除時に配下の中・小エリアも削除される', async () => {
      const {
        selectedLargeAreas,
        selectedMiddleAreas,
        selectedSmallAreas,
        addLargeAreaByCode,
        addMiddleAreaByCode,
        addSmallAreaByCode,
        removeLargeArea,
      } = useAreaSelection(mockLargeAreas)

      // 各階層のエリアを選択
      addLargeAreaByCode('Z011')
      await flushPromises()

      addMiddleAreaByCode('Y005')
      await flushPromises()

      addSmallAreaByCode('X010')
      await flushPromises()

      expect(selectedLargeAreas.value).toEqual(['Z011'])
      expect(selectedMiddleAreas.value).toEqual(['Y005'])
      expect(selectedSmallAreas.value).toEqual(['X010'])

      // 大エリアを削除
      removeLargeArea('Z011')
      await flushPromises()

      // すべてのエリアが削除される
      expect(selectedLargeAreas.value).toEqual([])
      expect(selectedMiddleAreas.value).toEqual([])
      expect(selectedSmallAreas.value).toEqual([])
    })

    it('中エリア削除時に配下の小エリアも削除される', async () => {
      const {
        selectedMiddleAreas,
        selectedSmallAreas,
        addLargeAreaByCode,
        addMiddleAreaByCode,
        addSmallAreaByCode,
        removeMiddleArea,
      } = useAreaSelection(mockLargeAreas)

      // 各階層のエリアを選択
      addLargeAreaByCode('Z011')
      await flushPromises()

      addMiddleAreaByCode('Y005')
      await flushPromises()

      addSmallAreaByCode('X010')
      await flushPromises()

      expect(selectedMiddleAreas.value).toEqual(['Y005'])
      expect(selectedSmallAreas.value).toEqual(['X010'])

      // 中エリアを削除
      removeMiddleArea('Y005')
      await flushPromises()

      // 中エリアと小エリアが削除される
      expect(selectedMiddleAreas.value).toEqual([])
      expect(selectedSmallAreas.value).toEqual([])
    })
  })

  describe('ローディング状態', () => {
    it('中エリアのローディング状態を返す', () => {
      const { isLoadingMiddle } = useAreaSelection(mockLargeAreas)

      expect(isLoadingMiddle.value).toBe(false)

      mockIsLoadingMiddle.value = true
      expect(isLoadingMiddle.value).toBe(true)
    })

    it('小エリアのローディング状態を返す', () => {
      const { isLoadingSmall } = useAreaSelection(mockLargeAreas)

      expect(isLoadingSmall.value).toBe(false)

      mockIsLoadingSmall.value = true
      expect(isLoadingSmall.value).toBe(true)
    })
  })
})
