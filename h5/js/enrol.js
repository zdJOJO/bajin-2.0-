
$(function(){


    // 判断 是否安卓  IOS
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;  //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);     //ios终端



    //此页面逻辑：进入页面加载活动内容，然后判断用户是否收藏该活动，如果收藏就要现实收藏的图标，否则就是没有收藏
    var data;
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
    token = getCookie("token");

    var activityid = window.location.search.split("=")[1];
    if(/&/g.test(activityid)){
        activityid = activityid.split("&")[0];
    }

    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    his = his + window.location.search;

    //跳转预览界面
    if(window.location.search.indexOf('cms') > 0 ){
        window.location.href = 'enrol_preview.html?id=' +  activityid;
    }

    //设置为1s
    $.toast.prototype.defaults.duration = 1000;

    //判断是 活动 还是  热门
    var isHotDoor = false;
    if(window.location.pathname.indexOf('hotDoorDetail') > 0){
        isHotDoor = true;
    }

    var itemId = window.location.href.split("=")[1];
    var commentStr = '';
    var pageNum = 1;

    

    // alert(his);
    $("#culb_But").click(function(){			
        window.location.href="index.html";
	})		
    var dataWrap=$('.main').eq(0);
    //进入页面就会执行的函数，也只是调用了一次

    //判断活动人数是否已经爆满
    var peopleNumber = 0;   //总允许报名人数
    var applyNumber = 0;    //已报名人数



    //分享时候 传当前页面的url 和 对象obj
    get_url(window.location.href);



    function getActDetail(){
        $.get(port+"/card/activity/"+activityid,function(data){

            // //调用分享借口
            jsSdkApi('share',{
                title: data.activityTitle,
                desc: data.activitySubtitle,
                link: window.location.href,
                imgUrl: data.activityPic
            });

            peopleNumber = data.peopleNumber;
            applyNumber = data.applyNumber;
            var actPrice = '￥'+ data.activityPrice.toFixed(2);
            if(data.activityPrice == 0){
                actPrice = '免费';
            }

            var picStr =  '';
            for(var i=0; i<data.imgList.length; i++){
                picStr += '<div class="swiper-slide"><img src="' + data.imgList[i].pic + '"/></div>' ;
            }
            $(".swiper-wrapper").append(picStr);

            if(data.imgList.length > 1){
                var mySwiper = new Swiper('.swiper-container',{
                    loop: false,
                    speed:300,
                    scrollbar:'.swiper-scrollbar',
                    scrollbarHide : false,
                    scrollbarDraggable : true ,
                    scrollbarSnapOnRelease : true ,
                });
            }

            var peopleNumberStr = ''
            if(peopleNumber ==  999999){
                peopleNumberStr = '不限人数';
            }else {
                peopleNumberStr = data.peopleNumber + '人';
            }

            var str1=$('<section class="msgBox"><div class="msg-wrap"><h1 class="msg-tit">'+data.activityTitle+'</h1><div class = "btn_q"><a href="tel:400-111-3797" class="tellNum"><img src="imgs/iconfont-kefu.png"></a>' +
                '<span class="love-btn"><img src="imgs/iconfont-love.png"></span><span class="share-btn"><img src="imgs/iconfont-p-share.png"></span></div>' +
                '<p class="msg-time"><span class="head">时间</span>'+new Date(data.startTime*1000).Formate()+' - '+ new Date(data.endTime*1000).Formate()+'</p> ' +
                '<p class="msg-address"> <span class="head">地点</span>'+data.activityAddress+'</p>' +
                '<p class="msg-price"><span class="head">价格</span>'+actPrice+'</p>' +
                '<p class="msg-num"><span class="head">人数</span>'+ peopleNumberStr + '</p>' +
                '<p class="msg-num"><span class="head">已报名</span>'+data.applyNumber+'人'+'</p></div></section>');


            var str2 = $('<section class="content"><div class="content-text">' + data.activityDetail + '</div></section>');
            $("#doEnrol").append('<span class="closeDate">'+'报名截止时间：'+ new Date(data.applyEndTime*1000).Formate() +'</span>');

            if(new Date().getTime() > data.applyEndTime*1000){
                $("#doEnrol>button").attr({
                    disabled: true ,
                    style:"background:#9c9c9c;"
                }).html('已过期');
            }


            dataWrap.append(str1).append(str2);
            $(".content-text img").css({
                'width': '100%!important',
                'height': 'auto'
            });
            $(".content-text").find('p').find('img').css({
                'width': '100%!important',
                'height': 'auto'
            });


            //判断是会否报名
            if(token){
                getEnrollStatu();
            }


            //加载评论列表
            getCommentList(1);
            $('#comment').show();


            //这里删除了活动亮点
            //这里进行是否收藏活动判断
            $.ajax({
                type:"get",
                url:port+"/card/file/getImage",
                success:function(data){
                   var str = $('<img src="'+ data.data.url+'" style="width:87%;height:auto;margin: 8% 0.06rem;"/>');
                    $("section.content").append(str);
                }
            });


            //分享部分
            var sharebtn=$('.share-btn').eq(0);
            var sharemask=$('#share-mask');
            sharemask.click(function(){
                $(this).hide();
            })
            sharebtn.click(function(){
                sharemask.show();
            });

            var url = port +"/card/collect/item?token="+token+"&itemId="+data.activityId+"&itemType=1";

            //加载成功页面后就判断是否已经被收藏过了    
			 if(token != undefined){
                $.ajax({
                    url:url,
                    success:function(data){
                        if(data.message == "该项目未被收藏"){
                            $(".btn_q .love-btn img").attr("src","imgs/iconfont-love.png");

                        }else{
                            $(".btn_q .love-btn img").attr("src","imgs/iconfont-love_save.png");
                        }
                     },
                    error:function(data){
                        window.location.href="login.html?his="+escape(his);
                    }
                });
            }            
        
            //这里需要加判断用户是否登录
            $(".btn_q .love-btn").click(function(target){              
			if(token == undefined){
                   //alert("用户未登录，请登录后再操作！！！！");
                   window.location.href="login.html?his="+escape(his);
            }else{
                var info ={
                    //"userId":data.userId,
                    "itemId": data.activityId,
                    "itemType":"1",   //1表示收藏活动，2表示收藏白金人生
                }				
				$.get(url,function(data){
                if(data.message == "该项目未被收藏"){					 
					$(".btn_q .love-btn img").attr("src","imgs/iconfont-love_save.png")
                    $.ajax({
                        type:"POST",
                        url:port+"/card/collect?token="+token+"",
                        dataType:"json",
                        contentType : "application/json;charset=UTF-8",  
                        data:JSON.stringify(info),
                        success:function(data){
                            if(typeof(data) == "string"){
                                window.location.href = "login.html?his="+escape(his);
                            }else{
							//alert("收藏成功")
                        } },                            
                        error:function(data){
                            //alert("请求出错，重新登录")
                            window.location.href = "login.html?his="+escape(his);
                        }
                    });
                }else{
					$(".btn_q .love-btn img").attr("src","imgs/iconfont-love.png")                        
                        //http://121.196.232.233:9292/card/collect/{collectId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
                        //这里删除的话，需要先请求查询是否存在,然后拿到data.data.collectId进行删除操作
                        $.ajax({
                            type:"get",
                            url:url,
                            success:function(data){
                            //alert("删除查询成功");
                            $.ajax({
                                type:"DELETE",
                                url:port+"/card/collect/"+data.data.collectId+"?token="+token+"",
                                dataType:"json",
                                contentType : "application/json;charset=UTF-8",  
                                success:function(data){
                                    //alert("删除操作成功");
                                if(typeof(data) == "string"){
                                    window.location.href = "login.html?his="+escape(his);
                                }else{
                                    //todo
                                } },
                                error:function(data){
                                    //alert("请求出错，重新登录")
                                    window.location.href = "login.html?his="+escape(his);
                                }
                                }); 
                                },
                                error:function(data){
                                    //alert("请求出错，重新登录")
                                    window.location.href = "login.html?his="+escape(his);
                        }
                    });
                }
            });			
		}//登录判断结束为止
     })
        });
    }


    getActDetail();



    //获取报名状态
    var getEnrollStatu = function () {
        $.get(port + '/card/apply/status/' + activityid + '?token=' + token,function (result) {
            function statuStr (num) {
                var statuStr = '';
                switch (num) {
                    case 1:
                        statuStr = '已报名';
                        break;
                    case 2:
                        statuStr = '活动结束';
                        break;
                    case 3:
                        statuStr = '报名截止';
                        break;
                    case 4:
                        statuStr = '人数已满';
                        break;
                    case 5:
                        statuStr = '报名';
                        break;
                }
                return statuStr;
            }

            if(JSON.parse(result).code == '666'){
                $('#doEnrol >button').html('报名');
            }else {
                if((JSON.parse(result)).data != 5){
                    $("#doEnrol>button").attr({
                        disabled: true ,
                        style:"background:#9c9c9c;"
                    });
                }
                $('#doEnrol >button').html( statuStr( (JSON.parse(result)).data ) );
            }
        })
    };







    //获取评论列表
    var isPublishCtm = false;
    function getCommentList(page) {
        $('#loading').show();
        $('#loading span').show();
        $('#moreComts').hide();

        if(isPublishCtm){
            $("#comment>.commentList").html('');
        }
        commentStr = '' ;
        $.get( port + '/card/comment/list?currentPage=' + page + '&type=1&itemId=' + itemId,function (data) {
            $("#comment>h3.cmtNUm").html('评论' + '<span>'+ data.rowCount + ' 条</span>');
            if(data.list.length !=0){
                var headPicStr = '';
                var nameStr = '';
                for(var i=0 ;i<data.list.length;i++){
                    if(data.list[i].user){
                        headPicStr = data.list[i].user.headPic || portStr + '/imgs/headPic_default.png' ;
                        nameStr = data.list[i].user.userName || '';
                    }else {
                        headPicStr = portStr + '/imgs/headPic_default.png';
                        nameStr = '';
                    }
                    commentStr += '<li class="singleCmt">' +
                        '<img src="'+ headPicStr +'">' + '<span class="userName">' + nameStr + '</span>' +
                        '<p>'+ data.list[i].commentContent +'</p>' + '<span class="creatTime">'+ timeAgo((new Date().getTime()/1000)-data.list[i].createTime) +'</span></li>';
                }
                $("#comment>.commentList").append(commentStr);
                $('#loading').hide();
                $('#moreComts').show();
            }else {
                setTimeout('$("#loading").hide()',1000);
            }
        });
    }


    //点击查看更多评论
    $('#moreComts').click(function () {
        isPublishCtm = false;
        if(pageNum >= 1){
            pageNum++;
        }
        getCommentList(pageNum);
    });



    //发表评论
    $("#publishCmt").click(function () {
        if(!token){
            $.modal({
                title: "评论失败",
                text: "登录之后才能评论",
                buttons: [
                    {text: "点击登录", onClick: function(){
                        window.location.href = "login.html?his=" + escape(his);
                    }},
                    { text: "取消", className: "default", onClick: function(){
                        return;
                    }},
                ]
            });
        }else {
            if(!$("#commentContent").val()){
                $.alert("请填写后再评论", "评论失败", function() {
                });
                return;
            }

            if($("#commentContent").val().length > 140){
                $.alert("评论内容过长，请重新填写", "评论失败", function() {
                });
                return;
            }else {
                $.ajax({
                    type: 'post',
                    dataType: "json",
                    contentType : "application/json",
                    url: port + '/card/comment?token=' + token ,
                    data: JSON.stringify({
                        itemType: 1,
                        itemId: itemId,
                        commentContent: $("#commentContent").val()
                    }),
                    success: function (result) {
                        if(result.code == 201){
                            $.toast("发表评论成功", function() {
                                $("#commentContent").val('');
                                isPublishCtm = true;
                                getCommentList(1);
                            });
                        }
                        if(result.code == 666){
                            $.modal({
                                title: "评论失败",
                                text: "当前用户错误，请重新登录",
                                buttons: [
                                    {text: "点击登录", onClick: function(){
                                        window.location.href = "login.html?his=" + escape(his);
                                    }},
                                    { text: "取消", className: "default", onClick: function(){return;} },
                                ]
                            });
                        }
                    },
                    error: function () {
                        $.toast("发表评论失败", "cancel");
                    }
                });
            }
        }
    });




    // 评论时候 IOS 安卓 不同, 在这里做判断
    $("#commentContent").focus(function () {
        if(isAndroid > -1 ){
            $('#comment').css('margin-bottom','5%');
            $('footer.nav').hide();
        }
    }).blur(function () {
        $('#comment').css('margin-bottom','10%')
        $("#publishCmt").css('color','#ccc');
        $('footer.nav').show();
    });

    if(isAndroid > -1 ){
        $('footer.nav').css('height','8%');
    }

    
    
    function doEnrol(){
        if(token != undefined){
            if(applyNumber >= peopleNumber ){
                $.alert("活动申请人数已满", "报名失败");
            }else {
                window.location.href = "doenrol.html?id=" + activityid;
            };
        }else{
            window.location.href = "login.html?his="+escape(his);
        }

    }

    var enrolBtn = $('#doEnrol>button');
    enrolBtn.click(function(){
        doEnrol();
    });



// time ago
    var timeAgo = function (preTime) {
        if(preTime<60){
            return parseInt(preTime)+"秒前";
        }else if((preTime/60)<60){
            return parseInt(preTime/60)+"分钟前";
        }else if((preTime/3600)<24){
            return parseInt(preTime/3600)+"小时前";
        }else if((preTime/3600/24)<30){
            return parseInt(preTime/3600/24)+"天前";
        }else if((preTime/3600/24/30)<12){
            return parseInt(preTime/3600/24/30)+"月前";
        }else{
            return parseInt(preTime/3600/24/365)+"年前";
        }
    };


    Date.prototype.Formate=function(){
        var y=this.getFullYear();
        var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
        var d=this.getDate()>9?this.getDate():'0'+this.getDate();
        var h=this.getHours()>9?this.getHours():'0'+this.getHours();
        var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
        var s=this.getSeconds()>9?this.getSeconds():'0'+this.getSeconds();
        if(h == '00'&& f == '00'){
            return (y+'.'+m+'.'+d);
        }else {
            return (y+'.'+m+'.'+d+' '+h+':'+f);
        }
    }





    $("body").prepend($('<div id ="urlToDownload" style="width:1rem;height:0.12rem;position: fixed;z-index: 2000;"><img style="width:0.8rem;height:0.12rem;" src="imgs/bg-baoming.png"/><div style="background-color:#fafafa; float:right;text-align:center;width:0.2rem;height:0.12rem;line-height:0.12rem;"><p style="width:0.08rem;margin-top: 0.02rem;height:0.08rem;line-height:0.08rem;margin-left:0.06rem;background-color:#ccc;border-radius:0.08rem;font-size:0.06rem;">×</p></div></div>'));
    $("#urlToDownload>img").bind("click",function(){
        window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.kting.baijinka";
    });

    $("#urlToDownload>div").bind("click",function(){
        $("#urlToDownload").css("display","none");
    });

    $(".mian img").css("width","100%")

});




