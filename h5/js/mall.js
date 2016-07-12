$(document).ready(function(){	
	//获取token
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
	token = getCookie("token");//便于本地测试
	// token = getCookie("token");
	//获取页面的名称
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	//数量选择处理
    var mallid = window.location.search.split("=")[1];
    if(/&/g.test(mallid)){
        mallid = mallid.split("&")[0];
    }
    //获取商品http://121.196.232.233/card/goods/{goodsId}	
	$.ajax({
		type:"get",
		url:port+"/card/mall/"+mallid,
		async:true,
		dataType:"json",
		success:function(data){
			console.log(data);
			$(".primeCost span").html(data.data.title);
			$(".currentCost span").html(data.data.address);
			$(".stock span").html(data.data.discount);
			$(".message div").html(data.data.detail);
			$("footer a").attr("href","tel:"+data.data.phone);
			$(".saveAndShare").attr("data-itemid",data.data.mallId);
			var picList = data.data.imgList;
			// picList = JSON.parse(picList);
			console.log(picList);
			for(var i=0,len=picList.length;i<len;i++){
				var str = $('<div class="swiper-slide"><img src="'+picList[i].pic+'"/></div>');
				$(".swiper-wrapper").append(str);
			}
			//保存当前的商品的图片地址到立即购买按钮上		    
		    var swiper = new Swiper('.swiper-container', {

				autoplay: 3000,//可选选项，自动滑动
		        pagination: '.swiper-pagination',
		        paginationType: 'progress',
				scrollbar: '.swiper-scrollbar',
				scrollbarHide: false
		    });
		    // 进入页面检测是否收藏，如果是登录的状态
		    if(token==undefined){
		    	return;
		    }else{
			    $.ajax({
			        type:"get",
			        async:true,
			        url:port+"/card/collect/item?token="+token+"&itemId="+$(".saveAndShare").data("itemid")+"&itemType=5",
			        dataType:"json",
			        success:function(data){
			       		console.log(data);
			       		if(data.code==204){
			       			$(".saveAndShare img.love").attr("src","imgs/iconfont-love_save.png")
			       		}else if(data.code==205){
			       			$(".saveAndShare img.love").attr("src","imgs/iconfont-love.png");
			       		}
			   		},
			   		error:function(data){
			   			console.log(data);
			   		}
			   	});
			}
		},
		error:function(data){
			console.log(data);
		}
	});

	//收藏与分享部分
	$(".saveAndShare img.love").bind("click",function(){
		if(token!=undefined){
			if($(this).attr("src")=="imgs/iconfont-love.png"){
				// alert("没有收藏！");
				$(this).attr("src","imgs/iconfont-love_save.png");
				//http://121.196.232.233/card/collect?token=e7120d7a-456b-4471-8f86-ac638b348a53
				$.ajax({
					type:"post",
					url:port+"/card/collect?token="+token,
					dataType:"json",
					contentType:"application/json;charset=UTF-8",
					data:JSON.stringify({
		 				itemId:$(this).parent().data("itemid"),
		      			itemType:5,
					}),
					success:function(data){
						console.log(data);
						// alert(data.message);
					},
					error:function(data){
						console.log(data);
					}
				});
		    }else{
		    	// alert("收藏！");
		    	$(this).attr("src","imgs/iconfont-love.png");	    	
		        //here you must check the collectid by a ajax，then you can delete it
		        //http://121.196.232.233/card/collect/item?token=e7120d7a-456b-4471-8f86-ac638b348a53&itemId=1&itemType=1
		        $.ajax({
			        type:"get",
			        async:true,
			        url:port+"/card/collect/item?token="+token+"&itemId="+$(this).parent().data("itemid")+"&itemType=5",
			        dataType:"json",
			        success:function(data){
			       		console.log(data);
			       		if(data.data.collectId==undefined){
			       			return;
			       		}
				       	//删除收藏的接口http://121.196.232.233/card/collect/{collectId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
				        $.ajax({
				        	type:"DELETE",
							dataType:"json",
							contentType:"application/json;charset=UTF-8",
				        	url:port+"/card/collect/"+data.data.collectId+"?token="+token,
				        	success:function(data){
								console.log(data);
								// alert(data.message);
				        	},
				        	error:function(data){
				        		console.log(data);
				        	}
				        }); 
			        },
			        error:function(data){
			        	console.log(data);
			        } 	

		        });	        
		    }
		}else{
			window.location.href = "login.html?his="+escape(his);
		}
	});

    //分享部分
    var sharebtn=$('.share').eq(0);
    var sharemask=$('#share-mask');
    sharemask.click(function(){
        $(this).hide();
    })
    sharebtn.click(function(){
        sharemask.show();
    });
    //二维码
    $.ajax({
	    type:"get",
	    url:port+"/card/file/getImage",
	    success:function(data){
	        console.log(data);
	        var str = $('<img src="'+data.data.url+'" style="width:0.88rem;height:auto;margin:0.08rem 0.06rem;"/>');
	        $(".wrapper").append(str);
	    }
	});
    $("body").prepend($('<div id ="urlToDownload" style="width:1rem;height:0.12rem;position: fixed;z-index: 2000;"><img style="width:0.8rem;height:0.12rem;position: absolute;top:0;"src="imgs/bg-baoming.png"/><div style="background-color:#fafafa;float:right;text-align:center;width:0.2rem;height:0.12rem;line-height:0.12rem;"><p style="width:0.08rem;margin-top: 0.02rem;height:0.08rem;line-height:0.08rem;margin-left:0.06rem;background-color:#ccc;border-radius:0.08rem;font-size:0.06rem;">×</p></div></div>'));
    $("#urlToDownload>img").bind("click",function(){
        window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.kting.baijinka";
    });
    $("#urlToDownload>div").bind("click",function(){
        $("#urlToDownload").css("display","none");
    })
});