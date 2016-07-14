

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
    $(".readIframe").css("display","none");
    var dataWrap=$('.vipList').eq(0);
    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    $(".indexPage").click(function(){
        window.location.href = "index.html";
    });
    $(".clubPage").click(function(){
        window.location.href = "culb.html";
    });
    $(".pierrePage").click(function(){
        window.location.href = "pierre.html";
    });
    //发送请求，请求嵌入页面的url       
    function toActivity(id){
        window.location.href="life.html?id="+id;
    }
    function getData(page){
        $.get(port+"/card/life?currentPage="+page,function(data){
            console.log(data);
            for(var i=0;i<data.list.length;i++){
                var str=$('<div data-id='+data.list[i].lifeId+' class="vip-item"><div class="img-item"><img class="img" src="'+data.list[i].lifePic+'" /></div><div class="info-item"><p class="vip-name">'+data.list[i].lifePersonName+'</p><p class="vip-info">'+data.list[i].lifeAbstract+'</p></div></div>');
                dataWrap.append(str);
            }
            $('.vip-item').click(function(){
                toActivity($(this).attr('data-id'));
            });
        });
    }
    getData(1);
        //这里定义下拉加载
        //定义触发的事件
        var touchEvents = {
            touchstart: "touchstart",
            touchmove: "touchmove",
            touchend: "touchend",
            /**
             * @desc:判断是否pc设备，若是pc，需要更改touch事件为鼠标事件，否则默认触摸事件
             */
            initTouchEvents: function () {
                if (isPC()){
                    this.touchstart = "mousedown";
                    this.touchmove = "mousemove";
                    this.touchend = "mouseup";
                }
            }
        };
        $(document).bind(touchEvents.touchend, function (event) {
            //event.preventDefault();   
            //这里触发事件
            //判断加载的条件
            console.log("屏幕的高度：");
            //alert($(document).height());
            console.log("滚动的的高度：");
            //alert($(window).height() + $(window).scrollTop());
            if($(document).height() >= $(window).height() + $(window).scrollTop()){
                page++;
                getData(page);
            }            
        });//下拉加载函数
    //选项卡，切换到阅读页面
	$(".read").click(function(){
    if(token != undefined ) {
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
                    $(".vipList").css("display","none");
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
        }else{
            $(".vipList").css("display","none");
            $(".readList").show();

        }
        $(".life.active").css("border-bottom","none").css("color","#9c9c9c");
        $(".read").css("border-bottom","1px solid  #666").css("color","#323232");
    });



    $(".life").css("border-bottom","1px solid  #666").css("color","#323232");
    $(".read").css("border-bottom","none").css("color","#9c9c9c");
    //切换到白金人生的部分
    $(".life").click(function(){
        $(".readList").hide();
        $(".readIframe").css("display","none");
        $(".vipList").css("display","block");
        $(".life").css("border-bottom","1px solid  #666").css("color","#323232");
        $(".read").css("border-bottom","none").css("color","#9c9c9c");
    });

    $("#loginToRead").click(function () {
        window.location.href = "login.html?his="+his;
    }); 
});