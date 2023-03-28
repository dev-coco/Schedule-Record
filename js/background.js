let calcTime = false
let startTime

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message == 'startRecord') {
    startTime = new Date().getTime()
    calcTime = true
    count()
  } else if (message == 'endRecord') {
    calcTime = false
    chrome.action.setBadgeText({ text: '' })
  }
})

async function count () {
  for (let i = 0; i < Infinity; i++) {
    if (!calcTime) break
    const diff = Math.floor((new Date().getTime() - startTime) / 1000 / 60)
    chrome.action.setBadgeText({ text: diff.toString() })
    await delay()
  }
}

function delay () {
  return new Promise(resolve => {
    setTimeout(resolve, 10000)
  })
}
