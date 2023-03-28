const sheetUrl = document.getElementById('sheetUrl')

sheetUrl.addEventListener('keyup', () => {
  chrome.storage.local.set({ getSheetUrl: sheetUrl.value })
})

chrome.storage.local.get(['getSheetUrl'], ({ getSheetUrl }) => {
  sheetUrl.value = getSheetUrl || ''
})
