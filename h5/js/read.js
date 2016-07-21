

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
        window.location.href = "culb.html?joinAct";
    });
    $(".pierrePage").click(function(){
        window.location.href = "pierre.html";
    });


    //发送请求，请求嵌入页面的url       
    function toActivity(classStr,id){
        window.location.href = classStr.indexOf('life')>=0 ? "life.html?id=" + id : "consultation.html?id=" + id;
    }



    function getData(page,classStr){

        $(".hotList,.vipList").html('');

        var url = classStr.indexOf('life')>=0 ? port+"/card/life?currentPage="+page : port+"/card/consult?currentPage=1&token="+token+"&type=7";
        var str = '';

        $.get(url,function(data){
            for(var i=0;i<data.list.length;i++){
               if(classStr.indexOf('life')>=0){
                   str = $('<div data-id='+data.list[i].lifeId+' class="vip-item"><div class="img-item"><img class="img" src="'+data.list[i].lifePic+'" /></div><div class="info-item"><p class="vip-name">'+data.list[i].lifePersonName+'</p><p class="vip-info">'+data.list[i].lifeAbstract+'</p></div></div>');

                   dataWrap.append(str);

                   $(".vipList").show().siblings(".hotList,.readList").hide();
                   $(".readIframe").hide();

               }else {
                    str = $('<div class="singleHot" data-id="'+data.list[i].id+'" style="background: url('+data.list[i].maxPic+') no-repeat 50%;background-size: 1rem 0.5rem">' +
                       '<h4 class="title">'+data.list[i].title+'</h4>' +
                       '<span class="creatTime">'+ new Date(data.list[i].createTime*1000).Formate()+'</span>' +
                       '<span class="lookNum">'+data.list[i].viewNum+' 已阅</span></div>');

                   $('.hotList').append(str);

                   $(".hotList").show().siblings(".vipList,.readList").hide();
                   $(".readIframe").hide();
               }
            }
            $('.vip-item').click(function(){
                toActivity(classStr,$(this).attr('data-id'));
            });

            $('.singleHot').click(function(){
                toActivity(classStr,$(this).attr('data-id'));
            });
        });
    }



    //选项卡，切换到阅读页面
	$(".read").click(function(){
        if(token != undefined ) {
            $(".vipList,.hotList").hide();
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
                $(".hotList").css("display","none");
                $(".vipList").css("display","none");
                $(".readList").show();
            }
    });




    var tabJo =  $(".tab > div");
    tabJo.click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        if($(this).hasClass('hot') || $(this).hasClass('life')){
            var classStr = $(this).attr('class');
            getData(1,classStr);
        }
    });

    getData(1,'hot');





    //切换到白金人生的部分   人物
    $(".life").click(function(){
        $(".readList").hide();
        $(".readIframe").css("display","none");
        $(".vipList").css("display","block");
    });

    $("#loginToRead").click(function () {
        window.location.href = "login.html?his="+his;
    });


});