let bangumiUrl = apiUrl

const limit = 12
const load = `<img style="margin: 0 auto;" src="https://cdn.jsdelivr.net/gh/hans362/Bilibili-Bangumi-JS/assets/bilibili.gif">`

function getTab() {
  const types = {
    'want': '想看',
    'watching': '在看',
    'watched': '看过'
  }
  const url = `${bangumiUrl}/bangumi_total`
  getJSON(url, function (data) {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const value = data[key]
        document.querySelector('.bgm-tabs')
          .insertAdjacentHTML('beforeend', `<span class="bgm-tab" id="bgm-${key}" data-type=${key} onclick="tabClick(event)">${types[key]}(${value})</span>`)
      }
    }
    document.getElementsByClassName('bgm-tab')[1].click()
  })
}

function getPage(pageNum, type) {
  const url = `${bangumiUrl}/bangumi?type=${type}&offset=${(pageNum - 1) * limit}&limit=${limit}`
  getJSON(url, function (data) {
    if (pageNum == 1) {
      emptyEl(document.querySelector('.bgm-collection'))
    } else {
      removeEl(document.querySelector('.bgm-navigator'))
    }
    Array.prototype.forEach.call(data.data, function (value, index) {

      let totalEp = value.eps
      let ep = type === 'watched' ? totalEp : value.ep_status

      let percentage = ep / totalEp * 100
      let cover = value.images.large
      let subjectUrl = `https://bgm.tv/subject/${value.subject_id}`
      const html = `
      <a class="bgm-item" href="${subjectUrl}" target="_blank">
          <div class="bgm-item-thumb" style="background-image:url(${cover})" referrerpolicy="no-referrer"></div>
          <div class="bgm-item-info">
              <span class="bgm-item-title main">${value.name_cn || value.name}</span>
              <span class="bgm-item-title">${value.summary || value.name}</span>
              <div class="bgm-item-statusBar-container">
                <div class="bgm-item-statusBar" style="width:${percentage}%"></div>
                <span class="bgm-item-percentage">进度：${ep} / ${totalEp}</span>
              </div>
          </div>
      </a>
      `
      document.querySelector('.bgm-collection')
        .insertAdjacentHTML('beforeend', html)
    })
    if (pageNum < Math.ceil(data.total / limit)) {
      const html = `
      <div class="bgm-navigator">
          <a class="bgm-btn">加载更多</a>
          <script>
          
          </script>
      </div>
      `
      document.querySelector('.bgm-container')
        .insertAdjacentHTML('beforeend', html)
      document.querySelector('.bgm-btn').addEventListener('click', function (event) {
        loadClick(event, pageNum + 1, type)
      }, { 'once': true })
    }
  })
}

function tabClick(event) {

  emptyEl(document.querySelector('.bgm-collection'))
  removeEl(document.querySelector('.bgm-navigator'))

  document.querySelector('.bgm-collection').insertAdjacentHTML('beforeend', load)
  const el = event.target
  el.classList.add('bgm-active')
  document.querySelectorAll('.bgm-tab').forEach(function (item) {
    if (item.id !== el.id) {
      item.classList.remove('bgm-active')
    }
  })
  const type = el.dataset.type
  getPage(1, type)
}

function loadClick(event, pageNum, type) {
  getPage(pageNum, type);
  const el = event.target
  el.textContent = '加载中'
  el.style.backgroundColor = 'grey'
}

function emptyEl(el) {
  while (el.firstChild)
    el.removeChild(el.firstChild)
}

function removeEl(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

function getJSON(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)

  xhr.onload = function () {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      callback(JSON.parse(this.response))
    }
  };

  xhr.onerror = function () {
    // There was a connection error of some sort
  };

  xhr.send()
}

function init() {
  document.querySelector('.bgm-container').insertAdjacentHTML('beforeend', `<div class="bgm-tabs"></div>`)
  document.querySelector('.bgm-container').insertAdjacentHTML('beforeend', `
    <div class="bgm-collection" id="bgm-collection">
      ${load}
    </div>`
  )
  getTab()
}

init()
