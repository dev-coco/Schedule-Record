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

// 今天日期
const today = () => {
  const currentDate = new Date()
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  return `${month}-${day}`
}

const currentTime = new Date().toLocaleTimeString().split(':').slice(0, 2).join(':')

// 填表
const fillForm = (startTime, endTime, taskEvent) => {
  console.log(startTime, endTime, taskEvent)
  chrome.storage.local.get(['getSheetUrl', 'getScriptUrl'], ({ getSheetUrl, getScriptUrl }) => {
    const body = new FormData()
    body.append('startTime', startTime)
    body.append('endTime', endTime)
    body.append('spendTime', calcMins(startTime, endTime))
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
  const time = document.getElementById('startTime').value
  if (start.innerText === '开始') {
    info[1].innerHTML = `开始时间：${time}<br>结束时间：<input id="endTime" type="time"><br>事件：${task.value}`
    document.getElementById('endTime').value = currentTime
    start.innerText = '结束'
    chrome.storage.local.set({ isRunning: true, todo: info[1].innerHTML })
    chrome.runtime.sendMessage('startRecord')
  } else if (start.innerText === '结束') {
    task.value = ''
    start.innerText = '开始'
    fillForm(time, document.getElementById('endTime').value, info[1].innerText.split('事件：').pop())
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

// 恢复界面数据
chrome.storage.local.get(['getTask', 'isRunning', 'todo', 'scheduleItems', 'itemStatus'], ({ getTask, isRunning, todo, scheduleItems, itemStatus }) => {
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
  document.getElementById('endTime').value = currentTime
})

// 预设当前时间
document.getElementById('startTime').value = currentTime


function calcMins (startTime, endTime) {
  startTime = startTime.split(':')
  endTime = endTime.split(':')
  const totalStart = ~~startTime[0] * 60 + ~~startTime[1]
  const totalEnd = ~~endTime[0] * 60 + ~~endTime[1]
  let result
  if (endTime[0] < startTime[0]) {
    result = 1440 + totalEnd - totalStart
  } else {
    result = totalEnd - totalStart
  }
  return result
}




