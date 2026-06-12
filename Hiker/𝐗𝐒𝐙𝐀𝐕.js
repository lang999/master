const Apollo = {
    version: "2026061203",
    empty: "hiker://empty",
    url: "https://cn.xsz-av.com",
    d: [],
    data: {
        category: getMyVar('Apo.category', '0'),
        subCate: getMyVar('Apo.subCate', '0'),
    },
    getRangeColors: function() {
        return '#' + ('00000' + (Math.random() * 0x1000000 << 0)
                .toString(16))
            .substr(-6);
    }, //随机颜色
    baseParse: () => {
        let categoryList = [{
            "title": "日本AV",
            "path": "https://cn.xsz-av.com/videos/japanese",
            "type": "video",
            "sub": []
        }, {
            "title": "日本无码",
            "path": "https://cn.xsz-av.com/videos/uncensored",
            "type": "video",
            "sub": []
        }, {
            "title": "无码流出",
            "path": "https://cn.xsz-av.com/videos/uncensored-leak",
            "type": "video",
            "sub": []
        }, {
            "title": "日本素人",
            "path": "https://cn.xsz-av.com/videos/amateur",
            "type": "video",
            "sub": []
        }, {
            "title": "中国",
            "path": "https://cn.xsz-av.com/videos/chinese",
            "type": "video",
            "sub": []
        }, {
            "title": "韩国",
            "path": "https://cn.xsz-av.com/videos/korean",
            "type": "video",
            "sub": []
        }, {
            "title": "欧美",
            "path": "https://cn.xsz-av.com/videos/western",
            "type": "video",
            "sub": []
        }, {
            "title": "动漫",
            "path": "https://cn.xsz-av.com/videos/hanime",
            "type": "video",
            "sub": []
        }, {
            "title": "标签",
            "path": "https://cn.xsz-av.com/tags",
            "type": "tag",
            "sub": []
        }, {
            "title": "女优",
            "path": "https://cn.xsz-av.com/actresses",
            "type": "pornstar",
            "sub": []
        }]
        const currentCate = categoryList[Apollo.data.category]
        let url
        let type = currentCate.type
        let path = currentCate.path
        if (currentCate.sub.length > 0) {
            url = Apollo.url + getMyVar("url", currentCate.sub[Apollo.data.subCate].path)
            path = currentCate.sub[Apollo.data.subCate].path
        } else {
            url = Apollo.url + getMyVar("url", currentCate.path)
        }
        url = url.replace(/https?.*(https?.*)/, "$1")
        if (MY_PAGE === 1) {
            categoryList.forEach((cate, index) => {
                Apollo.d.push({
                    title: parseInt(Apollo.data.category) === index ? '““””' + cate.title.fontcolor("#FFFFFF").bold() : cate.title,
                    url: $(Apollo.empty + "#noLoading#")
                        .lazyRule((index) => {
                            putMyVar("Apo.category", index.toString())
                            putMyVar("Apo.subCate", '0')
                            clearMyVar("url")
                            clearMyVar("sort")
                            clearMyVar("yurl")
                            clearMyVar("ysort")
                            refreshPage(true)
                            return "hiker://empty"
                        }, index),
                    col_type: 'scroll_button',
                    extra: {
                        'backgroundColor': parseInt(Apollo.data.category) === index ? Apollo.getRangeColors() : ''
                    }
                })
                //特例，分割第一行顶部
                if (index == 3) {
                    Apollo.d.push({
                        col_type: 'blank_block',
                    })
                } //分割行
            })
            if (currentCate.sub.length > 0) {
                Apollo.d.push({
                    col_type: 'blank_block',
                })
                currentCate.sub.forEach((cate, index) => {
                    Apollo.d.push({
                        title: parseInt(Apollo.data.subCate) === index ? '““””' + cate.title.fontcolor("#FFFFFF").bold() : cate.title,
                        url: $(Apollo.empty + "#noLoading#")
                            .lazyRule((index) => {
                                putMyVar("Apo.subCate", index.toString())
                                clearMyVar("url")
                                clearMyVar("sort")
                                clearMyVar("yurl")
                                clearMyVar("ysort")
                                refreshPage(true)
                                return "hiker://empty"
                            }, index),
                        col_type: 'scroll_button',
                        extra: {
                            'backgroundColor': parseInt(Apollo.data.subCate) === index ? Apollo.getRangeColors() : ''
                        }
                    })
                })
            }
        }

        //翻页
        let nextPage = getMyVar("nextPage", "");
        if (nextPage && MY_PAGE > 1) {
            if (url.includes("random")) {
                url = url
            } else {
                url = nextPage;
            };
        } else if (MY_PAGE > 1) {
            if (url.endsWith("/zh/")) {
                url = url
            } else {
                url = "没有下一页哦😑"
            };
        }

        var html = fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
            }
        })

        log(url)
        try {
            var next = Apollo.url + pdfh(html, "body&&.inline-flex[aria-label=\"Next\"]&&href")
            next = next.replace(/.*(http.*)/, "$1")
            putMyVar("nextPage", next);
        } catch {
            clearMyVar("nextPage");
            //log("可能不存在下一页或者下一页定位有问题");
        }

        if (MY_PAGE == 1 && url.includes("search")) {
            Apollo.d.push({
                title: '““””' + "搜寻结果".fontcolor("#FF00FF"),
                url: "hiker://empty",
                col_type: "text_1",
                extra: {
                    lineVisible: false
                }
            })
        }
        Apollo.videoSort(html)
        //搜索
        if (MY_PAGE == 1 && !/category/.test(url)) {
            Apollo.d.push({
                title: "🔍",
                url: $.toString((url) => {
                    if (input.trim() != "") {
                        putMyVar('keyword', input);
                        var searchUrl = getHome(url) + "/search/videos/" + input
                        putMyVar("url", searchUrl);
                        refreshPage();
                        return "hiker://empty"
                    } else {
                        return "confirm://搜索内容为空.js:'hiker://empty'"
                    }
                }, url),
                desc: '搜索番号...',
                col_type: "input",
                extra: {
                    defaultValue: getMyVar('keyword', '') || "",
                }
            });
        }

        switch (type) {
            case 'video':
                Apollo.videoType(url, html)
                break
            case 'pornstar':
                if (url.includes("search")) {
                    Apollo.videoType(url, html)
                } else {
                    Apollo.pornstarType(html)
                }
                break
            case 'tag':
                if (url.includes("search")) {
                    Apollo.videoType(url, html)
                } else {
                    Apollo.tagType(html)
                }
                break
            default:
                Apollo.videoType(url, html)
        }
        setResult(Apollo.d)
    },

    //一级sort
    videoSort: (html) => {
        if (MY_PAGE == 1) {
            Apollo.d.push({
                col_type: "blank_block",
            })
            try {
                var sort = pdfa(html, 'body&&.left-0:not(.hidden),-1||.right-0[q:id=1y]&&a')
                sort.forEach((item, index) => {
                    var title = pdfh(item, 'Text');
                    var urll = Apollo.url + pdfh(item, 'a&&href');
                    urll = urll.replace(/.*(https?.*)/, "$1");
                    Apollo.d.push({
                        title: (getMyVar('sort', '0') == index || getMyVar('ysort', '0') == index) ? '‘‘’’' + title.fontcolor("#FFFFFF") : title,
                        url: urll + $('#noLoading#')
                            .lazyRule((index) => {
                                putMyVar('sort', index);
                                putMyVar("url", input);
                                putMyVar('ysort', index);
                                putMyVar("yurl", input);
                                refreshPage();
                                return 'hiker://empty'
                            }, index),
                        col_type: 'scroll_button',
                        extra: {
                            'backgroundColor': getMyVar('sort', '0') == index ? Apollo.getRangeColors() : ''
                        }
                    })
                })
            } catch {}
        }
    },

    //动态分类
    DynamicSort: (url, html) => {
        const 分类颜色 = Apollo.getRangeColors()
        const 大类定位 = 'body&&.origin-top-right.w-56.z-10'
        const 拼接分类 = ''
        const 小类定位 = 'body&&a'
        const 分类标题 = 'Text'
        const 分类链接 = 'a&&href'
        Apollo.d.push({
            col_type: "blank_block"
        });
        try {
            if (typeof(拼接分类) != 'undefined' && 拼接分类 != '') {
                var categories = pdfa(html, 大类定位).concat(pdfa(html, 拼接分类))
            } else {
                var categories = pdfa(html, 大类定位)
            }
        } catch {
            var categories = pdfa(html, 大类定位)
        }
        let init_cate = []
        for (let i = 0; i < 20; i++) {
            init_cate.push("0")
        }
        if (url.includes("search")) {
            var cate_temp_json = getMyVar("ysort", JSON.stringify(init_cate))
        } else {
            var cate_temp_json = getMyVar("sort", JSON.stringify(init_cate))
        }
        var cate_temp = JSON.parse(cate_temp_json)

        if (MY_PAGE == 1) {
            categories.forEach((category, index) => {
                let sub_categories = pdfa(category, 小类定位);
                sub_categories.forEach((item, key) => {
                    let title = pdfh(item, 分类标题)
                    if (typeof(排除) != 'undefined' && 排除 != '') {
                        title = title.replace(new RegExp(排除, "g"), "")
                    };
                    Apollo.d.push({
                        title: key.toString() === cate_temp[index] ? '““””' + title.fontcolor(分类颜色) : title,
                        url: $(pdfh(item, 分类链接) + '#noLoading#').lazyRule((params) => {
                            params.cate_temp[params.index] = params.key.toString()
                            putMyVar('sort', JSON.stringify(params.cate_temp));
                            putMyVar("url", input);
                            putMyVar('ysort', JSON.stringify(params.cate_temp));
                            putMyVar("yurl", input);
                            refreshPage(true)
                            return "hiker://empty"
                        }, {
                            cate_temp: cate_temp,
                            index: index,
                            key: key,
                            page: MY_PAGE,
                        }),
                        col_type: 'scroll_button',
                        extra: {
                            'backgroundColor': key.toString() === cate_temp[index] ? Apollo.getRangeColors() : ''
                        }
                    })
                })
                Apollo.d.push({
                    col_type: "blank_block"
                });
            })
        }
    },

    //一级视频列表
    videoType: (url, html) => {
        try {
            var currpagenum = pdfh(html, "nav[aria-label]&&.pointer-events-none&&Text").match(/\d+/)[0] //pdfh(html, "body&&.inline-flex.shadow-sm&&.px-4.cursor-default&&Text").match(/\d+/)[0]
        } catch {
            var currpagenum = "1"
        }
        try {
            lastpagenum = pdfh(html, "nav[aria-label]&&.px-4,-1&&Text").match(/\d+/)[0]
        } catch {
            var lastpagenum = currpagenum
        }
        var list = pdfa(html, "body&&.thumbnail");
        list.forEach(item => {
            var vurl = Apollo.url + pdfh(item, 'a&&href');
            vurl = vurl.replace(/.*(http.*)/, "$1")
            var title = pdfh(item, "a,-1&&aria-label||Text");
            var img = pdfh(item, "img&&data-src||src").replace(/(.*)w_330(.*)\/1\.jpg/, "$1w_800$2/default.jpg").replace(/\/1\.jpg/, "/default.jpg").replace("w_480,q_50", "w_800");
            Apollo.d.push({
                title: title,
                desc: pdfh(item, ".left-1&&Text") + "⏰" + pdfh(item, ".right-1&&Text"),
                img: img ? img : "https://thumbsnap.com/i/wxDcxfJH.png",
                url: vurl + $('#noHistory#')
                    .rule(() => {
                        const Apollo = $.require('hiker://page/XSZAVApolloRemote')
                        Apollo.videoParse(MY_URL)
                    }),
                col_type: "movie_2",
                extra: {
                    pageTitle: title,
                    img: img,
                    longClick: !url.includes("/video/") ? [{
                        title: '【跳页】【当前第>' + currpagenum + '<页】【尾页=>' + lastpagenum + '页】',
                        js: $.toString((lastpagenum, url) => {
                                return $('', '正确的页码：1=>' + lastpagenum + "页")
                                    .input((url, lastpagenum) => {
                                            if (input > 0 && input % 1 == 0 && input <= parseInt(lastpagenum)) {
                                                var jumpu = url.includes("page") ? url.replace(/page=\d+/, "page=" + input) : url + "?page=" + input
                                                putMyVar("url", jumpu);
                                                putMyVar("yurl", jumpu);
                                                refreshPage();
                                                return 'toast://你已经穿越到了' + input + '页'
                                            } else {
                                                return "toast://请输入正确的页码"
                                            }
                                        },
                                        url, lastpagenum)
                            },
                            lastpagenum, url)
                    }] : ""
                }
            })
        })
    },
    //标签
    tagType: (html) => {
        var list = pdfa(html, "body&&.grid.gap-4&&a");
        list.forEach((item, index) => {
            var vurl = Apollo.url + pdfh(item, 'a&&href');
            vurl = vurl.replace(/.*(http.*)/, "$1")
            Apollo.d.push({
                title: '““””' + pdfh(item, "a&&Text").fontcolor("#FFFFFF"),
                url: vurl + $('##fypage')
                    .rule(() => {
                        const Apollo = $.require('hiker://page/XSZAVApolloRemote')
                        Apollo.yijiParse(MY_URL.split("##")[0])
                        setResult(Apollo.d)
                    }),
                col_type: "flex_button",
                extra: {
                    'backgroundColor': Apollo.getRangeColors()
                }
            })
        })
        Apollo.d.push({
            col_type: "blank_block",
        })

    },

    //明星
    pornstarType: (html) => {
        var list = pdfa(html, "body&&.mx-auto.grid&&.space-y-4");
        list.forEach(item => {
            var vurl = Apollo.url + pdfh(item, 'a&&href');
            vurl = vurl.replace(/.*(http.*)/, "$1")
            Apollo.d.push({
                title: pdfh(item, ".truncate&&Text") + pdfh(item, "p:last-child&&Text").replace("出道", "") + "\n🖥" + pdfh(item, "p:nth-child(2)&&Text"),
                img: pdfh(item, "img&&data-src||src") ? pdfh(item, "img&&data-src||src") : "https://thumbsnap.com/i/sySMQ7Mg.jpg",
                url: vurl + $('##fypage')
                    .rule(() => {
                        const Apollo = $.require('hiker://page/XSZAVApolloRemote')
                        Apollo.yijiParse(MY_URL.split("##")[0])
                        setResult(Apollo.d)
                    }),
                col_type: "card_pic_3",
            })
        })
    },

    //一级.简
    decodeText: function(str) {
        return (str || "")
            .replace(/\\u002F/ig, "/")
            .replace(/\\\//g, "/")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#34;/g, '"')
            .replace(/&#39;/g, "'");
    },
    normalizeUrl: function(u, base) {
        u = Apollo.decodeText(u || "").trim();
        if (!u) return "";
        if (/^https?:\/\//i.test(u)) return u;
        if (u.indexOf("//") === 0) return "https:" + u;
        var home = ((base || Apollo.url).match(/^(https?:\/\/[^\/]+)/i) || [Apollo.url])[0];
        if (u.indexOf("/") === 0) return home + u;
        return (base || Apollo.url).replace(/[?#].*$/, "").replace(/\/[^\/]*$/, "/") + u;
    },
    pickMediaUrl: function(html, base, depth) {
        html = Apollo.decodeText(html || "");
        depth = depth || 0;
        var urls = [];
        function add(u) {
            u = Apollo.normalizeUrl(u, base);
            if (u && /\.(m3u8|mp4)(?:[?#]|$)/i.test(u) && urls.indexOf(u) < 0) urls.push(u);
        }
        (html.match(/https?:\/\/[^"'<>\\\s]+?\.(?:m3u8|mp4)(?:\?[^"'<>\\\s]*)?/ig) || []).forEach(add);
        (html.match(/["'](\/[^"'<>\\\s]+?\.(?:m3u8|mp4)(?:\?[^"'<>\\\s]*)?)["']/ig) || []).forEach(s => add(s.replace(/^["']|["']$/g, "")));
        (html.match(/(?:file|src|url|video|hls|m3u8)\s*[:=]\s*["']([^"']+?\.(?:m3u8|mp4)(?:\?[^"']*)?)["']/ig) || []).forEach(s => {
            var m = s.match(/["']([^"']+)["']/);
            if (m) add(m[1]);
        });
        if (urls.length === 0) {
            (html.match(/[A-Za-z0-9+\/=]{80,}/g) || []).forEach(s => {
                try {
                    var dec = typeof base64Decode === "function" ? base64Decode(s) : window0.atob(s);
                    var u = Apollo.pickMediaUrl(dec, base, depth + 1);
                    if (u) add(u);
                } catch (e) {}
            });
        }
        if (urls.length === 0 && depth < 2) {
            (html.match(/<iframe[^>]+src=["']([^"']+)["']/ig) || []).forEach(s => {
                var m = s.match(/src=["']([^"']+)["']/i);
                if (!m) return;
                try {
                    var iframeUrl = Apollo.normalizeUrl(m[1], base);
                    var iframeHtml = Apollo.requestHtml(iframeUrl, base);
                    var u = Apollo.pickMediaUrl(iframeHtml, iframeUrl, depth + 1);
                    if (u) add(u);
                } catch (e) {}
            });
        }
        var m3u8 = urls.filter(u => /\.m3u8(?:[?#]|$)/i.test(u));
        return (m3u8[0] || urls[0] || "");
    },
    requestHtml: function(url, referer) {
        return fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                "Referer": referer || Apollo.url
            },
            timeout: 10000
        }) || "";
    },
    videoHeader: function(ref) {
        return "#isVideo=true#;{Referer@" + (ref || Apollo.url + "/") + "&&User-Agent@Mozilla/5.0}";
    },
    playLazy: function(url) {
        try {
            var html = Apollo.requestHtml(url, Apollo.url + "/");
            var playUrl = Apollo.pickMediaUrl(html, url);
            if (!playUrl) return "toast://XSZAV解析失败：未找到真实播放地址";
            return playUrl + Apollo.videoHeader(Apollo.url + "/");
        } catch (e) {
            return "toast://XSZAV解析失败：" + (e.message || e);
        }
    },
    yijiParse: (url) => {
        addListener("onClose", $.toString(() => {
            clearMyVar("yurl");
            clearMyVar("ysort");
        }));
        url = getMyVar("yurl", url)
        if (MY_PAGE !== 1) {
            url = url.includes("?") ? url + "&page=" + MY_PAGE : url + "?page=" + MY_PAGE
        }

        log(url)
        var html = fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
            },
        });
        if (MY_PAGE == 1) {
            try {
                Apollo.d.push({
                    title: "““””" + pdfh(html, "body&&.justify-center.space-x-4&&p&&Text").fontcolor("#666666").bold().big(),
                    desc: "““””" + pdfh(html, "body&&.justify-center.space-x-4&&p,1&&Text").fontcolor("#666666").bold().big() + "\n\n" + pdfh(html, "body&&.justify-center.space-x-4&&p,2&&Text").fontcolor("#666666").bold().big(),
                    img: pdfh(html, "body&&.justify-center.space-x-4&&img&&data-src"),
                    url: "hiker://empty",
                    col_type: "movie_1_vertical_pic"
                })
            } catch {}
        }
        Apollo.videoSort(html)
        Apollo.videoType(url, html)
        setResult(Apollo.d)
    },
    //二级
    videoParse: (url) => {
        log(url)
        var html = fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
            },
        });
        //标题
        var title = pdfh(html, "body&&h1&&Text");
        Apollo.d.push({
            title: '““””' + title.fontcolor("#E57A1A").small(),
            url: url,
            col_type: 'text_1',
            extra: {
                lineVisible: false,
                id: 'transdesc',
                longClick: [{
                    title: '网页',
                    js: $.toString(() => {
                        return "web://" + MY_URL
                    })
                }, {
                    title: '复制',
                    js: $.toString((title) => {
                        return "copy://" + title;
                    }, title)
                }]
            }
        })
        //图片        
        // 源站部分页面不会直接把 m3u8 写在双引号里，避免 match()[1] 空值崩溃。
        var playervars = Apollo.pickMediaUrl(html, url)
        var img = MY_PARAMS.img; //pdfh(html, "body&&video[data-poster]&&data-poster");
        Apollo.d.push({
            img: img,
            url: playervars ? playervars + Apollo.videoHeader(Apollo.url + "/") : $(url).lazyRule((detailUrl) => {
                const Apollo = $.require('hiker://page/XSZAVApolloRemote');
                return Apollo.playLazy(detailUrl);
            }, url),
            col_type: "pic_1_full",
        })
        try {
            var 详细信息 = pdfh(html, "body&&.mb-1&&Text").trim()
            if (详细信息 != "") {
                Apollo.d.push({
                    title: "““””" + "详细信息".fontcolor("#FF00FF").bold(),
                    url: "hiker://empty",
                    col_type: "text_1"
                })
                Apollo.d.push({
                    title: 详细信息.fontcolor("#666666").bold(),
                    col_type: "rich_text"
                })
                Apollo.d.push({
                    col_type: "line",
                })
            }
        } catch {}
        try {
            var 番号 = pdfh(html, "body&&.text-gray-700:matches(番号:)&&Text").trim()
            if (番号 != "") {
                Apollo.d.push({
                    title: "““””" + 番号.fontcolor("#666666").bold(),
                    url: "hiker://empty",
                    col_type: "text_1"
                })
            }
        } catch {}
        try {
            var 日期 = pdfh(html, "body&&.text-gray-700:matches(日期)&&Text").trim()
            if (日期 != "") {
                Apollo.d.push({
                    title: "““””" + 日期.fontcolor("#666666").bold(),
                    url: "hiker://empty",
                    col_type: "text_1"
                })
            }
        } catch {}
        try {
            var 标题 = pdfh(html, "body&&.text-gray-700:matches(标题:)&&Text").trim()
            if (标题 != "") {
                Apollo.d.push({
                    title: "““””" + 标题.fontcolor("#666666").bold(),
                    url: "hiker://empty",
                    col_type: "text_1"
                })
            }
        } catch {}
        //女优
        try {
            var list = pdfa(html, "body&&.text-gray-700:matches(女优:)&&a");
            list.forEach(item => {
                var vurl = Apollo.url + pdfh(item, 'a&&href');
                vurl = vurl.replace(/.*(http.*)/, "$1");
                var title = pdfh(item, "a&&Text");
                Apollo.d.push({
                    title: '““””' + title.fontcolor("#FFFFFF"),
                    url: vurl + $('##fypage')
                        .rule(() => {
                            const Apollo = $.require('hiker://page/XSZAVApolloRemote')
                            Apollo.yijiParse(MY_URL.split("##")[0])
                            setResult(Apollo.d)
                        }),
                    col_type: "flex_button",
                    extra: {
                        pageTitle: title,
                        'backgroundColor': Apollo.getRangeColors()
                    }
                })
            })
            Apollo.d.push({
                col_type: "line_blank",
            })
        } catch {}
        //标签
        try {
            var list = pdfa(html, "body&&.text-gray-700:matches(类型)&&a");
            list.forEach(item => {
                var vurl = Apollo.url + pdfh(item, 'a&&href');
                vurl = vurl.replace(/.*(http.*)/, "$1");
                var title = pdfh(item, "a&&Text");
                Apollo.d.push({
                    标题: '““””' + 标题.fontcolor("#FFFFFF"),
                    url: vurl + $('##fypage')
                        .rule(() => {
                            const Apollo = $.require('hiker://page/XSZAVApolloRemote')
                            Apollo.yijiParse(MY_URL.分屏("##")[0])
                            setResult(Apollo.d)
                        }),
                    col_type: "flex_button",
                    extra: {
                        pageTitle: 标题,
                        'backgroundColor': Apollo.getRangeColors()
                    }
                })
            })
        } catch {}
        //相关
        Apollo.d.push({
            标题: "相关".fontcolor("#FF00FF").bold(),
            col_type: "rich_text"
        })
        Apollo.videoType(url, html)
        /*
        var vid = url.match(/\/video\/(\d+)/)[1]
        var result = JSON.parse(post("https://cn.xsz-av.com/api/recommend", {
            body: {
                "VID": vid,
                "count": 27
            }
        })).videos;

        function formatDuration(seconds) {
            // 将秒数取整
            seconds = Math.floor(seconds);
            // 计算小时、分钟和秒数
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            // 返回格式化的字符串
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function getTmbFolder(vid) {
            var max_thumb_folders = 32000
            var index = Math.floor((vid - 1) / max_thumb_folders)
            var tmb_folder = index !== 0 ? `tmb${index}` : 'tmb'
            return tmb_folder;
        }
        result.forEach(item => {
            var img = `https://img.xszcdn.net/w_800/media/videos/${getTmbFolder(item.VID)}/${item.VID}/default.jpg`;
            Apollo.d.push({
                title: item.title,
                desc: (item.channel == 6 ? "🈚️🦄💦⏰" : "⏰") + formatDuration(item.duration),
                img: img,
                url: Apollo.url + `/video/${item.VID}` + $('#noHistory#')
                    .rule(() => {
                        const Apollo = $.require('hiker://page/XSZAVApolloRemote')
                        Apollo.videoParse(MY_URL)
                    }),
                col_type: "movie_2",
                extra: {
                    pageTitle: item.title,
                    img: img
                }
            })
        })*/
        setResult(Apollo.d)
    },
    //搜索
    searchParse: (url) => {
        keyword = url.分屏("##")[1]
        url = Apollo.url + "/search/videos/" + keyword + "?page=" + MY_PAGE
        log(url)
        var html = fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0)",
            },
        });
        // log(html)
        Apollo.videoType(url, html)
        setResult(Apollo.d)
    },

}

$.exports = Apollo
