
$(function(){
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
	//没有绑定银行卡的时候提示添加银行卡
	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	var pickid = window.location.search.split('=')[1];
	var pathname = window.location.pathname.split("/")[6] == "bank.html";

	var isBJVip = false;



	if(token != undefined){
		//拿到pickid继续获取参数然后发送请求
		var cardList=$(".cardList").eq(0);
		function cardData(){
			$.ajax({
				type:"get",
				url:port+"/card/card?token="+token,
				success:function(data){

					if(typeof(data) == "string"){
						window.location.href = "login.html?his="+his;
					}else{
						for(var i=0;i<data.list.length;i++){
							var item=$('<div class="cardItem" data-cardNum="'+data.list[i].cardNumber+'" data-cardId='+data.list[i].cardId+'>' +
								'<div class="card-logo" ><img src="imgs/bank.jpg"></div>' +
								'<div class="card-info"><div class="card-name">中国工商银行</div>' +
								'<div class="card-tip">尾号'+data.list[i].cardNumber+'</div>' +
								'<div class="card-r">&gt;</div></div></div>');
							cardList.append(item);
							if(data.list[i].bjke == 1){
								isBJVip = true;
							}else {
								isBJVip = false;
							}

						}
						if($(".cardList").children().length == 0){
							//alert("你还没有添加银行卡,请先添加银行卡，然后再操作！！");
							cardList.append("<h2 class= 'alert_q'>你还没有添加银行卡</h2>");
						}else{
							// 一定要注意，在元素出来的时候再帮定事件，不然就没效
							// $(".cardItem").click(function(){		 //点击选中银行卡事件
							// 	if(pickid==11 && !isBJVip){
							// 		$.alert('本功能仅限工行白金卡用户');
							// 		return
							// 	}else {
							// 		var cardItem = $(this).data("cardid");
							// 		$.ajax({
							// 			type:"GET",
							// 			dataType:"text",
							// 			url:port+"/card/bank/encryption/"+pickid+"/"+cardItem+"?token="+token,
							// 			success:function(data){
							// 				if(data.length<50){
							// 					window.location.href = "login.html?his="+his;
							// 				}else{
							// 					toIcbc(data);
							// 				}
							// 			},
							// 		});
							// 	}
							// });

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
									if(timeOutEvent!=0){
										if(pickid==11 && !isBJVip){
											$.alert('本功能仅限工行白金卡用户');
											return
										}else {
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
				error:function(data){
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