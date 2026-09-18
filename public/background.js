const menuId = 'json-lens-selection'
const pendingKey = 'pendingInput'

function openTool() {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll().then(() => {
    chrome.contextMenus.create({
      id: menuId,
      title: '用 JSON Lens 打开',
      contexts: ['selection'],
    })
  })
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== menuId || !info.selectionText) return
  await chrome.storage.session.set({ [pendingKey]: info.selectionText })
  openTool()
})

chrome.action.onClicked.addListener(openTool)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-json-lens') openTool()
})
