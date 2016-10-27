

//这个页面数据接入太傻逼了，这里需要处理三个页面的数据进来，
////  ↑老子 二次开发 ，你个臭煞笔 你他妈的还好意思说？？？ 蠢狗，代码写得跟屎一样！

//应该使用一个obj来保存数据，进入页面再请求得到相对应的数据，
//更傻逼的是购物车过来的数据是没有合并的，也就是说skuid是会一样的，这样就造成了很多的麻烦。
//如下数据{
//cards:[1,2],//购物车Id列表
//receveId:1,//收获地址
//skuId:1,//商品的skuid
//num:3//直接添加的时候的购买数量
//}

$(document).ready(function(){
	//获取token
	var token = "";
	//获取存在于cookie中的token值
	function getCookie(c_name) {
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


	function GetQueryString(name) {
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r!=null)return  unescape(r[2]);
		return null;
	}

	token = getCookie("token");
	//获取页面的名称
	var his = window.location.pathname.split("/");
	his = his[his.length-1];


	//解析前一个页面传递的对象，包含汉字
	var obj = {};
	if(window.location.search.indexOf('isShoppingCart=true') > 0){
		//从 购物车进来
		obj = JSON.parse(GetQueryString('obj'));
		console.log(obj)
	}else{
		try{
			obj.goodsId = GetQueryString('goodsId');
			obj.num = GetQueryString('num');
			obj.skuId = GetQueryString('skuId');
			if( window.location.search.indexOf('receiveId')>0){
				obj.receiveId = GetQueryString('receiveId');
			}
		}catch(e){
			var  str = window.location.search.split("=")[1];
			obj = JSON.parse(unescape(str));
		}
	}



	//填入数据
	if(window.location.search.indexOf('isShoppingCart=false') > 0){
		var numStr = '<div class="buyNum">购买数量<span class="plus">+</span><span id="numValue">'+obj.num+'</span><span class="reduce">-</span></div>';
		$.get( port + '/card/goods/'+obj.goodsId ,function (res) {
			$(".good").append('<div class="singleBrand" data-id="'+obj.skuId+'"><img class="activityPic" src="'+res.hotPic+'"/>' +
				'<div class="detail"><h3>'+res.goodsTitle+'</h3><p class="subtitle"></p>' +
				'<p class="singleCost"><span class="price"></span><span class="num"></span></p></div></div>' + numStr);

			$.get( port + '/card/goods/sku/'+obj.skuId ,function (result) {
				$(".good .detail .subtitle").html(result.skuGague);
				$(".good .detail .singleCost span.price").html("￥" +  result.skuPrice.toFixed(2));
				$('footer .totalPrice').html( '￥' + (obj.num * result.skuPrice).toFixed(2));
				obj.cost = result.skuPrice;

				$('.good').find('.reduce').click(function () {
					numChangeFn( 'reduce',parseInt($('#numValue').html()),result.skuPrice);
				});
				$('.good').find('.plus').click(function () {
					numChangeFn('plus',parseInt($('#numValue').html()),result.skuPrice,result.stockNumber);
				});
			});

			function numChangeFn(type,num,skuPrice,_maxNum) {
				if(type=='reduce'){
					if(num == 1){
						return
					}else {
						num--;
						$('#numValue').html(num);
						$('footer .totalPrice').html( '￥' + (num*skuPrice).toFixed(2));
					}
				}else {
					if(num == _maxNum){
						return
					}else {
						num++;
						$('#numValue').html(num);
						$('footer .totalPrice').html( '￥' + (num*skuPrice).toFixed(2));
					}
				}
			};
		});
	}

	$(".message").bind("click",function(){
		if(window.location.search.indexOf("cards") < 0){
			window.location.href = "setAddress.html?obj=" + escape(JSON.stringify(obj)) + '&&isShoppingCart=false';
		}else {
			window.location.href = "setAddress.html?obj=" + escape(JSON.stringify(obj));
		}
	});
	// 拿到cardid来请求的到商品的信息
	
	// 地址处理
	// 地址处理要区分两种情况，
	// 有地址：有地址肯定有默认地址一个，所以直接显示的地址就是默认的地址，点击地址栏的时候要跳到地址管理页面
	// 没有地址的时候需要显示没有地址的情况，文字提示，点击跳转到添加新地址的页面。
	var receiveId = obj.receiveId;
	if(receiveId == undefined){
		$.ajax({
			type:"get",
			url:port+"/card/receiver?token="+token+"&currentPage=1",
			dataType:"json",
			async:true,
			contentType : "application/json;charset=UTF-8",
			success:function(data){
				if(data.code == '666'){
					alert('用户登录异常，请重新登录');
					window.location.href = "login.html?his="+escape(his);
					return;
				}
				if(data.list.length==0){
					var str=$('<h3 class="noneAddress">请选择收货地址<img src="imgs/go.png"/></h3>');
					$(".message").html(str);
				}else{
					for(var i=0,len=data.list.length;i<len;i++){
						if(data.list[i].isDefault==1){
							var str = $('<p class="userName"><span></span></p>' +
								'<p class="phone"><span></span><img src="imgs/go.png"/></p>' +
								'<p class="address"></p>');

							$(".message").html(str);
							$(".userName span").html(data.list[i].receiverName);
							$(".phone span").html(data.list[i].receiverPhone);
							$("p.address").html(data.list[i].province+data.list[i].city+data.list[i].district+data.list[i].detilAddress);
							$("footer p").attr("data-id",data.list[i].receiveId);
							return;
						}else{
							var str=$('<h3 class="noneAddress">请选择收货地址<img src="imgs/go.png"/></h3>');
							$(".message").html(str);
						}
					}	
				}
			},
			error:function(data){
				//todo
			}
		});		
	}else{			//有地址的id，就会去请求得到地址的id，然后填写到页面上边
		$.ajax({
			type:"get",
			url:port+"/card/receiver/"+receiveId+"?token="+token,
			dataType:"json",
			async:true,
			contentType:"application/json;charset=UTF-8",
			success:function(data){
				$("footer p").attr("data-id",data.receiveId);
				$(".userName span").html(data.receiverName);
				$(".phone span").html(data.receiverPhone);
				$("p.address").html(data.province+data.city+data.district+data.detilAddress);
			},
			error:function(data){
				console.log(data);
			}
		});
	}


	//获取购物车物品，根据id来显示出物品
	// 购物车
	var cards = obj.cards;
	if(cards){
		$.ajax({
			type:"get",
			url:port+"/card/car?currentPage=1&size="+1000+"&token="+token,
			dataType:"json",
			async:true,
			success:function(data){
				$(".good").html("");
				console.log(data);
				var totalPrice = 0;
				for(var i=0,len=data.list.length;i<len;i++){
					for(var j=0,len_=cards.length;j<len_;j++){
						if(data.list[i].carModel.id==cards[j]){
							console.log(data.list[i].carModel.id);
							console.log(cards[j]);
							var str=$('<div class="singleBrand">' +
								'<img src="'+data.list[i].goodsModel.hotPic+'" class="activityPic"/>' +
								'<div class="detail"><h3>'+data.list[i].goodsModel.goodsTitle+'</h3>' +
								'<p class="subtitle">'+data.list[i].goodsModel.goodsSubtitle+'</p>' +
								'<p class="singleCost">￥&nbsp;'+data.list[i].skuModel.skuPrice.toFixed(2)+'<span class="num">×'+data.list[i].carModel.num+'</span></p></div></div>');
							$(".good").append(str);
							totalPrice += data.list[i].skuModel.skuPrice*data.list[i].carModel.num;
						}
					}
				}
				$('footer .totalPrice').html('￥' + totalPrice.toFixed(2));
			},
			error:function(data){
				console.log(data);
			}
		});
	}//这里跟单个物品立即购买处理的不同。
	//这里处理确认订单按钮的事件，区分添加的来源
	$("footer p").bind("click",function(){
		if(obj.cost!=undefined){			//直接购买的地方
			var data = {
				receiveId: $("footer p").data("id"), // 收货地址
				skuId: obj.skuId, // 商品SKUID
				num: $('#numValue').html()// 购买数量
			}

			if(!data.receiveId){
				alert('订单生成失败！请填写收货地址后重新下订单。');
				return;
			}
			if(!data.skuId){
				alert('订单生成失败！请选择商品型号后重新下订单。');
				return;
			}
			if(!data.num){
				alert('订单生成失败！请选择商品数量后重新下订单。');
				return;
			}

			$.ajax({
				type:"post",
				async:true,
				url:port+"/card/order/now?token="+token,
				dataType:"json",
				contentType:"application/json;charset=UTF-8",
				data:JSON.stringify(data),
				success:function(data){

					if(window.location.search.indexOf('brandDetail')> 0){
						window.location.href = "unpaid.html?brandDetail&&cardid=" + data.data.orderModel.orderId ;
					}else {
						window.location.href = "unpaid.html?cardid=" + data.data.orderModel.orderId;
					}

				},
				error:function(data){
					console.log(data);
				}
			});
		}else{							//购物车购买
			$.ajax({
				type:"post",
				async:true,
				url:port+"/card/order?token="+token,
				dataType:"json",
				contentType:"application/json;charset=UTF-8",
				data:JSON.stringify({
					receiveId:$("footer p").data("id"), // 收货地址
					carIds:cards // 购物车ID列表
				}),
				success:function(data){
					window.location.href = "unpaid.html?isShoppingCart&&cardid=" + data.data.orderModel.orderId;
				},
				error:function(data){
					console.log(data);
				}
			});
		}

	});//订单确认按钮结束
})

