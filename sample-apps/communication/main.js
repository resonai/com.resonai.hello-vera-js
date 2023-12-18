import { veraApi } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const communicationSamplePackageName = 'com.resonai.sdk.sample.communication'
const communicationButtonName = 'Communication Demo'
const titleEn = 'Sample Communication App'
const titleRu = 'Пример коммуникационного приложения'
let appConfig
let pointOfInterest

async function init () {
  appConfig = await veraApi.getAppConfig()

  veraApi.registerButtons({
    buttons: [{
      name: communicationButtonName, isRegistered: true
    }]
  })

  // Add handling of Back event - should take place *before* veraApi.loaded()
  veraApi.onBackEvent(() => {
    // Briefly show the back event message
    // TODO(orenco): merge all messages into a single block
    const msgElement = document.getElementById('back-clicked')
    msgElement.style.display = 'block'
    setTimeout(() => {
      msgElement.style.display = 'none'
    }, 5000)
  })

  // Add handling of messages - should take place *before* veraApi.loaded()
  veraApi.onMessage(async (data) => {
    console.log(`${communicationSamplePackageName} got 'onMessage' event with: ${data}`)
    if (data.action === 'navigationSuccess') {
      // Briefly show the navigation success message
      const msgElement = document.getElementById('dest-reached')
      msgElement.style.display = 'block'
      setTimeout(() => {
        msgElement.style.display = 'none'
      }, 5000)
    }
    // TODO(orenco): use promise syntax, to first make sure tryOpen finished successfully
    veraApi.tryOpen({ activityId: 'start' })
  })
  veraApi.loaded()

  // Handle language change - must take place *after* veraApi.loaded()
  const titleElement = document.getElementById('app-title')
  titleElement.textContent = titleEn
  veraApi.onLanguage((newLanguage) => {
    titleElement.textContent = (newLanguage.lan === 'ru') ? titleRu : titleEn
  })

  let frame = 0
  veraApi.onCameraPose(() => {
    frame++
    if (frame % 300 === 0) {
      console.log('Camera position: ', veraApi.getCameraPose().translation)
    }
  })

  pointOfInterest = appConfig.POI
  if (pointOfInterest === undefined) {
    document.getElementById('navigate-message-button').disabled = true
    document.getElementById('nearest-poi-button').disabled = true
  }
  document.getElementById('navigate-message-preview-button').addEventListener('click', () => {
    onNavigateUsingMessageClick(false)
  })
  document.getElementById('navigate-message-nopreview-button').addEventListener('click', () => {
    onNavigateUsingMessageClick(true)
  })
  document.getElementById('native-message-button').addEventListener('click', onNativeMessageClick)
  document.getElementById('nearest-poi-button').addEventListener('click', onNearestPoiClick)
}
init()

function onNavigateUsingMessageClick ({ skipPreview = false }) {
  const data = {
    msg: 'navigateTo',
    poi: pointOfInterest.key,
    skipPreview,
    register: true,
    packageName: communicationSamplePackageName,
    actions: { navigationSuccess: true }
  }
  veraApi.sendArmeMessage({ packageName: navigationPackageName, data })
}

function onNativeMessageClick () {
  // This triggers native's 'sendNative' bridge API (with sender = the ARX, and data = the JSON sent)
  veraApi.sendNativeMessage({
    data: {
      test: 123
    }
  })
}

async function onNearestPoiClick () {
  const MAX_DISTANCE_V = 2
  const MAX_DISTANCE_H = 3
  const cameraCoords = veraApi.getCameraPose().translation
  const filter = {
    bool: {
      filter: [{
        range: {
          'ar:geometry.center_y': {
            gte: cameraCoords[1] - MAX_DISTANCE_V,
            lte: cameraCoords[1] + MAX_DISTANCE_V
          }
        }
      }]
    }
  }
  const geofilter = { centerX: cameraCoords[0], centerZ: cameraCoords[2], hDistance: MAX_DISTANCE_H }
  const allNearbyPoisObjs = await veraApi.querySemanticObjects({ confKey: appConfig._id, filter, geofilter })
  const allNearbyPois = Object.values(allNearbyPoisObjs)

  let nearestPoiName = 'None'
  if (allNearbyPois.length > 0) {
    // Get 3D distances to camera pos of all result POIs
    const allPoiDistances = allNearbyPois.map(poi => {
      const poiPos = poi['ar:geometry']
      // Exclude Pois with no position
      if (!poiPos) { return Infinity }
      return Math.hypot(poiPos.center_x - cameraCoords[0], poiPos.center_y - cameraCoords[1], poiPos.center_z - cameraCoords[2])
    })
    // Find the index & name of the nearest value
    const minIndex = allPoiDistances.reduce((minIndex, currentValue, currentIndex, arr) => {
      return currentValue < arr[minIndex] ? currentIndex : minIndex
    }, 0)
    const nearestPoi = allNearbyPois[minIndex]
    nearestPoiName = nearestPoi.name
  }

  // Briefly show the nearest POI name
  const nearestPoiElement = document.getElementById('nearest-poi-name')
  nearestPoiElement.textContent = nearestPoiName
  const msgElement = document.getElementById('nearest-poi-found')
  msgElement.style.display = 'block'
  setTimeout(() => {
    nearestPoiElement.textContent = ''
    msgElement.style.display = 'none'
  }, 5000)
}
