let calcTime = false
let startTime


const iconText = str => chrome.action.setBadgeText({ text: str || ''})

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
    if (!calcTime) break
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
