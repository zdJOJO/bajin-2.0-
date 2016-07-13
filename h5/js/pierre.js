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
	//分页获取商品http://121.196.232.233:9292/card/goods?currentPage=1&brandId=0
	//臻品底边栏导航
	$(".indexPage").click(function(){
		window.location.href = "index.html";
	});
	$(".clubPage").click(function(){
		window.location.href = "culb.html";
	});	
	$(".readPage").click(function(){
		window.location.href = "read.html";
	});
	//购物车导航
	$(".shoppingCart").bind("click",function(){
		if(token==undefined){
			window.location.href="login.html?his="+escape(his);
		}else{
			window.location.href = "shoppingCart.html";			
		}
	});

	//分页获取商品http://121.196.232.233/card/goods?currentPage=1&brandId=0
	function getGoods(page,brandId,isDelete){
		$.ajax({
		type:"get",
		async:true,
		dataType:'json',
		url:port+"/card/goods?currentPage="+page+"&brandId="+brandId+"&isDelete="+isDelete+"&token="+token,
		success:function(data){
			// 清空内容
			$(".wrapper .content").html("");
			var str;
			for(var i=0,len=data.list.length;i<len;i++){
				// 处理金钱数后边的.00
				var costFormate=0.00;
				if(/[\.]{1}/.test(data.list[i].goodsPrice)){
					var str= data.list[i].goodsPrice.toString().split(".");
					costFormate = str[0]+"."+str[1].substring(0,2);
				}else{
					costFormate = data.list[i].goodsPrice+".00";
				}
				if(i%2==0){
					//<div class="logo"><img src="imgs/pierre.png"/></div>
					str = $('<div class="lar" data-id="'+data.list[i].goodsId+'"><img src="'+data.list[i].hotPic+'"/><div class="detail"><p class="title" style="margin: 15px 0 5px 0;">'+data.list[i].goodsTitle+'</p><p class="subTitle">'+data.list[i].goodsSubtitle+'</p><p class="pirce">￥&nbsp;'+costFormate+'</p></div></div>');
				}else if(i%2==1){
					str = $('<div class="uad" data-id="'+data.list[i].goodsId+'"><img src="'+data.list[i].maxPic+'"/><div class="down"><center><p class="title">'+data.list[i].goodsTitle+'</p><p class="subtitle">'+data.list[i].goodsSubtitle+'</p><p class="pirce">￥&nbsp;'+costFormate+'</p><p class="buy">购买</p></center></div></div>');
				}
				$(".wrapper .content").append(str);
			}
			//添加导航事件
				$(".lar,.uad").bind("click",function(){
					window.location.href = "brandDetail.html?id="+$(this).data("id");
				});			
			},
			error:function(data){
				//todo
			}
		});
	}
	//获取服务的方法
	function getServer(currentPage,size){
		$.ajax({
			type:"get",
			url:port+"/card/mall?currentPage="+currentPage+"&size="+size+"&token="+token,
			success:function(data){
				for(var i=0,len=data.data.list.length;i<len;i++){
					var str=$('<div class="singleBrand_q" data-mallid ="'+data.data.list[i].mallId+'"><img src="'+data.data.list[i].pic+'"/><div class="detail_q"><h3>'+data.data.list[i].title+'<span>'+data.data.list[i].discount+'</span></h3><p>'+data.data.list[i].subtitle+'</p><div><p><img src="imgs/position_qq.png"/><span>'+data.data.list[i].address+'<span></p></div></div></div>');
					$(".wrapper .newBrandList").append(str);
				}
				//多行省略显示
				lessAll($(".singleBrand_q .detail_q>p"),25);
				// 添加到详细页面的跳转http://121.196.232.233/card/mall/{id}
				$(".singleBrand_q").bind("click",function(){
					window.location.href = "mall.html?id="+$(this).data("mallid");
				});
			},
			error:function(data){
			}
		});
	}


	//臻品
	$(".hot").bind("click",function(){
		$(this).css("border-bottom","1px solid #666;").css("color","#323232");
		$(this).siblings().css("border-bottom","none").css("color","#9c9c9c");
		$(".content").css("display","block");
		$(".brandList").css("display","none");
		getGoods(1,0,0);
	});

	//乐享
	$(".brand").bind("click",function(){
		$(".brandList").css("display","block");
		$(".content").css("display","none");
		$(this).css("border-bottom","1px solid #666;").css("color","#323232");
		$(this).siblings().css("border-bottom","none").css("color","#9c9c9c");
		getServer(1,100);
	});


	$(".hot").click();//默认点击一下热推
});