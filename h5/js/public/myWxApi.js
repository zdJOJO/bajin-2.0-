/**
 * Created by Administrator on 2016/7/28.
 */

var jsapi_ticket = '';
var nonceStr = '';
var timestamp =  '';
var urlStr = '';
var signature = '';



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
var share_Modular = function (shareObj) {
    $.get( port + '/card/weixin/token/get',function (result) {
        if(shareObj.title){
            nonceStr = randomString(16);
            timestamp =  String( parseInt((new Date().getTime() / 1000)) );
            jsapi_ticket = JSON.parse(result).wxticket;
            var string1 = 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + urlStr;
            signature = hex_sha1(string1);
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
                ]
                // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
            shareMInnit_JSSDK(shareObj);
        }
    })
};


var shareMInnit_JSSDK = function (obj) {
    wx.ready(function () {
        wx.onMenuShareTimeline({
            title: obj.title, // 分享标题
            link: obj.link, // 分享链接
            imgUrl: obj.imgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数
                alert(11111111111);
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
                alert(2222222222);
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
            }
        });

    });
};









/*
*  另外一种 微信 分享方法，不用JS-SDK
*  引入WeixinApi.js
*/
var shareMInnit = function (obj) {
    if(!obj){
        return false;
    }
    // // 开启Api的debug模式
    // WeixinApi.enableDebugMode();

    // 需要分享的内容，请放到ready里
    WeixinApi.ready(function(Api) {

        // 微信分享的数据
        var wxData = {
            "appId": "wx729bcc4f3ca39e87", // 服务号可以填写appId
            "imgUrl" : obj.imgUrl,
            "link" : obj.link,
            "desc" : obj.desc,
            "title" : obj.title
        };

        // 分享的回调
        var wxCallbacks = {
            // 收藏操作是否触发回调，默认是开启的
            favorite : false,

            // 用async模式，表示每次分享之前，都需要更新分享内容
            async:true,

            // 分享操作开始之前
            ready : function() {
                // 你可以在这里对分享的数据进行动态修改：*可以只修改某些字段*
            },
            // 分享被用户自动取消
            cancel : function(resp) {
                // 你可以在你的页面上给用户一个小Tip，为什么要取消呢？
                $.alert("分享被取消，msg=" + resp.err_msg);
            },
            // 分享失败了
            fail : function(resp) {
                // 分享失败了，是不是可以告诉用户：不要紧，可能是网络问题，一会儿再试试？
                $.alert("分享失败，msg=" + resp.err_msg);
            },
            // 分享成功
            confirm : function(resp) {
                // 分享成功了，我们是不是可以做一些分享统计呢？
                $.alert("分享成功，msg=" + resp.err_msg);
            },
            // 整个分享过程结束
            all : function(resp,shareTo) {
                // 如果你做的是一个鼓励用户进行分享的产品，在这里是不是可以给用户一些反馈了？
                $.alert("分享" + (shareTo ? "到" + shareTo : "") + "结束，msg=" + resp.err_msg);
            }
        };

        // 用户点开右上角popup菜单后，点击分享给好友，会执行下面这个代码
        Api.shareToFriend(wxData, wxCallbacks);

        // 点击分享到朋友圈，会执行下面这个代码
        Api.shareToTimeline(wxData, wxCallbacks);

        // 点击分享到腾讯微博，会执行下面这个代码
        Api.shareToWeibo(wxData, wxCallbacks);

        // iOS上，可以直接调用这个API进行分享，一句话搞定
        Api.generalShare(wxData,wxCallbacks);
    });
};

























