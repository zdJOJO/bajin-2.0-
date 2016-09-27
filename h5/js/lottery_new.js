/**
 * Created by Administrator on 2016/9/22.
 */
/**
 * Created by Administrator on 2016/9/11.
 */
$(function (){
    var token = "";
    var sectionId = ''; //抽奖期数

    var searchStr = window.location.search;
    var phoneNumArray = ['139****3415','131****3995','189****5613','157****5779','182****2235','131****5809','156****2175','136****5889','187****4779']

    //获取存在于cookie中的token值
    function getCookie(c_name) {
        if (document.cookie.length>0) {
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
    if(searchStr.indexOf('token')>0 && !token){
        token = searchStr.split("&")[1].split("=")[1];
    }
    if( searchStr.indexOf('id')>0){
        sectionId = searchStr.split("&")[0].split("=")[1]
    }else {
        sectionId = -1;
    }


    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var hasBankCard = false;  //判断是否绑有信用卡  是--true
    var isBJVip = false; //判断是否为白金卡用户  是--true
    var prizeModelList = []; //奖品列表

    //分享时候 传当前页面的url 和 对象obj
    get_url(window.location.href);
    //调用分享借口
    jsSdkApi('share',{
        title: '贺中秋,迎国庆',
        desc: ' 新用户通过下载/注册“白金尊享”APP并绑定工商银行信用卡，可获得一次抽奖机会',
        link: portStr + '/fareDraw.html?id=' + sectionId,
        imgUrl: portStr + '/imgs/lottery_midAutumn/midFall.png'
    });



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
                    $('.maskBox').hide().siblings('.real').show();
                }
            },
            error: function (e) {
                //todo
            }
        });
    }


    //点击 抽奖
    $('.pointer').click(function (){
        if($(this).attr('data-state') == '207'){
            $.modal({
                title: "提示",
                text: "本活动仅限新注册用户参与每个用户仅限一次抽奖机会）",
                buttons: [
                    { text: "知道了", onClick: function(){} },
                ]
            });
        }
        if(!token){
            $.modal({
                title: "提示",
                text: "您还未登录白金尊享",
                buttons: [
                    { text: "去登录", onClick: function(){
                        window.location.href = "login.html?his=" + escape('fareDraw_new.html');
                    } },
                    { text: "取消", className: "default", onClick: function(){
                        //todo
                    } },
                ]
            });
        }else {
            if(!hasBankCard) {
                $.modal({
                    title: "提示",
                    text: "您还未绑定工商银行信用卡",
                    buttons: [
                        {
                            text: "去绑卡", onClick: function () {
                            window.location.href = "bank.html?his=" + escape('fareDraw_new.html');
                        }
                        },
                        {
                            text: "取消", className: "default", onClick: function () {
                            //todo
                        }
                        },
                    ]
                });
            }
        }
    });


    //根据抽奖期数ID,获取抽奖列表 和 本次抽奖期数的信息
    $.ajax({
        type: 'get',
        url: port + '/card/prizes/section/' + sectionId ,
        success: function (result) {
            $('body').find('.turntable-bg').css({
                'background' : 'url('+ result.prizeSectionModel.bgPic+') no-repeat',
                'background-size' : '100% 100%'
            }).children('.textTitle').children('img').attr('src',result.prizeSectionModel.sectionAdpic)

            $('#rule').children('h3').after(result.prizeSectionModel.ruleDescription);
            prizeModelList = result.prizeModelList;
            var len = prizeModelList.length;
            var winnerStr = '';
            var detailStr = '';
            for(var i=0;i<len;i++){
                detailStr += '<li>'+ prizeModelList[i].prizeDescription +'</li>';
            }
            $('.detail .present').append(detailStr);

            // 随机赋值中奖用户
            for(var i=0;i<len;i++){
                winnerStr += '<li><span>'+ phoneNumArray[i] +'</span>' +
                    '<span>'+ prizeModelList[getRandom(0, 7)].prizeName +'</span></li>';
            }
            $('#nameList').find('ul').append(winnerStr);
            //获奖用户滚动
            $("#nameList").kxbdMarquee({
                direction:"down",
                scrollAmount: 1,
                scrollDelay: 30
            });


            // 声明抽奖
            var targetNum = -1;
            $('.presentList').myLuckDraw({
                width: 100,
                height: 100,
                row : 3, //行
                column : 3, //列
                spacing: 3, //空隙
                conditionObj: {
                    prizeModelList : prizeModelList,
                    lotteryAjaxUrl: port + '/card/newprize?token=' + token + '&sectionId=' + sectionId,  //ajax url
                },
                click : '#realStart',     //点击触发
                time: 3 ,//匀速运动的时间
                end:function(e){
                    //抽奖执行完毕的回调函数,参数e为 获奖编号或者奖品对象
                    var resultStr = ( e.prizeName.indexOf('谢谢') != -1) ? '很遗憾，您没中奖' :'恭喜！您抽中了';
                    var presentStr = ( e.prizeName.indexOf('谢谢') != -1) ? '' : '您的奖品【'+ e.prizeName+'】，我们再与您核实信息后发放到您的手中!';
                    var $content = $('#poPub').find('.content');
                    $('#poPub').fadeIn(200,function () {
                        $content.css({
                            'width': '75%',
                            'height': '55%',
                        }).addClass('bounceIn').find('button').before('<img src="'+ e.prizePic +'">' +
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
                }
            },targetNum);


        },
        error: function (e) {
            //todo
        }
    });
});


