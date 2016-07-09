

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
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	// 获取数据，填写到页面
	var cardid=window.location.search.split("=")[1];
	$.ajax({
		type:"get",
		url:port+"/card/order/"+cardid+"?token="+token,
		async:true,
		success:function(data){
			console.log(data);
			var str= "";
			var num = 1;
			if(data.goodsAndSkuModels.length==1){
				num = data.orderModel.orderNumber;
				str = $('<img src="'+data.goodsAndSkuModels[0].goodsModel.maxPic+'"/><div><div class="title">'+data.goodsAndSkuModels[0].goodsModel.goodsTitle+'</div><div class="subtitle">'+data.goodsAndSkuModels[0].skuModel.skuGague+'</div><div class="cost"><p>￥&nbsp;'+formatePrice(data.goodsAndSkuModels[0].skuModel.skuPrice)+'</p><p>×'+num+'</p></div></div>');			
			}else{
				for(var i=0,len=data.goodsAndSkuModels.length;i<len;i++){
					str += '<img src="'+data.goodsAndSkuModels[i].goodsModel.maxPic+'"/><div><div class="title">'+data.goodsAndSkuModels[i].goodsModel.goodsTitle+'</div><div class="subtitle">'+data.goodsAndSkuModels[i].skuModel.skuGague+'</div><div class="cost"><p>￥&nbsp;'+formatePrice(data.goodsAndSkuModels[i].skuModel.skuPrice)+'</p><p>×1</p></div></div>';			
				}
			}
			//插入商品信息
			$(".good").append(str);
			//总价格
		    $(".cost_unpaid span").html(formatePrice(data.orderModel.orderCount));
			//保存id到删除按钮
			$(".f_1").attr("data-receiveid",data.orderModel.orderId);
			//这里需要拿到收货人的receiveId再来请求收货地址以及相关的东西
			$.ajax({
				type:"get",
				url:port+"/card/receiver/"+data.orderModel.receiveId+"?token="+token,
				success:function(data){
					console.log(data);
					//插入收货人的地址和收货人的姓名
					$(".person").html(data.receiverName+"<span>收</span>");
					$(".adr").html(data.province+data.city+data.district+"&nbsp;"+data.detilAddress)
				},
				error:function(data){
					console.log(data);
				},
			});
		},
		error:function(data){
			console.log(data);
		}

	});


    var str = $("iframe");
    console.log(str);
	//物流消息测试   跨域问题，暂时不能解决
	//http://api.jisuapi.com/express/query?appkey=ed7720bd1cc55ee4&type=sfexpress&number=881832667983024580
	// $.ajax({
	// 	type:"get",
	// 	dataType:"jsonp",
	// 	jsonp:"jsoncallback",
	// 	url:"http://api.jisuapi.com/express/query?appkey=ed7720bd1cc55ee4&type=auto&number=881832667983024580",
	// 	success:function(data){
	// 		console.log(data);


	// 	},
	// 	error:function(data){
	// 		console.log(data);
	// 	}

 //    });



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