/**
 * Created by Administrator on 2016/8/29.
 */
$(function(){
    var searchStr = window.location.search;
    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var token = '';
    var kabin = ''; //前六位
    var cardNum = ''; //尾号
    var loadingPaht = portStr + '/imgs/gift/loading.gif';
    var uniqueCardNum = '';  //当只有一张银行卡时候，直接跳结果，不出现银行卡列表
    var pgId = window.location.href.split('#')[1];   //从卡详情也跳回来时候判断显示

    if(window.location.href.indexOf('token') > 0 ){
        token = searchStr.split('=')[1];
        //设置cookie
        setCookie("token",token,365);
    }else {
        token = getCookie("token") || 0;
    }
    if(searchStr.indexOf('cardnum') > 0){
        cardNum = searchStr.split('&')[0].split('=')[1];
        kabin=  searchStr.split('&')[1].split('=')[1];
    }

    //二级广告
    // isAudit 表示是否审核  0 为审核  1已审核  (默认获取已审核) isDelete 表示是否删除的数据 0正常  1删除 (默认获取未删除的数据)
    $.ajax({
        type:"get",
        url: port+"/card/sub/banner?currentPage=1&isDelete=0&isAudit=1",
        success:function(result){
            var str = '' , url='';
            for(var i=0;i<result.data.list.length;i++){
                str += '<div class="swiper-slide" data-id="'+ result.data.list[i].id +'" data-url="'+ result.data.list[i].url +'">' +
                    '<img src="'+ result.data.list[i].pic +'"></div>';
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
                hitsOnFn(token,19,1,$(this).attr('data-id'));
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
            var len = result.list.length;
            var buttonStr = '';
            for(var i=0;i<len;i++){
                buttonStr += '<li class="icbcBtn" data-pickid="'+result.list[i].pickId+'" data-buttonId="'+result.list[i].buttonId+'">' +
                    '<img data-original="'+result.list[i].buttonPic+'"><span>'+ result.list[i].buttonTitle +'</span></li>'
            }
            $('#service').find('.serviceList').html(buttonStr);
            //图片预加载
            $("#service").find('img').lazyload({
                placeholder : "./imgs/gift/pic-loading.gif", //用图片提前占位
                effect: "fadeIn", // 载入使用何种效果
            });

            //工行 各个按钮
            $("#service").find('li.icbcBtn').click(function(){
                hitsOnFn(token,20,1,$(this).attr('data-buttonId'));
                if(token){
                    if($(this).attr("data-pickid")=="998"){
                        window.location.href = 'tel://' + '400-009-5588';
                        return;
                    }else if( $(this).attr("data-pickid")=="999"){
                        getMessage();
                        return;
                    }else if($(this).attr("data-pickid")=="888"){
                        window.location.href = "icbcServe.html";   //跳转工行服务按钮
                    }else {
                        //只有1张信用卡的时候
                        if(uniqueCardNum){
                            submiyInfoToIcbc($(this).data("pickid"),uniqueCardNum)
                        }else {
                            window.location.href = "bank.html?pickid=" + $(this).data("pickid") + '&token=' + token;
                        }
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
        var changeCardJO = $('#content').find('.change');
        //判断是否绑定了银行卡
        $.get( port + '/card/card?token=' + token,function (result) {
            //判断是否有卡
            if(result.list.length == 0){
                $('#content').find('.tip').show();
                changeCardJO.css('color','#929292');
                $('#content').find('.title').html('您还未绑定工行信用卡');
                $('#content').find('p').html('绑定工行信用卡，享受精致的尊享服务，'+'<br>'+'了解详细的信用卡权益。');

                //绑定信用卡
                $('#content').find('button').html('绑定信用卡').click(function () {
                    // window.location.href = "bank.html?pickid=''&token=" + token;
                    window.location.href = "bindCardIFrame.html?pickid=''&token=" + token + '&android=true';
                });
            }else {
                if(result.rowCount == 1){
                    uniqueCardNum = result.list[0].cardNumber;
                }

                $('#cardDetail').show();
                $('#content').find('.tip').hide();
                if(cardNum){
                    $('#content').find('.cardNum').html('尾号' + cardNum);
                    myCardDeatil(kabin);
                }else {
                    $('#content').find('.cardNum').html('尾号' + result.list[0].cardNumber);
                    myCardDeatil(result.list[0].kabin);
                }

                //更换银行卡
                changeCardJO.click(function () {
                    window.location.href = "bank.html?changeCard";
                });
            }
        });
    }else {
        $('#content').find('header').hide();
        $('#content').find('.tip').show();
        $('#content').find('.title').html('您还未登录');
        $('#content').find('p').html('登录白金尊享，'+'<br>'+'查看所有工行信用卡服务和权益。');
        $('#content').find('button').html('登录').click(function () {
            window.location.href = "login.html?his="+his;
        });
    }


    //菜单栏按钮点击
    function menuClickFn(type,groupId) {
        $('#loading').show();
        if(!type){
            $('section.index').show().siblings('section').hide();
        }else {
            $('section.allCards').show().siblings('section').hide();
        }
        if(type == 'allCards'){
            $('section.allCardsl').html('');
            getList('cardtype',{pageNum: 1});
            $('section.allCards').preventScroll();//滚动条冒泡阻止
        }else if(type == 'groupCards'){
            getList('groupCards',{groupId: groupId});
            $('section.allCards').preventScroll();//滚动条冒泡阻止
        }else {
            // 点击‘我的’
        }
    };

    //菜单栏 (我的)  点击
    $('#mine').click(function () {
        $('#menu').find('a').removeClass('active');
        if($(this).hasClass('active')){
            return
        }else{
            $(this).addClass('active');
            menuClickFn('');
        }
        $('#loading').hide();
    });


    //监听url的hash
    $(window).hashchange(function () {
        pgId = location.hash.substring(1);
        if(pgId == 'first' || !pgId){
            $('#mine').click();
        }else {
            $('#'+pgId).click();
        }
    });


    //  卡种 、人群  列表获取
    // typeStr: cardtype || pgroup
    function getList(typeStr,_obj) {
        var url = (typeStr=='groupCards') ? port + '/card/pgroup/cardtypes/'+_obj.groupId : port + '/card/' + typeStr + '?currentPage=1';
        if(typeStr!='pgroup' && _obj.pageNum){
            url = port + '/card/' + typeStr + '?currentPage=' + _obj.pageNum;
        }
        $.ajax({
            type: 'get',
            url: url,
            success: function (result) {
                $('#loading').hide();
                if(typeStr == 'groupCards' && result.data.length == 0){
                    $('section.allCards').html('<div class="singleCard"><p style="text-align: center">无此类信用卡卡种</p></div>');
                    return;
                }
                var len = result.data.list ? result.data.list.length : result.data.length;
                if(result.code == '211' && len > 0){
                    if(typeStr=='pgroup'){   //人群
                        var groupStr_copy = '';
                        for(var i=0;i<len;i++){
                            //groupStr_copy += ' <li class="swiper-slide" data-groupId="'+ result.data.list[i].id +'">'+ result.data.list[i].title +'</li>';
                            groupStr_copy += ' <li class="swiper-slide" data-groupId="'+ result.data.list[i].id +'" id="pg'+ result.data.list[i].id +'">' +
                                '<a href="#pg'+ result.data.list[i].id +'">'+ result.data.list[i].title +'</a></li>';

                        }
                        var groupStr = groupStr_copy;

                        $('#menu').children('.swiper-wrapper').append(groupStr);
                        if(len >= 4){
                            var menuSwiper = new Swiper ('#menu', {
                                loop: false,
                                slidesPerView : 4,
                                nextButton:'.swiper-button-next',
                            });
                        }else {
                            $('#menu').children('.swiper-button-next').hide();
                            $('#menu li').css('width','25%');
                        }
                        //菜单点击
                        $('#menu li').click(function () {
                            $('#mine').removeClass('active');
                            if($(this).children('a').hasClass('active')){
                                return
                            }else {
                                $(this).children('a').addClass('active');
                                $(this).siblings('li').children('a').removeClass('active');
                                $('section.allCards').html('');
                                menuClickFn(match($(this).attr('data-groupId')),$(this).attr('data-groupId'));
                            }
                        });
                        if(pgId){
                            $('#'+pgId).click();
                        }
                    }else {  //卡
                        var str = '';
                        var cardList = result.data;
                        for (var i=0;i<len;i++){
                            str += '<div class="singleCard" data-cardId="'+ cardList[i].id +'" data-kabin="'+ cardList[i].kabin +'">' +
                                '<div class="cardBox"><img src="'+ cardList[i].pic +'"></div>' +
                                '<div><h2>'+ cardList[i].name +'</h2>' +
                                '<p>'+ cardList[i].description +'</p></div></div>';
                        }
                        if(!_obj.pageNum){
                            $('section.allCards').html(str);
                        }else {
                           if(_obj.pageNum > 1){
                               $('#moreCard').remove();
                           }
                            $('section.allCards').append(str+'<div id="moreCard">点击加载更多</div>');
                            if(len < 10){
                                $('#moreCard').hide();
                            }
                            $('#moreCard').bind('click',function () {
                                $(this).html('<img src="'+ loadingPaht +'">')
                                setTimeout(function () {
                                    _obj.pageNum++;
                                    getList('cardtype',{pageNum: _obj.pageNum});
                                },300);
                            });
                        }
                        //图片预加载
                        $("section.allCards img").lazyload({
                            placeholder : "", //用图片提前占位
                            threshold: 500,
                            effect: "fadeIn", // 载入使用何种效果
                            event: 'scroll',
                        });

                        $(".singleCard").click(function () {
                            hitsOnFn(token,22,1,$(this).attr('data-cardid'));
                            window.location.href = 'ICBC_cardDetail.html?cardId=' + $(this).attr('data-cardid');
                        });

                    }
                }else {
                    //菜单点击
                    $('#menu li').click(function () {
                        $('#mine').removeClass('active');
                        if($(this).hasClass('active')){
                            return
                        }else {
                            $(this).addClass('active').siblings('li').removeClass('active');
                            $('section.allCards').html('');
                            menuClickFn(match($(this).attr('data-groupId')),$(this).attr('data-groupId'));
                        }
                    });
                }
            },
            error: function (e) {
                //todo
            }
        });
    }



    //菜单展示
    getList('pgroup');


    //我的信用卡详情
    function  myCardDeatil(kabin) {
        $.get( port + '/card/cardtype/kinds?kabin=' + kabin ,function (result) {
            var cardList = result.data;
            if( result.data == '未匹配到卡信息' || result.data.length == 0){
                $('#cardDetail').html('<p class="none">未匹配到卡信息</p>');
            }else {
                var len = result.data.length;
                var cardStr = '';
                for(var i=0;i<len;i++){
                    cardStr += '<div class="singleCard" data-cardId="'+ cardList[i].id +'" data-kabin="'+ cardList[i].kabin +'">' +
                        '<div class="cardBox"><img src="'+ cardList[i].pic +'"></div>' +
                        '<div><h2>'+ cardList[i].name +'</h2>' +
                        '<p>'+ cardList[i].description +'</p></div></div>';
                }
                $('#cardDetail').html(cardStr);
                $(".singleCard").click(function () {
                    window.location.href = 'ICBC_cardDetail.html?cardId=' + $(this).attr('data-cardid');
                });

            }
        });
    }


    //人群id 和 人群type
    function match(groupId) {
        var type = '';
        if(groupId == -1){
            //全部卡种
            type = 'allCards';
        }else {
            //按照人群查找卡种
            type = 'groupCards';
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

    //只存在一张卡的时候， 点击银行服务按钮提交表单
    function submiyInfoToIcbc(pickid,cardItem) {
        $.ajax({
            type:"GET",
            dataType:"text",
            url:port+"/card/bank/encryption/"+pickid+"/"+cardItem+"?token="+token,
            success:function(data){
                if(data.length<50){
                    window.location.href = "login.html?his="+his;
                }else{
                    $("#merSignMsg").val(data);
                    $("#info").submit();
                }
            },
        });
    }



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
            $('nav > div:last-child').css({'width':'70%'});
        }else if(scroH<navH){
            $('nav').removeClass('fixed');

            $('nav>div:first-child').css({'width':'18%'});
            $('nav > div:first-child img').css({'left':'18%'});
            $('nav > div:last-child').css({'width':'70%'});
        }
    });

});