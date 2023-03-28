const info = document.getElementsByClassName('info')
const task = document.getElementById('task')
const start = document.getElementById('start')

const fillForm = taskEvent => {
  chrome.storage.local.get(['getSheetUrl'], ({ getSheetUrl }) => {
    const body = new FormData()
    body.append('task', taskEvent)
    body.append('url', getSheetUrl)
    fetch('https://script.google.com/macros/s/AKfycbx866jUuV_NNkE0rZmxJoRy3NNFzOr_b0RZtatugHidRKm7xJM8dciGTiVDQoG47_4Wfw/exec', {
      body,
      method: 'POST'
    })
  })
}

const startEvent = () => {
  const time = new Date().toLocaleDateString('zh-CN', { hour: '2-digit', minute: '2-digit' }).split(' ')[1]
  if (start.innerText === '开始') {
    info[1].innerHTML = `开始事件：${time}<br>事件：${task.value}`
    start.innerText = '结束'
    chrome.storage.local.set({ isRunning: true, todo: info[1].innerHTML })
    chrome.runtime.sendMessage('startRecord')
  } else if (start.innerText === '结束') {
    const detail = info[1].innerText.split('事件：')
    const result = `${detail[1]}～${time} ${detail[2]}`.replace(/\n/g, '')
    task.value = ''
    start.innerText = '开始'
    fillForm(result)
    chrome.storage.local.set({ isRunning: false, getTask: '' })
    chrome.runtime.sendMessage('endRecord');
  }
  [...info].forEach(e => e.classList.toggle('hide'))
}

task.addEventListener('keyup', () => {
  chrome.storage.local.set({ getTask: task.value })
})

task.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    startEvent()
  }
})

start.addEventListener('click', () => {
  startEvent()
})

chrome.storage.local.get(['getTask', 'isRunning', 'todo'], ({ getTask, isRunning, todo }) => {
  if (getTask) task.value = getTask || ''
  if (todo) info[1].innerHTML = todo || ''
  if (isRunning) {
    [...info].forEach(e => e.classList.toggle('hide'))
    start.innerText = '结束'
  }
})
