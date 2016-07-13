

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
	//获取页面的名称
	var hrefStr = window.location.search;
	var cardid = hrefStr.split("=")[1];

	var his = window.location.pathname.split("/");
	his = his[his.length-1];



	//给url 设置tab标志，方便返回到哪里去
	var tabStr = 'allApo';
	if( hrefStr.indexOf('waittingForApo') > 0){
		tabStr = 'waittingForApo';
	}
	if(hrefStr.indexOf('havePaidApo') > 0){
		tabStr = 'havePaidApo';
	}
	if(hrefStr.indexOf('havePostApo') > 0){
		tabStr = 'havePostApo';
	}


	
	//请求微信支付所需的参数
	var ip = String(returnCitySN["cip"]);;
	var applyid = '';

	var appid =  '';
	var nonceStr = '';
	var  package = '';
	var myDate = new Date();
	var timeStamp = '';
	var stringA ='' ;
	var stringSignTemp = '';
	var sign = '';

	

	//获取页面数据
	$.ajax({
		type:"get",
		url:port+"/card/order/"+cardid+"?token="+token,
		success:function(data){
			var str= "";
			var num = 1;
			if(data.goodsAndSkuModels.length==1){
				num = data.orderModel.orderNumber;
				str = '<div class="goodBox"><img src="'+data.goodsAndSkuModels[0].goodsModel.maxPic+'"/>' +
					'<div><div class="title">'+data.goodsAndSkuModels[0].goodsModel.goodsTitle+'</div>' +
					'<div class="subtitle">'+data.goodsAndSkuModels[0].skuModel.skuGague+'</div>' +
					'<div class="cost"><p>￥&nbsp;'+formatePrice(data.goodsAndSkuModels[0].skuModel.skuPrice)+'</p>' +
					'<p>×'+num+'</p></div></div></div>';
			}else{
				for(var i=0,len=data.goodsAndSkuModels.length;i<len;i++){
					str += '<div class="goodBox"><img src="'+data.goodsAndSkuModels[i].goodsModel.maxPic+'"/><div>' +
						'<div class="title">'+data.goodsAndSkuModels[i].goodsModel.goodsTitle+'</div>' +
						'<div class="subtitle">'+data.goodsAndSkuModels[i].skuModel.skuGague+'</div>' +
						'<div class="cost"><p>￥&nbsp;'+formatePrice(data.goodsAndSkuModels[i].skuModel.skuPrice)+'</p><p>×1</p></div></div></div>';
				}
			}
			//插入商品信息
			$(".good").append(str);
			//总价格
		    $(".cost_unpaid span").html('￥ ' + formatePrice(data.orderModel.orderCount));
			//保存id到删除按钮
			$(".f_1").attr("data-receiveid",data.orderModel.orderId);
			$(".f_2").attr("data-cardid",data.orderModel.orderId);
			//这里需要拿到收货人的receiveId再来请求收货地址以及相关的东西
			$.ajax({
				type:"get",
				url:port+"/card/receiver/"+data.orderModel.receiveId+"?token="+token,
				success:function(data){
					//插入收货人的地址和收货人的姓名
					$(".person").html(data.receiverName+"<span>收</span>");
					$(".adr").html(data.province+data.city+data.district+"&nbsp;"+data.detilAddress)
				},
				error:function(data){
					//todo
				},
			});


			applyid = data.orderModel.orderId;   //微信请求参数时候用到

			//插入订单编号
			$(".time p:nth-child(1) span").html(data.orderModel.orderId);
			//插入时间
			$(".time p.createTime span:nth-child(1)").html(new Date(data.orderModel.createTime*1000).Formate());
		},
		error:function(data){
			//todo
		}
	});



	var isWxParam = true;   //为true时候表示 参数请求成功，可以唤起微信支付。
	var requestWxParam = function () {
		$.showLoading('请求支付中');
		// 微信请求参数
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
					$.hideLoading();
				}
			},
			error:function(){
				isWxParam = false;
				$.hideLoading();
			}
		});
	};






	//取消订单事件操作
	//http://121.196.232.233/card/order/{id}
	$(".f_1").bind("click",function(){
		var f_1Jo = $(".f_1");
		$.confirm("确定取消该订单？", function() {
			$.ajax({
				type:"DELETE",
				dataType:"json",
				contentType:"application/json;charset=UTF-8",
				url:port+"/card/order/"+ f_1Jo.data("receiveid") +"?token="+token,
				success:function(data){
					$.toast("取消订单成功", function() {
						if(window.location.search.indexOf('brandDetail') > 0){
							window.location.href = "brandDetail.html";
						}else {
							window.location.href = "myOrders.html?" + tabStr;   //waittingForApo
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
	});


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
						window.location.href = "payIFrame.html?cardid=" + cardid;
					}
				},
				{
					text: "微信支付",
					className: "color-primary",
					onClick: function() {
						requestWxParam();
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

					}
				},
			]
		});
	});
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