import { jseApiHelper } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const navigationButtonId = 'hello-vera-js.navigation'
let poiSemanticObjectKeys = []
let siteId = undefined

async function init() {
  jseApiHelper.registerButtons({ buttons: [{ id: navigationButtonId }] })
  jseApiHelper.loaded()
  const siteConfig = await jseApiHelper.getSiteConfig()
  siteId = siteConfig.siteId
  const appConfig = await jseApiHelper.getAppConfig() // this is done too early. When loaded through link - appConfig is not ready.
  const pointsOfInterest = appConfig['Points of Interest']
  poiSemanticObjectKeys = pointsOfInterest?.map((poi => poi.key)) || []
  document.getElementById('navigate-deeplink-button').addEventListener('click', onNavigateUsingDeeplinkClick)
  document.getElementById('navigate-message-button').addEventListener('click', onNavigateUsingMessageClick)
  document.getElementById('show-map-button').addEventListener('click', onShowMapClick)
}
init()

function onNavigateUsingDeeplinkClick() {
  if (!isValidSemanticObjectKeys()) {
    return
  }
  const data = { key: poiSemanticObjectKeys[0] }
  const dataJson = JSON.stringify(data)
  const deepLinkParts = []
  const prefix = 'https://vera.resonai.com/#/play'
  deepLinkParts.push(prefix)
  deepLinkParts.push(encodeURIComponent(siteId))
  deepLinkParts.push(encodeURIComponent(navigationPackageName))
  deepLinkParts.push(encodeURIComponent(dataJson))
  const deepLinkUrl = deepLinkParts.join('/')
  console.log('openUrl: ', deepLinkUrl)
  jseApiHelper.openUrl(deepLinkUrl)
}

function onNavigateUsingMessageClick() {
  if (!isValidSemanticObjectKeys()) {
    return
  }
  const data = {
    msg: 'navigateTo',
    poi: poiSemanticObjectKeys[0]
  }
  jseApiHelper.sendArmeMessage({ packageName: navigationPackageName, data })
  alert(data.msg + ' message is not supported yet')
}

function onShowMapClick() {
  if (!isValidSemanticObjectKeys()) {
    return
  }
  const data = {
    msg: 'showMap',
    pois: poiSemanticObjectKeys
  }
  jseApiHelper.sendArmeMessage({ packageName: navigationPackageName, data })
  alert(data.msg + ' message is not supported yet')
}

function isValidSemanticObjectKeys() {
  if (poiSemanticObjectKeys.length === 0) {
    console.error('Please configure "Points of Interest" and refresh')
    return false
  }
  return true
}