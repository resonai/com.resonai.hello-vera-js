import { jseApiHelper } from '@resonai/vera-sdk'

const sceneID = 'iotScene'
let appConfig = undefined
let meshObj = undefined
let url = undefined
let authorization = undefined

async function init() {
  jseApiHelper.loaded()
  appConfig = await jseApiHelper.getAppConfig()
  url = appConfig.Provider.Url // https://lightswitch.free.beeceptor.com
  authorization = appConfig.Provider.Authorization
  const appConfigDevices = appConfig.Devices
  if (!appConfigDevices) {
    return
  }
  const devicesStates = await getDevicesFromIotServer()
  
  await jseApiHelper.initScene({ sceneID })
  appConfigDevices.forEach(async deviceInfo => {
    const id = deviceInfo.ID
    const isOn = devicesStates[id]
    const place = deviceInfo.Device
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

async function getDevicesFromIotServer () {
  try {
    const response = await fetch(`${url}/api/devices`, {
      method: 'get',
      headers: {
        authorization: authorization
      }
    })
    const deviceStateList = await response.json()
    return Object.fromEntries(deviceStateList.map(device => [device.id, device.isOn]));
  } catch (e) {
    console.error('getDevices: error', e)
  }
}

async function switchLight ({ id, isOn }) {
  try {
    const response = await fetch(`${url}/api/devices/${id}/action/turn${isOn ? 'Off' : 'On'}`, {
      method: 'post',
      headers: {
        authorization: authorization
      }
    })
    const deviceState = await response.json()
    isOn = deviceState.isOn
    const gltf = getGltfPath({ isOn })
    meshObj = {
      sceneID,
      id,
      gltf,
      onEvent: ({ id, event }) => {
        if (event == 'mouseUp') {
          switchLight({ id, isOn })
        }
      }
   }
    jseApiHelper.mesh(meshObj)
  } catch (e) {
    console.error('switchLight: error', e)
  }
}

function getGltfPath ({ isOn }) {
  return `https://storage.googleapis.com/resonai-public/com.resonai.iot/models/bulb-${isOn ? 'on' : 'off'}.glb`
}