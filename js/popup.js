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
const scheduleDate = document.getElementById('scheduleDate')
const popup = document.querySelector('.popup')

// 番茄时间
const pomodoroAction = document.getElementById('pomodoroAction')
const countdown = document.getElementById('countdown')

// 今天日期
const today = () => {
  const currentDate = new Date()
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  return `${month}-${day}`
}

// 填表
const fillForm = taskEvent => {
  chrome.storage.local.get(['getSheetUrl', 'getScriptUrl'], ({ getSheetUrl, getScriptUrl }) => {
    const body = new FormData()
    body.append('task', taskEvent)
    body.append('url', getSheetUrl)
    fetch(getScriptUrl, {
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
  const currentDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('/', '-')
  scheduleDate.value = currentDate
  scheduleInfo.focus()
})
const addScheduleItem = () => {
  const itemStatus = [...document.querySelectorAll('.items input')].map(x => x.checked)
  const formatDate = scheduleDate.value.replace(/^.{5}/, '')
  items.innerHTML += `<label><span class="date">${formatDate}</span><input type="checkbox"><span>${scheduleInfo.value}</span></label>`
  scheduleInfo.value = ''
  popup.classList.toggle('hide')
  document.querySelectorAll('.items input').forEach((e, index) => e.checked = itemStatus[index] )
  chrome.storage.local.set({ scheduleItems: items.innerHTML, itemStatus })
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

// 勾选待办事项触发
items.addEventListener('click', () => {
  const itemStatus = [...document.querySelectorAll('.items input')].map(x => x.checked)
  chrome.storage.local.set({ scheduleItems: items.innerHTML, itemStatus })
})

pomodoroAction.addEventListener('click', () => {
  if (countdown.innerText) {
    chrome.runtime.sendMessage('endPomodoro')
    countdown.innerText = ''
  } else {
    chrome.runtime.sendMessage('startPomodoro')
    setInterval(getPomodoroTime, 300)
  }
})

const getPomodoroTime = async () => {
  const iconText = await chrome.browserAction.getBadgeText({})
  if (!iconText.includes(':')) return
  countdown.innerText = iconText
}

// 恢复界面数据
chrome.storage.local.get(['getTask', 'isRunning', 'todo', 'scheduleItems', 'itemStatus', 'pomodoroStatus'], ({ getTask, isRunning, todo, scheduleItems, itemStatus, pomodoroStatus }) => {
  if (getTask) task.value = getTask || ''
  if (todo) info[1].innerHTML = todo || ''
  if (scheduleItems) {
    items.innerHTML = scheduleItems || ''
    document.querySelectorAll('.items input').forEach((e, index) => e.checked = itemStatus[index] )
  }
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  document.querySelectorAll('.date').forEach(e => new Date(`${year}-${e.outerText} 23:59:59`) < new Date() && e.setAttribute('style', 'font-weight: bold;color: red;'))
  if (isRunning) {
    [...info].forEach(e => e.classList.toggle('hide'))
    start.innerText = '结束'
  }
  if (pomodoroStatus) setInterval(getPomodoroTime, 300)
})
