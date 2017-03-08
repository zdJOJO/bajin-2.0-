
$(function(){
	var token = "";
	var pickid = '';
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
	//没有绑定银行卡的时候提示添加银行卡
	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	var changeCard = false; //判断是否来工行服务模块的换卡操作，是--true，否--false
	var searchStr = window.location.search ;
	if(searchStr.indexOf('changeCard') > 0){
		changeCard = true;
	}else {
		if(searchStr.indexOf('pickid') > 0){
			pickid = searchStr.split('&')[0].split('=')[1];
		}
		if(searchStr.indexOf('token') > 0){
			token = searchStr.split('&')[1].split('=')[1];
		}
	}

	var isBJVip = false;

	if(token){
		//拿到pickid继续获取参数然后发送请求
		var cardList=$(".cardList").eq(0);
		function cardData(){
			$.ajax({
				type:"get",
				url: port+"/card/card?token="+token,
				success:function(data){
					var bankTypeStr = '';
					var classStr = 'cardItem pu';
					var picStr = 'imgs/bankList/pu-Card.png';
					if(typeof(data) == "string"){
						window.location.href = "login.html?his="+his;
					}else{
						if(data.list.length > 0){
							$('.addCard,.cardList').show().siblings('.noList').hide();
							for(var i=0;i<data.list.length;i++){
								bankTypeStr = '信用卡';
								classStr = 'cardItem pu';
								picStr = 'imgs/bankList/pu-Card.png';
								if(data.list[i].bjke==1){
									bankTypeStr = '白金卡';
									classStr = 'cardItem bj';
									picStr = 'imgs/bankList/bj-Card.png';
								}
								if(data.list[i].ctkh==1){
									bankTypeStr = '畅通卡';
									classStr = 'cardItem ct';
									picStr = 'imgs/bankList/ct-Card.png';
								}
								var item = $('<div class="'+classStr+'" data-bjke="'+data.list[i].bjke+'" data-cardNum="'+data.list[i].cardNumber+'" data-cardId="'+data.list[i].cardId+'" data-kabin="'+data.list[i].kabin+'" >' +
									'<div class="left"><img src="'+picStr+'"></div><div class="bg"></div>' +
									'<div class="right"><h2>中国工商银行</h2><p class="type">'+bankTypeStr+'</p>' +
									'<p class="number"><span>**** **** **** </span>'+data.list[i].cardNumber+'</p></div></div>');

								cardList.append(item);
								if(data.list[i].bjke == 1){
									isBJVip = true;
								}
							}
						}
						if(data.list.length == 0){
							$('.noList').show().siblings('.addCard').hide();
						}else {
							//长按 和 点击
							var timeOutEvent = 0;
							$(".cardItem").on({
								touchstart: function(e){
									var cardId = $(this).attr('data-cardId');
									function deleteBankCard() {
										$.modal({
											title: "删除",
											text: "确定删除这张银行卡吗？",
											buttons: [
												{ text: "删除", onClick: function(){
													$.ajax({
														type:"DELETE",
														url: port+"/card/card/"+ cardId + "?token="+token,
														contentType:"application/json",
														success:function(data){
															if(data.code == 203){
																$.alert("删除成功");
																$(this).hide();
															}else{
																$.alert("删除失败");
															}
														}
													})
												} },
												{ text: "取消", className: "default", onClick: function(){} }
											]
										});
									}
									timeOutEvent = setTimeout(function(){deleteBankCard();},1000);
									e.preventDefault();
								},
								touchmove: function(){
									clearTimeout(timeOutEvent);
									timeOutEvent = 0;
								},
								touchend: function(){
									clearTimeout(timeOutEvent);
									if(changeCard){
										window.location.href = 'ICBC_index.html?cardnum='+$(this).attr('data-cardnum')+'&kabin='+$(this).attr('data-kabin');
									}else {
										if(timeOutEvent!=0){
											if(pickid==11 && $(this).attr('data-bjke')==0){
												$.alert('本功能仅限工行白金卡用户');
												return
											}else {
												if(!pickid){
													return
												}
												var cardItem = $(this).data("cardNum");
												$.ajax({
													type:"GET",
													dataType:"text",
													url:port+"/card/bank/encryption/"+pickid+"/"+cardItem+"?token="+token,
													success:function(data){
														if(data.length<50){
															window.location.href = "login.html?his="+his;
														}else{
															toIcbc(data);
														}
													},
												});
											}
										}
									}
									return false;
								}
							})
						}
					}
				},
				error:function(data){
					window.location.href = "login.html?his="+his;
				}
			});//ajax请求结束
		}
		cardData();



		//模拟表单提交
		function toIcbc(str){
			$("#merSignMsg").val(str);
			$("#info").submit();
		}



		function fidCard(){
			$.ajax({
				type:"GET",
				dataType:"text",
				url:port+"/card/bank/encryption/register?token="+token,
				success:function(data){
					console.log(data);
					//alert("没有银行卡的时候");
					if(data.length<50){
						window.location.href = "login.html?his="+his;
					}else{
						toIcbc(data);
					}
				},
				error:function(e){
					window.location.href = "login.html?his="+his;
				}

			});
		}
		$(".addCard").click(function(){
			fidCard();
		});
		//http://121.196.232.233:9292/card/bank/encryption/{pickId}/{cardno}?token=e7120d7a-456b-4471-8f86-ac638b348a53http://www.winthen.com
		//绑定点击事件，获取cardid 发送请求，拿到一串字符，然后就跟绑定一样的操作
	}else{
		window.location.href = "login.html?his="+his;
	}
});