

$(document).ready(function(){

	//获取token
	var token = "";
	//获取存在于cookie中的token值
	token = getCookie("token");//便于本地测试
	//获取页面的名称
	var hrefStr = window.location.search;
	var cardid = hrefStr.split("=")[1];
	var goodId = hrefStr.split("=")[2];   //goodId
	var orderStateStr = GetQueryString('orderState');
	var orderState = 0;

	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	//查询物流详情的 物流订单号
	var  expressId = 0;

	//请求微信支付所需的参数
	var ip = String(returnCitySN["cip"]);
	var applyid = '';

	var appid =  '';
	var nonceStr = '';
	var package = '';
	var myDate = new Date();
	var timeStamp = '';
	var stringA ='' ;
	var stringSignTemp = '';
	var sign = '';


	//获取页面数据
	// 备注:orderState 订单状态，0:全部,1：待付款，2：已付款，3：已发货，4：已退款，5：交易关闭，6：已收货
	$.ajax({
		type:"get",
		url:port+"/card/order/v2/"+cardid+"?token="+token,
		success:function(data){
			expressId = data.orderModel.expressId ;
			var str= "";
			if(!data){
				window.location.href = 'index.html'
			}
			orderState = data.orderModel.orderState;
			if(data.orderModel.orderState==1){
				orderStateStr = '待付款';
			}else if(data.orderModel.orderState==2){
				orderStateStr = '待发货';
				$('footer').hide();
			}else if(data.orderModel.orderState==3){
				orderStateStr = '已发货';
			}else if(data.orderModel.orderState==4){
				orderStateStr = '已退款';
			}else if(data.orderModel.orderState==5){
				orderStateStr = '交易关闭';
			}else if(data.orderModel.orderState==6){
				orderStateStr = '已收货';
			}else {
				orderStateStr = '全部';
			}
			var cancelOrderStr = orderState==1 ? '<button id="cancelOrder">取消订单</button>' : '' ;
			var orderInfoStr = '<h3>订单信息</h3><ul><li><span>订单编号:</span><span>'+data.orderModel.orderId+'</span></li>' +
				'<li><span>下单时间:</span><span>'+new Date(data.orderModel.createTime*1000).Formate()+'</span></li>' +
				'<li><span>订单状态:</span>'+cancelOrderStr+'<span>'+orderStateStr+'</span></li></ul>';
			$('#info').children('.orderInfo').html(orderInfoStr);
			$("#cancelOrder").bind("click",function(){
				cancelOrderFn($("#cancelOrder"));
			});

			var goodInfoStr = '';
			for(var i=0;i<data.detailOrderModels.length;i++){
				goodInfoStr += '<div class="itemGood" data-goodId="'+ data.detailOrderModels[i].goodsId +'">' +
					'<img src="'+data.detailOrderModels[i].hotPic+'">' +
					'<div><h4>'+data.detailOrderModels[i].goodsTitle+'</h4><p>'+data.detailOrderModels[i].skuGague+'</p>' +
					'<p><span class="price">￥'+data.detailOrderModels[i].skuPrice.toFixed(2)+'</span>' +
					'<span class="num">×'+ data.detailOrderModels[i].count+'</span></p></div></div><div></div>';
			}
			//var tellStr = '<div class="tell"><a href="tel:">联系白金尊享</a><span><img src="imgs/enjoy/right.png" style="width: 0.02rem"></span></div>';
			$('#info').children('.goodInfo').append(goodInfoStr);
			if(window.location.href.indexOf('brandDetail') > 0 ){
				goodId = data.detailOrderModels[0].goodsId;
			}

			//总价格
		    $('#info').find('.totalPay').html('￥'+data.orderModel.orderCount);
			$('#info').find('.realPay').html('实付款: ￥'+data.orderModel.orderCount);
			
			//保存id到删除按钮
			$("#cancelOrder").attr("data-receiveid",data.orderModel.orderId);
			$(".f_2").attr("data-cardid",data.orderModel.orderId);
			
			//备注
			$('#info').find('.remarkCnt').html(data.orderModel.orderRemark || '暂无备注');
			$('#info').find('.remark').click(function () {
				if($(this).hasClass('active')){
					$(this).removeClass('active');
					$('#info').find('.remarkCnt').show();
				}else {
					$(this).addClass('active');
					$('#info').find('.remarkCnt').hide();
				}

			});
			
			//这里需要拿到收货人的receiveId再来请求收货地址以及相关的东西
			$.ajax({
				type:"get",
				url:port+"/card/receiver/"+data.orderModel.receiveId+"?token="+token,
				success:function(data){
					var headrStr = orderState==3 ? '<h3>配送信息<a href="logisticsInfo.html?expressId='+expressId+'"">查看物流 ></a></h3>'
						: '<h3>配送信息</h3>';
					var addressStr = headrStr + '<ul><li><span>收货人:</span><span>'+data.receiverName+'</span></li>' +
						'<li><span>联系电话:</span><span>'+data.receiverPhone+'</span></li>' +
						'<li class="adderDetail"><span>收货地址:</span>' +
						'<span>'+data.province+data.city+data.district+data.detilAddress+'</span>' +
						'</li></ul>';
					$('#info').children('.addressInfo').html(addressStr);
				},
				error:function(data){
					//todo
				},
			});

			//点击跳转到相应的商品页面
			$('.itemGood').click(function () {
				window.location.href = 'brandDetail.html?id=' + $(this).attr('data-goodId')
			});

			applyid = data.orderModel.orderId;   //微信请求参数时候用到
		},
		error:function(data){
			//todo
		}
	});


	var isWxParam = true;   //为true时候表示 参数请求成功，可以唤起微信支付。
	var requestWxParam = function () {
		// 微信请求参数
		$.showLoading('支付请求中');
		$.ajax({
			type: "get",
			url: port + "/card/weixin/getRepay?orderId=" + applyid + "&token=" + token + "&type=1&ipAddress=" + ip ,
			success: function (result) {
				appid =  String(result.appId);
				nonceStr = String(result.nonceStr);
				package = String(result.package);
				timeStamp = String(myDate.getTime());

				stringA = "appId=" + appid + "&nonceStr=" + nonceStr + "&package=" + package + "&signType=MD5&timeStamp=" + timeStamp ;
				stringSignTemp = stringA + "&key=29798840529798840529798840529798";
				sign = hex_md5(stringSignTemp).toUpperCase();
				if(result){
					isWxParam = true;
				}
			},
			error:function(){
				isWxParam = false;
			}
		});
	};


	//取消订单事件操作
	function cancelOrderFn($btn) {
		var f_1Jo = $btn;
		$.confirm("确定取消该订单？", function() {
			$.ajax({
				type:"DELETE",
				dataType:"json",
				contentType:"application/json;charset=UTF-8",
				url:port+"/card/order/"+ f_1Jo.data("receiveid") +"?token="+token,
				success:function(data){
					$.toast("取消订单成功", function() {
						if(window.location.search.indexOf('brandDetail') > 0){
							window.location.href = "brandDetail.html?id=" + goodId;
						}else if(window.location.search.indexOf('isShopCart') > 0){
							window.location.href = "shoppingCart.html";
						}else {
							window.location.href = "myOrders.html#goodsOrder";
						}
					});
				},
				error:function(data){
					$.alert("取消订单失败");
				}
			});
		}, function() {
			//点击取消后的回调函数
		});
	};


	//去支付
	$(".f_2").bind("click",function(){
		$.actions({
			title: "请选择支付方式",
			onClose: function() {},
			actions: [
				{
					text: "银行卡支付",
					className: "color-warning",
					onClick: function() {  //跳转 银行卡支付
						//window.location.href = "payIFrame.html?cardid=" + cardid;
						window.location.href = 'pay.html?cardid=' + cardid;
					}
				},
				{
					text: "微信支付",
					className: "color-primary",
					onClick: function() {
						requestWxParam();
						setTimeout(function () {
							$.hideLoading();
							if(isWxParam){
								function onBridgeReady(){
									WeixinJSBridge.invoke(
										'getBrandWCPayRequest', {
											"appId" : appid,     //公众号名称，由商户传入
											"timeStamp": timeStamp,         //时间戳，自1970年以来的秒数
											"nonceStr" : nonceStr, //随机串
											"package" : package,
											"signType" : "MD5",         //微信签名方式：
											"paySign" : sign  //微信签名
										},
										function(res){		// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
											if(res.err_msg == "get_brand_wcpay_request：ok" ) {
											}
										}
									);
								}
								if (typeof WeixinJSBridge == "undefined"){
									if( document.addEventListener ){
										document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
									}else if (document.attachEvent){
										document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
										document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
									}
								}else{
									onBridgeReady();
								}
							}else {
								$.alert('支付失败',function(){
									location.reload();
								})
							}
						},2000);

					}
				},
			]
		});
	});


	//已付款  订单的 详情页面
	if(orderState == '3'){
		$('.logistical').show();
		$('footer').html('').append('<p class="confirmReceipt">确认收货</p>');
		$('.logistical a').click(function () {
			window.location.href = "logisticsInfo.html?expressId=" + expressId ;
		});
	}
});


//格式化时间，在date原形上边添加方法
Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
	var h=this.getHours()>9?this.getHours():'0'+this.getHours();
	var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
    return (y+'-'+m+'-'+d+' '+h+':'+f);
}