/**
 * Created by Administrator on 2016/10/11.
 */
$(document).ready(function(){

    var token = getCookie("token");
    var userPhoneNum = getCookie("phone");
    var productOrderId = window.location.search.split('=')[1];
    var time = 60;  //验证码获取时间  60s倒计时

    //获取订单信息
    // 0待付款 1待使用 2已完成  3已取消
    $.ajax({
        type: 'get',
        url: port + '/card/productorder/' + productOrderId + '?&token=' + token,
        success: function (res) {
            var status = (res.data.status>=0 ) ? res.data.status : -2 ; //-2表示全部订单
            var statusHandel = '<span class="cancelOrder"></span>';
            if(res.data.status == 0){
                statusHandel = '<span class="cancelOrder">取消订单</span>';
                $('#detailInfo').css('margin-top','50px');
                $('#leftTime').show();
                $('footer').show();
            }else if(res.data.status == 1){
                statusHandel = '';
            }else if(res.data.status == 2){
                statusHandel = '';
            }else if(res.data.status == 3){
                statusHandel = '<span class="cancelOrder deleteOrder">删除订单</span>';
            }

            var orderInfoStr1 = '<ul ><li>订单编号: '+res.data.number+'<br>下单时间: '+new Date(res.data.createTime*1000).Formate()+'</li>' +
                '<li class="bold-btn state">'+stateStrFn(status) + statusHandel +'</li></ul>';
            var orderInfoStr2 = '<ul><li class="product" data-id="'+res.data.productModel.id+'" ><img src="'+res.data.productModel.pic+'"><span>'+res.data.productModel.title+'</span></li>' +
                '<li class="bold-btn tell"><img src="imgs/enjoy/phone.png"><a href="tel:'+res.data.phone+'">'+res.data.productModel.connectName+'</a><span>></span></li></ul>';
            var orderInfoStr3 = '<ul><li>用户信息<br>购买人<span>'+res.data.userName+'</span></li>' +
                '<li>手机号码<span>'+res.data.phone+'</span></li><li class="bold-btn">份数<span>'+res.data.count+'</span></li></ul>';
            var orderInfoStr4 = '<ul><li>消费总金额<span class="price">￥'+res.data.sumPrice.toFixed(2)+'</span></li>' +
                '<li><span class="price">￥'+res.data.sumPrice.toFixed(2)+'</span><span>实付款: </span></li></ul>';

            $('#detailInfo').html(orderInfoStr1 + orderInfoStr2 + orderInfoStr3 + orderInfoStr4);
            $('footer span').html('￥' + res.data.sumPrice.toFixed(2));
            
            //点击 跳转详情
            $('#detailInfo').find('.product').click(function () {
                window.location.href = 'localDisDetail.html?productId=' + $(this).attr('data-id');
            });

            if( ((new Date().getTime()/1000 - res.data.createTime)< 60*30)&& res.data.status == 0){
                enjoyTimer(res.data.createTime);
            }else {
                $('#leftTime').hide();
            }

            //待使用
            if(res.data.status == 1){
                unUseFn(res.data.title,1);
            }else if(res.data.status == 2){
                unUseFn(res.data.title,2);
            }

            //取消订单  删除订单
            var cancelOrderBtn = $('#detailInfo').find('.cancelOrder');
            var $state =  $('#detailInfo').find('ul:first-child').children('li:last-child');
            cancelOrderBtn.unbind('click').click(function () {
                var text = '';
                var isDelete = false;  //判断是 取消订单 还是 删除订单
                if(cancelOrderBtn.hasClass('deleteOrder')){
                    text = "确认是删除订单吗？";
                    isDelete = true;
                }else {
                    text = "确认取消订单吗？"
                }
                $.modal({
                    title: "提示",
                    text: text,
                    buttons: [
                        { text: "确定", onClick: function(){
                            cancel_delete_OrderFn($state,isDelete);
                        } },
                        { text: "取消", className: "default", onClick: function(){ console.log(3)} },
                    ]
                });
            });
        },
        error: function (e) {
            //todo
        }
    });


    //待使用状态下，获取券码并且插入    status: 0-未使用  1-已使用  2-已过期
    function unUseFn(title,orderStatus) {
        $.ajax({
            type: 'get',
            url: port + '/card/productticket/list?productOrderId=' + productOrderId + '&token=' + token,
            success: function (res) {
                var codeList = [];
                var len = res.data.length;
                var listStr = '';
                for(var i=0;i<len;i++){
                    var statuSrt = '';
                    var classStr = '';
                    if(res.data[i].status == 1){
                        statuSrt = '已使用';
                        classStr = 'outTime';
                    }else if(res.data[i].status == 2){
                        statuSrt = '已过期';
                        classStr = 'outTime';
                    }else {
                        codeList.push(res.data[i]);
                    }
                    listStr += '<li data-id="'+res.data[i].id+'">券码'+(i+1)+'' +
                        '<span class="node '+classStr+'">'+res.data[i].code.replace(/(.{4})/g,'$1\n')+'</span>' +
                        '<span>'+statuSrt+'</span></li>';
                }

                var orderInfoStr4 = '';
                if(orderStatus == 2){   //订单已完成
                    orderInfoStr4 = '<ul class="unUse"><li class="introduction">' +
                        '<img src="imgs/enjoy/code.png">券码<span>(有效期至'+new Date(res.data[0].time*1000).Formate()+')</span>' +
                        '<span>温馨提示：门店消费活动结束后，将该券码展示给服务员，并在服务员记录后点击“使用”按钮确认使用。</span></li>' + listStr +'</ul>';
                }else {
                    orderInfoStr4 = '<ul class="unUse"><li class="introduction">' +
                        '<img src="imgs/enjoy/code.png">券码<span>(有效期至'+new Date(res.data[0].time*1000).Formate()+')</span>' +
                        '<span>温馨提示：门店消费活动结束后，将该券码展示给服务员，并在服务员记录后点击“使用”按钮确认使用。</span></li>' +
                        listStr + '<li id="use">使用</li></ul>';
                }

                $('#detailInfo').find('ul:first-child').after(orderInfoStr4);

                // 第1个 使用
                $('#use').unbind('click').click(function () {
                    $('#poPub').fadeIn(200,function () {
                        //使用券码
                        $(this).children('div:first-child').show().siblings('div').hide();
                        useVcode(codeList,title);
                    });
                });
            }
        });
    };

    //取消订单  删除订单
    function cancel_delete_OrderFn($state,isDelete) {
        var url = isDelete ? port + '/card/productorder/force/' + productOrderId + '?token=' + token
            : port + '/card/productorder/' + productOrderId + '?token=' + token;
        $.ajax({
            type: 'delete',
            url: url,
            success: function (res) {
               if(isDelete){
                   $.toast('删除成功',function () {
                       window.location.href = 'myOrders.html#all';
                   });
               }else {
                   location.reload();
               }
            },
            error: function (e) {
                //todo
            }
        })
    };

    //使用券码
    function useVcode(codeList,title) {
        var captcha = ''; //验证码
        var idsStr = '';
        var len = codeList.length;
        var str = '';
        for(var i=0;i<len;i++){
            str += '<li data-id="'+codeList[i].id+'">券码'+(i+1)+' '+'<span style="font-weight:bold">'+codeList[i].code.replace(/(.{4})/g,'$1\n')+'</span>'+
                '<input data-id="'+codeList[i].id+'" id="ticket'+(i+1)+'" type="checkbox">' +
                '<label for="ticket'+(i+1)+'"></label></li>';
        }

        $('#poPub').find('ul').append(str);

        //关闭弹出层
        $('#close1,#close2').unbind('click').click(function () {
            $('#poPub').fadeOut(200).find('ul').html('');
        });

        //点击弹出层面的‘使用’
        $('#useNext').unbind('click').click(function () {
            var checkCodeList = []; //被选中的id
            for(var i=0;i<len;i++){
                if($('#ticket'+(i+1)).is(':checked')) {
                    console.log( $('#ticket'+(i+1)).attr('data-id')  )
                    checkCodeList.push( $('#ticket'+(i+1)).attr('data-id') );
                }
            }
            if(checkCodeList.length > 0){
                for(var i=0;i<checkCodeList.length;i++){
                    idsStr += 'bjzx'+checkCodeList[i];
                }
                idsStr = idsStr.substring(4);
            }else {
                $.alert('请选择要使用的券码');
                return;
            }

            $('#poPub').children('div:first-child').hide().siblings('.verification').show();
            var reSendBtn = $('#poPub').children('.verification').find('.vCode');
            reSendBtn.unbind('click').click(function () {
                var start = setInterval(timer,1000);
                function timer(){
                    reSendBtn.html('剩余(' + time + 's)').attr('disabled','true');
                    time--;
                    if(time == -1){
                        clearTimeout(start);
                        time = 60;
                        reSendBtn.html('重发验证码').removeAttr('disabled');
                    }
                }
                getCodeFn();
            });
            reSendBtn.click();
            //获取验证码  http://121.196.232.233/card/subjectRegister?phone={phone_num}&title={title}&ids={12bjzx14bjaz26}
            function  getCodeFn() {
                $.ajax({
                    type: 'get',
                    url: port + '/card/subjectRegister?phone=' + userPhoneNum + '&title=' + title + '&ids='+ idsStr ,
                    success: function (res) {
                        //验证 验证码
                        $('#verif').unbind('click').click(function () {
                            captcha = $('#verificationCode').val();
                            if(captcha){
                                verifCodeFn(captcha,idsStr);
                            }else {
                                $.alert('请输入验证码');
                            }

                        });
                    },
                    error: function (e) {
                        //todo
                    }
                });
            };
        });
    };

    //验证码 验证  http://121.196.232.233/card/productticket/use?ids={14bjzx24}&captcha={captcha}&token={token}
    function verifCodeFn(captcha,ids) {
        $.ajax({
            type: 'put',
            url: port + '/card/productticket/use?ids=' + ids + '&captcha=' + captcha + '&token=' + token,
            success: function (res) {
                if(res.code == '602'){
                    $.alert(res.message + '请输入正确验证码');
                }else {
                    $.alert('核销成功',function () {
                        window.location.href = 'enjoyOrderDetail.html?orderId=' + productOrderId;
                    });
                }
            },
            error: function (e) {
                //todo
            }
        });
    };

    //付款
    $('#pay').unbind('click').click(function () {
        $.actions({
            title: "请选择支付方式",
            onClose: function() {
                // 关闭弹层的回调函数
            },
            actions: [{
                text: "银行卡支付",
                className: "color-warning",
                onClick: function() {  //跳转 银行卡支付
                    window.location.href = "payIFrame.html?productOrderId=" + productOrderId;
                }
            },
            //     {
            //     text: "微信支付",
            //     className: "color-primary",
            //     onClick: function() {
            //         $.showLoading('支付请求中');
            //         // arouseWeixinPay();  //点击  微信支付
            //     }
            // }
            ]
        });
    });

    //状态转换 -2全部  0待付款 1待使用 2已完成  3已取消
    function stateStrFn(num) {
        var str = '';
        switch (num){
            case 0 :
                str = '待付款';
                break;
            case 1 :
                str = '待使用';
                break;
            case 2 :
                str = '已完成';
                break;
            case 3 :
                str = '已取消';
                break;
        }
        return str;
    };
    
    //计时器
    function enjoyTimer(creatTime) {
        var leftTime = creatTime + 30*60 - parseInt(new Date().getTime()/1000);
        function timer() {
            if(leftTime == 0){
                $('#leftTime').hide();
            }
            var minute = Math.floor(leftTime/60);
            var second = leftTime - minute*60;

            var min = minute < 10 ? '0'+ minute : minute ;
            var sec = second < 10 ? '0' + second-- : second-- ;

            $('#leftTime').html('支付剩余时间: ' + min + ':' + sec);
            leftTime--
        }
        var timeP = setInterval(timer,1000);
        if(leftTime == 0){
            clearInterval(timeP);
        }
    };


});