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
	his = his + window.location.search;

	//获取商品http://121.196.232.233/card/goods/{goodsId}
	var goodsid = window.location.search.split("=")[1]?window.location.search.split("=")[1]:1;
	    if(/&/g.test(goodsid)){
        goodsid = goodsid.split("&")[0];
    }

	$.ajax({
		type:"get",
		url:port+"/card/goods/"+goodsid,
		async:true,
		dataType:"json",
		success:function(data){
			console.log(data);
			$(".buyNow").attr("data-goodsid",data.goodsId);
			$(".wrapper .title").html(data.goodsTitle);
			$(".wrapper .subtitle").html(data.goodsSubtitle);
			$(".buyNow").attr("data-pic",data.maxPic);
			$(".message_1").html(data.goodsDetail);
			$(".message_2").html(data.goodsGauge);
			var picList = data.goodsPics;


			picList = JSON.parse(picList);
			$(".brandDetail").click();
			$(".saveAndShare").attr("data-itemid",data.goodsId);


			for(var i in picList){
				var str = $('<div class="swiper-slide"><img src="'+picList[i]+'"/></div>');
				$(".swiper-wrapper").append(str);
			}
			//保存当前的商品的图片地址到立即购买按钮上		    
		    var swiper = new Swiper('.swiper-container', {
		        nextButton: '.swiper-button-next',
		        prevButton: '.swiper-button-prev',
		        pagination: '.swiper-pagination',
		        paginationType: 'progress'
		    });
		    // 进入页面检测是否收藏，如果是登录的状态
		    if(token==undefined){
		    	return;
		    }else{
			    $.ajax({
			        type:"get",
			        async:true,
			        url:port+"/card/collect/item?token="+token+"&itemId="+$(".saveAndShare").data("itemid")+"&itemType=3",
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
	//获取商品库存，并显示出颜色
	var stockAll = 0;
	$.ajax({
		type:"get",
		url:port+"/card/goods/"+goodsid+"/sku",
		dataType:"json",
		success:function(data){
			var maxPrice = 0;
			for(var i=0,len=data.length;i<len;i++){				
				// stockAll += data[i].stockNumber;//如果是总数要在这里写
				var str_ = $('<p data-soldnumber="'+data[i].soldNumber+'" data-stock="'+data[i].stockNumber+'" data-marketPrice="'+data[i].marketPrice+'"  data-skuprice="'+formatePrice(data[i].skuPrice)+'" data-skuid="'+data[i].skuId+'">'+data[i].skuGague+'</p>');
				$(".colorPick .colors").append(str_);
				maxPrice = maxPrice>data[i].skuPrice?maxPrice:data[i].skuPrice;			
			}
			console.log(maxPrice);
			stockAll += data[0].stockNumber;//如果是每次进入先显示第一个就这样写
			//原价||现价||库存
			//这里筛选出来最高的价格，暂且作为市场价格填写到市场价格的地方			
			$(".currentCost span").html("￥&nbsp;"+formatePrice(data[0].skuPrice));
			$(".primeCost span").html("￥&nbsp;"+formatePrice(data[0].marketPrice));
			$($(".colorPick .colors p")[0]).css("background-color","#b7a66e").css("color","#fafafa");
			//填入总库存
			$(".stock span").html(stockAll+"件");
			$(".joinCart").attr("data-skuid",data[0].skuId);//默认的商品
			$(".buyNow").attr("data-skuid",data[0].skuId);
			//根据颜色改变价格
			$(".colorPick .colors p").bind("click",function(){
				stockAll = $(this).data("stock");
				$(".stock span").html($(this).data("stock")+"件");
				$(".currentCost span").html("￥&nbsp;"+$(this).data("skuprice"));//这个地方到时间是要变的
				$(".primeCost span").html("￥&nbsp;"+$(this).data("marketprice"));
				$(this).css("background-color","#b7a66e").css("color","#fafafa");
				$(this).siblings().css("background-color","#ffffff").css("color","#b0b0b0");
				$(".joinCart").attr("data-skuid",$(this).data("skuid"));
				$(".buyNow").attr("data-skuid",$(this).data("skuid"));  
			});
		},
		error:function(data){
			console.log(data);
		}
	});
	$(".brandDetail").bind("click",function(){
		$(this).css("border-bottom","1px solid #666;").css("color","#666");
		$(this).siblings().css("border-bottom","none").css("color","#a6a6a6");	
		$(".message_1").css("display","block");
		$(".message_2").css("display","none");	
	});
	$(".specification").bind("click",function(){
		$(this).css("border-bottom","1px solid #666;").css("color","#666");
		$(this).siblings().css("border-bottom","none").css("color","#a6a6a6");
		$(".message_2").css("display","block");
		$(".message_1").css("display","none");	
	});
	// $(".customerService").bind("click",function(){
	// 	$(this).css("border-bottom","1px solid #666;");
	// 	$(this).siblings().css("border-bottom","none");
	// });
	//立即购买按钮跳转，这个地方需要传递选择的一些信息，可以传递一个对象到下一个页面，通过url来传递
	//这里的传递，在购物车填写订单的时候也要这样传递，要保持一致
	//注意转换，反转换
	// var obj = {
	// 	pic:,//订单的图片
	// 	title:,//订单标题
	// 	subTitle:,//订单的副标题
	// 	cost:,//订单的价格
	// 	num:,//商品数量
	// }
	//{
	//cards:[1,2],//购物车Id列表
	//receveId:1,//收获地址
	//skuId:1,//商品的skuid
	//num:3//直接添加的时候的购买数量
	//}
	$(".buyNow").bind("click",function(){
		if(token!=undefined){
			var obj = {
				pic:$(".buyNow").data("pic"),
				title:encodeURIComponent($("center .title").html()),
				subTitle:encodeURIComponent($("center .subtitle").html()),
				cost:$(".currentCost span").html(),
				// num:1,//这里的数量调整是在填写订单的页面，所以这里可以默认不填
				skuId:$(".buyNow").data("skuid"),
				goodsId:$(".buyNow").data("goodsid"),
				num:$(".currentNum").html()
			};
			console.log(obj);
			console.log(JSON.stringify(obj));
			console.log(escape(JSON.stringify(obj)));
			// window.location.href = "fillInOrder.html?obj="+escape(JSON.stringify(obj));
			window.location.href = "fillInOrder.html?cost="+ obj.cost + "&&goodsId="+obj.goodsId+ "&&num=" +obj.num+ "&&pic=" +obj.pic+ "&&skuId="+obj.skuId+ "&&subTitle="+obj.subTitle + "&&title="+obj.title ;
		}else{
			window.location.href = "login.html?his=" + escape(his);
		}
	});
	//加入购物车
	//http://121.196.232.233/card/car/goods?token=e7120d7a-456b-4471-8f86-ac638b348a53&=1
	$(".joinCart").bind("click",function(){
		var skuid = $(this).data("skuid");
		if(token!=undefined){
			$.ajax({
				type:"post",
				url:port+"/card/car/goods?token="+token+"&=1",
				dataType:"json",
				contentType : "application/json;charset=UTF-8",
				aysnc:true,
				data:JSON.stringify({
					num:$(".currentNum").html(),
					skuId:skuid
				}),
				success:function(data){
					console.log(data);
					// alert(data.message);
					alert_replace("test.winthen.com","加入购物车成功",2);
				},
				error:function(data){
					console.log(data);
				}
			});			
		}else{
			window.location.href = "login.html?his="+escape(his);
		}
	});


	//数量选择处理
	var currentNum = $(".currentNum").html();
	$(".addAndReduce img.reduce").bind("click",function(){
		if(currentNum==1){
			alert('已经最少！');
			return;
		}else{
			currentNum--;
			$(".currentNum").html(currentNum);
		}
	});
	$(".addAndReduce img.add").bind("click",function(){
			if(currentNum)
			currentNum++;
		if(currentNum  > stockAll){
			alert('超出库存！');
			return;
		}
		$(".currentNum").html(currentNum);
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
		      			itemType:3,
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
			        url:port+"/card/collect/item?token="+token+"&itemId="+$(this).parent().data("itemid")+"&itemType=3",
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