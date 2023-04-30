import { jseApiHelper } from '@resonai/vera-sdk'

const sceneID = 'iotScene'
let appConfig = undefined
let meshObj = undefined
let serverUrl = undefined

async function init() {
  jseApiHelper.loaded()
  appConfig = await jseApiHelper.getAppConfig()
  serverUrl = appConfig['Server Url'] || 'https://lightswitch.free.beeceptor.com'
  const lightsStates = await getLightsFromIotServer()
  if (!lightsStates) {
    return
  }
  
  await jseApiHelper.initScene({ sceneID })
  appConfig.Lights.forEach(async light => {
    const id = light.ID
    const isOn = lightsStates[id]
    const place = light.Place
    const scale = [1, 1, 1]
    const gltf = getGltfPath({ isOn })
    const position = await jseApiHelper.getSOCenter({ key: place.key })
    meshObj = {
      sceneID,
      id,
      position,
      scale,
      gltf,
      onEvent: ({ id, event }) => {
        if (event == 'mouseUp') {
          switchLight({ id, isOn })
        }
      }
    }
    jseApiHelper.mesh(meshObj)
  })

}
init()

async function getLightsFromIotServer () {
  const lightsStateList = await safeFetchJson(`${serverUrl}/api/devices`, 'get')
  if (!lightsStateList) {
    return
  }
  return Object.fromEntries(lightsStateList.map(light => [light.id, light.isOn]));
}

async function switchLight ({ id, isOn }) {
  // This is where the toggle happens; the server is expected to return the new state.
  const light = await safeFetchJson(`${serverUrl}/api/devices/${id}/action/turn${isOn ? 'Off' : 'On'}`, 'post')
  if (!light) {
    return
  }
  isOn = light.isOn
  const gltf = getGltfPath({ isOn })
  meshObj = {
    sceneID,
    id,
    gltf,
    onEvent: ({ id, event }) => {
      if (event === 'mouseUp') {
        switchLight({ id, isOn })
      }
    }
  }
  jseApiHelper.mesh(meshObj)
}

async function safeFetchJson(url, method) {
  try {
    const response = await fetch(url, {
      method
      // ,headers: {
      //   Add your authorization headers here
      // }
    })
    if (response?.ok) {
      return response.json()
    }
    if (response?.status === 429 && serverUrl.includes('free.beeceptor.com')) {
      console.error('fetch error. You\'ve reached the daily free quota.')
    } else {
      console.error('fetch failed', response?.statusText)
    }
  } catch (e) {
    console.error('fetch error', e)
  }
  return undefined
}

function getGltfPath ({ isOn }) {
  return `https://storage.googleapis.com/resonai-public/com.resonai.iot/models/bulb-${isOn ? 'on' : 'off'}.glb`
}
