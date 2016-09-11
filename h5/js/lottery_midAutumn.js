/**
 * Created by Administrator on 2016/9/11.
 */
$(function (){
    var speed= 15; //数字越大速度越慢
    var tab=document.getElementById("winner");
    var tab1=document.getElementById("demo1");
    var tab2=document.getElementById("demo2");
    tab2.innerHTML=tab1.innerHTML;
    function Marquee(){
        if(tab2.offsetWidth-tab.scrollLeft<=0)
            tab.scrollLeft-=tab1.offsetWidth
        else{
            tab.scrollLeft++;
        }
    }
    var MyMar = setInterval(Marquee,speed);



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
    token = getCookie("token")
    if((window.location.search.indexOf('token') > 0)){
        token = window.location.search.split("&")[1].split("=")[1]
    }

    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var hasBankCard = false;  //判断是否绑有信用卡  是--true
    var isBJVip = false; //判断是否为白金卡用户  是--true

    var rotateTimeOut = function (){
        $('#rotate').rotate({
            angle:0,
            animateTo:2160,
            duration:8000,
            callback:function (){
                alert('网络超时，请检查您的网络设置！');
            }
        });
    };
    var bRotate = false;

    var rotateFn = function (awards, angles, txt){
        bRotate = !bRotate;
        $('#rotate').stopRotate();
        $('#rotate').rotate({
            angle:0,
            animateTo:angles + 3600,
            duration:8000,
            callback:function (){
                var $content = $('#poPub').find('.content');
//					alert(txt);
                $('#poPub').fadeIn(200,function () {
                    $content.css({
                        'width': '85%',
                        'height': '15rem',
                    }).addClass('bounceIn').html(txt).click(function () {
                        $('#poPub').fadeOut(300);
                        $content.css({
                            'width': 0,
                            'height': 0
                        });
                    });
                });
                bRotate = !bRotate;
            }
        })
    };

    //是否为白金卡用户
    if(token){
        $.ajax({
            type: 'get',
            url: port+"/card/card?token="+token,
            success: function (result) {
                if(result.list.length == 0){
                    hasBankCard = false;
                }else {
                    hasBankCard = true;
                    for(var i=0;i<result.list.length;i++){
                        if(result.list[i].bjke == 1){
                            isBJVip = true;
                        }else {
                            isBJVip = false;
                        }
                    }
                }
            },
            error: function (e) {

            }
        });
    }


    //点击 抽奖
    $('.pointer').click(function (){
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
            if(!hasBankCard){
                $.modal({
                    title: "提示",
                    text: "您还未绑定工商银行信用卡",
                    buttons: [
                        { text: "去绑卡", onClick: function(){
                            window.location.href = "bank.html?his=" + escape(his);
                        } },
                        { text: "取消", className: "default", onClick: function(){
                            //todo
                        } },
                    ]
                });
            }else {
                $.ajax({
                    type: 'post',
                    dataType: "json",
                    contentType : "application/json",
                    url: port + '/card/prize?token=' + token + '&sectionId=7',
                    success: function (result) {
                        if(result.code == '207'){
                            $.modal({
                                title: "提示",
                                text: "您已经抽过奖了",
                                buttons: [
                                    { text: "知道了", onClick: function(){} },
                                ]
                            });
                            return
                        }
                        if(bRotate)return;
                        var item = transFormPrizeIdToItem(result.data.prizeId);
                        switch (item) {
                            case 0:
                                //var angle = [26, 88, 137, 185, 235, 287, 337];
                                rotateFn(0, 337, '谢谢参与');
                                break;
                            case 1:
                                //var angle = [88, 137, 185, 235, 287];
                                rotateFn(1, 26, '20元话费');
                                break;
                            case 2:
                                //var angle = [137, 185, 235, 287];
                                rotateFn(2, 88, '50元话费');
                                break;
                            case 3:
                                //var angle = [137, 185, 235, 287];
                                rotateFn(3, 137, '阳澄湖大杂蟹');
                                break;
                            case 4:
                                //var angle = [185, 235, 287];
                                rotateFn(4, 185, '1280元护理疗程体验券');
                                break;
                            case 5:
                                //var angle = [185, 235, 287];
                                rotateFn(5, 185, '550元的云上清风现金抵用券');
                                break;
                            case 6:
                                //var angle = [235, 287];
                                rotateFn(6, 235, '108元的阿卡有机蔬菜一箱');
                                break;
                            case 7:
                                //var angle = [287];
                                rotateFn(7, 287, '红羲红果礼盒');
                                break;
                        }

                        console.log(item);
                    },
                    error: function () {

                    }
                });
            }
        }
    });


    //取整数
    function rnd(n, m){
        return Math.floor(Math.random()*(m-n+1)+n)
    }

    //奖品 prizeId 对应的 item
    function transFormPrizeIdToItem(prizeId) {
        var item;
        switch (prizeId) {
            case 75:
                //谢谢参与
                item = 0;
                break;
            case 77:
                //20元话费
                item = 1;
                break;
            case 79:
                //50元话费
                item = 2;
                break;
            case 80:
                //阳澄湖大杂蟹
                item = 3;
                break;
            case 81:
                //1280元护理疗程体验券
                item = 4;
                break;
            case 82:
                //550元的云上清风现金抵用券
                item = 5;
                break;
            case 83:
                //108元的阿卡有机蔬菜一箱
                item = 6;
                break;
            case 84:
                //红羲红果礼盒
                item = 7;
                break;
        }
        return item;
    }
});


