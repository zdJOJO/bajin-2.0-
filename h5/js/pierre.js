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
		window.location.href = "culb.html?joinAct";
	});	
	$(".readPage").click(function(){
		window.location.href = "read.html?hot";
	});


	

	var	pageNum = 0 ;
	var str = '';

	
	$('header>center>div').click(function () {
		if($(this).hasClass('active')){
			return
		}
		if($(this).hasClass('good')){
			window.location.href = 'pierre.html?good';
		}else {
			window.location.href = 'pierre.html?brand';
		}
	});

	//获取 臻品列表
	function getGoods(page,brandId,isDelete){
		$.ajax({
			type:"get",
			async:true,
			dataType:'json',
			url:port+"/card/goods?currentPage="+page+"&brandId="+brandId+"&isDelete="+isDelete+"&token="+token,
			success:function(data){
				// 清空内容
				if(data.list.length != 0){
					for(var i=0,len=data.list.length;i<len;i++){
						str += '<div class="lar" data-id="'+data.list[i].goodsId+'"><img src="'+data.list[i].hotPic+'"/>' +
							'<div class="detail"><p class="title" style="margin: 5px 0 5px 0;">'+data.list[i].goodsTitle+'</p>' +
							'<p class="subTitle">'+data.list[i].goodsSubtitle+'</p><p class="pirce">￥&nbsp;'+data.list[i].goodsPrice.toFixed(2)+'</p></div></div>' ;
					}
					$(".wrapper .content").append(str);

					//添加导航事件
					$(".lar,.uad").bind("click",function(){
						window.location.href = "brandDetail.html?id="+$(this).data("id");
					});

				}else {
					// 锁定
					dropload_good.lock();
					// 无数据
					dropload_good.noData();
					setTimeout('$(".dropload-down").css("height","0")',1000);
				}
			},
			error:function(data){
				//todo
			}
		});
	}


	//获取 乐享列表
	function getServer(currentPage,size){
		$.ajax({
			type:"get",
			url:port+"/card/mall?currentPage="+currentPage+"&size="+size+"&token="+token,
			success:function(data){
				if(data.data.list.length != 0 ){
					for(var i=0,len=data.data.list.length;i<len;i++){
						str += '<div class="singleBrand_q" data-mallid ="'+data.data.list[i].mallId+'"><img src="'+data.data.list[i].pic+'"/><div class="detail_q"><h3>'+data.data.list[i].title+'<span>'+data.data.list[i].discount+'</span></h3><p>'+data.data.list[i].subtitle+'</p><div><p><img src="imgs/position_qq.png"/><span>'+data.data.list[i].address+'<span></p></div></div></div>' ;
					}
					$(".wrapper .newBrandList").append(str);

					$(".singleBrand_q").bind("click",function(){
						window.location.href = "mall.html?id="+$(this).data("mallid");
					});

					lessAll($(".singleBrand_q .detail_q > p"),25);
				}else {
					// 锁定
					dropload_brand.lock();
					// 无数据
					dropload_brand.noData();
					setTimeout('$(".dropload-down").css("height","0")',1000);
				}
			},
			error:function(data){
				//todo
			}
		});
	}





	if(window.location.href.indexOf('good') > 0){
		pageNum = 0;
		str = '';
		$('header .good').addClass('active').siblings().removeClass('active');
		$('.wrapper >.content').show().siblings().hide();
		var dropload_good = $('.wrapper').dropload({
			scrollArea : window,
			domDown : {
				domClass   : 'dropload-down',
				domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
				domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
				domNoData  : '<div class="dropload-noData">已无数据</div>'
			},
			loadDownFn : function(me){
				pageNum++;
				if(pageNum == 1){
					setTimeout('$(".dropload-down").css("height","0")',1000);
				}
				getGoods(pageNum,0,0);
			}
		});
	}else {
		pageNum = 0;
		str = '';
		$('header .brand').addClass('active').siblings().removeClass('active');
		$('.wrapper >.brandList').show().siblings().hide();
		var dropload_brand = $('.wrapper').dropload({
			scrollArea : window,
			domDown : {
				domClass   : 'dropload-down',
				domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
				domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
				domNoData  : '<div class="dropload-noData">已无数据</div>'
			},
			loadDownFn : function(me){
				pageNum++;
				if(pageNum == 1){
					setTimeout('$(".dropload-down").css("height","0")',1000);
				}
				getServer(pageNum,5);
			}
		});
	}


	//购物车导航
	$(".shoppingCart").bind("click",function(){
		if(token==undefined){
			window.location.href="login.html?his="+escape(his);
		}else{
			window.location.href = "shoppingCart.html";
		}
	});






	//查看那购物车是有商品
	if(token){
		$.get(port+"/card/car?currentPage="+1+"&size="+ 10 +"&token="+token ,function (result) {
			if(result.list.length > 0){
				$(".shoppingCart>img").attr('src','imgs/shoppingCart-2.png');
			}
		})
	}

});