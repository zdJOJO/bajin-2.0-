$(document).ready(function(){
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
	var applyid = window.location.search.split('&')[0].split("=")[1];
	var createTime = parseInt(window.location.search.split('&')[1].split("=")[1]);
	var price = parseFloat(window.location.search.split('&')[2].split("=")[1]);



	//请求微信支付所需的参数
	var ip = String(returnCitySN["cip"]);

	var appid =  '';
	var nonceStr = '';
	var  package = '';
	var myDate = new Date();
	var timeStamp = '';
	var stringA ='' ;
	var stringSignTemp = '';
	var sign = '';


	//计时器
	//判断是否超过30min
	if(price > 0){
		$('#timer').show();
		var leftTime = createTime + 1800 - parseInt(new Date().getTime()/1000);
		function timer() {
			if(leftTime == 0){
				$('footer').hide();
			}
			var minute = Math.floor(leftTime/60);
			var second = leftTime - minute*60;

			var min = minute < 10 ? '0'+ minute : minute ;
			var sec = second < 10 ? '0' + second-- : second-- ;

			$('#min').html('支付剩余时间' + min + ':');
			$('#second').html(sec);
			leftTime--
		}
		var timeP = setInterval(timer,1000);
		if(leftTime == 0){
			clearInterval(timeP);
		}
	}
	
	$.ajax({
		type:"get",
		url:port+"/card/apply/"+applyid+"?token="+token,
		success:function(data){
			if(data.isPay == 1){
				$('footer').hide();
			}
			$(".detailUrl .left img").attr("src",data.activity.activityPic);
			$(".detailUrl .right h2").html(data.activity.activityTitle)
			$(".detailUrl .right .time span").html(new Date(data.activity.startTime*1000).Formate() + "-" +new Date(data.activity.endTime*1000).Formate());
			$(".detailUrl .right .address span").html(data.activity.activityAddress);
			$(".detailUrl").attr("data-activity",data.activityId);  
			console.log(data)
			//填写下半部分的字段
			$(".register").html(data.applyName);
			$(".telephone").html(data.applyPhone);
			$(".email").html(data.applyEmail);//字段不明
			$(".number").html(data.applyNumber);
			// $(".cost").html("0");//字段不明
			$(".remark").html(data.applyRemark);
			var cost = data.applyPrice*data.applyNumber;
			cost = cost==0?"免费活动":"￥"+cost;
			console.log(cost);
			$(".cost").html(formatePrice(cost));
			console.log(data.isPay);
			console.log(data.applyPrice);			
			if(data.isPay==0){
				$("footer p").css("display","block");
			}
			//注册事件
			$(".detailUrl").click(function(){
				window.location.href = "enrol.html?id="+$(this).data("activity")
			});


			//9292端口为测试环境，真实环境的话需要去掉端口号
			$.ajax({
				type: "get",
				url:  port + "/card/weixin/getRepay?orderId=" + applyid + "&token=" + token + "&type=0&ipAddress=" + ip ,
				success: function (result) {
					appid =  String(result.appId);
					nonceStr = String(result.nonceStr);
					package = String(result.package);
					timeStamp = String(myDate.getTime());

					stringA = "appId=" + appid + "&nonceStr=" + nonceStr + "&package=" + package + "&signType=MD5&timeStamp=" + timeStamp ;
					stringSignTemp = stringA + "&key=29798840529798840529798840529798";
					sign = hex_md5(stringSignTemp).toUpperCase();
				}
			});



	    },
		error:function(data){
			console.log(data)
		}
	});





	//去付款的跳转
	$("footer p").bind("click",function(){
		$.actions({
			title: "请选择支付方式",
			onClose: function() {},
			actions: [
				{
					text: "银行卡支付",
					className: "color-warning",
					onClick: function() {  //跳转 银行卡支付
					//	window.location.href = "payIFrame.html?id="+applyid;
						window.location.href = "pay.html?id="+applyid;

					}
				},
				{
					text: "微信支付",
					className: "color-primary",
					onClick: function() {
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
								function(res){
									if(res.err_msg == "get_brand_wcpay_request：ok" ) {}     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
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
					}
				},
			]
		});
	});



});

var t=60;
var a=setInterval(daojishi,1000);//1000毫秒
function daojishi(){
	t--;

//刷新时间显示
	if(t==0){
		clearInterval(a);
		//倒计时结束

	}

}




Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
	var h=this.getHours()>9?this.getHours():'0'+this.getHours();
	var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
	var s=this.getSeconds()>9?this.getSeconds():'0'+this.getSeconds();
	if( (h=='00' && f=='00') || (h=='23' && f=='59')){
		return (y+'.'+m+'.'+d);
	}else {
		return (y+'.'+m+'.'+d+' '+h+':'+f);
	}

}