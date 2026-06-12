
var TkTube = {
    version: "2026061201"
};

var lazy = $('#noLoading#').lazyRule(() => {
    var detailUrl = input;
    var ua = "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36";

    function homeOf(url) {
        var m = (url || "").match(/^(https?:\/\/[^\/]+)/i);
        return m ? m[1] : "https://tktube.com";
    }

    function decodeText(str) {
        return (str || "")
            .replace(/\\u002F/ig, "/")
            .replace(/\\\//g, "/")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#34;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\\x3d/ig, "=")
            .replace(/\\x26/ig, "&");
    }

    function normalizeUrl(url, base) {
        url = decodeText(url || "").trim();
        if (!url) return "";
        try {
            if (/%[0-9a-f]{2}/i.test(url)) url = decodeURIComponent(url);
        } catch (e) {}
        if (/^https?:\/\//i.test(url)) return url;
        if (url.indexOf("//") === 0) return "https:" + url;
        if (url.indexOf("/") === 0) return homeOf(base) + url;
        return (base || homeOf(detailUrl) + "/").replace(/[?#].*$/, "").replace(/\/[^\/]*$/, "/") + url;
    }

    function requestHtml(url, ref) {
        return fetch(url, {
            headers: {
                "User-Agent": ua,
                "Referer": ref || homeOf(url) + "/",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
            },
            timeout: 15000
        }) || "";
    }

    function getValue(text, key) {
        text = decodeText(text || "");
        var safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        var list = [
            新建 RegExp("['\"]?" + safeKey + "['\"]?\\s*[:=]\\s*(['\"])([\\s\\S]*?)\\1", "i"),
            新建 RegExp("flashvars\\." + safeKey + "\\s*=\\s*(['\"])([\\s\\S]*?)\\1", "i"),
            新建 RegExp("flashvars\\[['\"]" + safeKey + "['\"]\\]\\s*=\\s*(['\"])([\\s\\S]*?)\\1", "i")
        ];
        for (var i = 0; i < list.length; i++) {
            var m = text.match(list[i]);
            if (m && m[2]) return decodeText(m[2]);
        }
        return "";
    }

    function isPlayable(url) {
        return /\.(m3u8|mp4)(?:[?#]|$)/i.test(url) || /\/get_file\//i.test(url);
    }

    function isBadMedia(url) {
        return /(?:preview|trailer|teaser|thumb|screenshot|videos_screenshots|\/pv\.|_preview\.mp4)/i.test(url || "");
    }

    function withHeader(url) {
        var origin = homeOf(detailUrl);
        return url + "#isVideo=true#;{Referer@" + detailUrl + "&&Origin@" + origin + "&&User-Agent@" + ua + "}";
    }

    try {
        var html = requestHtml(detailUrl, homeOf(detailUrl) + "/");
        var playerHtml = pdfh(html, "body&&.player-holder&&Html") || html;
        var source = decodeText(playerHtml + "\n" + html);
        var rnd = getValue(source, "rnd");
        var urls = [];
        var names = [];

        function 添加(url, 名字) {
            url = normalizeUrl(url, detailUrl);
            if (!url || !isPlayable(url) || isBadMedia(url) || urls.indexOf(url) >= 0) return;
            if (rnd && url.indexOf("rnd=") < 0 && /\/get_file\//i.test(url)) {
                url += (url.indexOf("?") >= 0 ? "&" : "?") + "rnd=" + rnd;
            }
            urls.push(url);
            names.push(名字 || "播放");
        }

        var keys = ["video_alt_url5", "video_alt_url4", "video_alt_url3", "video_alt_url2", "video_alt_url", "video_url"];
        keys.forEach(key => {
            var url = getValue(source, key);
            var 名字 = getValue(source, key + "_text") || key.replace("video_", "").replace(/_/g, " ");
            添加(url, 名字);
        });

        var kv = /(?:['"]?(video(?:_alt)?_url\d*)['"]?|flashvars\.(video(?:_alt)?_url\d*)|flashvars\[['"](video(?:_alt)?_url\d*)['"]\])\s*[:=]\s*(['"])([\s\S]*?)\4/ig;
        var m;
        while ((m = kv.exec(source)) !== null) {
            var key = m[1] || m[2] || m[3] || "";
            添加(m[5], getValue(source, key + "_text") || key);
        }

        (source.match(/https?:\/\/[^"'<>\\\s]+?(?:\.m3u8|\.mp4|\/get_file\/[^"'<>\\\s]*)(?:\?[^"'<>\\\s]*)?/ig) || []).forEach(u => 添加(u, "直连"));
        (source.match(/["'](\/get_file\/[^"']+)["']/ig) || []).forEach(s => 添加(s.replace(/^["']|["']$/g, ""), "直连"));
        (source.match(/["'](\/[^"']+?\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/ig) || []).forEach(s => 添加(s.replace(/^["']|["']$/g, ""), "直连"));

        if (urls.length === 0) return "toast://未找到播放地址";
        if (urls.length === 1) return withHeader(urls[0]);
        return {
            urls: urls.map(u => withHeader(u)),
            names: names
        };
    } catch (e) {
        return "toast://解析失败：" + (e.message || e);
    }
});
