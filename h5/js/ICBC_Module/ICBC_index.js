/**
 * Created by Administrator on 2016/8/29.
 */
$(function(){
    var  searchStr = window.location.search;
    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var token = '';
    var kabin = ''; //前六位
    var cardNum = ''; //尾号
    var loadingPaht = portStr + '/imgs/gift/loading.gif';

    if(window.location.href.indexOf('token') > 0 ){
        token = searchStr.split('=')[1];
        //设置cookie
        setCookie("token",token,365);
    }else {
        token = getCookie("token");
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
                str += '<div class="swiper-slide" data-url="'+ result.data.list[i].url +'">' +
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
        $('#menu').find('li').removeClass('active');
        if($(this).hasClass('active')){
            return
        }else{
            $(this).addClass('active');
            menuClickFn('');
        }
        $('#loading').hide();
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
                            groupStr_copy += ' <li class="swiper-slide" data-groupId="'+ result.data.list[i].id +'">'+ result.data.list[i].title +'</li>';
                        }
                        var groupStr = ' <li class="swiper-slide" data-groupid="-1" data-type="allCards">全部卡种</li>' + groupStr_copy;
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
                            if($(this).hasClass('active')){
                                return
                            }else {
                                $(this).addClass('active').siblings('li').removeClass('active');
                                if(!token){
                                    return;
                                }
                                $('section.allCards').html('');
                                menuClickFn(match($(this).attr('data-groupId')),$(this).attr('data-groupId'));
                            }
                        });
                    }else {  //卡
                        var str = '';
                        var cardList = result.data.list || result.data;
                        for (var i=0;i<len;i++){
                            str += '<div class="singleCard" data-cardId="'+ cardList[i].id +'" data-kabin="'+ cardList[i].kabin +'">' +
                                '<img src="'+ cardList[i].pic +'">' +
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
                            window.location.href = 'ICBC_cardDetail.html?cardId=' + $(this).attr('data-cardid');
                        });

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


    //我的信用卡详情
    function  myCardDeatil(kabin) {
        $.get( port + '/card/cardtype/kinds?kabin=' + kabin ,function (result) {
            if( result.data == '未匹配到卡信息'){
                $('#cardDetail').html('<p style="text-align: center;margin: 100px 0 0 0;">'+ result.data +'</p>');
            }else {
                var cardTypeLen = result.data.cardMapModelList.length;
                var $propertyUl = $('#cardDetail').children('.ctg').find('ul');
                var $detailUl = $('#cardDetail').children('.content').find('.ul');
                $propertyUl.before('<img src="'+result.data.pic+'"><h3>'+ result.data.name +'</h3>');
                for(var i=0;i<cardTypeLen;i++){
                    $detailUl.append('<div class="li">' +
                        '<span id="property'+ result.data.cardMapModelList[i].cardPropertyId +'"></span>' +
                        '<div class="p">'+ result.data.cardMapModelList[i].description +'</div></div>');

                    $.get( port + '/card/property/' + result.data.cardMapModelList[i].cardPropertyId ,function (result_property) {
                        $propertyUl.append('<li><a href="#property'+ result_property.data.id +'">'+ result_property.data.title +'</a></li>');
                        $('#property' + result_property.data.id).html('| ' + result_property.data.title);

                        //点击属性 平滑滚动
                        scrollSmoothSlib('cardDetail');
                    });
                }
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