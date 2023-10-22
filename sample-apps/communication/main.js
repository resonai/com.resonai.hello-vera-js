import { veraApi } from '@resonai/vera-sdk'

const navigationPackageName = 'com.resonai.navigation'
const communicationSamplePackageName = 'com.resonai.sdk.sample.communication'
const communicationButtonName = 'Communication Demo'
let appConfig = undefined
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
    // TODO(orenco): promise syntax
    veraApi.tryOpen({ activityId: 'start' })
  })
  veraApi.loaded()
  veraApi.onCameraPose(() => {})

  appConfig = await veraApi.getAppConfig()
  pointOfInterest = appConfig['POI']
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
    actions: { 'navigationSuccess': true }
  }
  veraApi.sendArmeMessage({ packageName: navigationPackageName, data })
}

async function onNearestPoiClick() {
  const MAX_DISTANCE_V = 2
  const MAX_DISTANCE_H = 3
  var cameraPose = veraApi.getCameraPose()
  const filter = {
    bool: {
      filter: [{
        range: {
          "ar:geometry.center_y": {
            gte: cameraPose.translation[1] - MAX_DISTANCE_V,
            lte: cameraPose.translation[1] + MAX_DISTANCE_V
          }
        }
      }]
    }
  }
  // Geo-filter array: camX, camZ, max 2D horizontal distance (m)
  const geofilter = [cameraPose.translation[0], cameraPose.translation[2], MAX_DISTANCE_H]
  const allNearbyPois = await veraApi.querySemanticObjects({confKey: appConfig._id, filter, geofilter})

  let nearestPoiName = 'None'
  if (Object.values(allNearbyPois).length > 0) {
    // Get 3D distances to camera pos of all result POIs
    const allPoiDistances = Object.values(allNearbyPois).map(poi => {
      const camPos = cameraPose.translation
      const poiPos = poi['ar:geometry']
      if (!poiPos) return 9999
      return Math.sqrt((poiPos['center_x'] - camPos[0]) ** 2 + (poiPos['center_y'] - camPos[1]) ** 2 + (poiPos['center_z'] - camPos[2]) ** 2)
    })
    // Find the index & name of the nearest value
    const minIndex = allPoiDistances.reduce((minIndex, currentValue, currentIndex, arr) => {
      return currentValue < arr[minIndex] ? currentIndex : minIndex;
    }, 0);
    const nearestPoi = Object.values(allNearbyPois)[minIndex]
    nearestPoiName = nearestPoi.name
  }

  // Briefly show the nearest POI name
  let nearestPoiElement = document.getElementById("nearest-poi-name")
  nearestPoiElement.textContent = nearestPoiName
  const msgElement = document.getElementById('nearest-poi-found')
  msgElement.style.display = "block"
  setTimeout(function () {
    nearestPoiElement.textContent = ""
    msgElement.style.display = "none"
  }, 5000)
}
