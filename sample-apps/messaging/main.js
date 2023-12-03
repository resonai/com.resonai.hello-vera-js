import { jseApiHelper } from '@resonai/vera-sdk'

const packageName = 'com.resonai.ran_test_js'
const messagingButtonId = 'hello-vera-js.messaging'

async function init () {
  jseApiHelper.onMessage(onMessage)
  jseApiHelper.registerButtons({ buttons: [{ id: messagingButtonId }] })
  jseApiHelper.loaded()
  document.getElementById('send-button').addEventListener('click', onSendClick)
  document.getElementById('take-photo-button').addEventListener('click', onTakePhotoClick)
}
init()

function onSendClick () {
  const msg = document.getElementById('send-text').value
  const data = { msg }
  console.log('sendNativeMessage: ', msg)
  jseApiHelper.sendNativeMessage({ data })
  // For simulating in VCC, we'll send it to ourselves
  jseApiHelper.sendArmeMessage({ packageName, data })
}

function onMessage (data) {
  console.log('onMessage', data)
  const textarea = document.getElementById('receive-text')
  textarea.value += data.msg + '\r\n'
  textarea.scrollTop = textarea.scrollHeight
}

async function onTakePhotoClick () {
  try {
    const photo = await jseApiHelper.takePhoto()
    let imgElem = document.getElementById('img')
    if (!imgElem) {
      imgElem = new Image(300)
      imgElem.id = 'img'
      imgElem.style.transform = 'rotate(90deg)'
      imgElem.style.marginTop = '100px'
      imgElem.style.border = 'solid red 5px'
      document.getElementById('photo-div').appendChild(imgElem)
    }
    imgElem.src = 'data:image/png;base64,' + photo
    console.log('takePhoto succeeded')
  } catch (e) {
    console.error('takePhoto failed', e)
  }
}
