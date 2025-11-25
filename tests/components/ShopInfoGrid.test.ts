import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

import ShopInfoGrid from '~/components/ShopInfoGrid.vue'
import { mockShopDetail } from '../fixtures/shops'

const createWrapper = (shopOverride = {}) =>
  mountSuspended(ShopInfoGrid, {
    props: {
      shop: {
        ...mockShopDetail,
        ...shopOverride,
      },
    },
  })

describe('ShopInfoGridコンポーネント', () => {
  it('セクションタイトルを表示する', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.get('[data-test="shop-info-title"]').text()).toBe('基本情報')
  })

  it('住所を表示する', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.get('[data-test="shop-info-address"]').text()).toContain('住所')
    expect(wrapper.get('[data-test="shop-info-address"]').text()).toContain(mockShopDetail.address)
  })

  it('最寄り駅がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithStation = await createWrapper()
    expect(wrapperWithStation.get('[data-test="shop-info-station"]').text()).toContain('最寄り駅')
    expect(wrapperWithStation.get('[data-test="shop-info-station"]').text()).toContain(
      mockShopDetail.stationName,
    )

    const wrapperWithoutStation = await createWrapper({ stationName: undefined })
    expect(wrapperWithoutStation.find('[data-test="shop-info-station"]').exists()).toBe(false)
  })

  it('アクセスがある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithAccess = await createWrapper()
    expect(wrapperWithAccess.get('[data-test="shop-info-access"]').text()).toContain('アクセス')
    expect(wrapperWithAccess.get('[data-test="shop-info-access"]').text()).toContain(
      mockShopDetail.access,
    )

    const wrapperWithoutAccess = await createWrapper({ access: undefined })
    expect(wrapperWithoutAccess.find('[data-test="shop-info-access"]').exists()).toBe(false)
  })

  it('営業時間がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithOpen = await createWrapper()
    expect(wrapperWithOpen.get('[data-test="shop-info-open"]').text()).toContain('営業時間')
    expect(wrapperWithOpen.get('[data-test="shop-info-open"]').text()).toContain(
      mockShopDetail.open,
    )

    const wrapperWithoutOpen = await createWrapper({ open: undefined })
    expect(wrapperWithoutOpen.find('[data-test="shop-info-open"]').exists()).toBe(false)
  })

  it('定休日がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithClose = await createWrapper()
    expect(wrapperWithClose.get('[data-test="shop-info-close"]').text()).toContain('定休日')
    expect(wrapperWithClose.get('[data-test="shop-info-close"]').text()).toContain(
      mockShopDetail.close,
    )

    const wrapperWithoutClose = await createWrapper({ close: undefined })
    expect(wrapperWithoutClose.find('[data-test="shop-info-close"]').exists()).toBe(false)
  })

  it('予算（name + average）を表示する', async () => {
    const wrapper = await createWrapper()

    expect(wrapper.get('[data-test="shop-info-budget"]').text()).toContain('予算')
    expect(wrapper.get('[data-test="shop-info-budget"]').text()).toContain(
      mockShopDetail.budget?.name,
    )
    expect(wrapper.get('[data-test="shop-info-budget"]').text()).toContain('平均')
    expect(wrapper.get('[data-test="shop-info-budget"]').text()).toContain(
      mockShopDetail.budget?.average,
    )
  })

  it('予算がnameのみの場合はnameだけ表示する', async () => {
    const wrapper = await createWrapper({
      budget: { name: '3001~4000円', average: undefined },
    })

    expect(wrapper.get('[data-test="shop-info-budget"]').text()).toContain('3001~4000円')
    expect(wrapper.get('[data-test="shop-info-budget"]').text()).not.toContain('平均')
  })

  it('予算がaverageのみの場合はaverageだけ表示する', async () => {
    const wrapper = await createWrapper({
      budget: { name: undefined, average: '3500円' },
    })

    expect(wrapper.get('[data-test="shop-info-budget"]').text()).toContain('3500円')
  })

  it('予算がない場合は非表示にする', async () => {
    const wrapper = await createWrapper({ budget: undefined })

    expect(wrapper.find('[data-test="shop-info-budget"]').exists()).toBe(false)
  })

  it('収容人数がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithCapacity = await createWrapper()
    expect(wrapperWithCapacity.get('[data-test="shop-info-capacity"]').text()).toContain('収容人数')
    expect(wrapperWithCapacity.get('[data-test="shop-info-capacity"]').text()).toContain('50名')

    const wrapperWithoutCapacity = await createWrapper({ capacity: undefined })
    expect(wrapperWithoutCapacity.find('[data-test="shop-info-capacity"]').exists()).toBe(false)
  })

  it('禁煙・喫煙情報がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithNonSmoking = await createWrapper()
    expect(wrapperWithNonSmoking.get('[data-test="shop-info-nonsmoking"]').text()).toContain(
      '禁煙・喫煙',
    )
    expect(wrapperWithNonSmoking.get('[data-test="shop-info-nonsmoking"]').text()).toContain(
      mockShopDetail.nonSmoking,
    )

    const wrapperWithoutNonSmoking = await createWrapper({ nonSmoking: undefined })
    expect(wrapperWithoutNonSmoking.find('[data-test="shop-info-nonsmoking"]').exists()).toBe(false)
  })

  it('駐車場情報がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithParking = await createWrapper()
    expect(wrapperWithParking.get('[data-test="shop-info-parking"]').text()).toContain('駐車場')
    expect(wrapperWithParking.get('[data-test="shop-info-parking"]').text()).toContain(
      mockShopDetail.parking,
    )

    const wrapperWithoutParking = await createWrapper({ parking: undefined })
    expect(wrapperWithoutParking.find('[data-test="shop-info-parking"]').exists()).toBe(false)
  })

  it('カード情報がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithCard = await createWrapper()
    expect(wrapperWithCard.get('[data-test="shop-info-card"]').text()).toContain('カード')
    expect(wrapperWithCard.get('[data-test="shop-info-card"]').text()).toContain(
      mockShopDetail.card,
    )

    const wrapperWithoutCard = await createWrapper({ card: undefined })
    expect(wrapperWithoutCard.find('[data-test="shop-info-card"]').exists()).toBe(false)
  })

  it('貸切情報がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithCharter = await createWrapper()
    expect(wrapperWithCharter.get('[data-test="shop-info-charter"]').text()).toContain('貸切')
    expect(wrapperWithCharter.get('[data-test="shop-info-charter"]').text()).toContain(
      mockShopDetail.charter,
    )

    const wrapperWithoutCharter = await createWrapper({ charter: undefined })
    expect(wrapperWithoutCharter.find('[data-test="shop-info-charter"]').exists()).toBe(false)
  })

  it('個室情報がある場合は表示、ない場合は非表示にする', async () => {
    const wrapperWithPrivateRoom = await createWrapper()
    expect(wrapperWithPrivateRoom.get('[data-test="shop-info-private-room"]').text()).toContain(
      '個室',
    )
    expect(wrapperWithPrivateRoom.get('[data-test="shop-info-private-room"]').text()).toContain(
      mockShopDetail.privateRoom,
    )

    const wrapperWithoutPrivateRoom = await createWrapper({ privateRoom: undefined })
    expect(wrapperWithoutPrivateRoom.find('[data-test="shop-info-private-room"]').exists()).toBe(
      false,
    )
  })

  it('全項目が空の場合はタイトルのみ表示される', async () => {
    const wrapper = await createWrapper({
      address: undefined,
      stationName: undefined,
      access: undefined,
      open: undefined,
      close: undefined,
      budget: undefined,
      capacity: undefined,
      nonSmoking: undefined,
      parking: undefined,
      card: undefined,
      charter: undefined,
      privateRoom: undefined,
    })

    expect(wrapper.get('[data-test="shop-info-title"]').text()).toBe('基本情報')
    expect(wrapper.find('[data-test="shop-info-address"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-station"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-access"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-open"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-close"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-budget"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-capacity"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-nonsmoking"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-parking"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-card"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-charter"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="shop-info-private-room"]').exists()).toBe(false)
  })
})
