/**
 * Created by Administrator on 2016/7/28.
 */


//获取微信开放平台 access_token
var get_access_token = function () {
    $.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx886a1d1acb7084a5&secret=e675357016644dfeabce5f7ccec7f1fb',function () {
        var access_token = result.ACCESS_TOKEN;
        return access_token;
    })
};

//获取微信开放平台 jsapi_ticket
var get_jsapi_ticket = function (access_token) {
    $.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+ access_token+ '&type=jsapi',function (result) {
        var jsapi_ticket = result.ticket;
        return jsapi_ticket;
    })
};


//随机字符生成算法
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}


//获取当前页面的url
var urlStr = '';
var get_url = function (url) {
    urlStr = url;
};


/*
 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。
*/
var get_string1 = function (jsapi_ticket,nonceStr,timestamp,url) {
    var str = 'jsapi_ticket=' + jsapi_ticket + '&nonceStr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url ;
    return str;
}



var access_token =  get_access_token();
var jsapi_ticket = get_jsapi_ticket(access_token);
var nonceStr = randomString(16);
var timestamp =  new Date().getTime();
var url = urlStr;
var signature = hex_sha1(get_string1(jsapi_ticket,nonceStr,timestamp,url));




wx.config({
    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    appId: 'wx886a1d1acb7084a5', // 必填，公众号的唯一标识
    timestamp: timestamp,// 必填，生成签名的时间戳
    nonceStr: nonceStr, // 必填，生成签名的随机串
    signature: signature, // 必填，签名，见附录1
    jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',  // 分享到朋友圈
        'onMenuShareAppMessage', //分享给朋友
        'onMenuShareQQ',
        'onMenuShareWeibo'
    ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
});

var shareModular = function (shareObj) {
    wx.ready(function () {
        wx.onMenuShareTimeline({
            title: '', // 分享标题
            link: '', // 分享链接
            imgUrl: '', // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

        wx.onMenuShareAppMessage({
            title: '', // 分享标题
            desc: '', // 分享描述
            link: '', // 分享链接
            imgUrl: '', // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
                // 用户确认分享后执行的回调函数
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

    });
};






















