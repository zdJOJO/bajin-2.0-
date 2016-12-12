$(document).ready(function(){
	var token = getCookie("token")||0;
	//获取页面的名称
	var his = window.location.href.split("/");
	his = his[his.length-1];

	var itemId = '';
	//数量选择处理
    var mallid = window.location.search.split("=")[1];
	itemId = mallid;
    if(/&/g.test(mallid)){
        mallid = mallid.split("&")[0];
		itemId = mallid;
    }

	//跳转预览界面
	if(window.location.search.indexOf('cms') > 0 ){
		window.location.href = 'mall_preview.html?id=' +  mallid;
	}

	var mallObj = {
		mallId: 0,
		currentDiscount: 0,
		title: ''
	};

	//分享时候 传当前页面的url 和 对象obj
	get_url(window.location.href);
	hitsOnFn(token,5,1,mallid);

    //获取商品详情
	$.ajax({
		type:"get",
		url:port+"/card/mall/" + mallid,
		async:true,
		dataType:"json",
		success:function(data){

			mallObj.mallId = data.data.mallId;
			mallObj.currentDiscount = data.data.currentDiscount;
			mallObj.title = data.data.title;

			//调用分享借口
			jsSdkApi('share',{
				title: data.data.title,
				desc: data.data.subtitle,
				link: window.location.href,
				imgUrl: data.data.pic
			},{
				token: token,
				type: 5,
				subType: 4,
				typeId: itemId
			});


			$(".primeCost span").html(data.data.title);
			$(".currentCost span").html(data.data.address);
			if(data.data.discount == ' '){
				$(".stock span").html( (data.data.discount));
			}else {
				$(".stock span").html( (data.data.discount) + '折');
			}
			$(".message div").html(data.data.detail);
			$(".message div img").css({
				"width": "100%",
				"height": "auto"
			});

			//判断是否机场预约 和 是否打折
			if(data.data.title == '即刻尊享机场贵宾服务'){
				$('#payOnline').hide();
				$("footer a").css({
					'color' : '#fff',
					'background-color' : '#b7a66e',
					'width' : '100%'
				});
				$("footer p").html(' 预约');
			}

			if(data.data.currentDiscount != null){
				$("footer a").attr("href","tel:"+data.data.phone);
			}else {
				$('#payOnline').hide();
				$("footer a").attr("href","tel:"+data.data.phone).css({
					'color' : '#fff',
					'background-color' : '#b7a66e',
					'width' : '100%'
				});
			}


			$(".saveAndShare").attr("data-itemid",data.data.mallId);
			var picList = data.data.imgList;
			for(var i=0,len=picList.length;i<len;i++){
				var str = $('<div class="swiper-slide"><img src="'+picList[i].pic+'"/></div>');
				$(".swiper-wrapper").append(str);
			}
			//保存当前的商品的图片地址到立即购买按钮上		    
		    var swiper = new Swiper('.swiper-container', {
				autoplay: 3000,//可选选项，自动滑动
		        pagination: '.swiper-pagination',
		        paginationType: 'progress',
				scrollbar: '.swiper-scrollbar',
				scrollbarHide: false
		    });

			//获取评论内容
			getComment(data.data.mallId);


		    // 进入页面检测是否收藏，如果是登录的状态
		    if(token==undefined){
		    	return;
		    }else{
			    $.ajax({
			        type:"get",
			        async:true,
			        url:port+"/card/collect/item?token="+token+"&itemId="+$(".saveAndShare").data("itemid")+"&itemType=5",
			        dataType:"json",
			        success:function(data){
			       		if(data.code==204){
			       			$(".saveAndShare img.love").attr("src","imgs/iconfont-love_save.png")
			       		}else if(data.code==205){
			       			$(".saveAndShare img.love").attr("src","imgs/iconfont-love.png");
			       		}
			   		},
			   		error:function(data){
						//todo
			   		}
			   	});
			}
		},
		error:function(data){
			//todo
		}
	});

	//收藏与分享部分
	$(".saveAndShare img.love").bind("click",function(){
		if(token!=undefined){
			if($(this).attr("src")=="imgs/iconfont-love.png"){
				// alert("没有收藏！");
				$(this).attr("src","imgs/iconfont-love_save.png");
				//http://121.196.232.233/card/collect?token=e7120d7a-456b-4471-8f86-ac638b348a53
				$.ajax({
					type:"post",
					url:port+"/card/collect?token="+token,
					dataType:"json",
					contentType:"application/json;charset=UTF-8",
					data:JSON.stringify({
		 				itemId:$(this).parent().data("itemid"),
		      			itemType:5,
					}),
					success:function(data){
						hitsOnFn(token,5,2,itemId);
						//todo
					},
					error:function(data){
						//todo
					}
				});
		    }else{
		    	// alert("收藏！");
		    	$(this).attr("src","imgs/iconfont-love.png");	    	
		        //here you must check the collectid by a ajax，then you can delete it
		        //http://121.196.232.233/card/collect/item?token=e7120d7a-456b-4471-8f86-ac638b348a53&itemId=1&itemType=1
		        $.ajax({
			        type:"get",
			        async:true,
			        url:port+"/card/collect/item?token="+token+"&itemId="+$(this).parent().data("itemid")+"&itemType=5",
			        dataType:"json",
			        success:function(data){
			       		if(data.data.collectId==undefined){
			       			return;
			       		}
				       	//删除收藏的接口http://121.196.232.233/card/collect/{collectId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
				        $.ajax({
				        	type:"DELETE",
							dataType:"json",
							contentType:"application/json;charset=UTF-8",
				        	url:port+"/card/collect/"+data.data.collectId+"?token="+token,
				        	success:function(data){
								// alert(data.message);
				        	},
				        	error:function(data){
								//todo
				        	}
				        }); 
			        },
			        error:function(data){
						//todo
			        } 	

		        });	        
		    }
		}else{
			window.location.href = "login.html?his="+escape(his);
		}
	});

    //分享部分
    var sharebtn=$('.share').eq(0);
    var sharemask=$('#share-mask');
    sharemask.click(function(){
        $(this).hide();
    })
    sharebtn.click(function(){
        sharemask.show();
    });



    //二维码
    $.ajax({
	    type:"get",
	    url:port+"/card/file/getImage",
	    success:function(data){
	        var str = $('<img src="'+data.data.url+'" style="width:0.88rem;height:auto;margin:0.08rem 0.06rem;"/>');
	        $(".wrapper").append(str);
			$(".wrapper img").css('with','100%');
		}
	});
    $("body").prepend($('<div id ="urlToDownload" style="width:1rem;height:0.12rem;position: fixed;z-index: 2000;"><img style="width:0.8rem;height:0.12rem;position: absolute;top:0;"src="imgs/bg-baoming.png"/><div style="background-color:#fafafa;float:right;text-align:center;width:0.2rem;height:0.12rem;line-height:0.12rem;"><p style="width:0.08rem;margin-top: 0.02rem;height:0.08rem;line-height:0.08rem;margin-left:0.06rem;background-color:#ccc;border-radius:0.08rem;font-size:0.06rem;">×</p></div></div>'));
    $("#urlToDownload>img").bind("click",function(){
        window.location.href="http://a.app.qq.com/o/simple.jsp?pkgname=com.kting.baijinka";
    });
    $("#urlToDownload>div").bind("click",function(){
        $("#urlToDownload").css("display","none");
    })



	//在线支付
	$('#payOnline').click(function () {
		if(token){
			if(mallObj.currentDiscount==0){
				$('#payOnline').css('disabled','true');
				$.alert('当前商铺无法在线支付');
			}else {
				window.location.href = 'payMall.html?mallId=' + mallObj.mallId + '&currentDiscount=' + mallObj.currentDiscount + '&title=' + mallObj.title;
			}
		}else {
			$.modal({
			    title: "支付失败",
			    text: "请登录后再支付",
			    buttons: [
			        { text: "点击登录", onClick: function(){ window.location.href = "login.html?his=" + escape(his);} },
			        { text: "确定", className: "default", onClick: function(){} },
			    ]
			});
		}
	});


	//获取评论
	function  getComment(itemId) {
		$.ajax({
			type:"get",
			url: port + '/card/comment/list?currentPage=' + 1 + '&type=' + 5 + '&itemId=' + itemId,
			success: function (result) {
				if(result.list.length > 0) {
					$("#comment").find('.cmtNUm').html('评论 ' + result.rowCount + '条');
					var headPicStr = result.list[0].user.headPic || './imgs/headPic_default.png';
					var commentStr = '<img src="'+ headPicStr +'">' +
						'<div class="customerCmt"><span>'+ result.list[0].user.userName +'</span>' +
						'<p>' + result.list[0].commentContent + '</p></div>';
					$('#comment').find('.list').show().html(commentStr);
				}else {
					$('#comment>.box').css({'margin-top': '0.02rem'});
				}
				//查看更多评论
				$('#moreComts').show();
				$('#moreComts').click(function () {
					window.location.href = 'comment.html?type=' + 5 + '&itemId=' + itemId;
				});
			},
			error: function (e) {
				//todo
			}
		});
	};


	//发表评论
	$('#publishCmt').click(function () {
		publishComment(itemId);
	});

	var publishComment = function (itemId) {
		if(!token){
			$.modal({
				title: "评论",
				text: "请登录后再评论",
				buttons: [
					{ text: "点击登录", onClick: function(){ window.location.href = "login.html?his=" + escape(his);} },
					{ text: "确定", className: "default", onClick: function(){} },
				]
			});
			return;
		}
		if(!$("#commentContent").val()){
			$.alert("请填写后再评论", "评论失败", function() {
			});
			return;
		}else {
			$.ajax({
				type: 'post',
				dataType: "json",
				contentType : "application/json",
				url: port + '/card/comment?token=' + token ,
				data: JSON.stringify({
					itemType: 5,
					itemId: itemId,
					commentContent: $("#commentContent").val()
				}),
				success: function (result) {
					if(result.code == 201){
						$.toast("发表评论成功", function() {
							$('footer').css('height','7%');
							$("#commentContent").val('');
							getComment(itemId);
							$('#comment>.box').css({'margin-top': '0.12rem 0 0.01rem 0;'});
						});
					}
				},
				error: function () {
					$.toast("发表评论失败", "cancel");
				}
			});
		}
	};
});