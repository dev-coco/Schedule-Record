function doPost (request) {
  const params = request.parameter
  const startTime = params.startTime
  const endTime = params.endTime
  const spendTime = params.spendTime
  const task = params.task
  const url = params.url
  return ContentService.createTextOutput(fillForm(`${startTime}～${endTime} ${task}`, url))
}

function fillForm (task, url) {
  task += '\n'
  const sheet = getSheet(url)
  const data = sheet.getRange('A:D').getDisplayValues()
  for (let i = 0; i < data.length; i++) {
    if (new Date(data[i][0]).toDateString() == new Date().toDateString()) {
      const hour = task.split(':')[0]
      const cell = data[i + 1]
      // 根据时间写入不同范围
      if (hour >= 0 && hour <= 12) {
        cell[1] += task
      } else if (hour >= 13 && hour <= 18) {
        cell[2] += task
      } else {
        // 处理凌晨填错位置
        if (hour > new Date().getHours()) {
          data[i + 2][3] += task
        } else {
          cell[3] += task
        }
      }
      break
    }
  }
 sheet.getRange('A:D').setValues(data)
}

function getSheet (url) {
  const sheetID = url.replace(/.+\/d\/|\/.+/g, '')
  const gid = url.match(/(?<=gid=).*[0-9]/g, '')[0]
  const ss = SpreadsheetApp.openById(sheetID)
  return ss.getSheets().find(s => s.getSheetId() === parseInt(gid))
}
