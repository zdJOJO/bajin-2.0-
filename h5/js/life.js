
$(function(){    
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
    var lifeid = window.location.search.split("=")[1].split("&")[0]?window.location.search.split("=")[1].split("&")[0]:'1';
    if(/&/g.test(lifeid)){
        lifeid = lifeid.split("&")[0];
    }
    $("#read_But").click(function(){
		window.location.href="read.html?tocken="+token;
	})

    var his = window.location.pathname.split("/");
    his = his[his.length-1];
    his = his + window.location.search;
    console.log(escape(his));
    console.log(typeof(token));
    var dataWrap=$('.content').eq(0);
    function getData(){
        $.get(port+"/card/life/"+lifeid,function(data){
            console.log(data);
            var str=$('<h1 class="msg-tit">'+data.lifeTitle+'</h1><div class="btn_q"><span class="love-btn"><img src="imgs/iconfont-love.png"></span><span class="share-btn"><img src="imgs/iconfont-p-share.png"></span></div><h4 class="tit-sm">'+data.lifeSubtitle+'</h4><div class="tip"><div class="author"><img src="imgs/iconfont-bi.png" /> '+data.userId+'</div><div class="time"><img src="images/iconfont-shijian_q.png" /> '+new Date(data.createTime*1000).Formate()+'</div> </div></div><div class="liftContent">'+data.lifeContent+'</div>');
            dataWrap.append(str);
            $.ajax({
                type:"get",
                url:port+"/card/file/getImage",
                success:function(data){
                    console.log(data);
                    var str = $('<img src="'+data.data.url+'" style="width:100%;height:auto;margin:0.08rem 0"/>');
                    $(".liftContent").append(str);
                }
            });
            //进入页面查询是否被收藏
            //查询收藏的url拼接
            var url = port+"/card/collect/item?token="+token+"&itemId="+data.lifeId+"&itemType=2";
            if(token != undefined){
                $.ajax({
                    url:url,
                    success:function(data){
                        if(typeof(data) == "string"){
                            window.location.href = "login.html?his="+his;
                        }else{
                        if(data.message == "该项目未被收藏"){
                            $(".btn_q .love-btn img").attr("src","imgs/iconfont-love.png");                
                        }else{
                            $(".btn_q .love-btn img").attr("src","imgs/iconfont-love_save.png");
                        }
                   } },
                    error:function(data){
                        //alert("请求出错，重新登陆")
                        window.location.href = "login.html?his="+escape(his);
                    }
                });
			}

            //分享部分
            var sharebtn=$('.share-btn').eq(0);
            var sharemask=$('#share-mask');
            sharemask.click(function(){
                $(this).hide();
            })
            sharebtn.click(function(){
                sharemask.show();
            });
            //这里需要加判断用户是否登录
            // //http://121.196.232.233/card/item?token=e7120d7a-456b-4471-8f86-ac638b348a53&itemId=1&itemType=1
			$(".btn_q .love-btn").click(function(target){
			   if(token == undefined){
                   //alert("用户未登录，请登录后再操作！！！！");
                   window.location.href="login.html?his="+escape(his);
           		}else{
                console.log(data);
                console.log($(target.target).css("background"));
                var info ={
                    //"userId":data.userId,
                    "itemId":data.lifeId,
                    "itemType":"2",   //1表示收藏活动，2表示收藏白金人生
                }
				$.ajax({
                    url:url,
                    success:function(data){
                    console.log(data);				
                    if(data.message == "该项目未被收藏"){                      
                        console.log("该项目未被收藏");
    					$(".btn_q .love-btn img").attr("src","imgs/iconfont-love_save.png")
    					$.ajax({
                            type:"POST",
                            url:port+"/card/collect?token="+token+"",
                            dataType:"json",
                            contentType : "application/json;charset=UTF-8",  
                            data:JSON.stringify(info),
                            success:function(data){
                            if(typeof(data) == "string"){
                            window.location.href = "login.html?his="+his;
                            }else{
                                console.log(data);
								//alert("收藏成功")
                            } },
                            error:function(data){
                                //alert("请求出错，重新登陆")
                                window.location.href = "login.html?his="+escape(his);
                            }
                        });    					
                     }else{                        
    					$(".btn_q .love-btn img").attr("src","imgs/iconfont-love.png")
    					$.ajax({
                            url:url,
                            success:function(data){
                                console.log(data);
                                $.ajax({
                                    type:"DELETE",
                                    url:port+"/card/collect/"+data.data.collectId+"?token="+token+"",
                                    dataType:"json",
                                    contentType : "application/json;charset=UTF-8",  
                                    success:function(data){
                                    if(typeof(data) == "string"){
                                        window.location.href = "login.html?his="+his;
                                        }else{
                                        console.log(data);
                                    }},
                                    error:function(data){
                                        window.location.href = "login.html?his="+escape(his);
                                    }
                                }); 
                            },
                            error:function(data){
                                window.location.href = "login.html?his="+escape(his);
                            }
                        });    
                    }
                },
                error:function(data){
                    //alert("请求出错，重新登陆")
                    window.location.href = "login.html?his="+escape(his);
                }
            });
                
			}//登陆判断结束为止
        })       
        });
    }
    getData();

// //微信部分   
//     loadwx(function(){
//         alert('获取微信接口成功');
//     });
//     wx.onMenuShareTimeline({
//         title: sharetit, // 分享标题
//         link: shareurl, // 分享链接
//         imgUrl: shareimg, // 分享图标
//         success: function () { 
//             // 用户确认分享后执行的回调函数
//             alert('分享到朋友圈成功');
//         },
//         cancel: function () { 
//             // 用户取消分享后执行的回调函数
//             alert('取消分享到朋友圈成功');
//         }
//     });
//     wx.onMenuShareAppMessage({
//         title: sharetit, // 分享标题
//         desc: sharedesc, // 分享描述
//         link: shareurl, // 分享链接
//         imgUrl: shareimg, // 分享图标
//         type: 'link', // 分享类型,music、video或link，不填默认为link
//         dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
//         success: function () { 
//             // 用户确认分享后执行的回调函数
//             alert('分享给朋友成功');
//         },
//         cancel: function () { 
//             // 用户取消分享后执行的回调函数
//             alert('取消分享给朋友成功');
//         }
//     });
//     wx.onMenuShareQQ({
//         title: sharetit, // 分享标题
//         desc: sharedesc, // 分享描述
//         link: shareurl, // 分享链接
//         imgUrl: shareimg, // 分享图标
//         success: function () { 
//             // 用户确认分享后执行的回调函数
//             alert('分享到QQ成功');
//         },
//         cancel: function () { 
//             // 用户取消分享后执行的回调函数
//             alert('取消分享到QQ成功');
//         }
//     });
//     wx.onMenuShareWeibo({
//         title: sharetit, // 分享标题
//         desc: sharedesc, // 分享描述
//         link: shareurl, // 分享链接
//         imgUrl: shareimg, // 分享图标
//         success: function () { 
//             // 用户确认分享后执行的回调函数
//             alert('分享到腾讯微博成功');
//         },
//         cancel: function () { 
//             // 用户取消分享后执行的回调函数
//             alert('取消分享到腾讯微博成功');
//         }
//     });
//     wx.onMenuShareQZone({
//         title: sharetit, // 分享标题
//         desc: sharedesc, // 分享描述
//         link: shareurl, // 分享链接
//         imgUrl: shareimg, // 分享图标
//         success: function () { 
//             // 用户确认分享后执行的回调函数
//             alert('分享到QQ空间成功');
//         },
//         cancel: function () { 
//             // 用户取消分享后执行的回调函数
//             alert('取消分享到QQ空间成功');
//         }
//     });
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
    return (y+'-'+m+'-'+d);
}