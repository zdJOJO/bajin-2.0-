/**
 * Created by Administrator on 2016/10/11.
 */
$(document).ready(function(){

    var token = getCookie("token");
    var productOrderId = window.location.search.split('=')[1];
    var time = 60;  //验证码获取时间  60s倒计时

    //获取订单信息
    $.ajax({
        type: 'get',
        url: port + '/card/productorder/' + productOrderId + '?&token=' + token,
        success: function (res) {
            var status = (res.data.status>=0 ) ? res.data.status : -2 ; //-2表示全部订单
            var isCancelStr = '<span class="cancelOrder">取消订单</span>';
            if(res.data.status == 3){
                isCancelStr = '';
                $('footer').hide();
                $('#detailInfo').css('margin-top','0');
                $('#leftTime').hide();
            }
            var orderInfoStr1 = '<ul ><li>订单编号: '+res.data.number+'<br>下单时间: '+new Date(res.data.createTime*1000).Formate()+'</li>' +
                '<li class="bold-btn state">'+stateStrFn(status) + isCancelStr +'</li></ul>';
            var orderInfoStr2 = '<ul><li class="product"><img src="'+res.data.productModel.pic+'"><span>'+res.data.productModel.title+'</span></li>' +
                '<li class="bold-btn tell"><img src="imgs/enjoy/phone.png"><a href="tel:'+res.data.phone+'">联系白金尊享</a><span>></span></li></ul>';
            var orderInfoStr3 = '<ul><li>用户信息<br>购买人<span>'+res.data.productModel.connectName+'</span></li>' +
                '<li>手机号码<span>'+res.data.productModel.phone+'</span></li><li class="bold-btn">份数<span>'+res.data.count+'</span></li></ul>';
            var orderInfoStr4 = '<ul><li>消费总金额<span class="price">￥'+res.data.sumPrice.toFixed(2)+'</span></li>' +
                '<li><span class="price">￥'+res.data.sumPrice.toFixed(2)+'</span><span>实付款: </span></li></ul>';

            $('#detailInfo').html(orderInfoStr1 + orderInfoStr2 + orderInfoStr3 + orderInfoStr4);
            $('footer span').html('￥' + res.data.sumPrice.toFixed(2));

            if( ((new Date().getTime()/1000 - res.data.createTime)< 60*30)&& res.data.status == 0){
                enjoyTimer(res.data.createTime);
            }else {
                $('#leftTime').hide();
            }

            //待使用
            if(res.data.status == 1){
                unUseFn(res.data.productModel.phone,res.data.title);
            }

            //取消订单
            var cancelOrderBtn = $('#detailInfo').find('.cancelOrder');
            var $state =  $('#detailInfo').find('ul:first-child').children('li:last-child');
            cancelOrderBtn.click(function () {
                cancelOrderFn($state);
            });
        },
        error: function (e) {
            //todo
        }
    });


    //待使用状态下，获取券码并且插入    status: 0-未使用  1-已使用  2-已过期
    function unUseFn(phone,title) {
        $.ajax({
            type: 'get',
            url: port + '/card/productticket/list?productOrderId=' + productOrderId + '&token=' + token,
            success: function (res) {
                var codeList = [];
                var len = res.data.length;
                var listStr = '';
                for(var i=0;i<len;i++){
                    var statuSrt = '';
                    if(res.data[i].status == 1){
                        statuSrt = '已使用';
                    }else if(res.data[i].status == 2){
                        statuSrt = '已过期';
                    }else {
                        codeList.push(res.data[i]);
                    }
                    listStr += '<li data-id="'+res.data[i].id+'">券码'+(i+1)+'<span class="node">'+res.data[i].code.replace(/(.{4})/g,'$1\n')+'</span>' +
                        '<span>'+statuSrt+'</span></li>';
                }
                var orderInfoStr4 = '<ul class="unUse"><li class="introduction"><img src="imgs/enjoy/code.png">券码<span>(有效期至2016-12-31)</span>' +
                '<span>温馨提示：门店消费活动结束后，将该券码展示给服务员，并在服务员记录后点击“使用”按钮确认使用。</span></li>' +
                    listStr + '<li id="use">使用</li></ul>';

                $('#detailInfo').find('ul:first-child').after(orderInfoStr4);

                $('#use').click(function () {
                    $('#poPub').fadeIn(200,function () {
                        //使用券码
                        useVcode(codeList,phone,title);

                        //关闭弹出层
                        $('#close1 ,#close2').click(function () {
                            $('#poPub').fadeOut(200);
                        });
                    });

                });
            }
        });
    }


    //取消订单
    function cancelOrderFn($state) {
        $.ajax({
            type: 'delete',
            url: port + '/card/productorder/' + productOrderId + '?token=' + token,
            success: function (res) {
                $.modal({
                    title: "提示",
                    text: "确认取消订单吗？",
                    buttons: [
                        { text: "确定", onClick: function(){
                            $state.html('已取消');
                            $('#detailInfo').css('margin-top','0');
                            $('footer').hide();
                            $('#leftTime').hide();
                        } },
                        { text: "取消", className: "default", onClick: function(){ console.log(3)} },
                    ]
                });
            },
            error: function (e) {
                //todo
            }
        })
    }

    //使用券码
    function useVcode(codeList,phone,title) {
        var captcha = ''; //验证码
        var idsStr = '';
        var checkCodeList = []; //被选中的id
        var len = codeList.length;
        var str = '';
        for(var i=0;i<len;i++){
            str += '<li data-id="'+codeList[i].id+'">券码'+(i+1)+'+'+codeList[i].code+
                '<input id="ticket'+(i+1)+'" type="checkbox"><label for="ticket'+(i+1)+'"></label></li>';
        }

        $('#poPub').find('ul').append(str);

        $('#useNext').click(function () {
            for(var i=0;i<len;i++){
                if($('#ticket'+i).is(':checked')) {
                    checkCodeList.push($(this).attr('data-id'));
                }
            }

            if(checkCodeList.length > 1){
                for(var i=0;i<checkCodeList.length-1;i++){
                    idsStr += 'bjzx'+checkCodeList[i];
                }
                idsStr = idsStr.substring(4);
            }else if(checkCodeList.length == 1){
                idsStr = checkCodeList[0]
            }else {
                alert('请选择要使用的券码');
                return
            }

            $('#poPub').children('div:first-child').hide().siblings('.verification').show();
            var reSendBtn = $('#poPub').children('.verification').find('.vCode');
            reSendBtn.click(function () {
                var start = setInterval(timer,1000);
                function timer(){
                    reSendBtn.html('重发验证码(' + time + 's)').attr('disabled','true');
                    time--;
                }
                if(time == 0){
                    reSendBtn.html('重发验证码').removeAttr('disabled');
                }
            });
            reSendBtn.click();
            //获取验证码  http://121.196.232.233/card/subjectRegister?phone={phone_num}&title={title}&ids={12bjzx14bjaz26}
            $.ajax({
                type: 'get',
                url: port + '/card/subjectRegister?phone=' + phone + '&title=' + title + '&ids={'+ idsStr + '}',
                success: function (res) {
                    //验证 验证码
                    captcha = $('#verificationCode').val();
                    $('#verif').click(function () {
                        if(captcha){
                            verifCodeFn(captcha,idsStr);
                        }else {
                            alert('请输入验证码');
                        }

                    });
                },
                error: function (e) {
                    //todo
                }
            });
        });
    }

    //验证码 验证  http://121.196.232.233/card/productticket/use?ids={14bjzx24}&captcha={captcha}&token={token}
    function verifCodeFn(captcha,ids) {
        $.ajax({
            type: 'put',
            url: port + '/card/productticket/use?ids={' + ids + '}&captcha' + captcha + '&token=' + token,
            success: function (res) {
                //todo
                alert('核销成功');
                window.location.href = 'enjoyOrderDetail.html';
            },
            error: function (e) {
                //todo
            }
        });
    }



    //付款
    $('#pay').click(function () {
        $.actions({
            title: "请选择支付方式",
            onClose: function() {
                // 关闭弹层的回调函数
            },
            actions: [{
                text: "银行卡支付",
                className: "color-warning",
                onClick: function() {  //跳转 银行卡支付
                    window.location.href = "payIFrame.html?id=" + productOrderId;
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
    }
    
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
    }
});