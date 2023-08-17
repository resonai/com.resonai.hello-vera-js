import { veraApi } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const communicationSamplePackageName = 'com.resonai.sdk.sample.communication'
const communicationButtonName = 'Start Communication'
let pointOfInterest = undefined
let siteId = undefined

async function init() {
  veraApi.registerButtons({ buttons: [{
    name: communicationButtonName, isRegistered: true }] })

  veraApi.onMessage(async (data) => {
    console.log(communicationSamplePackageName, 'onMessage', data)
    if (data.action === 'navigationSuccess') {
      // Briefly show the navigation success message
      const msgElement = document.getElementById('dest-reached')
      msgElement.style.display = "block"
      setTimeout(function() {
        msgElement.style.display = "none"
      }, 3000)
    }
    veraApi.tryOpen({ activityId: 'start' })
  })
  veraApi.loaded()

  const siteConfig = await veraApi.getSiteConfig()
  siteId = siteConfig.siteId
  const appConfig = await veraApi.getAppConfig()
  pointOfInterest = appConfig['POI']
  document.getElementById('navigate-message-button').addEventListener('click', onNavigateUsingMessageClick)
  // document.getElementById('navigate-deeplink-button').addEventListener('click', onNavigateUsingDeeplinkClick)
  // document.getElementById('show-map-button').addEventListener('click', onShowMapClick)
}
init()

// function onNavigateUsingDeeplinkClick() {
//   if (!isValidSemanticObjectKeys()) {
//     return
//   }
//   const data = { key: pointOfInterest.key }
//   const dataJson = JSON.stringify(data)
//   const deepLinkParts = []
//   const prefix = 'https://vera.resonai.com/#/play'
//   deepLinkParts.push(prefix)
//   deepLinkParts.push(encodeURIComponent(siteId))
//   deepLinkParts.push(encodeURIComponent(communicationSamplePackageName))
//   deepLinkParts.push(encodeURIComponent(dataJson))
//   const deepLinkUrl = deepLinkParts.join('/')
//   console.log('openUrl: ', deepLinkUrl)
//   veraApi.openUrl(deepLinkUrl)
// }

function onNavigateUsingMessageClick() {
  if (!isValidSemanticObjectKeys()) {
    return
  }
  const data = {
    msg: 'navigateTo',
    poi: pointOfInterest.key,
    register: true,
    packageName: communicationSamplePackageName,
    actions: {'navigationSuccess': true}
  }
  veraApi.sendArmeMessage({ packageName: navigationPackageName, data })
}

// function onShowMapClick() {
//   if (!isValidSemanticObjectKeys()) {
//     return
//   }
//   const data = {
//     msg: 'showMap',
//     pois: pointOfInterest.key
//   }
//   veraApi.sendArmeMessage({ packageName: navigationPackageName, data })
// }

function isValidSemanticObjectKeys() {
  // TODO(orenco): add notification on the main page
  if (pointOfInterest === undefined) {
    console.error('Please configure "POI" and refresh')
    return false
  }
  return true
}