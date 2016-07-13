
$(function(){
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


    // alert(his);
    $("#culb_But").click(function(){			
        window.location.href="index.html";
	})		
    var dataWrap=$('.main').eq(0);
    //进入页面就会执行的函数，也只是调用了一次

    //判断活动人数是否已经爆满
    var peopleNumber = 0;   //总允许报名人数
    var applyNumber = 0;    //已报名人数


    function getActDetail(){
        $.get(port+"/card/activity/"+activityid,function(data){
            $("title").html(data.activityTitle);
            peopleNumber = data.peopleNumber;
            applyNumber = data.applyNumber;
            // var str_='';
            // for(var i = 1,len = data.imgList.length-1;i<=len;i++){
            //     str_ = str_ + '<img src='+data.imgList[i].pic+'>';
            // }
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
                    autoplay: 3000,
                    speed:300,
                    scrollbar:'.swiper-scrollbar',
                    scrollbarHide : false,
                    scrollbarDraggable : true ,
                    scrollbarSnapOnRelease : true ,
                });
            }

            var peopleNumberStr = ''
            if(peopleNumber ==  999999){
                peopleNumberStr = '不限';
            }else {
                peopleNumberStr = data.peopleNumber + '人';
            }

            var str1=$('<section class="msgBox"><div class="msg-wrap"><h1 class="msg-tit">'+data.activityTitle+'</h1><div class = "btn_q"><a href="tel:400-111-3797" class="tellNum"><img src="imgs/iconfont-kefu.png"></a>' +
                '<span class="love-btn"><img src="imgs/iconfont-love.png"></span><span class="share-btn"><img src="imgs/iconfont-p-share.png"></span></div><p class="msg-time"><img src="imgs/iconfont-shijian.png" /> '+new Date(data.startTime*1000).Formate()+'-'+new Date(data.endTime*1000).Formate()+'</p> ' +
                '<p class="msg-address"><img src="imgs/iconfont-location.png" /> '+data.activityAddress+'</p>' +
                '<p class="msg-price"><span class="head">价格</span>'+actPrice+'</p>' +
                '<p class="msg-num"><span class="head">人数</span>'+ peopleNumberStr + '</p>' +
                '<p class="msg-num"><span class="head">已报名</span>'+data.applyNumber+'人'+'</p></div></section>');


            var str2 = $('<section class="content"><div class="content-text">'+data.activityDetail+'</div></section>');
            $("#doEnrol").append('<span class="closeDate">'+'报名截止时间：'+ new Date(data.endTime*1000).Formate() +'</span>');

            if(new Date().getTime() > data.endTime*1000){
                $("#doEnrol>button").attr({
                    disabled: true ,
                    style:"background:#9c9c9c;"
                }).html('已过期');
            }
            //
            // for(var i in picList){
            //     var str = $('<div class="swiper-slide"><img src="'+picList[i]+'"/></div>');
            //     $(".swiper-wrapper   ").append(str);
            // }



            dataWrap.append(str1).append(str2);



            //这里删除了活动亮点
            //这里进行是否收藏活动判断
            $.ajax({
                type:"get",
                url:port+"/card/file/getImage",
                success:function(data){
                    var str = $('<img src="'+data.data.url+'" style="width:0.88rem;height:auto;margin:0.08rem 0.06rem;"/>');
                    $("section.content").append(str);
                }
            });
            
            // //客服电话
            // var tellNumJo =  $('.tellNum');
            // tellNumJo.click(function () {
            //     $(this).show();
            //     $(".main").append('<div class="phoneNumBox"><span>客服电话: 4001113797</span><span class="close">X</span></div>');
            //
            //     $(".main >.phoneNumBox>.close").click(function () {
            //         $(".phoneNumBox").hide();
            //     });
            // });
            
            
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
                    if(typeof(data) == "string"){
                        window.location.href = "login.html?his="+escape(his);
                    }else{
                        if(data.message == "该项目未被收藏"){
                            $(".btn_q .love-btn img").attr("src","imgs/iconfont-love.png");
                        
                        }else{
                            $(".btn_q .love-btn img").attr("src","imgs/iconfont-love_save.png");
                        }
                    } },
                    error:function(data){
                        window.location.href="login.html?his="+escape(his);
                    }
                });
            }            
        
            //这里需要加判断用户是否登录           
            //http://121.196.232.233:9292/card/item?token=e7120d7a-456b-4471-8f86-ac638b348a53&itemId=1&itemType=1
            $(".btn_q .love-btn").click(function(target){              
			if(token == undefined){
                   //alert("用户未登录，请登录后再操作！！！！");
                   window.location.href="login.html?his="+escape(his);
            }else{
                var info ={
                    //"userId":data.userId,
                    "itemId":data.activityId,
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
                            //alert("请求出错，重新登陆")
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
                                    //alert("请求出错，重新登陆")
                                    window.location.href = "login.html?his="+escape(his);
                                }
                                }); 
                                },
                                error:function(data){
                                    //alert("请求出错，重新登陆")
                                    window.location.href = "login.html?his="+escape(his);
                        }
                    });    
					
                }
            });			
		}//登陆判断结束为止
     })              

});
}

    getActDetail();


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


    
 //微信部分
 //    loadwx(function(){
 //        alert('获取微信接口成功');
 //    });
 //    wx.onMenuShareTimeline({
 //        title: obj.title, // 分享标题
 //        link: window.location.href, // 分享链接
 //        imgUrl:    '',       // 分享图标
 //        success: function () {
 //            // 用户确认分享后执行的回调函数
 //            alert('分享到朋友圈成功');
 //        },
 //        cancel: function () {
 //            // 用户取消分享后执行的回调函数
 //            alert('取消分享到朋友圈成功');
 //        }
 //    });
 //    wx.onMenuShareAppMessage({
 //        title: obj.title, // 分享标题
 //        desc: obj.subTitle, // 分享描述
 //        link: window.location.href, // 分享链接
 //        imgUrl: '', // 分享图标
 //        type: 'link', // 分享类型,music、video或link，不填默认为link
 //        dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
 //        success: function () {
 //            // 用户确认分享后执行的回调函数
 //            alert('分享给朋友成功');
 //        },
 //        cancel: function () {
 //            // 用户取消分享后执行的回调函数
 //            alert('取消分享给朋友成功');
 //        }
 //    });


 //    wx.onMenuShareQQ({
 //        title: sharetit, // 分享标题
 //        desc: sharedesc, // 分享描述
 //        link: shareurl, // 分享链接
 //        imgUrl: shareimg, // 分享图标
 //        success: function () {
 //            // 用户确认分享后执行的回调函数
 //            alert('分享到QQ成功');
 //        },
 //        cancel: function () {
 //            // 用户取消分享后执行的回调函数
 //            alert('取消分享到QQ成功');
 //        }
 //    });
 //    wx.onMenuShareWeibo({
 //        title: sharetit, // 分享标题
 //        desc: sharedesc, // 分享描述
 //        link: shareurl, // 分享链接
 //        imgUrl: shareimg, // 分享图标
 //        success: function () {
 //            // 用户确认分享后执行的回调函数
 //            alert('分享到腾讯微博成功');
 //        },
 //        cancel: function () {
 //            // 用户取消分享后执行的回调函数
 //            alert('取消分享到腾讯微博成功');
 //        }
 //    });
 //    wx.onMenuShareQZone({
 //        title: sharetit, // 分享标题
 //        desc: sharedesc, // 分享描述
 //        link: shareurl, // 分享链接
 //        imgUrl: shareimg, // 分享图标
 //        success: function () {
 //            // 用户确认分享后执行的回调函数
 //            alert('分享到QQ空间成功');
 //        },
 //        cancel: function () {
 //            // 用户取消分享后执行的回调函数
 //            alert('取消分享到QQ空间成功');
 //        }
 //    });
    $("body").prepend($('<div id ="urlToDownload" style="width:1rem;height:0.12rem;position: fixed;z-index: 2000;"><img style="width:0.8rem;height:0.12rem;" src="imgs/bg-baoming.png"/><div style="background-color:#fafafa; float:right;text-align:center;width:0.2rem;height:0.12rem;line-height:0.12rem;"><p style="width:0.08rem;margin-top: 0.02rem;height:0.08rem;line-height:0.08rem;margin-left:0.06rem;background-color:#ccc;border-radius:0.08rem;font-size:0.06rem;">×</p></div></div>'));
    $("#urlToDownload>img").bind("click",function(){
        window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.kting.baijinka";
    });
    $("#urlToDownload>div").bind("click",function(){
        $("#urlToDownload").css("display","none");
    })
});

Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
    return (y+'.'+m+'.'+d);
}

