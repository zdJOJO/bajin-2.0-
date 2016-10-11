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
	token = getCookie("token");
	//获取页面的名称
	var hisStr = window.location.pathname.split("/");
	var his = hisStr[hisStr.length-1];


	//点击活动预约    主要 切换选项卡，活动预约与商品订单切换按钮
	$(".appointments").click(function(){
		doCss(this);
		$(".appointment").show().siblings('div').hide();
	});

	//点击商品订单
	$(".commodityOrder").click(function(){
		doCss(this);
		$(".wrapper").show().siblings('div').hide();
		$(".wrapper").children('.header').children('div').attr('data-classstr','commodityOrder');
		isDeleteAction = 0;
		to_OrderTab(whereLocationHere(isDeleteAction),0,'commodityOrder');
	});

	//点击乐享订单
	$(".enjoyOrder").click(function(){
		$(".enjoyList").html("");
		doCss(this);
		$(".enjoyer").show().siblings('div').hide();
		$(".enjoyer").children('.header').children('div').attr('data-classstr','enjoyOrder');
		isDeleteAction = 0;
		to_OrderTab(whereLocationHere(isDeleteAction),-2,'enjoyOrder');
	});


	// 判断 从哪里跳转此页面
	var isDeleteAction = -1;
	if(window.location.search.indexOf('allApo') > 0){
		isDeleteAction = 0;
	}
	if(window.location.search.indexOf('waittingForApo') > 0){
		isDeleteAction = 1;
	}
	if(window.location.search.indexOf('havePaidApo') > 0){
		isDeleteAction = 2;
	}
	if(window.location.search.indexOf('havePostApo') > 0){
		isDeleteAction = 3;
	}

	var orderTab = '';
	var whereLocationHere = function (num) {
		switch(num)
		{
			case 0:
				orderTab  = 'allApo';
				break;
			case 1:
				orderTab  = 'waittingForApo';
				break;
			case 2:
				orderTab  = 'havePaidApo';
				break;
			case 3:
				orderTab  = 'havePostApo';
				break;
		}
		return orderTab;
	}



	if(isDeleteAction == -1){
		doCss($(".appointments"));
		getAppointment(1,100);
		$(".wrapper").css("display","none");
		$(".appointment").css("display","block");
		$(".appointments").css("border-bottom", "3px solid #6b6b6b");
	}

	var page = 1;

	//对Tab进行渲染
	var to_OrderTab = function (str,orderState,classStr) {
		//选择第一级
		$('.'+ classStr).css({
			"border-bottom": "3px solid #6b6b6b",
			"color": "#6b6b6b",
		}).siblings().css({
			"border-bottom": "3px solid #fff",
			"color": "#b2b2b2"
		});
		$(".appointment").hide();


		if($(this).hasClass('commodityOrder')){
			$(".wrapper").show();
		}else if($(this).hasClass('enjoyOrder')){
			$(".enjoyer").show();
		}

		//选择第二级
		$("." + str).css({
			"background-color": "#b7a66e",
			"color": "#fff"
		}).siblings().css({
			"background-color": "#fff",
			"color": "#9f9f9f"
		});

		if(classStr == 'commodityOrder'){
			getOrders(1, 10,orderState);
		}else if( classStr== 'enjoyOrder'){
			getEnjorOrders(1,orderState)
		}

		$(window).unbind("scroll");    //为了防止当前列表的 滚动条 影响 另外一个页面的滚动条
		page = 1;
		try {
			scrollLoadOrder(orderState,classStr);
		} catch (e) {
			//todo
		}

	}

	if(isDeleteAction >= 0){
		to_OrderTab(whereLocationHere(isDeleteAction),isDeleteAction,'commodityOrder');
	}


	//处理选项卡公共的事件
	function doCss(self){
		$(self).css({
			'border-bottom': '3px solid #6b6b6b',
			"color": "#6b6b6b"
		}).siblings().css({
			"border-bottom": "3px solid #fff",
			"color": "#b2b2b2"
		});
	}

	function doCss2(self){
		$(self).css({
			"background-color": "#b7a66e",
			"color": "#fff"
		}).siblings().css({
			"background-color": "#fff",
			"color": "#9f9f9f"
		});

		//乐享订单
		if($(self).hasClass('active')){
			return
		}else {
			$(self).addClass('active').siblings().removeClass('active');
		}
		if($(self).children('a').hasClass('active')){
			return
		}else {
			$(self).children('a').addClass('active');
			$(self).siblings().children('a').removeClass('active');
		}

	}


	//二级 商品订单下的切换按钮
	$(".header>div").bind("click",function () {
		var num;
		orderTab = $(this).attr("class");
		if(orderTab=='allApo' || orderTab=='unPaid'){
			num  = 0 ;
		}else if(orderTab=='waittingForApo' || orderTab=='unUse'){
			num  = 1;
		}else if(orderTab=='havePaidApo' || orderTab=='finished'){
			num  = 2;
		}else if(orderTab=='havePostApo'){
			num = 3;
		}else {
			num  = -2 ;  //  乐享订单全部，num 不传
		}
		$(".container").html("");
		$(".enjoyList").html("");
		to_OrderTab(whereLocationHere(isDeleteAction),num,$(this).attr('data-classstr'));
		doCss2($(this));
	});


	//活动加载
	function getAppointment(currentPage,size){
		$.ajax({
			type:"get",
			url:port+"/card/apply?currentPage="+currentPage+"&size="+size+"&token="+token,
			success:function(data){
				var state;
				$(".appointment").html("");

				if(typeof(data) == "string"){
					// window.location.href = "login.html?his="+his;
				}else{
					if(data.list.length==0){
						var strEmpty = '<center><img src="imgs/save_.png"/><h2>你还没有预约任何活动</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>';
						$(".appointment").append(strEmpty);
						$(".appointment .turnPage").click(function(){
							window.location.href = "culb.html?joinAct";
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
						var str = $('<div class="singleAppointment" data-id="'+data.list[i].applyId+'" data-timeStamp="'+data.list[i].createTime+'" data-price="'+data.list[i].applyPrice+'">' +
							'<img src="'+data.list[i].activity.maxPic+'"/><div class="detail">' +
							'<h4>'+data.list[i].activity.activityTitle+'</h4>' +
							'<span>'+state+'</span><p class="time">' +
							'<img src="imgs/time.png"/>'+new Date(data.list[i].activity.startTime*1000).Formate()+' - '+new Date(data.list[i].activity.endTime*1000).Formate()+'</p>' +
							'<p class="address"><img src="imgs/address.png"/>'+data.list[i].activity.activityAddress+'</p></div></div>');
						$(".appointment").append(str);
					}
					//添加事件，到详细    enrollMsg.html
					$(".singleAppointment").bind("click",function(){
						var currentTime = new Date().getTime()/1000;
						if((currentTime - $(this).attr('data-timeStamp') >= 1800) && $(this).attr('data-price') != 0){
							alert('您没在规定时间内付款，活动预约已经取消');
							$(this).hide();
							return
						}else {
							window.location.href = "enrollMsg.html?applyid="+$(this).data("id")+"&createTime="+$(this).attr('data-timeStamp')+"&price="+$(this).attr('data-price');
						}
					});
				}
			}
		});
	}




	//滚动加载 订单
	var scrollLoadOrder = function (orderState,classStr) {
		$(window).bind("scroll",function(){
			var scrollTop = $(this).scrollTop();
			var scrollHeight = $(document).height();
			var windowHeight = $(this).height();

			console.log(scrollTop)
			console.log(windowHeight)
			console.log(scrollHeight)
			console.log('aaaaaaaaaaaa')

			if (scrollTop + windowHeight == scrollHeight) {
				page++;

				if(classStr == 'commodityOrder'){
					getOrders(page, 10, orderState);
				}else if(classStr == 'enjoyOrder'){
					getEnjorOrders(page, 10, orderState);
				}
			}
		});
	};




	//获取订单详情
	// 备注:orderState 订单状态，0:全部,1：未付款，2：已付款，3：已发货，4：已退款，5：交易关闭，6：已收货
	function getOrders(currentPage,size,orderState){
		if(orderState == 0){
			orderTab = 'allApo';
		}
		if(orderState == 1){
			orderTab = 'waittingForApo';
		}
		if(orderState == 2){
			orderTab = 'havePaidApo';
		}
		if(orderState == 3){
			orderTab = 'havePostApo';
		}

		if(currentPage == 1){
			$('#orderLoading').css('bottom','75%').show();
		}else {
			$('#orderLoading').css('bottom','6px').show();
		}

		$.ajax({
			type:"get",
			aysnc:true,
			dataType:"json",
			contentType:"application/json;charset=UTF-8",
			url:port+"/card/order/v2?currentPage="+currentPage+"&size="+size+"&orderState="+orderState+"&token="+token,
			success:function(data){
				// 这里添加一个注释，购物车区分不同的添加方法，从购物车里边添加进来的时候，商品是完全分开的，每个商品都不一样，
				// 如果是直接购买的话商品是合并的。
				// 这里先要判断订单的来源，使用goodsAndSkuModels.length与orderModel.orderNumber进行对比

				if(currentPage == 1 && data.list.length==0){
					var strEmpty = '<center><img src="imgs/save_.png"/><h2>该分类里没有商品</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>';
					$(".container").html(strEmpty);
					$(".container .turnPage").click(function(){
						window.location.href = "pierre.html?good";
					});
					$(window).unbind('scroll');
					$('#orderLoading').hide();
					return;
				}

				if(currentPage > 1 && data.list.length == 0){
					$(window).unbind('scroll');
					setTimeout(function () {
						$('#orderLoading').hide();
						$(".container >div:last-child").css('margin-bottom','0');
					},1500);
					return;
				}

				for(var i=0;i<data.list.length;i++){
					var str= "";
					var state = "";
					var url;

					for(var j=0; j<data.list[i].detailOrderModels.length;j++){
						str +='<img src="'+data.list[i].detailOrderModels[j].hotPic+'"/>' +
							'<div class="msg"><h3>'+data.list[i].detailOrderModels[j].goodsTitle+'</h3>' +
							'<p class="what">'+data.list[i].detailOrderModels[j].skuGague+'</p>' +
							'<p class="cost">￥'+formatePrice(data.list[i].detailOrderModels[j].skuPrice)+'</p>' +
							'<p class="number">×'+data.list[i].detailOrderModels[j].count+'</p></div>';
					}


					if(data.list[i].orderModel.orderState == 1){
						state = "待付款";
						url = +data.list[i].orderModel.orderId;
					}else if(data.list[i].orderModel.orderState == 2){
						state = "已付款";
						url = data.list[i].orderModel.orderId;
					}else if(data.list[i].orderModel.orderState == 3){
						state = "已发货";
						url = data.list[i].orderModel.orderId;
					}

					var html = $('<div class="singleMsg" data-url="'+url+'">'+str+'<div class="totleMsg">' +
						'<p class="status">'+state+'</p><p class="detail">' +
						'共'+data.list[i].orderModel.orderNumber+'件商品&nbsp;合计:￥'+ data.list[i].orderModel.orderCount.toFixed(2) + '</p></div></div>');

					$(".container").append(html);

					$(".container >div:last-child").css('margin-bottom','30px');
				}

				$('#orderLoading').hide();


				//绑定点击跳转事件
				$(".singleMsg").bind("click",function(){
					window.location.href = "unpaid.html?" + orderTab + "&&&" + "cardid=" + $(this).data("url");
				});
			},
			error:function(data){
			}
		});
	}


	//获取 乐享 订单
	//  -2全部  0待付款 1待使用 2已完成
	function getEnjorOrders(currentPage,orderState) {
		if(currentPage == 1){
			$('#orderLoading').css('bottom','75%').show();
		}else {
			$('#orderLoading').css('bottom','6px').show();
		}
		var urlStr = (orderState >=0) ? port+"/card/productorder/all?currentPage="+currentPage+"&status="+orderState+"&token="+token
			:  port+"/card/productorder/all?currentPage="+currentPage+"&token="+token ;
		$.ajax({
			type: "get",
			aysnc: true,
			dataType: "json",
			contentType: "application/json;charset=UTF-8",
			url: urlStr,
			success:function(res){
				if(currentPage == 1 && res.data.list.length==0){
					var strEmpty = '<center><img src="imgs/save_.png"/><h2>该分类里没有商品</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>';
					$(".enjoyList").html(strEmpty);
					$(".enjoyList .turnPage").click(function(){
						window.location.href = "pierre.html?brand";
					});
					$(window).unbind('scroll');
					$('#orderLoading').hide();
					return;
				}

				if(currentPage > 1 && res.data.list.length == 0){
					$(window).unbind('scroll');
					setTimeout(function () {
						$('#orderLoading').hide();
						$(".enjoyList >div:last-child").css('margin-bottom','0');
					},1500);
					return;
				}
				for(var i=0;i<res.data.list.length;i++){
					var str = "";
					var state = "";

					if(res.data.list[i].status == 0){
						state = "待付款";
					}else if(res.data.list[i].status == 1){
						state = "待使用";
					}else if(res.data.list[i].status == 2){
						state = "已完成";
					}else if(res.data.list[i].status == 3){
						state = "已取消";
					} else if(!res.data.list[i].status){
						state = "全部";
					}

					if(res.data.list[i].status == 0){
						var timerStr = '<li class="timer">支付倒计时 00:00</li>'
					}else {
						timerStr = '<li class="timer" style="height: 0"></li>';
					}
					str = $('<div class="itemOrder" data-orderid="'+res.data.list[i].id+'"><ul>' +
						'<li><span class="orderNum">订单编号:'+res.data.list[i].number+'</span><span class="state">'+state+'</span></li> ' +
						'<li><img src="'+res.data.list[i].productModel.pic+'"><span class="title">'+res.data.list[i].title+'</span></li>' +
						'<li><span>￥'+res.data.list[i].sumPrice.toFixed(2)+'</span><span class="pay">去付款</span></li>'+timerStr+'</ul> </div>');

					if( ((new Date().getTime()/1000 - res.data.list[i].createTime)< 60*30) && res.data.list[i].status == 0){
						enjoyTimer(res.data.list[i].createTime,str);
					}
					$(".enjoyList").append(str);
				}
				$(".enjoyList >div:last-child").css('margin-bottom','30px');

				$('#orderLoading').hide();

				//绑定点击跳转事件
				$(".itemOrder").bind("click",function(){
					window.location.href = 'enjoyOrderDetail.html?orderId=' + $(this).attr('data-orderid');
				});
			},
			error:function(data){
				//todo
			}
		});
	}


	$(window).unload(function(){
		window.location.href = 'index.html';
	});

});


//计时器
function enjoyTimer(creatTime,dom) {
	var leftTime = creatTime + 30*60 - parseInt(new Date().getTime()/1000);
	function timer() {
		// if(leftTime == 0){
		// 	$('#leftTime').hide();
		// }
		var minute = Math.floor(leftTime/60);
		var second = leftTime - minute*60;

		var min = minute < 10 ? '0'+ minute : minute ;
		var sec = second < 10 ? '0' + second-- : second-- ;

		dom.find('.timer').html('支付剩余时间: ' + min + ':' + sec);
		leftTime--
	}
	var timeP = setInterval(timer,1000);
	if(leftTime == 0){
		clearInterval(timeP);
	}
}


//格式化两行换行
function less_q(text,length){
	// var text = $('.tit-wrap .detile p');
	var textLen = length;
	for(var k=0,len=text.length;k<len;k++){
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
	return (y+'-'+m+'-'+d);
}