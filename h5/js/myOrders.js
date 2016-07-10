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
	//订单加载
	function getAppointment(currentPage,size){
		$.ajax({
			type:"get",
			url:port+"/card/apply?currentPage="+currentPage+"&size="+size+"&token="+token,
			success:function(data){
				console.log(data);
				var state;
				$(".appointment").html("");
		    	if(typeof(data) == "string"){
					window.location.href = "login.html?his="+his;
				}else{
					if(data.list.length==0){
						var strEmpty = '<center><img src="imgs/save_.png"/><h2>你还没有预约任何活动</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>';
						$(".appointment").append(strEmpty);
						$(".appointment .turnPage").click(function(){
								window.location.href = "culb.html";
						});
						return;
					}
					for(var i=0,len=data.list.length;i<len;i++){
						if(data.list[i].applyPrice == 0){//付款与否的状态确定
							state = "免费";
						}else{
							if(data.list[i].isPay==0){
								state = "未付款";
							}else if(data.list[i].isPay==1){
								state = "已付款";
							}
						}
	                    var str = $('<div class="singleAppointment" data-id="'+data.list[i].applyId+'"><img src="'+data.list[i].activity.maxPic+'"/><div class="detail"><h4>'+data.list[i].activity.activityTitle+'</h4><span>'+state+'</span><p class="time"><img src="imgs/time.png"/>'+new Date(data.list[i].activity.startTime*1000).Formate()+'-'+new Date(data.list[i].activity.endTime*1000).Formate()+'</p><p class="address"><img src="imgs/address.png"/>'+data.list[i].activity.activityAddress+'</p></div></div>');
	                    $(".appointment").append(str);
					}
					//添加事件，到详细    enrollMsg.html
					$(".singleAppointment").bind("click",function(){
						window.location.href = "enrollMsg.html?applyid="+$(this).data("id");
					});
				}
			}
		});
	}
		
	//主要 切换选项卡，活动预约与商品订单切换按钮
	$(".appointments").click(function(){
		// getMessage(1);
		doCss(this);
		getAppointment(1,100);
		$(".wrapper").css("display","none");
		$(".appointment").css("display","block");
	});
	$(".commodityOrder").click(function(){
		// getMessage(2);
		doCss(this);
		$(".wrapper").css("display","block");
		$(".appointment").css("display","none");
	});
	$(".appointments").click();
    //处理选项卡公共的事件
    function doCss(self){
		$(self).css("border-bottom","1px solid #6b6b6b;").css("color","#6b6b6b");
		$(self).siblings().css("border-bottom","none").css("color","#b2b2b2");
    }
    //二级 商品订单下的切换按钮
    $(".header div").bind("click",function(){
    	doCss2(this);
    	console.log($(this).data("orderstate"));
    	getOrders(1,1000,$(this).data("orderstate"));
    });
    $(".header div.allApo").click();
    function doCss2(self){
    	$(self).css("background-color","#b7a66e").css("color","#fff");
    	$(self).siblings().css("background-color","#fff").css("color","#9f9f9f");
    }    
    //获取订单详情
    //http://121.196.232.233/card/order/admin?currentPage={pagenum}&size={size}&orderState=0&token=e7120d7a-456b-4471-8f86-ac638b348a53
    // 备注:orderState 订单状态，0:全部,1：未付款，2：已付款，3：已发货，4：已退款，5：交易关闭，6：已收货
    function getOrders(currentPage,size,orderState){
    	$.ajax({
    		type:"get",
    		aysnc:true,
    		url:port+"/card/order?currentPage="+currentPage+"&size="+size+"&orderState="+orderState+"&token="+token,
    		dataType:"json",
    		contentType:"application/json;charset=UTF-8",
    		success:function(data){
				console.log(data);
				// 这里添加一个注释，购物车区分不同的添加方法，从购物车里边添加进来的时候，商品是完全分开的，每个商品都不一样，
				// 如果是直接购买的话商品是合并的。
				// 这里先要判断订单的来源，使用goodsAndSkuModels.length与orderModel.orderNumber进行对比
				$(".container").html("");
				if(data.list.length==0){
					var strEmpty = '<center><img src="imgs/save_.png"/><h2>该分类里没有商品</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>';
					$(".container").append(strEmpty);
					$(".container .turnPage").click(function(){
						window.location.href = "pierre.html";
					});
					return;
				}
				for(var i=0,len=data.list.length;i<len;i++){
					var str= "";
					var num = 1;
					var state = "";
					var url;
					if(data.list[i].goodsAndSkuModels.length==1){
						num = data.list[i].orderModel.orderNumber;
					}
					for(var j=0,len_=data.list[i].goodsAndSkuModels.length;j<len_;j++){
						str +='<img src="'+data.list[i].goodsAndSkuModels[j].goodsModel.maxPic+'"/><div class="msg"><h3>'+data.list[i].goodsAndSkuModels[j].goodsModel.goodsTitle+'</h3><p class="what">'+data.list[i].goodsAndSkuModels[j].skuModel.skuGague+'</p><p class="cost">￥'+formatePrice(data.list[i].goodsAndSkuModels[j].skuModel.skuPrice)+'</p><p class="number">×'+num+'</p></div>';
					}						
					if(data.list[i].orderModel.orderState ==1){
						state = "待付款";
						url = "unpaid.html?cardid="+data.list[i].orderModel.orderId;
					}else if(data.list[i].orderModel.orderState ==2){
						state = "已付款";
						url = "hadPaid.html?cardid="+data.list[i].orderModel.orderId;
					}else if(data.list[i].orderModel.orderState ==3){
						state = "已发货";
						url = "hadSent.html?cardid="+data.list[i].orderModel.orderId;
					}
					var html = $('<div class="singleMsg" data-url="'+url+'">'+str+'<div class="totleMsg"><p class="status">'+state+'</p><p class="detail">共'+data.list[i].orderModel.orderNumber+'件商品&nbsp;合计:￥'+data.list[i].orderModel.orderCount+'</p></div></div>');
				    $(".container").append(html);
				    //绑定点击跳转事件
				    $(".singleMsg").bind("click",function(){
				    	window.location.href = $(this).data("url");
					});
				}
    		},
    		error:function(data){
				console.log(data);
    		}
    	});
    }
});
//格式化两行换行
function less_q(text,length){
    // var text = $('.tit-wrap .detile p');
    var textLen = length;
    for(var k=0,len=text.length;k<len;k++){
        // console.log($(text[k]).html());
        if($(text[k]).html().length>textLen){
            var str = $(text[k]).html().substring(0,textLen)+"..."
            $(text[k]).html(str);
        }
    }
}
//格式化时间，在date原形上边添加方法
Date.prototype.Formate=function(){
    var y=this.getFullYear();
    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
	var h=this.getHours()>9?this.getHours():'0'+this.getHours();
	var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
    return (y+'-'+m+'-'+d+' '+h+':'+f);
}