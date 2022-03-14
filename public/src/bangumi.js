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
  $.getJSON(url, function (data) {
    $.each(data, function (index, value) {
      console.log(index)
      $('.bgm-tabs').append(`
      <span class="bgm-tab" id="bgm-${index}" data-type=${index} onclick="tabClick(event)">
        ${types[index]}(${value})
      </span>
      `)
    })
    document.getElementsByClassName('bgm-tab')[1].click();
  })
}

function getPage(pageNum, type) {
  const url = `${bangumiUrl}/bangumi?type=${type}&offset=${(pageNum - 1) * limit}&limit=${limit}`
  $.getJSON(url, function (data) {
    if (pageNum == 1) {
      $('.bgm-collection').empty()
    } else {
      $('.bgm-navigator').remove()
    }
    $.each(data.data, function (index, value) {

      let totalEp = value.eps
      let ep = type === 'watched' ? totalEp : value.ep_status

      let percentage = ep / totalEp * 100;
      let cover = value.images.large;
      let subjectUrl = `https://bgm.tv/subject/${value.subject_id}`;
      let html = `
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

      $(".bgm-collection").append(html)

    })
    if (pageNum < Math.ceil(data.total / limit)) {
      $(".bgm-container").append(`
            <div class="bgm-navigator">
                <script>
                $(".bgm-btn").click(function(){
                    getPage(${pageNum + 1}, '${type}');
                    $(this).text("加载中");
                    $(this).css("background-color","grey");
                    $(this).unbind("click");
                })
                </script>
                <a class="bgm-btn">加载更多</a>
            </div>
            `)
    }
  })
}

function tabClick(event) {
  $('.bgm-collection').empty()
  $('.bgm-navigator').remove()
  $('.bgm-collection').append(load)
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

function init() {
  $('.bgm-container').append(`<div class="bgm-tabs"></div>`)
  $(".bgm-container").append(`
    <div class="bgm-collection" id="bgm-collection">
      ${load}
    </div>`
  )
  getTab()
}

init()
