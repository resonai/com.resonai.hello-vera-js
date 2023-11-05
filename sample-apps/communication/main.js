import { veraApi } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const communicationSamplePackageName = 'com.resonai.sdk.sample.communication'
const communicationButtonName = 'Communication Demo'
const titleEn = 'Sample Communication App'
const titleRu = 'Пример коммуникационного приложения'
let pointOfInterest = undefined

async function init () {
  veraApi.registerButtons({
    buttons: [{
      name: communicationButtonName, isRegistered: true
    }]
  })

  veraApi.onMessage(async (data) => {
    console.log(`${communicationSamplePackageName} got 'onMessage' event with: ${data}`)
    if (data.action === 'navigationSuccess') {
      // Briefly show the navigation success message
      const msgElement = document.getElementById('dest-reached')
      msgElement.style.display = "block"
      setTimeout(function() {
        msgElement.style.display = "none"
      }, 5000)
    }
    veraApi.tryOpen({ activityId: 'start' })
  })
  veraApi.loaded()

  const titleElement = document.getElementById("app-title")
  titleElement.textContent = titleEn
  // Calls to veraApi.on...() must take place *after* veraApi.loaded()
  veraApi.onLanguage((newLanguage) => {
    titleElement.textContent = (newLanguage.lan === 'ru') ? titleRu : titleEn
  })

  const appConfig = await veraApi.getAppConfig()
  pointOfInterest = appConfig['POI']
  if (pointOfInterest === undefined) {
    document.getElementById('navigate-message-button').disabled = true
  }
  document.getElementById('navigate-message-button').addEventListener('click', onNavigateUsingMessageClick)
}
init()

function onNavigateUsingMessageClick () {
  const data = {
    msg: 'navigateTo',
    poi: pointOfInterest.key,
    register: true,
    packageName: communicationSamplePackageName,
    actions: { 'navigationSuccess': true }
  }
  veraApi.sendArmeMessage({ packageName: navigationPackageName, data })
}
