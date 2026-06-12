var TkTube = {
    version: "2026061204"
};

var lazy = $('#noLoading#').lazyRule(function() {
    var detailUrl = input;
    var ua = "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36";

    function homeOf(url) {
        url = url || "https://tktube.com";
        var p = url.indexOf("://");
        if (p < 0) return "https://tktube.com";
        var s = url.indexOf("/", p + 3);
        return s > 0 ? url.substring(0, s) : url;
    }

    function cutBase(url) {
        url = url || "";
        var q = url.indexOf("?");
        var h = url.indexOf("#");
        var end = url.length;
        if (q >= 0 && q < end) end = q;
        if (h >= 0 && h < end) end = h;
        url = url.substring(0, end);
        var s = url.lastIndexOf("/");
        return s >= 0 ? url.substring(0, s + 1) : homeOf(detailUrl) + "/";
    }

    function replaceAllText(str, from, to) {
        str = str || "";
        var pos = str.indexOf(from);
        while (pos >= 0) {
            str = str.substring(0, pos) + to + str.substring(pos + from.length);
            pos = str.indexOf(from, pos + to.length);
        }
        return str;
    }

    function decodeText(str) {
        str = str || "";
        str = replaceAllText(str, "\\u002F", "/");
        str = replaceAllText(str, "\\u002f", "/");
        str = replaceAllText(str, "\\/", "/");
        str = replaceAllText(str, "&amp;", "&");
        str = replaceAllText(str, "&quot;", '"');
        str = replaceAllText(str, "&#34;", '"');
        str = replaceAllText(str, "&#39;", "'");
        str = replaceAllText(str, "\\x3d", "=");
        str = replaceAllText(str, "\\x3D", "=");
        str = replaceAllText(str, "\\x26", "&");
        return str;
    }

    function normalizeUrl(url, base) {
        url = decodeText(url || "");
        while (url.indexOf(" ") === 0) url = url.substring(1);
        while (url.length > 0 && url.charAt(url.length - 1) === " ") url = url.substring(0, url.length - 1);
        if (!url) return "";
        try {
            if (url.indexOf("%") >= 0) url = decodeURIComponent(url);
        } catch (e) {}
        if (url.indexOf("http://") === 0 || url.indexOf("https://") === 0) return url;
        if (url.indexOf("//") === 0) return "https:" + url;
        if (url.indexOf("/") === 0) return homeOf(base) + url;
        return cutBase(base || detailUrl) + url;
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

    function skipBlank(text, pos) {
        while (pos < text.length) {
            var c = text.charAt(pos);
            if (c !== " " && c !== "\n" && c !== "\r" && c !== "\t") break;
            pos++;
        }
        return pos;
    }

    function readValueAfter(text, pos) {
        pos = skipBlank(text, pos);
        var c = text.charAt(pos);
        if (c !== ":" && c !== "=") return "";
        pos = skipBlank(text, pos + 1);
        var q = text.charAt(pos);
        var out = "";
        var i;
        if (q === '"' || q === "'") {
            for (i = pos + 1; i < text.length; i++) {
                c = text.charAt(i);
                if (c === "\\") {
                    if (i + 1 < text.length) {
                        out += c + text.charAt(i + 1);
                        i++;
                    }
                    continue;
                }
                if (c === q) break;
                out += c;
            }
            return decodeText(out);
        }
        for (i = pos; i < text.length; i++) {
            c = text.charAt(i);
            if (c === ";" || c === "," || c === "\n" || c === "\r" || c === "\t" || c === "<" || c === ">") break;
            out += c;
        }
        return decodeText(out);
    }

    function getValue(text, key) {
        text = decodeText(text || "");
        var tokens = [
            "flashvars." + key,
            "flashvars['" + key + "']",
            'flashvars["' + key + '"]',
            "'" + key + "'",
            '"' + key + '"',
            key
        ];
        for (var t = 0; t < tokens.length; t++) {
            var token = tokens[t];
            var start = 0;
            while (start >= 0) {
                var p = text.indexOf(token, start);
                if (p < 0) break;
                var val = readValueAfter(text, p + token.length);
                if (val) return val;
                start = p + token.length;
            }
        }
        return "";
    }

    function isPlayable(url) {
        url = (url || "").toLowerCase();
        return url.indexOf(".m3u8") >= 0 || url.indexOf(".mp4") >= 0 || url.indexOf("/get_file/") >= 0;
    }

    function isBadMedia(url) {
        url = (url || "").toLowerCase();
        return url.indexOf("preview") >= 0 ||
            url.indexOf("trailer") >= 0 ||
            url.indexOf("teaser") >= 0 ||
            url.indexOf("thumb") >= 0 ||
            url.indexOf("screenshot") >= 0 ||
            url.indexOf("videos_screenshots") >= 0 ||
            url.indexOf("_preview.mp4") >= 0;
    }

    function withHeader(url) {
        return url + "#isVideo=true#;{Referer@" + detailUrl + "&&Origin@" + homeOf(detailUrl) + "&&User-Agent@" + ua + "}";
    }

    function addMedia(url, name, urls, names, rnd) {
        url = normalizeUrl(url, detailUrl);
        if (!url || !isPlayable(url) || isBadMedia(url) || urls.indexOf(url) >= 0) return;
        if (rnd && url.indexOf("rnd=") < 0 && url.indexOf("/get_file/") >= 0) {
            url += (url.indexOf("?") >= 0 ? "&" : "?") + "rnd=" + rnd;
        }
        urls.push(url);
        names.push(name || "播放");
    }

    function prettyName(key) {
        key = key || "";
        key = replaceAllText(key, "video_", "");
        key = replaceAllText(key, "_", " ");
        return key || "播放";
    }

    function readUntilDelimiter(text, pos) {
        var out = "";
        for (var i = pos; i < text.length; i++) {
            var c = text.charAt(i);
            if (c === '"' || c === "'" || c === "<" || c === ">" || c === " " || c === "\n" || c === "\r" || c === "\t") break;
            out += c;
        }
        return out;
    }

    function scanHttpMedia(text, urls, names, rnd) {
        var start = 0;
        while (start >= 0) {
            var p1 = text.indexOf("http://", start);
            var p2 = text.indexOf("https://", start);
            var p = p1 >= 0 && (p2 < 0 || p1 < p2) ? p1 : p2;
            if (p < 0) break;
            var u = readUntilDelimiter(text, p);
            if (isPlayable(u)) addMedia(u, "直连", urls, names, rnd);
            start = p + 8;
        }
    }

    function scanRelativeGetFile(text, urls, names, rnd) {
        var start = 0;
        while (start >= 0) {
            var p = text.indexOf("/get_file/", start);
            if (p < 0) break;
            addMedia(readUntilDelimiter(text, p), "直连", urls, names, rnd);
            start = p + 10;
        }
    }

    try {
        var html = requestHtml(detailUrl, homeOf(detailUrl) + "/");
        var playerHtml = pdfh(html, "body&&.player-holder&&Html") || html;
        var source = decodeText(playerHtml + "\n" + html);
        var rnd = getValue(source, "rnd");
        var urls = [];
        var names = [];
        var keys = ["video_alt_url5", "video_alt_url4", "video_alt_url3", "video_alt_url2", "video_alt_url", "video_url"];

        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            var u = getValue(source, key);
            var n = getValue(source, key + "_text") || prettyName(key);
            addMedia(u, n, urls, names, rnd);
        }

        scanHttpMedia(source, urls, names, rnd);
        scanRelativeGetFile(source, urls, names, rnd);

        if (urls.length === 0) return "toast://\u672a\u627e\u5230\u64ad\u653e\u5730\u5740";
        if (urls.length === 1) return withHeader(urls[0]);
        var playUrls = [];
        for (var p = 0; p < urls.length; p++) playUrls.push(withHeader(urls[p]));
        return {
            urls: playUrls,
            names: names
        };
    } catch (e) {
        return "toast://\u89e3\u6790\u5931\u8d25\uff1a" + (e.message || e);
    }
});
