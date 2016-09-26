/**
 * Created by Administrator on 2016/7/28.
 */

var jsapi_ticket = '';
var nonceStr = '';
var timestamp =  '';
var urlStr = '';
var signature = '';

//存储cooke
function setCookie_GPS (name, value) {
    //设置名称为name,值为value的Cookie
    var expdate = new Date();   //初始化时间
    expdate.setTime(expdate.getTime() + 30 * 60 * 1000);   //时间
    document.cookie = name +"="+value+";expires="+expdate.toGMTString()+";path=/";
    //即document.cookie= name+"="+value+";path=/";   时间可以不要，但路径(path)必须要填写，因为JS的默认路径是当前页，如果不填，此cookie只在当前页面生效！~
}

//获取当前页面的url
var get_url = function (url) {
    urlStr = String(url);
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




//向 后台获取 jsapi_ticket
var jsSdkApi = function (type,_obj,_callback) {
    $.get( port + '/card/weixin/token/get',function (result) {
        nonceStr = randomString(16);
        timestamp =  String( parseInt((new Date().getTime() / 1000)) );
        jsapi_ticket = JSON.parse(result).wxticket;
        var string1 = 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + urlStr;
        signature = hex_sha1(string1);

        // console.log(jsapi_ticket);
        // console.log(nonceStr);
        // console.log(timestamp);
        // console.log(urlStr);
        // console.log(string1);
        // console.log(signature);

        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx886a1d1acb7084a5', // 必填，公众号的唯一标识
            timestamp: timestamp,// 必填，生成签名的时间戳
            nonceStr: nonceStr, // 必填，生成签名的随机串
            signature: signature, // 必填，签名，见附录1
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',  // 分享到朋友圈
                'onMenuShareAppMessage', //分享给朋友
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'openLocation',
                'getLocation'    //获取地理位置
            ]
            // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function () {
            switch (type){
                case 'share' :
                    shareMInnit_JSSDK(_obj);
                    break;
                case 'position' :
                    getGPS_JSSDK();
                    break;
            }
        });

    })
};


//分享
var shareMInnit_JSSDK = function (obj) {
    wx.onMenuShareTimeline({
        title: obj.title, // 分享标题
        link: obj.link, // 分享链接
        imgUrl: obj.imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
    wx.onMenuShareAppMessage({
        title: obj.title, // 分享标题
        desc: obj.desc, // 分享描述
        link: obj.link, // 分享链接
        imgUrl: obj.imgUrl, // 分享图标
        type: '', // 分享类型,music、video或link，不填默认为link
        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        success: function () {
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
};

//获取经纬度
var getGPS_JSSDK = function () {
    wx.getLocation({
        success: function (res) {
            gpsObj = {
                latitude: res.latitude,
                longitude: res.longitude
            }
            setCookie_GPS('gpsObj',JSON.stringify(gpsObj));
        },
        cancel: function (res) {
            alert('用户拒绝授权获取地理位置');
            gpsObj = {};
            window.location.href = 'culb.html?joinAct';
        }
    });
}


























