import type { LargeArea, MiddleArea, SmallArea } from '../../server/types/hp-internal'

// 選択数の上限
export const AREA_LIMITS = {
  LARGE_AREAS: 3,
  MIDDLE_AREAS: 5,
  SMALL_AREAS: 5,
} as const

// 汎用的なgetName関数
const getName = <T extends { code: string; name: string }>(items: T[], code: string): string => {
  return items.find((item) => item.code === code)?.name ?? code
}

export function useAreaSelection(largeAreas: LargeArea[]) {
  // Reactive state 定義
  const selectedLargeAreas = ref<string[]>([])
  const selectedMiddleAreas = ref<string[]>([])
  const selectedSmallAreas = ref<string[]>([])

  // 動的データ取得
  const { areas: middleAreas, isLoading: isLoadingMiddle } = useMiddleAreas(selectedLargeAreas)
  const { areas: smallAreas, isLoading: isLoadingSmall } = useSmallAreas(selectedMiddleAreas)

  // 追加用の一時変数
  const largeAreaToAdd = ref<string>('')
  const middleAreaToAdd = ref<string>('')
  const smallAreaToAdd = ref<string>('')

  // エリア関連の処理
  const availableLargeAreas = computed(() => {
    return largeAreas.filter((a) => !selectedLargeAreas.value.includes(a.code))
  })

  // パフォーマンス最適化: 中エリアを大エリアごとにグループ化
  const middleAreasByLarge = computed(() => {
    const map = new Map<string, MiddleArea[]>()
    middleAreas.value.forEach((area) => {
      const key = area.parentLarge.code
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(area)
    })
    return map
  })

  const availableMiddleAreas = computed(() => {
    return selectedLargeAreas.value
      .flatMap((code) => middleAreasByLarge.value.get(code) ?? [])
      .filter((a) => !selectedMiddleAreas.value.includes(a.code))
  })

  // パフォーマンス最適化: 小エリアを中エリアごとにグループ化
  const smallAreasByMiddle = computed(() => {
    const map = new Map<string, SmallArea[]>()
    smallAreas.value.forEach((area) => {
      const parentMiddle = area.parentMiddle
      if (parentMiddle) {
        const key = parentMiddle.code
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(area)
      }
    })
    return map
  })

  const availableSmallAreas = computed(() => {
    return selectedMiddleAreas.value
      .flatMap((code) => smallAreasByMiddle.value.get(code) ?? [])
      .filter((a) => !selectedSmallAreas.value.includes(a.code))
  })

  const getLargeAreaName = (code: string) => getName(largeAreas, code)

  const getMiddleAreaName = (code: string) => getName(middleAreas.value, code)

  const getSmallAreaName = (code: string) => getName(smallAreas.value, code)

  const addLargeArea = () => {
    if (largeAreaToAdd.value && selectedLargeAreas.value.length < AREA_LIMITS.LARGE_AREAS) {
      selectedLargeAreas.value = [...selectedLargeAreas.value, largeAreaToAdd.value]
      largeAreaToAdd.value = ''
    }
  }

  const addMiddleArea = () => {
    if (middleAreaToAdd.value && selectedMiddleAreas.value.length < AREA_LIMITS.MIDDLE_AREAS) {
      selectedMiddleAreas.value = [...selectedMiddleAreas.value, middleAreaToAdd.value]
      middleAreaToAdd.value = ''
    }
  }

  const addSmallArea = () => {
    if (smallAreaToAdd.value && selectedSmallAreas.value.length < AREA_LIMITS.SMALL_AREAS) {
      selectedSmallAreas.value = [...selectedSmallAreas.value, smallAreaToAdd.value]
      smallAreaToAdd.value = ''
    }
  }

  const removeLargeArea = (code: string) => {
    // 配下の中・小エリアも削除
    const relatedMiddleAreas = middleAreas.value
      .filter((a) => a.parentLarge.code === code)
      .map((a) => a.code)
    selectedMiddleAreas.value = selectedMiddleAreas.value.filter(
      (c) => !relatedMiddleAreas.includes(c),
    )

    const relatedSmallAreas = smallAreas.value
      .filter((a) => a.parentMiddle && relatedMiddleAreas.includes(a.parentMiddle.code))
      .map((a) => a.code)
    selectedSmallAreas.value = selectedSmallAreas.value.filter(
      (c) => !relatedSmallAreas.includes(c),
    )

    selectedLargeAreas.value = selectedLargeAreas.value.filter((c) => c !== code)
  }

  const removeMiddleArea = (code: string) => {
    // 配下の小エリアも削除
    const relatedSmallAreas = smallAreas.value
      .filter((a) => a.parentMiddle?.code === code)
      .map((a) => a.code)
    selectedSmallAreas.value = selectedSmallAreas.value.filter(
      (c) => !relatedSmallAreas.includes(c),
    )

    selectedMiddleAreas.value = selectedMiddleAreas.value.filter((c) => c !== code)
  }

  const removeSmallArea = (code: string) => {
    selectedSmallAreas.value = selectedSmallAreas.value.filter((c) => c !== code)
  }

  return {
    // State
    selectedLargeAreas,
    selectedMiddleAreas,
    selectedSmallAreas,
    largeAreaToAdd,
    middleAreaToAdd,
    smallAreaToAdd,
    // Computed
    availableLargeAreas,
    availableMiddleAreas,
    availableSmallAreas,
    // Loading state
    isLoadingMiddle,
    isLoadingSmall,
    // Methods
    getLargeAreaName,
    getMiddleAreaName,
    getSmallAreaName,
    addLargeArea,
    addMiddleArea,
    addSmallArea,
    removeLargeArea,
    removeMiddleArea,
    removeSmallArea,
  }
}
