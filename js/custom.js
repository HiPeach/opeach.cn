// 右下角悬浮菜单栏 - 分享 - https://blog.leonus.cn/2022/rightside.html
function share() {
    let url = window.location.origin + window.location.pathname
    new ClipboardJS(".share", { text: function() { return url } });
    btf.snackbarShow("本页链接已复制到剪切板，快去分享吧~")
}