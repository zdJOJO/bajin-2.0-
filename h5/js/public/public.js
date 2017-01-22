/**
 * Created by Administrator on 2016/8/30.
 */

var port = "http://test.winthen.com";
var portStr = port + '/bcard';

//var port = "http://www.winthen.com";
//var portStr = port + '/test';



//获取存在于cookie中的token值
function getCookie(c_name) {
    if (document.cookie.length>0)
    {
        c_start=document.cookie.indexOf(c_name + "=")
        if (c_start!=-1)
        {
            c_start=c_start + c_name.length+1
            c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) c_end=document.cookie.length
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return undefined;
}
//保存cookie函数
function setCookie(c_name,value,expiredays) {
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value)+
        ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}


//统计点击量 公共函数
function hitsOnFn(token,type,subType,typeId) {
    $.ajax({
        type: 'put',
        url: port + '/card/count?token=' + token + '&type=' + type + '&typeId=' + typeId + '&subType=' + subType,
        success: function (res) {
            //todo
        },
        error: function (e) {
            //todo
        }
    })
};


// 调用原生的分享接口
// showAndroidToast(giftArray[0].title,giftArray[0].subTitle,giftArray[0].pic,window.location.href);
function share_Android_Ios(title,subTitle,imgPath,url) {
    try {
        show(title,subTitle,imgPath,url);   //IOS
    }catch (e){
        //todo
    }
    try {
        javascript: window.handler.show(title,subTitle,imgPath,url);    //Android
    }catch (e){
        //todo
    }
};

function getTokenFrome_Android_Ios() {
    try {
        alert('IOS：' + getNativeAppToken())
        return getNativeAppToken()   //IOS
    }catch (e){
        //todo
    }
    try {
        alert('Android：' + window.handler.getNativeAppToken())
        return window.handler.getNativeAppToken();    //Android
    }catch (e){
        //todo
    }
}






// 获取 min 到 max 的随机整数   如： var random = getRandom(0, 100);
function getRandom(min, max){
    var r = Math.random() * (max - min);
    var re = Math.round(r + min);
    re = Math.max(Math.min(re, max), min)
    return re;
};


//解析url 中的参数
//  例子： GetQueryString('num')
function GetQueryString(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]);
    return null;
}


// hot 更多热门 只显示3行文字
function showThreeLine(str,num) {
    if(str.length > num){
        str = str.substring(0,num-1) + '...';
    }
    return str
}


//通用函数 时间戳转换成 固定格式
Date.prototype.Formate_short = function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
    return (y+'.'+m+'.'+d);
}
Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
    var h=this.getHours()>9?this.getHours():'0'+this.getHours();
    var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
    var s=this.getSeconds()>9?this.getSeconds():'0'+this.getSeconds();
    if((h == '00' || h == '23')&&( f == '00' || f == '59')){
        return (y+'.'+m+'.'+d);
    }else {
        return (y+'.'+m+'.'+d+' '+h+':'+f);
    }
}


//判断是否在微信客户端打开
var is_weixin = function () {
    var ua = navigator.userAgent.toLowerCase();
    var isWeixin = ua.indexOf('micromessenger') != -1;
    var isAndroid = ua.indexOf('android') != -1;
    var isIos = (ua.indexOf('iphone') != -1) || (ua.indexOf('ipad') != -1);
    if (!isWeixin) {
        window.location.href = 'isWeiXin.html';
    }
}


//type判断   1活动 2 白金人生 3商品 4抽奖 5c 6url 7咨询 8工会服务 9热点
var typeJudge = function (type) {
    var typeStr = '';
    switch(type)
    {
        case 1:
            typeStr = '活动';
            break;
        case 2:
            typeStr = '人物';
            break;
        case 3:
            typeStr = '商品';
            break;
        case 4:
            typeStr = '抽奖';
            break;
        case 5:
            typeStr = '乐享';
            break;
        case 6:
            typeStr = 'url';
            break;
        case 7:
            typeStr = '资讯';
            break;
        case 8:
            typeStr = '工行服务';
            break;
        case 9:
            typeStr = '热点';
            break;
    }
    return typeStr;
};


// 验证手机号的方法
function checkMobile(str){
    var re = /^[1][35847][0-9]{9}$/;
    if (re.test(str)) {
        return true;
    } else {
        return false;
    }
}


//格式化金钱数
function formatePrice(price){
    // 处理金钱数后边的.00
    var price = price.toString();
    var costFormate=0.00;
    if(/[\.]/.test(price)){
        var str = price.split(".");
        costFormate = str[0]+"."+str[1].substring(0,2);
    }else{
        if(price == "免费活动"){
            costFormate="免费活动";
            return costFormate;
        }
        costFormate = price+".00";
    }
    return costFormate;
}


//元素内部滚动条滚动时候不影响外部滚动条
// $("#speList").preventScroll();
$.fn.extend({
    "preventScroll":function(){
        $(this).each(function(){
            var _this = this;
            if(navigator.userAgent.indexOf('Firefox') >= 0){   //firefox
                _this.addEventListener('DOMMouseScroll',function(e){
                    _this.scrollTop += e.detail > 0 ? 60 : -60;
                    e.preventDefault();
                },false);
            }else{
                _this.onmousewheel = function(e){
                    e = e || window.event;
                    _this.scrollTop += e.wheelDelta > 0 ? -60 : 60;
                    return false;
                };
            }
        })
    }
});


//点击属性 平滑滚动
function scrollSmoothSlib(idStr) {
    $("#"+idStr).find('a').click(function() {
        $("html, body").animate({
            scrollTop: $($(this).attr("href")).offset().top + "px"
        }, {
            duration: 500,
            easing: "swing"
        });
        return false;
    });
}


// 判断 是否 IOS || Android  终端
function terminalFn(string) {
    var u = navigator.userAgent
    switch (string){
        case 'IOS':
            return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
            break
        case 'Android':
            return u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
            break
    }
}


//判断是否为微信内置浏览器
function browserFn(string) {
    var ua = window.navigator.userAgent.toLowerCase();
    switch (string){
        case 'wx':
            return ua.match(/MicroMessenger/i) == 'micromessenger'
            break
    }
}


