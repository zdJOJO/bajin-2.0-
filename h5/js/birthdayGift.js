/**
 * Created by Administrator on 2016/8/16.
 */
var token = "";
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
token = getCookie("token");
var his = window.location.pathname.split("/");
his = his[his.length-1];


//选择生日框 字样修改
$('#birthDay').focus(function () {
    $(this).attr('type','date');
});
$('#birthDay').blur(function () {
    $(this).attr('type','text');
});


var hasBinded = false; //是否绑卡  是true
var isCodeRight = false; //领取码是否正确   是true
var isOverdue = true;  //领取码是否过期  过期true

var defaulAddressJo = $('#popPub>.defaulAddress');
//获取地址
function getAddress() {
    $.get( port + '/card/receiver?token=' + token + '&currentPage=1',function (result) {
        if(result.list.length == 0){
            defaulAddressJo.html('<a style="margin-top: 15%;text-align: center;display: inherit;">你还没有创建收货地址，赶快创建一个吧</a>');
            defaulAddressJo.click(function () {
                var obj={};
                window.location.href = 'addAddress.html?fromeGift&&obj=' + escape(JSON.stringify(obj));
            });
        }else {
            var defaulAddresObj = {};
            for(var i =0;i<result.list.length;i++){
                if(result.list[i].isDefault == 0){
                    defaulAddresObj = result.list[0];
                }else {
                    defaulAddresObj = result.list[i];
                }
            };
            defaulAddressJo.html(' <img id="right" src="imgs/gift/right.png">' +
                '<input id="choose" type="checkbox"><label id="chooseBox" for="choose"></label>' +
                '<span class="info">' + defaulAddresObj.receiverName + '&nbsp;&nbsp;' + defaulAddresObj.receiverPhone +'</span> ' +
                '<span class="address">' + defaulAddresObj.province + defaulAddresObj.city + defaulAddresObj.district + '</span> ' +
                '<button id="sureReceive">确认领取</button>');
            //默认选取地址
            $('#chooseBox').click();
            $('#right').click(function () {
                window.location.href = 'setAddress.html?fromeGift&&obj=' + escape(JSON.stringify({}));
            });

            //确认领取
            $('#sureReceive').click(function () {
                if(!$('#choose').is(':checked')){
                    $('#popPub').attr('z-index','-1');
                    $.alert("请选择收货地址", "提示");
                }
            });
        }
    });
}
getAddress();







//立即领取
// $("#receiveNow").click(function () {
//     var birthday = $('#birthDay').val();
//     var gifCode = $('#birthDayCode').val();
//     if(!token){
//         $.modal({
//             title: "提示",
//             text: "您还未登陆白金尊享",
//             buttons: [
//                 { text: "去登陆", onClick: function(){
//                     window.location.href = "login.html?his=" + escape(his);
//                 } },
//                 { text: "取消", className: "default", onClick: function(){
//                     //todo
//                 } },
//             ]
//         });
//         return
//     }
//     if(!birthday || !gifCode){
//         $.alert("请输入您的生日或者生日礼包领取码", "提示");
//         return
//     }
//     if(!hasBinded){
//         $.modal({
//             title: "提示",
//             text: "生日礼包仅限工行白金信用卡用户领取，请先绑定您的白金信用卡",
//             buttons: [
//                 { text: "去绑卡", onClick: function(){
//                     window.location.href = '';
//                 } },
//                 { text: "取消", className: "default", onClick: function(){
//                     //todo
//                 } },
//             ]
//         });
//         return
//     }
//     if(!isCodeRight){
//         $.modal({
//             title: "提示",
//             text: "您输入的礼包领取码有误，请核对后重新输入",
//             buttons: [
//                 { text: "知道了", className: "default", onClick: function(){
//                     //todo
//                 } }
//             ]
//         });
//         return
//     }
//     if(isOverdue){
//         $.modal({
//             title: "提示",
//             text: "您输入的礼包领取码已超过30天有效日期",
//             buttons: [
//                 { text: "知道了", className: "default", onClick: function(){
//                     //todo
//                 } }
//             ]
//         });
//         return
//     }
//     //是否绑定银行卡 需要ajax请求
//     //生日礼包领取码是否正确或者过期，需要ajax请求，再做判断
//
// });


$("#receiveNow").click(function () {
    $('.receiveBefore').hide();
    // $('#orderLoading').show();
    $('.receiveAfter').show();
});


//地址弹框
$('.giftContent').click(function () {
    $('#popPub').show(1,function () {
        $('#popPub>.defaulAddress').animate({'bottom': '0'},200);
    });
});

$('#popPub').click(function(e){
    e = window.event || e; // 兼容IE7
    var obj = $(e.srcElement || e.target);
    if ($(obj).is(".defaulAddress,.defaulAddress>span,.defaulAddress>img,#choose,#chooseBox,#sureReceive")) {
         //todo  ('内部区域');
    } else {
        $('#popPub>.defaulAddress').animate({'bottom': '-150px'},200,function () {
            $('#popPub').hide();
        });
    }
});


















