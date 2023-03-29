const itemSwitch = document.getElementById('itemSwitch')
const container = document.querySelectorAll('.container')

// 日程记录
const info = document.getElementsByClassName('info')
const task = document.getElementById('task')
const start = document.getElementById('start')

// 待办事项
const items = document.querySelector('.items')
const addSchedule = document.getElementById('addSchedule')
const cleanSchedule = document.getElementById('cleanSchedule')
const scheduleInfo = document.getElementById('scheduleInfo')
const popup = document.querySelector('.popup')

// 今天日期
const today = () => {
  const currentDate = new Date()
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  return `${month}月${day}日`
}

// 填表
const fillForm = taskEvent => {
  chrome.storage.local.get(['getSheetUrl'], ({ getSheetUrl }) => {
    const body = new FormData()
    body.append('task', taskEvent)
    body.append('url', getSheetUrl)
    fetch('https://script.google.com/macros/s/AKfycbwW87TrWzbXxM8qogDqZXQCiTaSyXK4GYyH1XHyQD54zHODoUnnOMqoBkpX5BL1sOWwOA/exec', {
      body,
      method: 'POST'
    })
  })
}

// 开始记录事件
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

// 记录事件记录
task.addEventListener('keyup', () => {
  chrome.storage.local.set({ getTask: task.value })
})

// 添加事件记录
task.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    startEvent()
  }
})
start.addEventListener('click', () => {
  startEvent()
})

// 切换界面
itemSwitch.addEventListener('click', () => {
  container.forEach(e => e.classList.toggle('hide'))
})

popup.addEventListener('click', e => {
  if (e.target === popup) popup.classList.toggle('hide')
})

// 添加事件
addSchedule.addEventListener('click', () => {
  popup.classList.toggle('hide')
  scheduleInfo.focus()
})
const addScheduleItem = () => {
  items.innerHTML += `<label><span class="date">${today()}</span><input type="checkbox"><span>${scheduleInfo.value}</span></label>`
  scheduleInfo.value = ''
  popup.classList.toggle('hide')
  chrome.storage.local.set({ scheduleItems: items.innerHTML })
}
addBtn.addEventListener('click', () => {
  addScheduleItem()
})
scheduleInfo.addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
    event.preventDefault()
    addScheduleItem()
  }
})

// 清空已完成的待办事项
cleanSchedule.addEventListener('click', () => {
  const getChecked = document.querySelectorAll('label input:checked')
  getChecked.forEach(e => e.parentElement.remove())
  chrome.storage.local.set({ scheduleItems: items.innerHTML })
})

// 清空所有待办事项
cleanSchedule.addEventListener('dblclick', () => {
  const getInput = document.querySelectorAll('label input')
  getInput.forEach(e => e.parentElement.remove())
  chrome.storage.local.set({ scheduleItems: '' })
})

// 恢复界面数据
chrome.storage.local.get(['getTask', 'isRunning', 'todo', 'scheduleItems'], ({ getTask, isRunning, todo, scheduleItems }) => {
  if (getTask) task.value = getTask || ''
  if (todo) info[1].innerHTML = todo || ''
  if (scheduleItems) items.innerHTML = scheduleItems || ''
  document.querySelectorAll('.date').forEach(e => e.outerText !== today() && e.classList.toggle('red'))
  if (isRunning) {
    [...info].forEach(e => e.classList.toggle('hide'))
    start.innerText = '结束'
  }
})
