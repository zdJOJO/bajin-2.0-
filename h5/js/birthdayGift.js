/**
 * Created by Administrator on 2016/8/16.
 */


var token = window.location.search.split('=')[1];
var statu = '';  //用于判断是否 已领取
var his = window.location.pathname.split("/");
his = his[his.length-1];

token = '709f8ef9-954e-497d-b221-ba29c68144ca';

function setCookie(c_name,value,expiredays) {
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value)+
        ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}
setCookie('token',token);


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
var hasRealGift = false; //是否有 实物
var hasElec = false;     //是否有 电子券

var giftArray = [];
var addressStr = '';

var pageNum = 1;
var defaulAddressJo = $('#popPub>.defaulAddress');



//判断是否绑定了银行卡
function bankCard() {
    $.get( port + '/card/card?token=' + token,function (result) {
        if(result.list.length > 0){
            hasBinded = true;
        }
    });
}
bankCard();


//生日礼包列表获取   type = 0 --- 实物 、   isOnline = 0 --- 停用
function getGIftsList(currentPage) {
    $.ajax({
        type: 'get',
        url: port + '/card/birthgift?currentPage=' + currentPage + '&token=' + token,
        success: function (result) {
            var giftStr = '';
            if( currentPage==1 &&(!result || result.data.list.length == 0)){
                $('#content>.receiveBefore .giftList').append('<li class="giftTitle">暂无礼包</li>');
                $('.bottomBox').hide();
                return;
            }
            for(var i=0;i<result.data.list.length;i++){
                giftStr += '<li class="giftTitle">'+ result.data.list[i].title +': <span class="giftSubTitle">'+ result.data.list[i].subTitle +'</span></li>';

                //判断是否有实物
                if(result.data.list[i].type == 0){
                    hasRealGift = true;
                }
                //判断是否有电子券
                if(result.data.list[i].type == 1){
                    hasElec = true;
                }
            }
            giftArray = giftArray.concat(result.data.list);
            $('#content>.receiveBefore .giftList').append(giftStr);

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
            addressStr = '<span class="address">' + defaulAddresObj.province + defaulAddresObj.city + defaulAddresObj.district + '</span><br>'+
                '<span class="info">' + defaulAddresObj.receiverName + '&nbsp;&nbsp;' + defaulAddresObj.receiverPhone +'</span>';
            //默认选取地址
            $('#chooseBox').click();
            $('#right').click(function () {
                window.location.href = 'setAddress.html?fromeGift&&obj=' + escape(JSON.stringify({}));
            });

            //（存在事物情况下） 确认领取
            $('#sureReceive').click(function () {
                if(!$('#choose').is(':checked')){
                    $('#popPub').attr('z-index','-1');
                    $.alert("请选择收货地址", "提示");
                }else {
                    giftAjax(defaulAddresObj.receiveId);
                }
            });
        }
    });
}
getAddress();



// （不存在事物情况下）立即领取
$("#receiveNow").click(function () {
    if(!token){
        $.modal({
            title: "提示",
            text: "您还未登陆白金尊享",
            buttons: [
                { text: "去登陆", onClick: function(){
                    window.location.href = "login.html?his=" + escape(his);
                } },
                { text: "取消", className: "default", onClick: function(){
                    //todo
                } },
            ]
        });
    }else {
        if(hasRealGift){    //有实物
            $('#popPub').show(1,function () {
                $('#popPub>.defaulAddress').animate({'bottom': '0'},200);
            });
        }else {
            giftAjax();
        }
    }
});



//领取 生日礼包的 ajax请求
function giftAjax(_receiverId) {
    var birthday = $('#birthDay').val();
    var birthdayTimeStamp = new Date(birthday.replace(/-/g,'/')).getTime()/1000; //单位s
    var gifCode = $('#birthDayCode').val();
    if(!birthday || !gifCode){
        $.alert("请输入您的生日或者生日礼包领取码", "提示");
        return
    }
    if(!hasBinded){
        $.modal({
            title: "提示",
            text: "生日礼包仅限工行白金信用卡用户领取，请先绑定您的白金信用卡",
            buttons: [
                { text: "去绑卡", onClick: function(){
                    window.location.href = 'bank.html';
                } },
                { text: "取消", className: "default", onClick: function(){
                    //todo
                } },
            ]
        });
        return
    }
    // if(!isCodeRight){
    //     $.modal({
    //         title: "提示",
    //         text: "您输入的礼包领取码有误，请核对后重新输入",
    //         buttons: [
    //             { text: "知道了", className: "default", onClick: function(){
    //                 //todo
    //             } }
    //         ]
    //     });
    //     return
    // }
    // if(isOverdue){
    //     $.modal({
    //         title: "提示",
    //         text: "您输入的礼包领取码已超过30天有效日期",
    //         buttons: [
    //             { text: "知道了", className: "default", onClick: function(){
    //                 //todo
    //             } }
    //         ]
    //     });
    //     return
    // }

    $('.receiveBefore').hide();
    $('#popPub').hide();
    $('#orderLoading').show();

    //是否绑定银行卡 需要ajax请求
    //生日礼包领取码是否正确或者过期，需要ajax请求，再做判断
    var data = {
        code: gifCode
    };
    if(_receiverId){
        data.receiverId = _receiverId;
    }
    $.ajax({
        type: 'post',
        url: port + '/card/usergift?birth=' + birthdayTimeStamp + '&token=' + token,
        data: JSON.stringify(data),
        dataType:"json",
        contentType : "application/json;charset=UTF-8",
        success: function (result) {
            console.log(result);
            giftSuccess();
            $('.receiveAfter').show();
            $('#orderLoading').hide();
        },
        error: function (e) {
            //todo
        }
    });
}


//领取成功页面
function giftSuccess() {
    var str = '';
    for(var i=0;i<giftArray.length;i++){
        str = $('<li class="gift"><img class="logo" src="'+giftArray[i].pic+'"><img class="right" src="imgs/gift/right.png">' +
            '<img class="success" src="imgs/gift/gift.png">' + '<span class="title">'+ giftArray[i].title +'</span>' +
            '<span class="subTitle">'+ giftArray[i].subTitle +'</span></li>');
        if(giftArray[i].type == 0){
            str.attr('data-type','0');  //实物
        }
        $('.receiveAfter>.gifList>h3').after(str);
    }

    $('.receiveAfter .gift').click(function () {
        if($(this).attr('data-type') == '0'){
            window.location.href = "myOrders.html?havePaidApo";   //havePaidApo
        }
    });

    if(hasRealGift){
        $('.receiveAfter .toAccount').show();
        $('.receiveAfter .address').html(addressStr);
    }
    if(hasElec){
        $('.receiveAfter .toAddress').show();
        $.get( port + '/card/user?token=' + token ,function (result) {
            $('.receiveAfter .account').html(result.phone);
        });
    }
}


//地址弹框点击 事件范围监听
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


//点击查看更多礼物
$('#more').click(function () {
    $('#giftLoading').show();
    $('#more').hide();
    pageNum++;
    getGIftsList(pageNum);
});

















