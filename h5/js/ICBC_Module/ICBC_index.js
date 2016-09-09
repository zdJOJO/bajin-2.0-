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

    //二级广告
    // isAudit 表示是否审核  0 为审核  1已审核  (默认获取已审核) isDelete 表示是否删除的数据 0正常  1删除 (默认获取未删除的数据)
    $.ajax({
        type:"get",
        url: port+"/card/sub/banner?currentPage=1&isDelete=0&isAudit=1",
        success:function(result){
            var str = '' , url='';
            for(var i=0;i<result.data.list.length;i++){
                url = result.data.list[i].url.split('?')[0] + '?' + result.data.list[i].url.split('?')[1].split('&')[1];
                str += '<div class="swiper-slide" data-url="'+ url +'">' +
                    '<img src="'+ result.data.list[i].pic +'" data-original="'+ result.data.list[i].pic +'"></div>';
            }
            var banner = document.getElementById('banner');
            var width = banner.offsetWidth;
            var height = width/2;
            $("#banner").css('height',height).children('.swiper-wrapper').append(str);


            //swiper滑动初始化
            var bannerSwiper = new Swiper ('#banner.swiper-container', {
                autoplay: 3000,//可选选项，自动滑动
                loop: true,
                // 如果需要分页器
                pagination : '.swiper-pagination',
                paginationClickable :true
            });
            //点击banner跳转
            var $itemBanner = $("#banner").find('.swiper-slide');
            $itemBanner.click(function () {
                window.location.href = $(this).attr('data-url');
            });
        },
        error:function(e){
            //todo
        }
    });

    //工行的button请求数据
    $.ajax({
        type:"get",
        url: port+"/card/icbcbutton",
        success:function(result){
            var actList = $("#service>.serviceList>li");
            var len = $("#service").children('.serviceList').children('li').length;
            for(var i=0;i<len;i++){
                $(actList[i]).attr("data-pickid",result.list[i].pickId);
                $(actList[i]).find("img").attr("data-original",result.list[i].buttonPic);
                $(actList[i]).find("span").html(result.list[i].buttonTitle);
            }
            //图片预加载
            $("#service").find('img').lazyload({
                placeholder : "./imgs/gift/pic-loading.gif", //用图片提前占位
                effect: "fadeIn", // 载入使用何种效果
            });

            //工行 各个按钮
            $("#service").find('li.icbcBtn').click(function(){
                if(token){
                    if(this.id == "phone"){
                        window.location.href = 'tel://' + '400-009-5588';
                        return;
                    }else if( this.id == "personalServe"){
                        getMessage();
                        return;
                    }else if($(this).attr("data-pickid")=="888"){
                        window.location.href = "icbcServe.html";   //跳转工行服务按钮
                    }else {
                        window.location.href = "bank.html?pickid=" + $(this).data("pickid") + '&token=' + token;
                    }
                }else{
                    window.location.href = "login.html?his="+his;
                }
            });

        },
        error:function(e){
            //todo
        }
    });


    if(token){
        var changeCardJO = $('#content >header>span:last-child');
        //判断是否绑定了银行卡
        $.get( port + '/card/card?token=' + token,function (result) {
            //判断是否有卡
            if(result.list.length == 0){
                changeCardJO.css('color','#929292');
                $('#content').find('.title').html('您还未绑定工行信用卡');
                $('#content').find('p').html('绑定工行信用卡，享受精致的尊享服务，'+'<br>'+'了解详细的信用卡权益。');
                $('#content').find('button').html('绑定信用卡').click(function () {
                    window.location.href = "bank.html?token=" + token;
                });
            }else {
                $('#cardDetail').show();

                $('#content').find('.tip').hide();
                $('#content').find('.cardNum').html('尾号' + result.list[0].cardNumber);
                changeCardJO.click(function () {
                    window.location.href = "bank.html";
                });
            }
        });
    }else {
        $('#content').find('header').hide();

        $('#content').find('.title').html('您还未登陆');
        $('#content').find('p').html('登陆白金尊享，'+'<br>'+'查看所有工行信用卡服务和权益。');
        $('#content').find('button').html('登录').click(function () {
            window.location.href = "login.html?his="+his;
        });
    }



    //菜单栏按钮点击
    function menuClickFn(type) {
        $('.' + type).siblings('section').hide();
        $('#loading').show();
        switch (type){
            case 'allCards':
                getList('cardtype');
                $('section.allCards').preventScroll();//滚动条冒泡阻止
                break;
        }
        setTimeout(function () {
            $('.' + type).show();
            $('#loading').hide();
        },300);
    };

    //菜单栏 (我的)  点击
    $('#mine').click(function () {
        $('#menu').find('li').removeClass('active');
        if($(this).hasClass('active')){
            return
        }else{
            $(this).addClass('active');
            menuClickFn($(this).attr('data-type'));
        }
    });

    
    //  卡种 、获取人群  列表获取
    // str: cardtype || pgroup
    function getList(typeStr) {
        var url = port + '/card/' + typeStr + '?currentPage=1';
        $.ajax({
            type: 'get',
            url: url,
            success: function (result) {
                var len = result.data.list.length;
                var str = '';
                if(result.code == '211' && len > 0){
                   switch (typeStr){
                       case 'cardtype':
                           for (var i=0;i<len;i++){
                               str += '<div class="singleCard" data-cardId="'+ result.data.list[i].id +'">' +
                                   '<img data-original="'+ result.data.list[i].pic +'">' +
                                   '<div><h2>'+ result.data.list[i].name +'</h2>' +
                                   '<p>'+ result.data.list[i].description +'</p></div></div>';
                           }
                           $('section.allCards').html(str);
                           //图片预加载
                           $("section.allCards img").lazyload({
                               placeholder : "", //用图片提前占位
                               effect: "fadeIn", // 载入使用何种效果
                               event: 'scroll'
                           });

                           break;
                       case 'pgroup':
                           for(var i=0;i<len;i++){
                                str += ' <li class="swiper-slide" data-groupId="'+ result.data.list[i].id +'">'+ result.data.list[i].title +'</li>';
                           }
                           $('#menu li:first-child').after(str);
                           if(len > 4){
                               var menuSwiper = new Swiper ('#menu', {
                                   loop: false,
                                   slidesPerView : 4,
                                   nextButton:'.swiper-button-next',
                               });
                           }else {
                               $('#menu li').css('width','25%');
                           }

                            //菜单点击
                           $('#menu li').click(function () {
                               $('#mine').removeClass('active');
                               if($(this).hasClass('active')){
                                   return
                               }else {
                                   $(this).addClass('active').siblings('li').removeClass('active');
                                   if(!token){
                                       return;
                                   }
                                   if($(this).attr('data-groupId')){
                                       //其他 用户人群
                                       console.log($(this).attr('data-groupId'))
                                       console.log(match($(this).attr('data-groupId')))
                                       menuClickFn(match($(this).attr('data-groupId')));
                                   }else {
                                       //全部卡种
                                       menuClickFn('allCards');
                                   }
                               }
                           });
                           break;
                   }
                }
            },
            error: function (e) {
                //todo
            }
        });
    }


    //菜单展示
    getList('pgroup');

    

    //人群id 和 人群type
    function match(groupId) {
        var type = '';
        switch (groupId){
            case '1':
                type = '';
                break
        }
        return type;
    }


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



    //滚动到一定程度时候，悬浮菜单栏  获取要定位元素距离浏览器顶部的距离
    var navH = $("nav").offset().top;
    //滚动条事件
    $(window).bind('scroll',function () {
        //获取滚动条的滑动距离
        var scroH = $(this).scrollTop();
        //滚动条的滑动距离大于等于定位元素距离浏览器顶部的距离，就固定，反之就不固定
        if(scroH >= navH){
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