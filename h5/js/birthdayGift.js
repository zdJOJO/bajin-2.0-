/**
 * Created by Administrator on 2016/8/16.
 *///获取存在于cookie中的token值
var token = '';
var status = -1; //0-- 正常  , 1-- 过期
var receiveId = ''; //根据id去请求 实物的收获地址
var urlSearch = window.location.search;
var localStorage = window.localStorage;   //用于存储生日日期和礼包领取码
if(urlSearch.indexOf('token') > 0){
    token = GetQueryString('token');
    setCookie('token',token);
}else {
    token = getCookie('token');
}
if(urlSearch.indexOf('status') > 0){
    status = GetQueryString('status'); //用于判断是否 已领取
    localStorage.setItem("status",status);
}else {
    status = localStorage.status;
}
if(urlSearch.indexOf('receiveId') > 0){
    receiveId = GetQueryString('receiveId')  //用于判断是否 已领取
}

var his = window.location.pathname.split("/");
his = his[his.length-1];


//选择生日框 字样修改
// 判断浏览器
var browser = myBrowser();
if(browser == "Chrome"){
    $('#birthDayCtrl_Safari').hide();
    $('#birthDayChrome').show().click(function () {
        $('#birthDayChrome').html('1980-01-01');
        $('#birthDayCtrl').click().bind('change',function () {
            $('#birthDayChrome').html($('#birthDayCtrl').val());
            localStorage.setItem("birthDay",$('#birthDayChrome').html());
        });
    });
}else if(browser == "Safari" || !browser){
    $('#birthDayCtrl').hide();
    $('#birthDaySafari').show().click(function () {
        $('#birthDaySafari').html('1980-01-01');
        $('#birthDayCtrl_Safari').focus().bind('change',function () {
            $('#birthDaySafari').html($('#birthDayCtrl_Safari').val());
            localStorage.setItem("birthDay",$('#birthDaySafari').html());
        });
    });
}else {
    //todo
}


$('#birthDayCode').on('change',function () {
    localStorage.setItem("birthDayCode",$(this).val());
});

if(localStorage.birthDay){
    $('#birthDayChrome,#birthDaySafari').html(localStorage.birthDay);
}
if(localStorage.birthDayCode){
    $('#birthDayCode').val(localStorage.birthDayCode);
}


var hasBinded = false; //是否绑白金卡  是true
var hasRealGift = false; //是否有 实物
var hasElec = false;     //是否有 电子券
var giftArray = [];
var addressStr = '';
var pageNum = 1;
var $defaultAddress = $("#popPub").find('.defaulAddress');
var hasGifts = false ;   // 判断生日礼包是否存在    存在-true  不存在-false
var isGiftDisabled = true ;  //判断礼包是否全部停用  是-true  否-false



//判断是否绑定了银行卡
function bankCard() {
    $.get( port + '/card/card?token=' + token,function (result) {
        //判断是否有白金卡
        // if(result.list.length > 0){
        //     for(var i=0;i<result.list.length;i++){
        //         if(result.list[i].bjke == 1){
        //             hasBinded = true;
        //         }
        //     }
        // }
        //判断是否有卡
        if(result.list.length > 0){
            hasBinded = true;
        }
    });
}
bankCard();

//获取地址
function getAddress() {
    var defaultAddressObj = {};
    if(receiveId){
        $.get( port + '/card/receiver/' + receiveId + '?token=' + token,function (result) {
            defaultAddressObj = result;
            setAdressFn(defaultAddressObj);
            $('#popPub').show(1,function () {
                $(this).children('.defaulAddress').animate({'bottom': '0'},200,function () {
                    $('#chooseBox').click();
                });
            });
        })
    }else {
        $.get( port + '/card/receiver?token=' + token + '&currentPage=1',function (result) {
            if(result.list.length == 0){
                $defaultAddress.html('<a style="margin-top: 11%;text-align: center;display: inherit;">你还没有创建收货地址，赶快创建一个吧</a>' +
                    '<button id="sureReceive">新建地址</button>');
                //（存在实物情况下） 确认领取
                $('#sureReceive').click(function () {
                    window.location.href = 'addAddress.html?fromeGift&obj=' + escape(JSON.stringify({})) + '';
                });
            }else {
                for(var i =0;i<result.list.length;i++){
                    if(result.list[i].isDefault == 0){
                        defaultAddressObj = result.list[0];
                    }else {
                        defaultAddressObj = result.list[i];
                    }
                };
                setAdressFn(defaultAddressObj);
            }
        });
    }

    function setAdressFn(defaulAddresObj) {
        $defaultAddress.html('<img id="right" src="imgs/gift/right.png">' +
            '<input id="choose" type="checkbox"><label id="chooseBox" for="choose"></label>' +
            '<span class="info">' + defaulAddresObj.receiverName + '&nbsp;&nbsp;' + defaulAddresObj.receiverPhone +'</span> ' +
            '<span class="address">' + defaulAddresObj.province + defaulAddresObj.city + defaulAddresObj.district + '</span> ' +
            '<button id="sureReceive">确认领取</button>');

        //选取地址
        if(!receiveId){
            $('#chooseBox').click();
        }
        $('#right').click(function () {
            window.location.href = 'setAddress.html?fromeGift&obj=' + escape(JSON.stringify({}));
        });
        //（存在实物情况下） 确认领取
        $('#sureReceive').click(function () {
            if(!$('#choose').is(':checked')){
                $('#popPub').attr('z-index','-1');
                $.alert("请选择收货地址", "提示");
            }else {
                giftAjax(defaulAddresObj.receiveId);
            }
        });
    }
}
getAddress();

//生日礼包列表获取   type=0---实物  isOnline=1---停用  sum=0---领完
function getGIftsList(currentPage) {
    $.ajax({
        type: 'get',
        url: port + '/card/birthgift?currentPage=' + currentPage + '&token=' + token,
        success: function (result) {
            var giftStr = '';
            if( currentPage==1 &&(!result || result.data.list.length == 0)){
                hasGifts = false;
                $('#content>.receiveBefore .giftList').html('<li class="giftTitle">暂无礼包</li>');
                $('.bottomBox').hide();
                return;
            }
            for(var i=0;i<result.data.list.length;i++){
                if(result.data.list[i].sum > 0 && result.data.list[i].isOnline == 0){
                    giftStr += '<li class="giftTitle">'+ result.data.list[i].title +' ' +
                        '<span class="giftSubTitle">'+ result.data.list[i].subTitle +'</span></li>';
                    //判断是否有实物
                    if(result.data.list[i].type == 0){
                        hasRealGift = true;
                    }
                    //判断是否有电子券
                    if(result.data.list[i].type == 1){
                        hasElec = true;
                    }
                    //判断 是否全部停用
                    if(result.data.list[i].isOnline == 0){
                        isGiftDisabled = false;
                    }else {
                        isGiftDisabled = true;
                    }
                }
            }

            if(isGiftDisabled){
                $('#content>.receiveBefore .giftList').html('<li class="giftTitle">暂无礼包</li>');
                $('.bottomBox').hide();
                hasGifts = false;
                return;
            }

            $('#content').find('.giftList').append(giftStr);
            if( currentPage > 1 && result.data.list.length == 0){
                setTimeout(function () {
                    $('#giftLoading').hide();
                    $('#more').show();
                },300);
            }

        },
        error: function () {
            //todo
        }
    });
}
getGIftsList(1);



// （不存在实物情况下）立即领取
$("#receiveNow").click(function () {
    var birthday = (browser == "Chrome") ? $('#birthDayChrome').html() : $('#birthDaySafari').html();
    var gifCode = $('#birthDayCode').val();
    if(!token){
        $.modal({
            title: "提示",
            text: "您还未登录白金尊享",
            buttons: [
                { text: "去登录", onClick: function(){
                    window.location.href = "login.html?his=" + escape(his);
                } },
                { text: "取消", className: "default", onClick: function(){
                    //todo
                } },
            ]
        });
    }else {
        if( birthday == '请选择您的生日' || !birthday || !gifCode){
            $.alert("请输入您的生日或者生日礼包领取码", "提示");
            return
        }

        hasBinded = true;  //临时

        if(!hasBinded){
            $.modal({
                title: "提示",
                text: "生日礼包仅限工行白金信用卡用户领取，请先绑定您的白金信用卡",
                buttons: [
                    { text: "去绑卡", onClick: function(){
                        window.location.href = 'bank.html'; //后面需要加几个参数
                    } },
                    { text: "取消", className: "default", onClick: function(){
                        //todo
                    } },
                ]
            });
            return
        }
        if(hasRealGift){    //有实物
            $('#popPub').show(1,function () {
                $(this).children('.defaulAddress').animate({'bottom': '0'},200);
            });
        }else {
            giftAjax();
        }
    }
});


//领取 生日礼包的 ajax请求
function giftAjax(_receiverId) {
    var birthday = (browser == "Chrome") ? $('#birthDayChrome').html() : $('#birthDaySafari').html();
    var birthdayTimeStamp = new Date(birthday.replace(/-/g,'/')).getTime()/1000; //单位s
    var data = {
        code: $('#birthDayCode').val()
    };
    if(_receiverId){
        data.receiverId = _receiverId;
    }
    $.ajax({
        type: 'post',
        url: port + '/card/usergift?birth=' + birthdayTimeStamp + '&token=' + token,
        data: JSON.stringify(data),
        dataType: "json",
        contentType : "application/json;charset=UTF-8",
        success: function (result) {
             if(result.code == '601'){
                 var msgObj = [];
                 if(result.message == '该用户已经领取过该礼包'){
                     msgObj = [
                         { text: "查看", className: "primary", onClick: function(){
                             //跳到领取成功页面
                             $('#popPub').hide();
                             var len = result.data.length;
                             var deleteLen = 0;
                             for(var i=0;i<len;i++){
                                $.get( port + '/card/birthgift/'+result.data[i].giftId+'?token='+token ,function (gift) {
                                    if(gift.data){
                                        giftArray.push(gift.data);
                                    }else {
                                        deleteLen++;
                                    }
                                    if(i == giftArray.length + deleteLen){
                                        giftSuccess(result.data[0].receiverId,true,giftArray);
                                    }
                                })
                             }
                             // if(hasRealGift){
                             //     $('.receiveAfter .toAccount').show();
                             //     $('.receiveAfter .address').html(addressStr);
                             // }
                             $('#content').children('.receiveBefore').hide().siblings('.receiveAfter').show();
                         } },
                         {text: "取消", className: "default", onClick: function(){
                             // window.localStorage.clear();
                         } }
                     ]
                 }else {
                     msgObj = [
                         {text: '知道了', className: "default", onClick: function(){
                             // window.localStorage.clear();
                         } }
                     ]
                 }

                $.modal({
                    title: "提示",
                    text: result.message,
                    buttons: msgObj
                });

            }else if(result.code == '619'){
                $.toast("礼包已领取", "text");
            }else {
                 //生日礼包为空 且 用户未领取
                 if(!hasGifts){
                     $.modal({
                         title: "提示",
                         text: "礼包正在紧急筹备中，请稍后领取",
                         buttons: [
                             { text: "知道了", className: "default", onClick: function(){
                                 //todo
                             } },
                         ]
                     });
                     return;
                 }

                $('.receiveBefore').hide();
                $('#popPub').hide();
                $('#orderLoading').show();
                setTimeout(function () {
                    var len = result.data.length;
                    var deleteLen = 0;
                    for(var i=0;i<len;i++){
                        $.get( port + '/card/birthgift/'+result.data[i].giftId+'?token='+token ,function (gift) {
                            if(gift.data){
                                giftArray.push(gift.data);
                            }else {
                                deleteLen++;
                            }
                            if(i == giftArray.length + deleteLen){
                                giftSuccess(result.data[0].receiverId,false,giftArray);
                            }
                        })
                    }
                    $('.receiveAfter').show();
                    $('#orderLoading').hide();
                },300);
                 window.localStorage.clear();
            }
        },
        error: function (e) {
        }
    });
}





//领取成功页面
function giftSuccess(id,_hasRealGift,_giftArray) {
    var str = '';
    var imgStr = '';
    for(var i=0;i<_giftArray.length;i++){
        if(_giftArray[i].type == 1){
            imgStr = portStr+'/imgs/gift/logo.png';
        }else {
            _hasRealGift = true; //判断有无实物
            imgStr = _giftArray[i].pic
        }
        str = $('<li class="gift"><img class="logo" src="'+imgStr+'">' +
            '<img class="success" src="imgs/gift/gift.png">' + '<span class="title">'+ _giftArray[i].title +'</span>' +
            '<span class="subTitle">'+ _giftArray[i].subTitle +'</span></li>');
        if(_giftArray[i].type == 0){
            str.attr('data-type','0');  //实物
        }
        if(str.children('img').eq(0).attr('src') == 'undefined'){
            str.children('img').eq(0).attr('src','imgs/gift/logo.png');
        }
        $('.receiveAfter>.gifList>h3').after(str);
    }

    if(hasRealGift || _hasRealGift){
        $.get( port + '/card/receiver/' + id + '?token=' + token,function (result) {
            addressStr = '<span class="address">' + result.province + result.city + result.district + '</span><br>'+
                '<span class="info">' + result.receiverName + '&nbsp;&nbsp;' + result.receiverPhone +'</span>';
            $('.receiveAfter .toAddress').show();
            $('.receiveAfter .address').html(addressStr);
        });
    }
    if(hasElec){
        $('.receiveAfter .toAccount').show();
        $.get( port + '/card/user?token=' + token ,function (result) {
            $('.receiveAfter .account').html(result.phone);
        });
    }
}


//地址弹框点击 事件范围监听
$('#popPub').on('click',function(e){
    e = window.event || e; // 兼容IE7
    var obj = $(e.srcElement || e.target);
    if ($(obj).is(".defaulAddress,.defaulAddress>span,.defaulAddress>img,#choose,#chooseBox,#sureReceive")) {
        //todo  ('内部区域');
    } else {
        $('#popPub').find('.defaulAddress').animate({'bottom': '-150px'},200,function () {
            $('#popPub').hide();
        });
    }
});


//点击查看更多礼物
$('#more').click(function () {
    $('#giftLoading').show();
    $('#more').hide();
    pageNum++;
    getGIftsList(pageNum);
});



//判断浏览器
function myBrowser(){
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isOpera = userAgent.indexOf("Opera") > -1;
    if (isOpera) {
        return "Opera"
    }; //判断是否Opera浏览器
    if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
    } //判断是否Firefox浏览器
    if (userAgent.indexOf("Chrome") > -1){
        return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
    } //判断是否Safari浏览器
    if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
        return "IE";
    }; //判断是否IE浏览器
}

//微信分享
get_url(portStr+'/birthdayGift.html');
//调用分享借口
jsSdkApi('share',{
    title: '白金尊享送您生日礼包',
    desc: '白金用户生日当月可以领取为您精心准备的礼包',
    link: portStr+'/birthdayGift.html',
    imgUrl: portStr+'/imgs/gift/gift-head.jpg'
});

//调用安卓、 IOS 的原生分享功能
share_Android_Ios(
    '白金尊享送您生日礼包' ,
    '白金用户生日当月可以领取为您精心准备的礼包' ,
    portStr+'/imgs/gift/gift-head.jpg',
    portStr+'/birthdayGift.html'
);




