$(document).ready(function() {
	//获取token
	var token = getCookie("token");
	//获取页面的名称
	var hisStr = window.location.pathname.split("/");
	var his = hisStr[hisStr.length - 1];
	//监听url的hash
	var hashStr = location.hash.substring(1);
	$(window).hashchange(function () {
		hashStr = location.hash.substring(1);
		$('#'+hashStr).click();
	});

	var $activityOrder = $('#list').children('.activityOrder');
	var $goodsOrder = $('#list').children('.goodsOrder');
	var $enjoyOrder = $('#list').children('.enjoyOrder');
	var page = 1;

	getActivityOrderList(1);
	// 一级 nav
	$('.nav').children('a').click(function () {
		window.scrollTo(0,0);
		if($(this).hasClass('active')){
			return
		}else {
			var classStr = $(this).attr('href').substring(1);
			$(this).addClass('active').siblings().removeClass('active');
			$('#list').children('.'+classStr).show().siblings().html('').hide();
			$('header').find('.'+classStr).show().siblings().hide();
			if(classStr=='activityOrder'){
				$('header').find('div nav').hide();
			}
			var height = $('header').outerHeight();
			$('#list').css('margin-top',height);
			$(window).unbind("scroll");    //为了防止当前列表的 滚动条 影响 另外一个页面的滚动条
			if(classStr=='activityOrder'){
				page = 1;
				getActivityOrderList(1);
				scrollLoadOrder(0,'activity');
			}else if(classStr=='goodsOrder'){
				getGoodOrderList(1,0);
				scrollLoadOrder(0,'good');
			}else {
				getEnjoyOrderList(1,-2);
				scrollLoadOrder(-2)
			}
		}
	});

	// 二级 nav
	$('.subNav').children('a').click(function () {
		window.scrollTo(0,0);
		page = 1;
		if($(this).hasClass('active')){
			return
		}else {
			$(this).addClass('active').siblings().removeClass('active');
			var state = $(this).attr('data-state');
			$(window).unbind("scroll");    //为了防止当前列表的 滚动条 影响 另外一个页面的滚动条
			if($(this).hasClass('good')){
				$goodsOrder.html('');
				getGoodOrderList(1,state);
				scrollLoadOrder(state,'good');
			}else {
				$enjoyOrder.html('');
				getEnjoyOrderList(1,state);
				scrollLoadOrder(state);
			}
		}
	});


	//获取活动订单
	function getActivityOrderList(currentPage) {
		$('#loading').show();
		$.ajax({
			type: 'get',
			url: port+"/card/apply?currentPage="+currentPage+"&token="+token,
			success: function (res) {
				if(hashStr){
					$('#'+hashStr).click();
				}
				if(currentPage==1 && res.list.length == 0){
					noDataFn(1);
					$('#loading').hide();
					$(window).unbind('scroll');
					return
				}
				if(currentPage > 1 && res.list.length == 0){
					$(window).unbind('scroll');
					setTimeout(function () {
						$('#loading').hide();
					},1500);
					return;
				}

				var str = '';
				var state = '';
				for(var i=0,len=res.list.length;i<len;i++){
					if(res.list[i].applyPrice == 0){//付款与否的状态确定
						state = "会员专享";
					}else{
						if(res.list[i].isPay==0){
							state = "待付款";
						}else if(res.list[i].isPay==1){
							state = "已付款";
						}
					}
					str += '<div class="singleAppointment" data-id="'+res.list[i].applyId+'" data-timeStamp="'+res.list[i].createTime+'" data-price="'+res.list[i].applyPrice+'" data-isPay="'+res.list[i].isPay+'">' +
						'<img src="'+res.list[i].activity.maxPic+'"/><div class="detail">' +
						'<h4>'+res.list[i].activity.activityTitle+'</h4><span>'+state+'</span><p class="time">' +
						'<img src="imgs/time.png"/>'+new Date(res.list[i].activity.startTime*1000).Formate()+' - '+new Date(res.list[i].activity.endTime*1000).Formate()+'</p>' +
						'<p class="address"><img src="imgs/address.png"/>'+res.list[i].activity.activityAddress+'</p></div></div>';
				}
				$('#loading').hide();
				$activityOrder.append(str);
				//添加事件，到详细    enrollMsg.html
				$(".singleAppointment").bind("click",function(){
					var currentTime = new Date().getTime()/1000;
					if((currentTime - $(this).attr('data-timeStamp') >= 1800) && $(this).attr('data-price') != 0 && $(this).attr('data-isPay')==0){
						$.alert('您没在规定时间内付款，活动预约已经取消');
						$(this).hide();
						return
					}else {
						window.location.href = "enrollMsg.html?applyid="+$(this).data("id")+"&createTime="+$(this).attr('data-timeStamp')+"&price="+$(this).attr('data-price');
					}
				});
			},
			error: function (e) {
				//todo
			}
		})
	};


	//获取臻品订单
	// 备注:orderState 订单状态，0:全部,1：待付款，2：已付款，3：已发货，4：已退款，5：交易关闭，6：已收货
	function getGoodOrderList(currentPage,orderState) {
		$('#loading').show();
		$.ajax({
			type: 'get',
			url: port+"/card/order/v2?currentPage="+currentPage+"&orderState="+orderState+"&token="+token,
			success: function (data) {
				if(hashStr){
					$('#'+hashStr).click();
				}
				if(currentPage == 1 && data.list.length==0){
					noDataFn(3);
					$(window).unbind('scroll');
					$('#loading').hide();
					return;
				}

				if(currentPage > 1 && data.list.length == 0){
					$(window).unbind('scroll');
					setTimeout(function () {
						$('#loading').hide();
					},1500);
					return;
				}

				var html = '';
				for(var i=0;i<data.list.length;i++){
					var str= "";
					var state = "";
					var cardId = data.list[i].orderModel.orderId;
					var isCancelStr = '';
					for(var j=0; j<data.list[i].detailOrderModels.length;j++){
						str += ' <li><img src="'+data.list[i].detailOrderModels[j].hotPic+'">' +
							'<p>'+data.list[i].detailOrderModels[j].goodsTitle+'</p>' +
							'<p>'+data.list[i].detailOrderModels[j].skuGague+'</p>' +
							'<p><span>￥'+data.list[i].detailOrderModels[j].skuPrice.toFixed(2)+'</span>' +
							'<span class="num">×'+data.list[i].detailOrderModels[j].count+'</span></p></li>';
					}

					if(data.list[i].orderModel.orderState == 1){
						state = "待付款";
						isCancelStr = '<button class="payNow">立即支付</button><button class="cancel" data-cardId="'+cardId+'">取消订单</button>';
					}else if(data.list[i].orderModel.orderState == 2){
						state = "待发货";
					}else if(data.list[i].orderModel.orderState == 3){
						state = "已发货";
					}
					html += '<div class="itemGood" data-cardId="'+cardId+'" data-state="'+data.list[i].orderModel.orderState+'">' +
						'<h4><span>订单编号: '+data.list[i].orderModel.orderId+'</span><i>'+state+'</i></h4>' +
						'<ul class="goodDetailList">'+str+'</ul><div><span>总价：<i>￥'+data.list[i].orderModel.orderCount.toFixed(2)+'</i></span>'+isCancelStr+'</div></div>';
				}
				$goodsOrder.append(html);
				$('#loading').hide();
				//绑定点击跳转事件
				$(".itemGood").bind("click",function(){
					if($(this).attr('data-state')=='3'){
						window.location.href = "unpaid.html?cardid=" + $(this).attr('data-cardId') + '&orderState=3';
					}else {
						window.location.href = "unpaid.html?cardid=" + $(this).attr('data-cardId');
					}
				});
				//取消订单
				$(".itemGood").find('.cancel').click(function (event) {
					var $thisParent = $(this).parent().parent();
					event.stopPropagation();
					$.modal({
						title: "提示",
						text: '确认是删除订单吗?',
						buttons: [
							{ text: "确定", onClick: function(){
								deleteOrderFn($thisParent,3);
							} },
							{ text: "取消", className: "default", onClick: function(){ console.log(3)} },
						]
					});
				});
			},
			error: function (e) {
				//todo
			}
		})
	};


	//获取 乐享 订单
	//  -2全部  0待付款 1待使用 2已完成  3已取消
	function getEnjoyOrderList(currentPage,orderState) {
		$('#loading').show();
		var urlStr = (orderState >=0) ? port+"/card/productorder/all?currentPage="+currentPage+"&status="+orderState+"&token="+token
			:  port+"/card/productorder/all?currentPage="+currentPage+"&token="+token ;
		$.ajax({
			type: "get",
			aysnc: true,
			dataType: "json",
			contentType: "application/json;charset=UTF-8",
			url: urlStr,
			success:function(res){
				if(hashStr){
					$('#'+hashStr).click();
				}
				if(currentPage == 1 && res.data.list.length==0){
					noDataFn(17);
					$(window).unbind('scroll');
					$('#loading').hide();
					return;
				}
				if(currentPage > 1 && res.data.list.length == 0){
					$(window).unbind('scroll');
					setTimeout(function () {
						$('#loading').hide();
					},1500);
					return;
				}

				for(var i=0;i<res.data.list.length;i++){
					var str = "";
					var state = '<span class="state"></span>';
					var orderHandle  = '<span></span>';
					if(res.data.list[i].status == 0){
						state = '<span class="state">待付款</span>';
						orderHandle = '<button class="pay">去付款</button>'
					}else if(res.data.list[i].status == 1){
						state = '<span class="state">待使用</span>';
						orderHandle = '<button class="pay">使用</button>'
					}else if(res.data.list[i].status == 2){
						state = '<span class="state finished">已完成</span>';
						orderHandle = '<button class="pay">评价</button>'
					}else if(res.data.list[i].status == 3){
						state = '<span class="state cancel">已取消</span>';
						orderHandle = '<button class="deleteOrder" data-orderid="'+res.data.list[i].id+'">删除订单</button>';
					} else if(!res.data.list[i].status){
						state = "全部";
					}

					if(res.data.list[i].status == 0){
						var timerStr = '<li class="timer">支付倒计时 00:00</li>'
					}else {
						timerStr = '<li class="timer" style="height: 0"></li>';
					}
					str = $('<div class="itemOrder" data-orderid="'+res.data.list[i].id+'">' +
						'<ul><li><span class="orderNum">订单编号:'+res.data.list[i].number+'</span>'+state+'</li> ' +
						'<li class="content"><img src="'+res.data.list[i].productModel.pic+'"><span class="title">'+res.data.list[i].title+'</span></li>' +
						'<li><span>￥'+res.data.list[i].sumPrice.toFixed(2)+'</span>'+orderHandle+'</li>'+timerStr+'</ul> </div>');

					if( ((new Date().getTime()/1000 - res.data.list[i].createTime)< 60*30) && res.data.list[i].status == 0){
						enjoyTimer(res.data.list[i].createTime,str);
					}
					$enjoyOrder.append(str);
				}
				$('#loading').hide();

				//点击删除订单按钮
				var deleteOrderBtn = $(".itemOrder").find('.deleteOrder');
				deleteOrderBtn.bind("click",function(event){
					var $thisParent = $(this).parent().parent().parent();
					event.stopPropagation();
					$.modal({
						title: "提示",
						text: '确认是删除订单吗?',
						buttons: [
							{ text: "确定", onClick: function(){
								deleteOrderFn($thisParent,17);
							} },
							{ text: "取消", className: "default", onClick: function(){ console.log(3)} },
						]
					});
				});
				//绑定点击跳转事件
				$(".itemOrder").bind("click",function(){
					window.location.href = 'enjoyOrderDetail.html?orderId=' + $(this).attr('data-orderid');
				});

			},
			error:function(data){
				//todo
			}
		})
	};


	//滚动加载 订单
	function scrollLoadOrder(orderState,_classStr) {
		$(window).bind("scroll",function(){
			var scrollTop = $(this).scrollTop();
			var scrollHeight = $(document).height();
			var windowHeight = $(this).height();

			console.log(scrollTop)
			console.log(windowHeight)
			console.log(scrollHeight)

			if (scrollTop + windowHeight == scrollHeight) {
				page++;
				if(_classStr == 'good'){
					getGoodOrderList(page,orderState);
				}else if(_classStr == 'activity'){
					getActivityOrderList(page);
				}else {
					getEnjoyOrderList(page,orderState);
				}
			}
		});
	};


	//如果是空页面的情况下
	//  type:  1-活动  3-臻品  17-乐享（主体产品、买一送一）
	function noDataFn(type) {
		var orderStr = type==1 ? '您还没有预约任何活动' : '您还没有订单';
		var strEmpty = '<center><img class="shopping" src="imgs/noOrder.png"><h3>'+orderStr+'</h3>' +
			'<a class="turnPage">再去看看吧>></a></center>';
		if(type == 1){
			$activityOrder.html(strEmpty);
			$(".turnPage").click(function(){
				window.location.href = "culb.html?joinAct";
			});
		}else if(type == 3){
			$goodsOrder.html(strEmpty);
			$(".turnPage").click(function(){
				window.location.href = "pierre.html?good";
			});
		}else {
			$enjoyOrder.html(strEmpty);
			$(".turnPage").click(function(){
				window.location.href = "pierre.html?brand";
			});
		}
	};


	//删除订单
	// 3-臻品   17-乐享（主体产品、买一送一）
	function deleteOrderFn(dom,type) {
		var url = type==17 ? port + '/card/productorder/force/' + dom.attr('data-orderid') + '?token=' + token
			: port+"/card/order/"+ dom.attr('data-cardId') + "?token="+token;
		$.ajax({
			type: 'delete',
			url: url,
			success: function (res) {
				$.toast('删除成功',function () {
					dom.hide();
				});
			},
			error: function (e) {
				//todo
			}
		})
	};

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
			leftTime-- ;
			if(leftTime == 0){
				clearInterval(timeP);
			}
		}
		var timeP = setInterval(timer,1000);
	};


});