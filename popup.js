const showHintChkbox = document.querySelector('#showHint');
showHintChkbox.addEventListener('change', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: toggleEnable,
  });
});

function toggleEnable() {
  console.log('toggle');
}
