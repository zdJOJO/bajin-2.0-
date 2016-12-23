$(document).ready(function(){	
	//获取token
	var token = getCookie("token");
	//获取页面的名称
	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	//TAB切换
	$('nav a').click(function () {
		var page = 1;
		if($(this).hasClass('active')) return
		$('.wrapper').html('');
		$(this).addClass('active').siblings().removeClass('active');
		if(this.id == 'systemMsg'){
			getMessage(1,1);
			scrollLoadOrder('systemMsg',page)
		}else {
			getMessage(3,1);
			scrollLoadOrder('discountMsg',page)
		}
	});


 	//消息类型(messageType) 1：系统消息，2:物流消息  3：优惠信息  4：客服消息.
	// 项目类型(itemType):1活动 2白金人生 3商品 4其他
	// 当itemtype为4的时候，那么就要启用message_url字段
	function getMessage(messageType,pagenum){
		if(!token){
			//window.location.href = "login.html?his="+his;
			return
		}
		$.ajax({
			type: "get",
			url: port+"/card/message/"+messageType+"?currentPage="+pagenum+"&size=10&token="+token,
			dataType: "json",
			async: true,
			success:function(data){
				var msgStr = '';
				var tips='<img src="imgs/redPoint.png"/>';
				if(pagenum>1 && data.list.length == 0){
					$(window).unbind('scroll');
				}
				//系统消息点击不跳转，展开与关闭。
				if(messageType==1){
					for(var i=0;data.list.length;i++){
						tips = data.list[i].isRead==0 ? tips : '';
						msgStr += '<div class="singleMsg" data-url="'+url+'" data-isread="'+data.list[i].isRead+'" data-itemtype="'+data.list[i].itemType+'" data-itemid="'+itemid+'" data-messageid="'+data.list[i].messageId+'">' +
							'<img src="'+data.list[i].messagePic+'">' +
							'<div class="content"><h3><span>'+data.list[i].messageTitle+'</span>' +
							'<i>'+new Date(data.list[i].pushTime*1000).Formate()+'</i></h3>' +
							'<p>'+data.list[i].messageTitle+'</p></div></div>';
					}
					$(".wrapper").append(msgStr);
					$(".singleMsg").bind("click",function(){
						if($(this).data("isread")==0){
							turnState($(this).data("messageid"));
						}
					});
				}else if(messageType==3){
					for(var i=0,len=data.list.length;i<len;i++){
						var itemid="";
						var url="";
						var str = '';
						if(data.list[i].messageDetail){
							str = data.list[i].messageDetail;
						}
						tips = data.list[i].isRead==0 ? tips : '';
						//类型 1：活动 2白金人生 3商品 4服务 5其他 6消息推送
						if(data.list[i].itemType!=6){
							itemid=data.list[i].itemId;
							if(data.list[i].itemType==1){
								url="enrol.html?id="+data.list[i].itemId;
							}else if(data.list[i].itemType==2){
								url="life.html?id="+data.list[i].itemId;
							}if(data.list[i].itemType==3){
								url="brandDetail.html?id="+data.list[i].itemId;
							}if(data.list[i].itemType==4){
								url="mall.html?id="+data.list[i].itemId;
							}if(data.list[i].itemType==5){
								url=data.list[i].url;
							}
						}

						msgStr += '<div class="singleMsg" data-url="'+url+'" data-isread="'+data.list[i].isRead+'" data-itemtype="'+data.list[i].itemType+'" data-itemid="'+itemid+'" data-messageid="'+data.list[i].messageId+'">' +
							'<img src="'+data.list[i].messagePic+'">' +
							'<div class="content"><h3><span>'+data.list[i].messageTitle+'</span>' +
							'<i>'+new Date(data.list[i].pushTime*1000).Formate()+'</i></h3>' +
							'<p>'+data.list[i].messageTitle+'</p></div></div>';
					}
					$(".wrapper").append(msgStr);
					$(".singleMsg").bind("click",function(){
						if($(this).data("isread")==0){
							turnState($(this).data("messageid"));
						}
						if($(this).data("url")){
							window.location.href = $(this).data("url");
						}
					});
				}

				//点击展开
				$(".more").click(function(){
					var str = $(this).parent().data("message");
					if($(this).find("img").attr("src") == "imgs/deploy.png"){
						$(this).siblings(".detail").find(".read").find(".word").text(str);
						$(this).find("img").attr("src","imgs/packUp.png");
					}else{
						lessAll($(this).siblings(".detail").find(".read").find(".word"),45);
						$(this).find("img").attr("src","imgs/deploy.png");
					}
				});
			},
			error:function(data){
				//todo
			}
		});
	}


	//滚动加载 订单
	function scrollLoadOrder(idStr,page) {
		$(window).bind("scroll",function(){
			var scrollTop = $(this).scrollTop();
			var scrollHeight = $(document).height();
			var windowHeight = $(this).height();

			console.log(scrollTop)
			console.log(windowHeight)
			console.log(scrollHeight)

			if (scrollTop + windowHeight == scrollHeight) {
				page++;
				if(idStr == 'systemMsg'){
					getMessage(1,page);
				}else {
					getMessage(3,page);
				}
			}
		});
	};

	//函数标记为已读
	function turnState(messageId){
		$.ajax({
			type:"get",
			url:port+"/card/message/isRead/"+messageId+"?token="+token,
			success:function(data){
				console.log(data);
			},
			error:function(data){
				console.log(data);
			}
		});
	};

	getMessage(1,1);
});