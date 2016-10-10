/**
 * Created by Administrator on 2016/10/9.
 */
$(document).ready(function(){
    token = getCookie("token");//便于本地测试
    //获取页面的名称
    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    var productId = window.location.search.split('&')[0].split('=')[1];
    var productObj = {};
    var totalPrice = 0;

    //获取单个产品的详细信息
    $.ajax({
        type: 'get',
        url: port + '/card/product/' + productId ,
        success: function (result) {
            productObj = result.data;
            $('#mallDetail').children('.headImg').html('<img src="'+result.data.imgList[0].pic+'">')
            $('#mallDetail').children('.list').html('<p class="title">'+result.data.title+'</p>' +
                '<p class="subtitle">'+result.data.subtitle+'</p><p class="price">￥'+result.data.costPrice.toFixed(2)+'</p>' +
                '<p class="disPrice">￥'+result.data.price.toFixed(2)+'</p><p class="num">已售'+result.data.soldSum+'份</p>');
            $('#mallDetail').children('.information').html('<p><img src="imgs/enjoy/time.png"><span>'+result.data.timeDescription+'</span></p>' +
                '<p><img src="imgs/enjoy/tip.png"><span>'+result.data.sumDescription+'</span></p>' +
                '<p class="tell"><img src="imgs/enjoy/phone.png"><a href="tel:'+result.data.phone+'">咨询白金尊享</a><img src="imgs/enjoy/right.png"></p>');
            $('#mallDetail').children('.message').children('div:first-child').append(result.data.storeInfo);
            $('#mallDetail').children('.message').children('div:last-child').append(result.data.reminder);
        },
        error: function (e) {
            //todo
        }
    });
    
    //跳转订单
    $('#payOnline').click(function () { 
        $('#order').show();
        var reduceBtn = $('#order').find('.reduce');
        var plusBtn = $('#order').find('.plus');
        $('#order').find('.proInfo').html('<img src="'+productObj.pic+'"><div class="name"><p>'+productObj.title+'</p>' +
            '<span class="itemPrice">￥'+productObj.costPrice.toFixed(2)+'</span></div>');
        $('#order').find('.totalPrice').html('￥' + productObj.costPrice.toFixed(2));
        $('#order').find('ul').append(' <li class="name">购买人<span>'+productObj.connectName+'</span></li>' +
            '<li class="phone">手机号码<span>'+productObj.phone+'</span></li>')
        reduceBtn.click(function () {
            var num = $('#order').find('.valueNum').html();
            if(num == 1){
                return
            }
            productNum('reduce',num,productObj.costPrice);
        });
        plusBtn.click(function () {
            var num = $('#order').find('.valueNum').html();
            // if(num){
            //     return
            // }
            productNum('plus',num,productObj.costPrice);
        });
        
        //提交订单并且支付
        $('#submitOrder').click(function () {
            //提交订单  http://121.196.232.233/card/productorder?token=e7120d7a-456b-4471-8f86-ac638b348a53
            var count = $('#order').find('.valueNum').html();
            var sumPrice = count * productObj.costPrice;

            $.ajax({
                type: 'post',
                dataType: "json",
                contentType : "application/json",
                url: port + '/card/productorder?token=' + token,
                data: JSON.stringify({
                    count: count,
                    productId: productId,
                    sumPrice: sumPrice
                }),
                success: function (result) {
                    //todo
                    $.actions({
                        title: "请选择支付方式",
                        onClose: function() {
                            // 关闭弹层的回调函数
                            $.modal({
                                title: "确认要放弃付款？",
                                text: "订单会保留一段时间，请尽快支付",
                                buttons: [
                                    { text: "继续支付", onClick: function(){
                                        window.location.href = "payIFrame.html?productId=" + productId;
                                    }
                                    },
                                    { text: "确认离开",className: "default",onClick: function(){
                                        // window.location.href = "myOrders.html";
                                    }
                                    },
                                ]
                            });
                        },
                        actions: [{
                                text: "银行卡支付",
                                className: "color-warning",
                                onClick: function() {  //跳转 银行卡支付
                                    window.location.href = "payIFrame.html?id=" + productId;
                                    $('#applyName').val("");
                                    $('#applyPhone').val("");
                                    $("#email").val("");
                                }
                            },{
                                text: "微信支付",
                                className: "color-primary",
                                onClick: function() {
                                    $.showLoading('支付请求中');
                                    // arouseWeixinPay();  //点击  微信支付
                                }
                            }
                        ]
                    });
                },
                error: function (e) {
                    //todo
                }
            });
        });

    });


    //订单数目加减
    function productNum(type,num,price) {
        if(type == 'reduce'){
            num--;
        }else {
            num++;
        }
        $('#order').find('.valueNum').html(num);
        totalPrice = parseInt(num) * price;
        $('#order').find('.totalPrice').html('￥' + totalPrice.toFixed(2));
    }


    //点击  微信支付  时候的函数
    var arouseWeixinPay = function () {
        //请求微信支付所需的参数
        var ip = String(returnCitySN["cip"]);
        var applyid = productId;

        var appid =  '';
        var nonceStr = '';
        var  package = '';
        var myDate = new Date();
        var timeStamp = '';
        var stringA ='' ;
        var stringSignTemp = '';
        var sign = '';

        $.ajax({
            type: "get",
            url: port + "/card/weixin/getRepay?orderId=" + applyid + "&token=" + token + "&type=0&ipAddress=" + ip ,
            success: function (result) {
                appid =  String(result.appId);
                nonceStr = String(result.nonceStr);
                package = String(result.package);
                timeStamp = String(myDate.getTime());

                stringA = "appId=" + appid + "&nonceStr=" + nonceStr + "&package=" + package + "&signType=MD5&timeStamp=" + timeStamp ;
                stringSignTemp = stringA + "&key=29798840529798840529798840529798";
                sign = hex_md5(stringSignTemp).toUpperCase();
            }
        });

        //唤起 微信支付
        setTimeout(function () {
            $.hideLoading();
            function onBridgeReady(){
                WeixinJSBridge.invoke(
                    'getBrandWCPayRequest', {
                        "appId" : appid,     //公众号名称，由商户传入
                        "timeStamp": timeStamp,         //时间戳，自1970年以来的秒数
                        "nonceStr" : nonceStr, //随机串
                        "package" : package,
                        "signType" : "MD5",         //微信签名方式：
                        "paySign" : sign  //微信签名
                    },
                    function(res){
                        if(res.err_msg == "get_brand_wcpay_request：ok" ) {}     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                    }
                );
            }
            if (typeof WeixinJSBridge == "undefined"){
                if( document.addEventListener ){
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                }else if (document.attachEvent){
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            }else{
                onBridgeReady();
            }
        },2000);
    };

});