/**
 * Created by Administrator on 2016/7/24.
 */
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
var goodsid =  window.location.search.split("=")[1] ? window.location.search.split("=")[1] : 1;
if(/&/g.test(goodsid)){
	goodsid = goodsid.split("&")[0];
}

$.toast.prototype.defaults.duration = 500;


var itemId = window.location.search.split("=")[1];
// var type = -1;


var data_pic = '';
var buyNum = 1;

var stockNum = 0;  //加减时候 用到
var chooseSpeStr = '' ; // 用于赋值给 弹框外部的 ‘已选择’的值
var current_skuId = 0;  // 用于‘已选择’的商品型号的 skuId

var collectId =  0 ;  //用于判断是否 收藏

//提交订单时候 url的传的参数
var url_obj = {
	pic: '',   //商品图
	title: '', //商品名
	subTitle: '', //所选规格
	cost: '', // 价格
	skuId: 0, //规格id
	goodsId: 0, //商品id
	num: 1  //所选商品数量
};


//分享时候 传当前页面的url 和 对象obj
get_url(window.location.href);



//判断 是否 被收藏
var isCollected = function () {
	$.get(port + '/card/collect/item?token=' + token + '&itemId=' + itemId + '&itemType=3',function (result) {
		if(result.code == 204){
			collectId = result.data.collectId;
			$(".saveAndShare img.love").attr('src','imgs/iconfont-love_save.png');
		}else {
			collectId = 0;
			$(".saveAndShare img.love").attr('src','imgs/iconfont-love.png');
		}
	});
};

// 收藏
$(".saveAndShare img.love").click(function () {

	if(!token){
		$.alert("登陆后再收藏", "收藏失败", function() {
			window.location.href = "login.html?his=" + escape(his);
		});
		return;
	}

	var url =  collectId>0 ? port + '/card/collect/'+ collectId +'?token=' + token : port + '/card/collect/?token=' + token ;
	var httpType =  collectId>0 ? 'delete' : 'post' ;
	var data = collectId>0  ? '' : JSON.stringify({
		itemType: 3,
		itemId: itemId
	}) ;

	$.ajax({
		type: httpType ,
		dataType:"json",
		contentType : "application/json",
		url: url,
		data: data,
		success : function (result) {

			if(result.code == 201){
				$(".saveAndShare img.love").attr("src","imgs/iconfont-love_save.png")
				$.toast("收藏成功",function () {
					isCollected();
				});
			}else if(result.code == 203){
				$(".saveAndShare img.love").attr("src","imgs/iconfont-love.png");
				$.toast("取消收藏成功",function () {
					isCollected();
				});
			}else {
				$.toast("操作失败", "cancel");
			}
		},
		error: function (data) {
			$.toast("操作失败", "cancel");
		}
	});
});






//获取商品详细信息
var getGoodDetail = function () {
	$.ajax({
		type: "get",
		url: port+"/card/goods/" + itemId,
		async: true,
		dataType: "json",
		success: function(data){

			isCollected();

			data_pic = data.hotPic;

			url_obj.pic = data.hotPic;
			url_obj.title = data.goodsTitle;
			url_obj.goodsId = data.goodsId;

			//调用分享借口
			jsSdkApi('share',{
				title: data.goodsTitle,
				desc: data.goodsSubtitle,
				link: window.location.href,
				imgUrl: data.hotPic
			});

			$(".buyNow").attr("data-goodsid",data.goodsId);
			$(".wrapper .title").html(data.goodsTitle);
			$(".wrapper .subtitle").html(data.goodsSubtitle);
			// $(".buyNow").attr("data-pic",data.maxPic);
			$(".message_1").html(data.goodsDetail);
			$(".message_2").html(data.goodsGauge);
			$(".message_1 img , .message_1 a").css({
				'width': '100%',
				'height': 'auto'
			});

			var picList = data.goodsPics;
			picList = JSON.parse(picList);
			$(".brandDetail").click();
			$(".saveAndShare").attr("data-itemid",data.goodsId);

			var picArray = []
			for(var i in picList){
				picArray.push(picList[i]);
			}
			var str = '';
			for(var i=0 ; i<picArray.length;i++){
				str += '<div class="swiper-slide"><img src="'+ picArray[i] +'"/></div>' ;
			}
			$(".swiper-wrapper").append($(str));
			//保存当前的商品的图片地址到立即购买按钮上
			if(picArray.length > 1){
				var mySwiper = new Swiper('.swiper-container', {
					loop: false,
					autoplay: 3000,
					speed:	300,
					scrollbar:'.swiper-scrollbar',
					scrollbarHide : false,
					scrollbarDraggable : true ,
					scrollbarSnapOnRelease : true ,
				});
			}
			getGoodSkuInfo();
		},
		error: function () {
			//todo
		}
	})
};

getGoodDetail();





//获取评论列表
var getComment = function () {
	$.get(port + '/card/comment/list?currentPage=' + 1 + '&type=' + 3 + '&itemId=' + itemId,function (result) {
		if(result.list.length == 0){
			$('.wrapper>.content >span').html( '暂无评论');
		}else {
			$('.wrapper>.content >span').html( '共有' + result.rowCount + '条评论');

			//查看更多评论
			$('.wrapper>.content').click(function () {
				window.location.href = 'comment.html?type=' + 3 + '&itemId=' + itemId;
			});
		}
	});
};
getComment();






// 获取商品 sku 详细信息
var getGoodSkuInfo = function () {
	$.ajax({
		type: "get",
		url: port + "/card/goods/" + itemId + "/sku",
		dataType: "json",
		success: function (result) {
			sureGoodInfo(result);
		},
		error: function () {
			//todo
		}
	})
};


// 对弹出框 进行 商品各个规格 赋值
var sureGoodInfo = function (data_sku) {

	$('#goodDetail >.name>.goodHeadPic').attr('src',data_pic);
	// $('#goodDetail >.name>.info').append('<li class="price">+'data.'+</li><li></li><li></li>');

	var speStr = '';
	for(var i=0; i<data_sku.length; i++){
		speStr += '<li class="spe" data-num=" '+ i +' ">'+ data_sku[i].skuGague +'</li>'
	}
	$('#speList').append(speStr);



	//初始化 默认值
	$('.wrapper>.primeCost>span').html('￥ ' + data_sku[0].marketPrice.toFixed(2));
	$('.wrapper>.currentCost>span').html('￥ ' + data_sku[0].skuPrice.toFixed(2));
	$('.wrapper>.stock >span').html( data_sku[0].skuGague + '×'+ buyNum);  // 默认是1
	$('#goodDetail>.specifications li').eq(0).addClass('active');
	$('#goodNum').val(1);  // 默认是1
	stockNum = data_sku[0].stockNumber;
	chooseSpeStr = data_sku[0].skuGague;
	current_skuId = data_sku[0].skuId;
	url_obj.subTitle = chooseSpeStr;
	url_obj.skuId = current_skuId;
	url_obj.cost = data_sku[0].skuPrice;

	oneSpe(data_sku[0]);


	//每个型号选择
	$('#goodDetail>.specifications li').click(function () {
		
		$('.wrapper>.primeCost>span').html('￥ ' + data_sku[parseInt($(this).attr('data-num'))].marketPrice.toFixed(2));
		$('.wrapper>.currentCost>span').html('￥ ' + data_sku[parseInt($(this).attr('data-num'))].skuPrice.toFixed(2));
		stockNum = data_sku[ parseInt($(this).attr('data-num')) ].stockNumber;
		chooseSpeStr = data_sku[ parseInt($(this).attr('data-num')) ].skuGague;
		current_skuId = data_sku[ parseInt($(this).attr('data-num')) ].skuId;

		url_obj.subTitle = chooseSpeStr;
		url_obj.skuId = current_skuId;
		url_obj.cost = data_sku[ parseInt($(this).attr('data-num')) ].skuPrice;

		if($(this).hasClass('active')){
			return
		}else {
			$(this).addClass('active').siblings().removeClass('active');
		}

		oneSpe( data_sku[ parseInt($(this).attr('data-num')) ] );
	});
}



//点击 具体规格时候
var oneSpe = function (sku_info) {

	$('#goodDetail>.name>.price').html('￥ ' + sku_info.skuPrice.toFixed(2));
	$('#goodDetail>.name>.count').html('库存' + sku_info.stockNumber + ' 件');
	$('#goodDetail>.name>.spe>span').html(sku_info.skuGague);

}



//加减
$('#plus').click(function () {
	if( $('#goodNum').val() == stockNum){
		$.alert("数量不能大于库存");
		return;
	}
	if(buyNum < stockNum){
		buyNum++ ;
		$('#goodNum').val(buyNum);
		$('.wrapper>.stock >span').html( chooseSpeStr + '×'+ buyNum);

		url_obj.num = buyNum ;
	}else {
		$.alert("数量不能大于库存");
		return;
	}
});

$('#sub').click(function () {
	if(buyNum > 1 && buyNum <= stockNum){
		buyNum--;
		$('#goodNum').val(buyNum);
		$('.wrapper>.stock >span').html( chooseSpeStr + '×'+ buyNum);

		url_obj.num = buyNum ;
	}else {
		$.alert("数量不能小于1");
		return;
	}
});



//加入购物车
var addToShoppingCartFn = function () {
	$.ajax({
		type: 'post',
		dataType: "json",
		contentType: "application/json",
		url: port+"/card/car/goods?token="+token+"&=3",
		data: JSON.stringify({
			"num": $('#goodNum').val(),     // 该商品数量
			"skuId": current_skuId         // 商品规格ID
		}),
		success: function (result) {
			$.modal({
				title: "提示",
				text: "加入购物车成功",
				buttons: [
					{ text: "去购物车", onClick: function(){window.location.href = 'shoppingCart.html'}},
					{ text: "确定", className: "default", onClick: function(){}}
				]
			});
		},
		error: function () {
			//todo
		}
	});
};


//确认购买
var sureBuyNowFn = function () {
	//brandDetail 用于判断从哪里进行支付， 以便于删除点但之后返回哪里去
	window.location.href = "fillInOrder.html?brandDetail&cost=" + url_obj.cost + "&&goodsId="+ url_obj.goodsId+ "&&num=" +url_obj.num+ "&&pic=" +url_obj.pic+ "&&skuId="+url_obj.skuId+ "&&subTitle="+url_obj.subTitle + "&&title="+url_obj.title ;
}











// 弹出层 确认 操作，  从  立即购买/加入购物车/选择 三个按钮进入至此弹出层
$('#goodDetail>button').click(function () {
	if($(this).html() == '确认加入'){
		if (token){
			addToShoppingCartFn();
		}else {
			$.alert("登陆后再收藏", "收藏失败", function() {
				window.location.href = "login.html?his=" + escape(his);
			});
		}
	}else if($(this).html() == '确认购买'){
		if (token){
			sureBuyNowFn();
		}else {
			$.alert("登陆后再购买", "购买失败", function() {
				window.location.href = "login.html?his=" + escape(his);
			});
		}
	}
});

$('#sureAdd').click(function () {
	if (token){
		addToShoppingCartFn();
	}else {
		$.alert("登陆后再收藏", "收藏失败", function() {
			window.location.href = "login.html?his=" + escape(his);
		});
	}
});
$('#sureBuyNow').click(function () {
	if (token){
		sureBuyNowFn();
	}else {
		$.alert("登陆后再购买", "购买失败", function() {
			window.location.href = "login.html?his=" + escape(his);
		});
	}
});





//加入购物车 立即购买  选择   三个按钮点击事件
$('#addToShoppingCart ,#buyNow, .wrapper>.stock').click(function () {
	if($(this).attr('id') == 'addToShoppingCart'){
		$('#goodDetail>.btnBox').hide();
		$('#goodDetail>button').show();
		$('#goodDetail>button').html('确认加入');
	}else  if($(this).attr('id') == 'buyNow'){
		$('#goodDetail>.btnBox').hide();
		$('#goodDetail>button').show();
		$('#goodDetail>button').html('确认购买');
	}else{
		$('#goodDetail>.btnBox').show();
		$('#goodDetail>button').hide();
	}

	$('footer').hide();
	$('#mask').fadeIn(150);
	$("#goodDetail").show().animate({
		height:'65%'
	});
});




//选择规格的滚动条 滚动时候不受外部滚动条印象
$('#speList').hover(function () {
	
});






//弹出层
$('#mask').click(function () {
	$(this).fadeOut(150);
	$('#goodDetail').animate({
		height:'0'
	});
	setTimeout('$("#goodDetail").hide()',200);
	$('footer').show();
});

//关闭弹出
$("#goodDetail>.name>.close").click(function () {
	$('#mask').click();
});






//分享
$('.saveAndShare>.share').click(function () {
	$("#share-mask").show();
});
$("#share-mask").click(function () {
	$("#share-mask").hide();
});




$(".details>p").click(function () {
	if($(this).hasClass('active')){
		return;
	}else {
		$(this).addClass('active').siblings().removeClass('active');
		if($(this).hasClass('brandDetail')){
			$(".message_1").show();
			$(".message_2").hide();
		}else {
			$(".message_1").hide();
			$(".message_2").show();
		}
	}
});