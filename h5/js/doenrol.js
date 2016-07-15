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

    addBtn.click(function(){
        setNum(true);
    });
    reduceBtn.click(function(){
       setNum(false);
    });
    //设置报名人数，true为++，false为--
    function setNum(type){
        if(type){
            curNum++;
        }else{
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
            $.ajax({
                type:"get",
                url:port+"/card/activity/"+activityid,
                success:function(data){
                    $(".activityDetail>img").attr("src",data.activityPic);
                    $(".activityDetail h3").html(data.activityTitle);
                    $(".activityDetail .time span").html(new Date(data.startTime*1000).Formate()+"-"+new Date(data.endTime*1000).Formate());
                    $(".activityDetail .address span").html(data.activityAddress);
                    lessAll($(".activityDetail .address span"),25);
                    $(".tips").attr("data-cost",data.activityPrice);
                    $(".cost").html(data.activityPrice==0?"免费活动":"￥"+data.activityPrice);
                    activity=data;


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
                                                order = data.data.applyId;
                                                    if(data.code=='201'){
                                                        // $('#applyName').val("");
                                                        // $('#applyPhone').val("");
                                                        // $("#email").val("");
                                                        if(activity.activityPrice == 0) {       //费用为0直接报名成功
                                                            window.location.href="success.html?id="+activityid;
                                                        }else {
                                                            //费用不为0则跳转到工行支付接口 或者  微信支付

                                                            // $("#payType").fadeIn(300);
                                                            $.actions({
                                                                title: "请选择支付方式",
                                                                onClose: function() {},
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

                                                            // //跳转 银行卡支付
                                                            // $("#payType >.block>.bankCardPay").click(function () {
                                                            //     window.location.href = "payIFrame.html?id="+data.data.applyId;
                                                            //     $('#applyName').val("");
                                                            //     $('#applyPhone').val("");
                                                            //     $("#email").val("");
                                                            // });


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



                                                            // $("#payType >.block>.weixinPay").click(function () {
                                                            //
                                                            // });
                                                            // //隐藏
                                                            // $("#payType >.block>.cancel").click(function () {
                                                            //     $("#payType").fadeOut(300);
                                                            // });

                                                            // window.location.href = "pay.html?id="+data.data.applyId;
                                                        }
                                                    }else{
                                                        $.alert(data.message);
                                                    }
                                            },
                                             error:function(data){
                                                 $.alert("您的账号还未登陆");
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
            //alert("请求出错，重新登陆")
            window.location.href = "login.html?his="+escape(his);
        }
    });

    }else{
        //alert("您的账号还未登陆,请登陆后操作！");
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
    return (y+'.'+m+'.'+d+' '+h+':'+f);
}