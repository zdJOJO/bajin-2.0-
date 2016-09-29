/**
 * Created by Administrator on 2016/9/11.
 */
$(function (){
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
    if( window.location.search.indexOf('token')>0 && !token){
        token = window.location.search.split("&")[0].split("=")[1];
        setCookie('token',token);
    }

    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var hasBankCard = false;  //判断是否绑有信用卡  是--true
    var isBJVip = false; //判断是否为白金卡用户  是--true


    //分享时候 传当前页面的url 和 对象obj
    get_url(window.location.href);
    //调用分享借口
    jsSdkApi('share',{
        title: '贺中秋,迎国庆',
        desc: ' 新用户通过下载/注册“白金尊享”APP并绑定工商银行信用卡，可获得一次抽奖机会',
        link: 'http://www.winthen.com/test/fareDraw.html',
        imgUrl: 'http://www.winthen.com/test/imgs/lottery_midAutumn/midFall.png'
    });


    //获奖用户滚动
    $("#nameList").kxbdMarquee({
        direction:"down",
        scrollAmount: 1,
        scrollDelay: 30
    });

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
        var resultStr = awards==0 ? '您没抽中' : '恭喜！您抽中了';
        var presentStr = awards==0 ? '【谢谢参与】' : '您的奖品【'+ txt+'】，我们再与您核实信息后发放到您的手中!' ;
        bRotate = !bRotate;
        $('#rotate').stopRotate();
        $('#rotate').rotate({
            angle:0,
            animateTo:angles + 3600,
            duration:8000,
            callback:function (){
                var $content = $('#poPub').find('.content');
                $('#poPub').fadeIn(200,function () {
                    $content.css({
                        'width': '75%',
                        'height': '55%',
                    }).addClass('bounceIn').find('button').before('<img src="'+ getPresentPic(awards) +'">' +
                        '<h3>'+ resultStr +'</h3><span class="present">'+ presentStr +'</span>');
                });

                var $sure = $('#poPub').find('.sure');
                $sure.click(function () {
                    $sure.css({
                        'color' : 'rgba(255, 255, 255, 0.5)',
                        'background' : 'rgb(43, 72, 108)'
                    });
                    setTimeout(function () {
                        $('#poPub').fadeOut(300);
                        $content.html('').css({
                            'width': 0,
                            'height': 0
                        });
                    },150)
                });
                bRotate = !bRotate;
            }
        })
    };


    //图片预加载
    $(".detail img").lazyload({
        placeholder : "",
        threshold: 0,
        effect : "fadeIn",
        effectspeed: 500,
        event: 'scroll'
    });


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
                text: "您还未登录白金尊享",
                buttons: [
                    { text: "去登录", onClick: function(){
                        window.location.href = "login.html?his=" + escape('fareDraw.html');
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
                                text: "本活动仅限新注册用户参与每个用户仅限一次抽奖机会）",
                                buttons: [
                                    { text: "知道了", onClick: function(){} },
                                ]
                            });
                            return
                        }
                        if(bRotate)return;
                        var item;
                        if(result.code == '208'){
                            item = 0;
                        }else {
                            item = transFormPrizeIdToItem(result.data.prizeId);
                        }
                        switch (item) {
                            case 0:
                                //var angle = [26, 88, 137, 185, 235, 287, 337];
                                rotateFn(0, 338, '谢谢参与');
                                break;
                            case 1:
                                //var angle = [88, 137, 185, 235, 287];
                                rotateFn(1, 203, '20元话费');
                                break;
                            case 2:
                                //var angle = [137, 185, 235, 287];
                                rotateFn(2, 113, '50元话费');
                                break;
                            case 3:
                                //var angle = [137, 185, 235, 287];
                                rotateFn(3, 158, '阳澄湖大杂蟹');
                                break;
                            case 4:
                                //var angle = [185, 235, 287];
                                rotateFn(4, 23, '1280元护理疗程体验券');
                                break;
                            case 5:
                                //var angle = [185, 235, 287];
                                rotateFn(5, 293, '550元的云上清风现金抵用券');
                                break;
                            case 6:
                                //var angle = [235, 287];
                                rotateFn(6, 68, '108元的阿卡有机蔬菜一箱');
                                break;
                            case 7:
                                //var angle = [287];
                                rotateFn(7, 248, '龙羲红果礼盒');
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
                //龙羲红果礼盒
                item = 7;
                break;
        }
        return item;
    }

    //获取奖品图片
    function  getPresentPic(item) {
        var picPathStr = '';
        switch (item) {
            case 0:
                // rotateFn(0, 338, '谢谢参与');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/thanks.png';
                break;
            case 1:
                // rotateFn(1, 203, '20元话费');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/20yuan.png';
                break;
            case 2:
                // rotateFn(2, 113, '50元话费');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/50yuan.png';
                break;
            case 3:
                // rotateFn(3, 158, '阳澄湖大杂蟹');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/dzx.png';
                break;
            case 4:
                // rotateFn(4, 23, '1280元护理疗程体验券');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/hl.png';
                break;
            case 5:
                // rotateFn(5, 293, '550元的云上清风现金抵用券');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/qf.png';
                break;
            case 6:
                // rotateFn(6, 68, '108元的阿卡有机蔬菜一箱');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/sc.png';
                break;
            case 7:
                // rotateFn(7, 248, '龙羲红果礼盒');
                picPathStr = portStr + '/imgs/lottery_midAutumn/presents/hg.png';
                break;
        }
        return picPathStr;
    }
});


