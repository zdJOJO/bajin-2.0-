/**
 * Created by Administrator on 2016/8/29.
 */
$(function(){
    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    var token = '';
    if(window.location.href.indexOf('token') > 0 ){
        token = window.location.search.split('=')[1];
    }else {
        token = getCookie("token");
    }

    //swiper滑动初始化
    var bannerSwiper = new Swiper ('.swiper-container', {
        autoplay: 3000,//可选选项，自动滑动
        loop: true,
        // 如果需要分页器
        pagination : '.swiper-pagination',
        paginationClickable :true
    });
    var menuSwiper = new Swiper ('#menu', {
        loop: false,
        slidesPerView : 4,
        nextButton:'.swiper-button-next',
    })


    if(token){
        var changeCarJO = $('#content >header>span:last-child');
        //判断是否绑定了银行卡
        $.get( port + '/card/card?token=' + token,function (result) {
            //判断是否有卡
            if(result.list.length == 0){
                changeCarJO.css('color','#929292');
                $('#content .weui_msg_title').html('您还未绑定工行信用卡');
                $('#content .weui_msg_desc').html('绑定工行信用卡，享受精致的尊享服务，'+'<br>'+'了解详细的信用卡权益。');
                $('#content .weui_btn_primary').html('绑定信用卡').click(function () {
                    window.location.href = "bank.html";
                });
            }else {
                $('#content>.tip').hide();
                $('#content>header>.cardNum').html('尾号' + result.list[0].cardNumber);
                changeCarJO.click(function () {
                    window.location.href = "bank.html";
                });
            }
        });
    }else {
        $('#content header').hide();
        $('#content .weui_msg_title').html('您还为登陆');
        $('#content .weui_msg_desc').html('登陆白金尊享，'+'<br>'+'查看所有工行信用卡服务和权益。');
        $('#content .weui_btn_primary').html('登录').click(function () {
            window.location.href = "login.html?his="+his;
        });
    }




    //菜单栏点击
    $('#menu li').click(function () {
        $('#mine').removeClass('active');
        if($(this).hasClass('active')){
            return
        }else {
            $(this).addClass('active').siblings('li').removeClass('active');
            menuClickFn($(this).attr('data-type'));
        }
    });
    $('#mine').click(function () {
        $('#menu li').removeClass('active');
        if($(this).hasClass('active')){
            return
        }else{
            $(this).addClass('active');
            menuClickFn($(this).attr('data-type'));
        }
    });



    //工行的button请求数据
    $.ajax({
        type:"get",
        url: port+"/card/icbcbutton",
        success:function(data){
            var actList = $("#service>.serviceList>li");
            var len = $("#service>.serviceList").children('li').length;
            for(var i=0;i<len;i++){
                $(actList[i]).attr("data-pickid",data.list[i].pickId);
                $(actList[i]).find("img").attr("src",data.list[i].buttonPic);
                $(actList[i]).find("span").html(data.list[i].buttonTitle);
            }

            //工行 各个按钮
            $("#service .icbcBtn").click(function(){
                if(token){
                    if($(this).attr("id")=="phone"){
                        window.location.href = 'tel://' + '400-009-5588';
                        return;
                    }else if($(this).attr("id")=="personalServe"){
                        getMessage();
                        return;
                    }else if($(this).attr("data-pickid")=="888"){
                        window.location.href = "icbcServe.html";   //跳转工行服务按钮
                    }else {
                        window.location.href = "bank.html?pickid=" + $(this).data("pickid");
                    }
                }else{
                    window.location.href = "login.html?his="+his;
                }
            });

        },
        error:function(data){
            //todo
        }
    });
    

    //私人预约服务
    function getMessage(){
        $.ajax({
            type: "GET",
            dataType:"text",
            url: port+"/card/bank/encryption/privatejcyy?token="+token,
            success:function(data){
                if(data.length<50){
                    window.location.href = "login.html?his="+his;
                }else{
                    $("#merSignMsg").val(data);
                    $("#info").submit();
                }
            },
            error: function () {
                $.ajax({
                    type: "GET",
                    dataType:"string",
                    url: port+"/card/bank/encryption/privatejcyy?token="+token,
                    success:function(data){
                        if(data.length<50){
                            window.location.href = "login.html?his="+his;
                        }else{
                            $("#merSignMsg").val(data);
                            $("#info").submit();
                        }
                    }
                });
            }
        });
    };
    
    
    //菜单栏按钮点击
    function menuClickFn(type) {
        $('.' + type).siblings('section').hide();
        $('#loading').show();
        setTimeout(function () {
            $('.' + type).show();
            $('#loading').hide();
        },500);

    };
    
    //银行卡获取
    function getBankCard() {
        
    }
    
    
    

    //滚动到一定程度时候，悬浮菜单栏
    //获取要定位元素距离浏览器顶部的距离
    var navH = $("nav").offset().top;
    //滚动条事件
    $(window).scroll(function(){
        //获取滚动条的滑动距离
        var scroH = $(this).scrollTop();
        //滚动条的滑动距离大于等于定位元素距离浏览器顶部的距离，就固定，反之就不固定
        if(scroH > navH){
            $('nav').addClass('fixed');
            $('nav>div:first-child').css({'width':'15%'});
            $('nav > div:first-child img').css({'left':'15%'});
            $('nav > div:last-child').css({'width':'49%'});
        }else if(scroH<navH){
            $('nav').removeClass('fixed');
            $('nav>div:first-child').css({'width':'18%'});
            $('nav > div:first-child img').css({'left':'18%'});
            $('nav > div:last-child').css({'width':'70%'});
        }
    });


});