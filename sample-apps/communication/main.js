import { veraApi } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const communicationSamplePackageName = 'com.resonai.sdk.sample.communication'
const communicationButtonName = 'Communication Demo'
let appConfig
let pointOfInterest

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
      msgElement.style.display = 'block'
      setTimeout(function () {
        msgElement.style.display = 'none'
      }, 5000)
    }
    // TODO(orenco): promise syntax
    veraApi.tryOpen({ activityId: 'start' })
  })
  veraApi.loaded()
  let frame = 0
  veraApi.onCameraPose(() => {
    frame += 1
    if (frame % 300 === 0) {
      console.log('Camera position: ', veraApi.getCameraPose().translation)
    }
  })

  appConfig = await veraApi.getAppConfig()
  pointOfInterest = appConfig.POI
  if (pointOfInterest === undefined) {
    document.getElementById('navigate-message-button').disabled = true
    document.getElementById('nearest-poi-button').disabled = true
  }
  document.getElementById('navigate-message-button').addEventListener('click', onNavigateUsingMessageClick)
  document.getElementById('nearest-poi-button').addEventListener('click', onNearestPoiClick)
}
init()

function onNavigateUsingMessageClick () {
  const data = {
    msg: 'navigateTo',
    poi: pointOfInterest.key,
    register: true,
    packageName: communicationSamplePackageName,
    actions: { navigationSuccess: true }
  }
  veraApi.sendArmeMessage({ packageName: navigationPackageName, data })
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
  const geofilter = { camX: cameraCoords[0], camZ: cameraCoords[2], hDistance: MAX_DISTANCE_H }
  const allNearbyPois = await veraApi.querySemanticObjects({ confKey: appConfig._id, filter, geofilter })

  let nearestPoiName = 'None'
  if (Object.values(allNearbyPois).length > 0) {
    // Get 3D distances to camera pos of all result POIs
    const allPoiDistances = Object.values(allNearbyPois).map(poi => {
      const poiPos = poi['ar:geometry']
      // Exclude Pois with no position
      if (!poiPos) { return Infinity }
      return Math.hypot(poiPos.center_x - cameraCoords[0], poiPos.center_y - cameraCoords[1], poiPos.center_z - cameraCoords[2])
    })
    // Find the index & name of the nearest value
    const minIndex = allPoiDistances.reduce((minIndex, currentValue, currentIndex, arr) => {
      return currentValue < arr[minIndex] ? currentIndex : minIndex
    }, 0)
    const nearestPoi = Object.values(allNearbyPois)[minIndex]
    nearestPoiName = nearestPoi.name
  }

  // Briefly show the nearest POI name
  const nearestPoiElement = document.getElementById('nearest-poi-name')
  nearestPoiElement.textContent = nearestPoiName
  const msgElement = document.getElementById('nearest-poi-found')
  msgElement.style.display = 'block'
  setTimeout(function () {
    nearestPoiElement.textContent = ''
    msgElement.style.display = 'none'
  }, 5000)
}
