const sheetUrl = document.getElementById('sheetUrl')
const scriptUrl = document.getElementById('scriptUrl')

sheetUrl.addEventListener('keyup', () => {
  chrome.storage.local.set({ getSheetUrl: sheetUrl.value })
})
scriptUrl.addEventListener('keyup', () => {
  chrome.storage.local.set({ getScriptUrl: scriptUrl.value })
})

chrome.storage.local.get(['getSheetUrl', 'getScriptUrl'], ({ getSheetUrl, getScriptUrl }) => {
  const setScript = getScriptUrl || 'https://script.google.com/macros/s/AKfycbxcb6sqDMyNSIlt4etsinLm7vMU1EqDED7DK0YixamgPHdMxyIPpTxIDoCV6iDuCnNkrw/exec'
  chrome.storage.local.set({ getScriptUrl: setScript })
  sheetUrl.value = getSheetUrl || ''
  scriptUrl.value = setScript
})
