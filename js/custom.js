// 右下角悬浮菜单栏 - 分享 - https://blog.leonus.cn/2022/rightside.html
function share() {
    let url = window.location.origin + window.location.pathname
    new ClipboardJS(".share", { text: function() { return url } });
    btf.snackbarShow("本页链接已复制到剪切板，快去分享吧~")
}

// 新年倒计时 - https://blog.leonus.cn/2023/newYearCard.html
let newYearTimer = null;
var newYear = () => {
    clearTimeout(newYearTimer);
    if (!document.querySelector('#newYear')) return;
    // 新年时间戳 and 星期对象
    let newYear = new Date('2023-01-22 00:00:00').getTime() / 1000,
        week = { 0: '周日', 1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六' }

    time();

    // 补零函数
    function nol(h) { return h > 9 ? h : '0' + h; };

    function time() {
        // 现在 时间对象
        let now = new Date();

        // 右下角 今天
        document.querySelector('#newYear .today').innerHTML = now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate() + ' ' + week[now.getDay()]

        // 现在与新年相差秒数
        let second = newYear - Math.round(now.getTime() / 1000);

        // 小于0则表示已经过年
        if (second < 0) {
            document.querySelector('#newYear .title').innerHTML = 'Happy New Year!';
            document.querySelector('#newYear .newYear-time').innerHTML = '<span class="happyNewYear">新年快乐</p>';
        } else {
            // 大于0则还未过年
            document.querySelector('#newYear .title').innerHTML = '距离2023年春节：'

            // 大于一天则直接渲染天数
            if (second > 86400) {
                document.querySelector('#newYear .newYear-time').innerHTML = `<span class="day">${Math.ceil(second / 86400)}<span class="unit">天</span></span>`
            } else {
                // 小于一天则使用时分秒计时。
                let h = nol(parseInt(second / 3600));
                second %= 3600;
                let m = nol(parseInt(second / 60));
                second %= 60;
                let s = nol(second);
                document.querySelector('#newYear .newYear-time').innerHTML = `<span class="time">${h}:${m}:${s}</span></span>`;
                // 计时
                newYearTimer = setTimeout(time, 1000);
            }
        }
    }

    // 元宝飘落
    jQuery(document).ready(function($) {
        $('#newYear').wpSuperSnow({
            flakes: ['https://cdn.leonus.cn/img/yb1.webp', 'https://cdn.leonus.cn/img/yb2.webp', 'https://cdn.leonus.cn/img/yb3.webp'],
            totalFlakes: '100',
            zIndex: '999999',
            maxSize: '30',
            maxDuration: '20',
            useFlakeTrans: false
        });
    });
}
newYear();

// noinspection JSIgnoredPromiseFromCall

// 这个语句的作用就是取代了BF原生的悬浮窗，不想要的话可以删掉（不确保没BUG）
// 注意：如果你使用了这段代码，请务必保证它在比较靠后的位置执行，否则可能会出现代码执行的时候btf还没有被定义的问题
btf.snackbarShow = (text, time = 3500) => kms.pushInfo(text, null, time)

const kms = {

    /** 是否为移动端 */
    isMobile: 'ontouchstart' in document.documentElement,
    
    /** 缓存 */
    _cache: {
        win: new Map(),
        winCode: 0
    },
    /**
     * 在右上角弹出悬浮窗
     * @param text {string} 悬浮窗文本
     * @param button 传入null表示没有按钮（icon: 图标，text: 按钮文本，desc: 描述文本， onclick: 点击按钮时触发的回调）
     * @param time {number} 持续时间
     * @return 大括号{close, onclose}大括号 返回一个对象，其中有一个名为 `close` 的函数，调用可手动关闭悬浮窗，同时添加 `onclose` 可监听悬浮窗的关闭
     */
    pushInfo: (text, button = null, time = 3500) => {
        const externalApi = {}
        const idMap = kms._cache.win
        /**
         * 移动指定悬浮窗
         * @param id {string} 悬浮窗ID
         * @param direct {boolean} 移动方向，true为上，false为下
         */
        const moveWin = (id, direct) => {
            const list = document.getElementsByClassName('float-win')
            const moveHeight = document.getElementById(id).offsetHeight + 10
            for (let i = list.length - 1; i !== -1; --i) {
                const div = list[i]
                if (div.id === id) break
                const value = parseInt(div.getAttribute('move')) + (direct ? -moveHeight : moveHeight)
                div.setAttribute('move', value.toString())
                div.style.transform = `translateY(${value}px)`
            }
        }
        /**
         * 关闭指定悬浮窗
         * @param id {string} 悬浮窗ID
         * @param move {boolean} 是否移动其余悬浮窗
         */
        const closeWin = (id, move = true) => {
            const div = document.getElementById(id)
            if (!div || div.classList.contains('delete')) return
            if (externalApi.onclose) externalApi.onclose()
            div.onanimationend = () => {
                idMap.delete(div.id)
                div.remove()
            }
            div.classList.add('delete')
            div.style.transform = ''
            if (move) moveWin(id, true)
        }
        /** 关闭多余的悬浮窗 */
        const closeRedundantWin = maxCount => {
            const list = document.getElementsByClassName('float-win')
            if (list && list.length > maxCount) {
                const count = list.length - maxCount
                for (let i = 0; i !== count; ++i) {
                    closeWin(list[list.length - i - 1].id, false)
                }
            }
        }
        /** 构建html代码 */
        const buildHTML = id => {
            const cardID = `float-win-${id}`
            const actionID = `float-action-${id}`
            const exitID = `float-exit-${id}`
            const buttonDesc = (button && button.desc) ? `<div class="descr"><p ${kms.isMobile ? 'class="open"' : ''}>${button.desc}</p></div>` : ''
            // noinspection HtmlUnknownAttribute
            return `<div class="float-win ${button ? 'click' : ''
            }" id="${cardID}" move="0"><button class="exit" id="${exitID}"><i class="iconfont icon-close"></i></button><p class="text">${text}</p>${button ?
                '<div class="select"><button class="action" id="' + actionID + '">' + (button.icon ? '<i class="' + button.icon + '">' : '') +
                '</i><p class="text">' + button.text + `</p></button>${buttonDesc}` : ''}</div></div>`
        }
        const id = kms._cache.winCode++
        document.body.insertAdjacentHTML('afterbegin', buildHTML(id))
        const actionButton = document.getElementById(`float-action-${id}`)
        const exitButton = document.getElementById(`float-exit-${id}`)
        const cardID = `float-win-${id}`
        actionButton && actionButton.addEventListener('click', () => {
            if (button.onclick) button.onclick()
            closeWin(cardID)
        })
        exitButton.addEventListener('click', () => closeWin(cardID))
        const div = document.getElementById(cardID)
        div.onmouseover = () => div.setAttribute('over', '1')
        div.onmouseleave = () => div.removeAttribute('over')
        moveWin(cardID, false)
        closeRedundantWin(3)
        const task = setInterval(() => {
            const win = document.getElementById(cardID)
            if (win) {
                if (win.hasAttribute('over')) return idMap.set(cardID, 0)
                const age = (idMap.get(cardID) || 0) + 100
                idMap.set(cardID, age)
                if (age < time) return
            }
            clearInterval(task)
            closeWin(cardID)
        }, 100)
        externalApi.close = () => closeWin(cardID)
        return externalApi
    }
}

// 哔哔
// 存数据
function saveData(name, data) { localStorage.setItem(name, JSON.stringify({ 'time': Date.now(), 'data': data })) };
// 取数据
function loadData(name, time) {
    let d = JSON.parse(localStorage.getItem(name));
    // 过期或有错误返回 0 否则返回数据
    if (d) {
        let t = Date.now() - d.time
        if (-1 < t && t < (time * 60000)) return d.data;
    }
    return 0;
};

let talkTimer = null;
function indexTalk() {
    if (talkTimer) {
        clearInterval(talkTimer)
        talkTimer = null;
    }
    if (!document.getElementById('bber-talk')) return

    function toText(ls) {
        let text = []
        ls.forEach(item => {
            text.push(item.content.replace(/#(.*?)\s/g, '').replace(/\{(.*?)\}/g, '').replace(/\!\[(.*?)\]\((.*?)\)/g, '<i class="fa-solid fa-image"></i>').replace(/(?<!!)\[(.*?)\]\((.*?)\)/g, '<i class="fa-solid fa-link"></i>'))
        });
        return text
    }

    function talk(ls) {
        let html = ''
        ls.forEach((item, i) => { html += `<li class="item item-${i + 1}">${item}</li>` });
        let box = document.querySelector("#bber-talk .talk-list")
        box.innerHTML = html;
        talkTimer = setInterval(() => {
            box.appendChild(box.children[0]);
        }, 3000);
    }

    let d = loadData('talk', 10);
    if (d) talk(d);
    else {
        fetch('https://memos.opeach.cn/api/memo?creatorId=1&tag=说说&limit=10').then(res => res.json()).then(data => { // 更改地址
            data = toText(data.data)
            talk(data);
            saveData('talk', data);
        })
    }
}
// indexTalk();
// pjax注释掉上面的 indexTalk(); 使用如下方法：
function whenDOMReady() {
    indexTalk();
}

whenDOMReady()
document.addEventListener("pjax:complete", whenDOMReady)