const selectionMenuId = 'json-lens-selection'
const pageMenuId = 'json-lens-page'
const pendingKey = 'pendingInput'

function openTool() {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll().then(() => {
    chrome.contextMenus.create({
      id: selectionMenuId,
      title: '用 JSON Lens 打开选中内容',
      contexts: ['selection'],
    })
    chrome.contextMenus.create({
      id: pageMenuId,
      title: '打开 JSON Lens',
      contexts: ['page'],
    })
  })
})

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === pageMenuId) return openTool()
  if (info.menuItemId !== selectionMenuId || !info.selectionText) return
  await chrome.storage.session.set({ [pendingKey]: info.selectionText })
  openTool()
})

chrome.action.onClicked.addListener(openTool)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-json-lens') openTool()
})
