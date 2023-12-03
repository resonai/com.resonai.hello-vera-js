import './style.css'
import { jseApiHelper } from '@resonai/vera-sdk'

let isControlView
let appConfig
let meshObj
let isModalActive = false

async function init () {
  jseApiHelper.callArmeActivity(({ activityId }) => {
    console.log('hello-vera-js callArmeActivity', activityId)
  })
  jseApiHelper.closeArmeActivity(({ activityId, isExitButtonClicked }) => {
    console.log('hello-vera-js closeArmeActivity', activityId, 'isExitButtonClicked: ', isExitButtonClicked)
    closeModal()
  })
  jseApiHelper.loaded()
  appConfig = await jseApiHelper.getAppConfig() // this is done too early. When loaded through link - appConfig is not ready.
  isControlView = (new URL(document.location)).searchParams.has('controlview') // As defined in Developer console under Web application link
  if (isControlView) {
    console.log('Control View App')
    createConfigurationSection(appConfig)
    document.getElementById('close-modal').addEventListener('click', closeModal)
  } else {
    document.getElementById('tools').remove()
    document.getElementById('close-modal').remove()
  }
  const sceneID = 'helloWorldScene'
  const place = appConfig.Place
  const scale = new Array(3).fill(appConfig.Scale ?? 1)
  const gltf = appConfig['Model URL']
  const position = await jseApiHelper.getSOCenter({ key: place.key })
  const lightConfigs = [
    {
      type: 'ambient',
      intensity: 0.4,
      color: 0xffffff
    }, {
      type: 'directional',
      intensity: 0.2,
      color: 0xffeeff,
      pos: [-8, 8, -5]
    }
  ]
  meshObj = {
    sceneID,
    id: place._id,
    position,
    scale,
    gltf,
    onEvent: ({ id, event }) => {
      if (event === 'mouseUp') {
        openModal()
      }
    }
  }
  await jseApiHelper.initScene({ sceneID, lightConfigs })
  jseApiHelper.mesh(meshObj)

  // if (!isControlView) {
  //   listenToCameraPose()
  // }
}
init()

function openModal () {
  console.log('openModal')
  if (isModalActive) { return }
  jseApiHelper.tryOpen({ activityId: 'SOME ACTIVITY ID' }) // opening an activity would cause the HTML to show
  document.getElementById('modal').style.display = 'block'
  isModalActive = true
}
function closeModal () {
  console.log('closeModal')
  if (!isModalActive) { return }
  jseApiHelper.tryClose()
  document.getElementById('modal').style.display = 'none'
  isModalActive = false
}

async function createConfigurationSection () {
  const toolsElement = document.getElementById('tools')
  const modelUrlElement = await createConfigElement('Model URL', 'text', onModelUrlChange)
  const scaleElement = await createConfigElement('Scale', 'number', onScaleChange)
  const placeElement = await createConfigElement('Place', 'text', undefined, editPlace, true)
  appendChildElement(placeElement, 'Place', 'Show', goToPlace)
  toolsElement.append(modelUrlElement, scaleElement, placeElement)
  appendChildElement(toolsElement, undefined, 'abort', abort)
}

async function createConfigElement (confKey, type, onchange, onclick, readonly) {
  const div = document.createElement('div')
  div.append(`${confKey}:`)
  const input = document.createElement('input')
  if (type) {
    input.setAttribute('type', type)
  }
  if (readonly) {
    input.setAttribute('readonly', '')
  }
  let value = appConfig[confKey]
  if (typeof value === 'object' && value !== null) {
    value = await getName(value.key)
  }
  input.setAttribute('value', value)
  if (onclick) {
    input.addEventListener('click', (event) => onclick({ parent: appConfig, property: confKey, value: event.target.value }))
  }
  if (onchange) {
    input.addEventListener('change', (event) => onchange({ parent: appConfig, property: confKey, value: event.target.value }))
  }
  div.appendChild(input)
  return div
}

function appendChildElement (parent, confKey, title, onclick) {
  const input = document.createElement('input')
  input.setAttribute('type', 'button')
  input.setAttribute('value', title)
  input.addEventListener('click', (event) => onclick({ parent: appConfig, property: confKey, value: event.target.value }))
  parent.appendChild(input)
}

async function onModelUrlChange ({ parent, property, value }) {
  console.log('onModelUrlChange', value)
  const result = await jseApiHelper.setPropertyInAppConfig({ parent, property, value })
  if (!result) {
    console.error('onModelUrlChange setPropertyInAppConfig failed')
    return
  }
  meshObj.gltf = value
  jseApiHelper.mesh(meshObj)
}

async function onScaleChange ({ parent, property, value }) {
  console.log('onScaleChange', value)
  const result = await jseApiHelper.setPropertyInAppConfig({ parent, property, value })
  if (!result) {
    console.error('onScaleChange setPropertyInAppConfig failed')
    return
  }
  meshObj.scale = new Array(3).fill(value ?? 1)
  jseApiHelper.mesh(meshObj)
}

function editPlace ({ parent, property, value }) {
  console.log('editPlace', value)
  jseApiHelper.editSO({ key: parent[property]?.key, parent, property, id: parent[property]?.id })
}

function goToPlace ({ parent, property, value }) {
  const key = parent[property]?.key
  console.log('goToPlace', key, value)
  if (!key) {
    return
  }
  jseApiHelper.activeSO({}) // so that's we'll re-focus, even if this is alreayd the current active SO.
  jseApiHelper.activeSO({ key })
}

function abort () {
  if (meshObj) {
    jseApiHelper.destroyMesh(meshObj)
  }
  jseApiHelper.activeSO({})
  jseApiHelper.abort()
}

async function getName (semanticObjectKey) {
  const semanticObjectsDict = await jseApiHelper.querySemanticObjects({
    confKey: appConfig._id,
    fields: ['id,type,name,key,argeometry{center_x,center_y,center_z}']
  })
  const semanticObject = semanticObjectsDict[semanticObjectKey]
  const name = semanticObject.name
  return name
}

// function listenToCameraPose() {
//   jseApiHelper.onCameraPose((cameraPose) => {
//     const currUserPos = cameraPose.translation
//     console.log(currUserPos)
//   })
// }
