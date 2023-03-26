import './style.css'
import { jseApiHelper, jseComm } from '@resonai/vera-sdk'

{
  const _activityId = 'hello-vera-js.hello-world'
  let isVacApp = undefined
  let appConfig = undefined
  let meshObj = undefined
  let isModalActive = false

  async function init() {
    jseApiHelper.callArmeActivity(({ activityId }) => {
      if (activityId === _activityId) {
        console.log('hello-vera-js callArmeActivity', activityId)
      }
    })
    jseApiHelper.closeArmeActivity(({ activityId, isExitButtonClicked }) => {
      if (activityId === _activityId) {
        console.log('hello-vera-js closeArmeActivity', activityId, 'isExitButtonClicked: ', isExitButtonClicked)
        closeModal()
      }
    })
    jseApiHelper.loaded()
    appConfig = await jseApiHelper.getAppConfig() // this is done too early. When loaded through link - appConfig is not ready.
    isVacApp = (new URL(document.location)).searchParams.has("vacapp");
    if (isVacApp) {
      console.log("VAC App")
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
    const position = await getPosition(place)
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
        if (event == 'mouseUp') {
          openModal()
        }
      }
    }
    await jseApiHelper.initScene({ sceneID, lightConfigs })
    jseApiHelper.mesh(meshObj)

    // if (!isVacApp) {
    //   listenToCameraPose()
    // }
  }
  init()

  function openModal() {
    console.log('openModal')
    if (isModalActive) return
    jseApiHelper.tryOpen({ activityId: _activityId })
    document.getElementById('modal').style.display = 'block'
    isModalActive = true
  }
  function closeModal() {
    console.log('closeModal')
    if (!isModalActive) return
    jseApiHelper.tryClose()
    document.getElementById('modal').style.display = 'none'
    isModalActive = false
  }

  async function createConfigurationSection() {
    const toolsElement = document.getElementById('tools')
    const modelUrlElement = await createConfigElement('Model URL', 'text', onModelUrlChange)
    const scaleElement = await createConfigElement('Scale', 'number', onScaleChange)
    const placeElement = await createConfigElement('Place', 'text', undefined, editPlace, true)
    appendChildElement(placeElement, 'Place', 'Show', goToPlace)
    toolsElement.append(modelUrlElement, scaleElement, placeElement)
    appendChildElement(toolsElement, undefined, 'abort', abort)
  }

  async function createConfigElement(confKey, type, onchange, onclick, readonly) {
    const div = document.createElement('div')
    div.append(`${confKey}:`)
    const input = document.createElement('input')
    if (type) {
      input.setAttribute('type', type)
    }
    if (readonly) {
      input.setAttribute('readonly' ,'')
    }
    let value = appConfig[confKey]
    if(typeof value === "object" && value !== null) {
      value = await getName(value.key)
    }
    input.setAttribute('value', value)
    if (onclick) {
      input.addEventListener("click", (event) => onclick({parent: appConfig, property: confKey, value: event.target.value}))
    }
    if (onchange) {
      input.addEventListener("change", (event) => onchange({parent: appConfig, property: confKey, value: event.target.value}))
    }
    div.appendChild(input)
    return div
  }

  function appendChildElement(parent, confKey, title, onclick) {
    const input = document.createElement('input')
    input.setAttribute('type', 'button')
    input.setAttribute('value', title)
    input.addEventListener('click', (event) => onclick({parent: appConfig, property: confKey, value: event.target.value}))
    parent.appendChild(input)
  }

  function onModelUrlChange({ parent, property, value }) {
    console.log('onModelUrlChange', value)
    updateAppConfig({ parent, property, value })
    meshObj.gltf = value
    jseApiHelper.mesh(meshObj)
  }

  function onScaleChange({ parent, property, value }) {
    console.log('onScaleChange', value)
    updateAppConfig({ parent, property, value })
    meshObj.scale = new Array(3).fill(value ?? 1)
    jseApiHelper.mesh(meshObj)
  }

  function editPlace({ parent, property, value }) {
    console.log('editPlace', value)
    jseComm.send('editSO', { key: parent[property]?.key, parent, property, id: parent[property]?.id })
  }

  function goToPlace({ parent, property, value }) {
    const key = parent[property]?.key
    console.log('goToPlace', key, value)
    if (!key) {
      return
    }
    jseComm.send('activeSO', {}) // so that's we'll re-focus, even if this is alreayd the current active SO.
    jseComm.send('activeSO', { key })
  }

  async function updateAppConfig ({ parent, property, value }) {
    await jseComm.call('setPropertyInAppConfig', { parent, property, value })
  }

  function abort() {
    if (meshObj) {
      jseApiHelper.destroyMesh(meshObj)
    }
    jseComm.send('activeSO', {})
    jseComm.dispatch({ funcName: 'abort', params: {} })
  }

  async function getName(semanticObjectKey) {
    const semanticObjectsDict = await jseApiHelper.querySemanticObjects({
      confKey: appConfig._id,
      fields: ['id,type,name,key,argeometry{center_x,center_y,center_z}']
    })
    const semanticObject = semanticObjectsDict[semanticObjectKey]
    const name = semanticObject.name
    return name
  }

  async function getPosition(place) {
    let position
    if (isVacApp) {
      position = await jseComm.call('getSOCenter', { key: place.key })
    } else {
      const semanticObjectsDict = await jseApiHelper.querySemanticObjects({
        confKey: appConfig._id,
        fields: ['id,type,name,key,argeometry{center_x,center_y,center_z}']
      })
      const semanticObject = semanticObjectsDict[place.key]
      const geometry = semanticObject['ar:geometry']
      position = [geometry.center_x, geometry.center_y, geometry.center_z]
    }
    return position
  }

  // function listenToCameraPose() {
  //   jseApiHelper.onCameraPose((cameraPose) => {
  //     const currUserPos = cameraPose.translation
  //     console.log(currUserPos)
  //   })
  // }
}