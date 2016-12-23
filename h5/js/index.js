
//此页面的问题很多，留到最后处理
$(document).ready(function(){
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
	token = getCookie("token");
	var activityid= window.location.search.split('=')[2];
	// console.log(token);
	//历史页面的记录用于登录成功或者注册、更改密码成功后跳回的页面
	var his = window.location.pathname.split("/");
	his = his[his.length-1];


	//侧边栏切换
	$.get(port +"/card/user?token="+token,function(data){
		if(token){
			var headPic = !data.headPic?"imgs/headPic_default.png":data.headPic;
			$('#vip').children('img').attr('src',headPic);
		}
		$("#vip").click(function(){

			$(".showDiv3").show(1,function () {
				$(".showDiv2").addClass('showDiv2In').removeClass('showDiv2Out');
			});


			//侧边栏登录
			if(token){
				//当token过期的时候会出错，code：666,这个时候需要
				if(typeof(data) == "string"){
					$(".pic_but").html("");
					// window.location.href = "login.html?his=" + his;
					var item=$('<div class="pic"><img src="imgs/headPic_default.png"></div><div class="user_But">未登录</div>');
					$(".pic_but").append(item);
					return;
				}
				$(".pic_but").html("");
				var headPic = !data.headPic?"imgs/headPic_default.png":data.headPic;
				var userName = data.userName==""?"已登录":data.userName;
				var item=$('<div class="pic"><img src='+headPic+'></div><div class="user_But">'+userName+'</div>');
				$(".pic_but").append(item);
			}else{
				$(".pic_but").html("");
				// window.location.href = "login.html?his=" + his;
				var item=$('<div class="pic"><img src="imgs/headPic_default.png"></div><div class="user_But">未登录</div>');
				$(".pic_but").append(item);
			}//侧边栏登录结束
			if(token!=undefined){
				$.get(port+'/card/car/sum?token='+token,function(data){
					if(typeof(data) == "string"){
						$(".order_tj").css("display","none");
						return;
					}
					if(data.data.sum==undefined || data.data.sum == 0){
						$(".order_tj").css("display","none");
					}else{
						$(".order_tj").val(data.data.sum);
					}
				});
			}else{
				$(".order_tj").css("display","none");
			}
		});
	});


	//页面跳转统一处理
	function turnUrl(point,url){
		point.bind("click",function(){
			if(token){
				$(this).addClass('active').find('span.text').addClass('active');
				if($(this).find('span.text').hasClass('active') || url=='set.html'){
					window.location.href = url;
				}
			}else{
				window.location.href = "login.html?his=" + escape(url);
			}
		});
	}
	$(".showDiv3").click(function(){
		$(".showDiv3").hide(1,function () {
			$(".showDiv2").addClass('showDiv2Out').removeClass('showDiv2In');
		});
	});
	turnUrl($("#QRCode"),"qrCode.html");
	turnUrl($("#fav_But"),"favorites.html");
	turnUrl($("#myMessage_But"),"myMessage.html");
	turnUrl($("#shop_But"),"shoppingCart.html");
	turnUrl($("#order_But"),"myOrders.html#activityOrder");
	turnUrl($("#bank_But"),"bank.html");
	turnUrl($(".pic_but"),"set.html");
	
	$("#set_But").bind("click",function(){
		if(!token){
			window.location.href = "login.html";
		}else {
			$(this).addClass('active').find('span.text').addClass('active');
			if($(this).find('span.text').hasClass('active')){
				window.location.href = "changePassword.html";
			}
		}
	});
	
	//设置元素的高度等于移动设备的高度
	$(".showDiv2").height($(window).height());
	$(".clubPage").click(function(){
		window.location.href = "culb.html?joinAct";
	});
	$(".readPage").click(function(){
		window.location.href = "read.html?hot";
	});
	$(".pierrePage").click(function(){
		window.location.href = "pierre.html?good";
	});
	var showMore=$('#moreAct');
	var activities=$("#activities");
	var actBottom=$(".act-bottom");
	var moreCheck=true;


    //更多的操作
	showMore.click(function(){
		if(moreCheck){
			//更改图片事件		    
			actBottom.css({
				marginTop:"0.025rem",
				height:"0.154rem"
			});
			$("#moreAct img").attr("src","imgs/top.png");
			$('#moreAct > span').html('收起');
			moreCheck=false;
		}else{			
			actBottom.css({
				marginTop:"0",
				height:"0"
			});
			$("#moreAct img").attr("src","imgs/bottom.png");
			$('#moreAct > span').html('更多');
			moreCheck=true;
		}
	});





	var bannerUrl = '';
	//轮播图页面部分
	//http://121.196.232.233:9292/card/banner
	var bannerWrap=$('.swiper-slide');
	function getBannerData(){
		$.ajax({
			type:"get",
			async:true,
			url:port +'/card/banner',
			success:function(data){
				var arr = data.list;
				var bannerStr = '';
				// Array.prototype.push.apply(arr, arr);
				var content_ = $('<div class="swiper-container"><div class="swiper-wrapper"></div><div class="swiper-pagination"></div></div>');
	            $(".carousel").append(content_);
				for(var i=0;i<arr.length;i++){
					if(arr[i].bannerUrl){
						bannerUrl = arr[i].bannerUrl;
					}
					bannerStr += '<div class="swiper-slide">' +
						'<p class="mask_banner">'+arr[i].bannerTitle+'</p>' +
						'<img src="'+arr[i].bannerPic+'" data-id="'+arr[i].itemId+'" data-type="'+arr[i].type+'" data-url="'+arr[i].bannerUrl+'" class="swiper-slide_img"/>' +
						'</div>';

				}
				$(".swiper-wrapper").append(bannerStr);

				//这里区分type，
				//		如果是0，不操作，
				//		如果是1，拿到itemId，然后导向活动页面
				//		如果是2，拿到itemId，然后导向白金人生页面
				//		如果是3, 拿到itemId，然后导向商品页面，现在没有的，所以现在也为空
				//		如果是4，拿到itemId，然后导向抽奖页面
				//		如果是5，直接导向给定的url
				var mySwiper = new Swiper('.swiper-container', {
					autoplay: 2000,
					pagination : '.swiper-pagination',
			        loop : true,
				});
				$(".swiper-slide img").click(function(){
					var type = $(this).attr("data-type");
					hitsOnFn(token,type,1, $(this).attr("data-id"));
                    if(type == 0){
			        	return;
                    }else if(type == 1){
			        	window.location.href = "enrol.html?id=" + $(this).data("id");
                    }else if(type == 2){
			        	window.location.href = "life.html?id="+ $(this).data("id");
                    }else if(type == 3){
			        	window.location.href = "brandDetail.html?id="+$(this).data("id");
                    }else if(type == 4 || type == 12){
			        	if(token != undefined){
							window.location.href = $(this).attr('data-url');//抽奖
			        	}else{
			        		window.location.href = "login.html?his=" + his;
			        	}
                    }else if(type == 6){
						if(token != undefined){
							//调到抽奖中间页
							window.location.href = bannerUrl;
						}else{
							window.location.href = "login.html?his=" + his;
						}
					}else if(type == 5){
			        	window.location.href = "mall.html?id="+$(this).data("id");
			        	return;
                    }else if(type == 12){
						window.location.href = $(this).attr('data-url');
					}
				});
			}
		});
	}
	getBannerData();


	//http://121.196.232.233:9292/card/activity?currentPage={pagenum}&size={size}
	var itemWrap=$('.items').eq(0);
	var itemWrap1=$('.items1').eq(0);
	function getActData(){
		//这里应该加载下边的选项的时候，先加载部分，在触发上滑事件(需要判断距离底端的距离)的时候触发继续加载更多的页面
		//加载上边三张图，加载下边三张图
	    $.get(port+"/card/mpage/hot",function(data){
			for(var i=0;i<data.length;i++){
				if(i ==0||i==1){
				var item=$('<div class="itemLeft" >' +
					'<img src='+data[i].minPic+' data-itemId = "'+data[i].itemId+'" data-type = "'+data[i].type+'" class="activity-img"/>' +
					'<div class = "mask_lhq"><p class="tit_tq">'+data[i].title+'</p></div>' + '<div class="gradientMask"></div></div>');
				}else if(i==2){
					var item=$('<div class="items_img" >' +
						'<img src="'+data[i].maxPic+'" data-itemId = "'+data[i].itemId+'" data-type = "'+data[i].type+'" class="activity-img"/>' +
						'<div class = "mask_lq"><p class="tit_tq1">'+data[i].title+'</p>' + '<div class="tit_bq1_detail">'+data[i].detail.replace(/<[^>]+>/g,"").replace(/[^\u4e00-\u9fa5]/gi,"")+'</div></div>');
				}
				itemWrap.append(item)
			}

			$(".tit_bq1").each(function(){ 
				var maxwidth=50;   
				if($(this).text().length>maxwidth){   
				$(this).text($(this).text().substring(0,maxwidth));    
				$(this).html($(this).html()+'...');    
				} 
			});	
			//加载下面三张图，加载出来四个信息，只渲染前三个
			$.get(port+"/card/mpage/new",function(data){
				var item = ''
				for(var i=0;i<data.length;i++){
					 item += '<div class="itemLeft"><img src='+data[i].minPic+' data-itemId = "'+data[i].itemId+'" data-type = "'+data[i].type+'" class="activity-img"/>' +
						'<div class = "mask_lhq"><p class="tit_tq">'+data[i].title+'</p></div>' +
						'<div class="gradientMask"></div></div>';
				}
				itemWrap1.append(item);

				$(".activity-img").click(function(){
					toActivity($(this).attr('data-type'),$(this).attr('data-itemid'));
				})
			});
			function toActivity(type,id){
				hitsOnFn(token,type,1,id);
				if(type == 1)
					window.location.href="enrol.html?id="+id;
				else if(type == 2)
					window.location.href="life.html?id="+id;
				else if(type == 3)
					window.location.href="brandDetail.html?id="+id;
				else if(type == 5)
					window.location.href="mall.html?id="+id;
			}

			itemWrap.after('<div id="lookMore"><a href="#">查看更多</a><hr></div>');
			$("#lookMore>a").click(function () {
				window.location.href = 'hotDoor.html';
			});
		});
	}
	getActData();





	//工行的button请求数据
	//http://121.196.232.233/card/icbcbutton
	$.ajax({
		type:"get",
		url: port+"/card/icbcbutton",
		success:function(data){
			var str = '';
			for(var i=0;i<3;i++){
				str += '<li class="btn" id="personalServe" data-pickid="'+ data.list[i].pickId+'" data-buttonId="'+data.list[i].buttonId+'">' +
					'<img src="'+ data.list[i].buttonPic +'">'+ data.list[i].buttonTitle +'</li>';
			}
			$('#activities>ul').append(str);

			//工行 各个按钮
			$("#activities .btn").click(function(){
				if(token != undefined){
					hitsOnFn(token,20,1,$(this).data("pickid"));
					if($(this).attr("id")=="phone"){
						window.location.href = 'tel://' + '400-009-5588';
						return;
					}else if($(this).attr("id")=="personalServe"){
						getMessage();
						return;
					}else if($(this).attr("data-pickid")=="888"){
						window.location.href = "icbcServe.html";   //跳转工行服务按钮
					}else {
						window.location.href = "bank.html?pickid=" + $(this).data("pickid");
					}
				}else{
					window.location.href = "login.html?his="+his;
				}
			});
		},
		error:function(data){
			//todo
		}
	});


	//私人预约服务
	function getMessage(){
		$.ajax({
			type: "GET",
			dataType:"text",
			url: port+"/card/bank/encryption/privatejcyy?token="+token,
			success:function(data){
				if(data.length<50){
					window.location.href = "login.html?his="+his;
				}else{
					$("#merSignMsg").val(data);
					$("#info").submit();
				}
			},
			error: function () {
				$.ajax({
					type: "GET",
					dataType:"string",
					url: port+"/card/bank/encryption/privatejcyy?token="+token,
					success:function(data){
						if(data.length<50){
							window.location.href = "login.html?his="+his;
						}else{
							$("#merSignMsg").val(data);
							$("#info").submit();
						}
					}
				});
			}
		});
	};


	//更多工行服务
	$('#moreIcbc').click(function () {
		window.location.href = 'ICBC_index.html';
	});
	
});
