$(function(){

    var token = "";
    //获取存在于cookie中的token值
    function getCookie(c_name)
    {
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

    var activityid= window.location.search.split('=')[1];
    console.log(activityid);

    var his = window.location.pathname.split("/");
    his = his[his.length-1] +window.location.search;
    var addBtn=$('.add').eq(0);
    var personNum=$('.num').eq(0);
    var reduceBtn=$('.reduce').eq(0);
    var curNum=1;
    var tmpNum = 1;  //作为标记提示

    // addBtn.click(function(){
    //     setNum(true);
    // });
    // reduceBtn.click(function(){
    //    setNum(false);
    // });
    //设置报名人数，true为++，false为--
    function setNum(type,_num){
        if(type){
            curNum = ++curNum>_num ? _num : curNum;
            tmpNum++;
            if(tmpNum > _num){
                $.modal({
                    title: "提示",
                    text: "本活动最多允许"+_num+"人报名",
                    buttons: [
                        { text: "知道了", className: "default", onClick: function(){}},
                    ]
                });
            }
        }else{
            tmpNum = 1;
            curNum=--curNum<1?1:curNum;
        }
        personNum.html(curNum);
        var Cost = curNum*$(".tips").data("cost");
        var cost=Cost.toFixed(2);
        cost = cost==0?"免费活动":"￥"+cost;
        $(".cost").html(cost);  
    }
    var user={};
    var activity={};
    var checkBtn=$('#checkInfo');
    

    
    if(token != undefined){
    $.ajax({
        type:"get",
        url:port+"/card/user?token="+token,
        success:function(data){
            if(typeof(data) =="string"){
                window.location.href = "login.html?his="+his;
            }else{
                user = data;

                $('#applyName').val(user.userName);
                $('#applyPhone').val(user.phone);
                if(user.email){
                    $("#email").val(user.email);
                }

                $.ajax({
                    type:"get",
                    url:port+"/card/activity/"+activityid,
                    success:function(data){
                        $(".activityDetail>img").attr("src",data.activityPic);
                        $(".activityDetail h3").html(data.activityTitle);
                        $(".activityDetail .time span").html(new Date(data.startTime*1000).Formate()+" - "+new Date(data.endTime*1000).Formate());
                        $(".activityDetail .address span").html(data.activityAddress);
                        lessAll($(".activityDetail .address span"),25);
                        $(".tips").attr("data-cost",data.activityPrice);
                        $(".cost").html(data.activityPrice==0?"免费活动":"￥"+data.activityPrice);

                        //判断加减人数
                        addBtn.click(function(){
                            setNum(true,data.maxApply);
                        });
                        reduceBtn.click(function(){
                            setNum(false);
                        });
                        activity = data;
                        checkBtn.click(function(){
                            var applyName=$('#applyName').val();
                            var applyPhone=$('#applyPhone').val();
                            var applyNumber=$('.num').html();
                            var applyRemark=$('.note_q').val();
                            var email = $("#email").val();
                            var reg_email=/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
                            if(applyName==''||applyPhone==''){
                                $.alert("请输入真实姓名和手机号");
                            }else{
                                var checked = checkMobile(applyPhone);
                                if(checked){
                                    if(reg_email.test(email)||$("#email").val()==""){
                                        var info={
                                            "activityId":activityid,
                                            "applyName":applyName,
                                            "applyPhone":applyPhone,
                                            "applyGender":user.gender,
                                            "applyNumber":applyNumber,
                                            "applyEmail":email||"",
                                            "applyPrice":activity.activityPrice*applyNumber,
                                            "applyRemark":applyRemark
                                        };
                                        var order = '';    // 微信用 applyId
                                        $.ajax({
                                            type:'POST',
                                            url:port+"/card/apply?token="+token,
                                            data:JSON.stringify(info),
                                            contentType:'application/json',
                                            success:function(data){
                                                if(data.code=='201'){
                                                    order = data.data.applyId;
                                                    // $('#applyName').val("");
                                                    // $('#applyPhone').val("");
                                                    // $("#email").val("");
                                                    if(activity.activityPrice == 0) {       //费用为0直接报名成功
                                                        window.location.href = "success.html?id=" + activityid;
                                                    }else {
                                                        //费用不为0则跳转到工行支付接口 或者  微信支付
                                                        popPay();


                                                        //弹出支付层
                                                        function popPay() {
                                                            $.actions({
                                                                title: "请选择支付方式",
                                                                onClose: function() {
                                                                    //关闭弹层的回调函数
                                                                    $.modal({
                                                                        title: "确认要放弃付款？",
                                                                        text: "订单会保留一段时间，请尽快支付",
                                                                        buttons: [
                                                                            { text: "继续支付", onClick: function(){
                                                                                popPay();
                                                                                $('#applyName').val("");
                                                                                $('#applyPhone').val("");
                                                                                $("#email").val("");
                                                                            }
                                                                            },
                                                                            { text: "确认离开",className: "default",onClick: function(){
                                                                                window.location.href = "myOrders.html";
                                                                            }
                                                                            },
                                                                        ]
                                                                    });
                                                                },
                                                                actions: [
                                                                    {
                                                                        text: "银行卡支付",
                                                                        className: "color-warning",
                                                                        onClick: function() {  //跳转 银行卡支付
                                                                            window.location.href = "payIFrame.html?id=" + data.data.applyId;
                                                                            $('#applyName').val("");
                                                                            $('#applyPhone').val("");
                                                                            $("#email").val("");
                                                                        }
                                                                    },
                                                                    {
                                                                        text: "微信支付",
                                                                        className: "color-primary",
                                                                        onClick: function() {
                                                                            $.showLoading('支付请求中');
                                                                            arouseWeixinPay();  //点击  微信支付
                                                                        }
                                                                    },
                                                                ]
                                                            });
                                                        };

                                                        //点击  微信支付  时候的函数
                                                        var arouseWeixinPay = function () {
                                                            //请求微信支付所需的参数
                                                            var ip = String(returnCitySN["cip"]);
                                                            var applyid = order;

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
                                                    }
                                                }else{
                                                    if(data.message == '您还未绑定工行信用卡'){
                                                        $.modal({
                                                            title: "提示",
                                                            text: data.message,
                                                            buttons: [
                                                                { text: "去绑卡", onClick: function(){
                                                                    window.location.href="bank.html?his="+escape(his);
                                                                }},
                                                                { text: "取消", className: "default", onClick: function(){
                                                                    //todo
                                                                },
                                                                }
                                                            ]
                                                        });
                                                    }else {
                                                        $.alert(data.message);
                                                    }
                                                }
                                            },
                                            error:function(data){
                                                $.alert("您的账号还未登录,请登录");
                                                window.location.href="login.html?his="+escape(his);
                                            }
                                        });

                                    }else{
                                        $.alert("请填写正确的邮箱");
                                    }
                                }else{
                                    $.alert("请填写正确的手机号码");
                                }
                            }
                        });
                    },
                    error:function(data){
                        // console.log(data);
                        window.location.href = "login.html?his="+escape(his);
                    }
                });
        
        } },
        error:function(data){
            //alert("请求出错，重新登录")
            window.location.href = "login.html?his="+escape(his);
        }
    });

    }else{
        //alert("您的账号还未登录,请登录后操作！");
        window.location.href="login.html?his="+escape(his);
    }
});





//格式化时间，在date原形上边添加方法
Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
    var h=this.getHours()>9?this.getHours():'0'+this.getHours();
    var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
    return (y+'.'+m+'.'+d);
}