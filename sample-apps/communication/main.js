import { veraApi } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const communicationSamplePackageName = 'com.resonai.sdk.sample.communication'
const communicationButtonName = 'Start Communication'
let pointOfInterest = undefined

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

  const appConfig = await veraApi.getAppConfig()
  pointOfInterest = appConfig['POI']
  document.getElementById('navigate-message-button').addEventListener('click', onNavigateUsingMessageClick)
}
init()

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

function isValidSemanticObjectKeys() {
  // TODO(orenco): add notification on the main page
  if (pointOfInterest === undefined) {
    console.error('Please configure "POI" and refresh')
    return false
  }
  return true
}