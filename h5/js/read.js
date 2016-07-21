

$(function(){

    var token = "";
    var page = 1;
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
    var his = window.location.pathname.split("/");
    his = his[his.length-1];



    $(".indexPage").click(function(){
        window.location.href = "index.html";
    });
    $(".clubPage").click(function(){
        window.location.href = "culb.html?joinAct";
    });
    $(".pierrePage").click(function(){
        window.location.href = "pierre.html?good";
    });



    var pageNum = 0;
    var str = '';



    // tab 切换页面
    $(".tab > div").click(function () {
        pageNum = 0;
        str = '';
        if($(this).hasClass('active')){
            return;
        }
        if($(this).hasClass('hot')){
            window.location.href = 'read.html?hot';
        }else if($(this).hasClass('life')){
            window.location.href = 'read.html?life';
        }else {
            window.location.href = 'read.html';
        }
    });




    //发送请求，请求嵌入页面的url
    function toActivity(classStr,id){
        window.location.href = classStr.indexOf('life')>=0 ? "life.html?id=" + id : "consultation.html?id=" + id;
    }





    //选项卡，切换到阅读页面
    var goToRead = function () {
        if(!token){
            $('.readList').show().siblings('#hot','#vip','.readIframe').hide();
        }else {
            $(".tab >.read").addClass('active').siblings().removeClass('active');
            $('.readIframe').show().siblings('#hot','.readList','#vip').hide();

            $.ajax({
                url:port+"/card/user/read?token="+token,
                success:function(data){
                    if(typeof(data) == "string"){
                        window.location.href = "login.html?his="+his;
                    }else{
                        $("iframe").attr("src",data.readUrl);
                        if(!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)){
                            $("iframe").attr("scrolling","no");
                        }else{
                            $("iframe").attr("scrolling","auto");
                        }

                        // alert(navigator.userAgent);
                        var u = navigator.userAgent, app = navigator.appVersion;
                        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //android终端或者uc浏览器
                        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
                        // alert('是否是Android：'+isAndroid);
                        // alert('是否是iOS：'+isiOS);
                        $(".readIframe").css("display","block");
                        var w = $(window).width();
                        var h = $(window).height();
                        $(".readIframe").css("width",w);
                        $("iframe").css("width",w);
                    }
                },
                error:function(data){
                    window.location.href = "login.html?his="+his;
                }
            });
        }
    };



    //获取列表   默认每页返回10个
    function getData(page,classStr){

        var url = classStr.indexOf('life')>=0 ? port+"/card/life?currentPage=" + page : port+"/card/consult?currentPage="+page+"&token="+token+"&type=7";

        $.get(url,function(data){
            if(data.list.length != 0){
                for(var i=0;i<data.list.length;i++){
                    if(classStr.indexOf('life')>=0){
                        str += '<div data-id='+data.list[i].lifeId+' class="vip-item"><div class="img-item"><img class="img" src="'+data.list[i].lifePic+'" /></div>' +
                            '<div class="info-item"><p class="vip-name">'+data.list[i].lifePersonName+'</p>' +
                            '<p class="vip-info">'+data.list[i].lifeAbstract+'</p></div></div>';
                    }else {
                        str += '<div class="singleHot" data-id="'+data.list[i].id+'" style="background: url('+data.list[i].maxPic+') no-repeat 50%;background-size: 1rem 0.5rem">' +
                            '<h4 class="title">'+data.list[i].title+'</h4>' +
                            '<span class="creatTime">'+ new Date(data.list[i].createTime*1000).Formate()+'</span>' +
                            '<span class="lookNum">'+data.list[i].viewNum+' 已阅</span></div>';
                    }
                }
                if(classStr.indexOf('life')>=0){
                    $('#vip>.vipList').append(str);
                    // 每次数据加载完，必须重置
                    str = '';
                    dropload_life.resetload();
                }else {
                    $('#hot>.hotList').append(str);
                    // 每次数据加载完，必须重置
                    str = '';
                    dropload_hot.resetload();
                }

                $('.vip-item ,.singleHot').click(function(){
                    toActivity(classStr,$(this).attr('data-id'));
                });

            }else {
                if(classStr.indexOf('life')>=0){
                    // 锁定
                    dropload_life.lock();
                    // 无数据
                    dropload_life.noData();
                }else {
                    // 锁定
                    dropload_hot.lock();
                    // 无数据
                    dropload_hot.noData();
                }
                setTimeout('$(".dropload-down").css("height","0")',1000);
            }
        });
    }




    //根据url 判断 哪一个页面
    if(window.location.href.indexOf('hot') > 0){
        $(".tab >.hot").addClass('active').siblings().removeClass('active');
        $('#hot').show().siblings('#vip','.readList','.readIframe').hide();

        var dropload_hot = $('#hot').dropload({
            scrollArea : window,
            domDown : {
                domClass   : 'dropload-down',
                domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
                domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData  : '<div class="dropload-noData">已无数据</div>'
            },
            loadDownFn : function(me){
                pageNum++;
                getData(pageNum,'hot');
            }
        })
    }else if(window.location.href.indexOf('life') > 0){
        $(".tab >.life").addClass('active').siblings().removeClass('active');
        $('#vip').show().siblings('#hot','.readList','.readIframe').hide();

        var dropload_life = $('#vip').dropload({
            scrollArea : window,
            domDown : {
                domClass   : 'dropload-down',
                domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
                domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
                domNoData  : '<div class="dropload-noData">已无数据</div>'
            },
            loadDownFn : function(me){
                pageNum++;
                getData(pageNum,'life');
            }
        })
    }else {
        goToRead();
    }




    $("#loginToRead").click(function () {
        window.location.href = "login.html?his="+his;
    });


});