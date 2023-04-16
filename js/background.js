let calcTime = false
let startTime

// 番茄工作法：工作25分钟，休息5分钟
const workTime = 1 * 60
const restTime = 0.5 * 60
let count
let pomodoroStatus
let timerInterval

const iconText = str => chrome.browserAction.setBadgeText({ text: str || ''})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'startRecord') {
    startTime = new Date().getTime()
    calcTime = true
    durationTime()
  } else if (message === 'endRecord') {
    calcTime = false
    iconText()
  } else if (message === 'startPomodoro') {
    startTimer()
  } else if (message === 'endPomodoro') {
    stopTimer()
  }
})

// 持续计时
async function durationTime () {
  for (let i = 0; i < Infinity; i++) {
    console.log(!calcTime || pomodoroStatus === '')
    if (!calcTime || pomodoroStatus === '') break
    const diff = Math.floor((new Date().getTime() - startTime) / 1000 / 60)
    console.log(diff)
    iconText(diff.toString())
    await delay()
  }
}

function delay () {
  return new Promise(resolve => {
    setTimeout(resolve, 10000)
  })
}

function startTimer () {
  pomodoroStatus = 'work'
  count = workTime
  timerInterval = setInterval(updateTime, 1000)
}

function stopTimer () {
  count = 0
  pomodoroStatus = ''
  clearInterval(timerInterval)
  iconText()
}

// 显示剩余时间
function showTime () {
  const minutes = Math.floor(count / 60).toString().padStart(2, '0')
  const seconds = (count % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
}

// 更新剩余时间
function updateTime () {
  count--
  const timer = showTime()
  if ((pomodoroStatus === 'work' || pomodoroStatus === 'rest') && count !== 0) {
    // 不管是工作还是休息都显示剩余时间
    iconText(timer)
  } else if (pomodoroStatus === 'work' && count == 0) {
    // 工作时间结束，设置休息时间
    pomodoroStatus = 'rest'
    count = restTime
    playAudio()
  } else if (pomodoroStatus === 'rest' && count == 0) {
    stopTimer()
    playAudio()
  }
  chrome.storage.local.set({ pomodoroStatus })
}

function playAudio () {
  new Audio('/src/ice.mp3').play()
}