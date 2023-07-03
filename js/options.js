const sheetUrl = document.getElementById('sheetUrl')
const scriptUrl = document.getElementById('scriptUrl')

sheetUrl.addEventListener('keyup', () => {
  chrome.storage.local.set({ getSheetUrl: sheetUrl.value })
})
scriptUrl.addEventListener('keyup', () => {
  chrome.storage.local.set({ getScriptUrl: scriptUrl.value })
})

chrome.storage.local.get(['getSheetUrl', 'getScriptUrl'], ({ getSheetUrl, getScriptUrl }) => {
  const setScript = getScriptUrl || 'https://script.google.com/macros/s/AKfycbwD6s_OiI6JTun-ex-RBGYYx_Vjh2pidB39J4MdvfEZyca8vIdShkjLr4EMuf3mvIeiNQ/exec'
  chrome.storage.local.set({ getScriptUrl: setScript })
  sheetUrl.value = getSheetUrl || ''
  scriptUrl.value = setScript
})
