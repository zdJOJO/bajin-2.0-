
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
    var his = window.location.pathname.split("/");
    his = his[his.length-1];

	var applyid = '';
	if(window.location.search.indexOf('productOrderId')>0){
		applyid = window.location.search.split('&')[0].split('=')[1];
		var oriented = window.location.search.split('&')[1].split('=')[1];
	}else {
		applyid= window.location.search.split('=')[1];
	}
	var infoForm = document.getElementById("infoFormSubmit");
	var addForm = document.getElementById("addFormButton");  //addFormButton

	if(token != undefined){
		  var cardList = $(".cardList").eq(0);
		  $.ajax({
			 	type:"get",
			 	url:port+'/card/card?token='+token,
			 	success:function(data){
					var bankTypeStr = ''
					if(typeof(data) == "string"){
						window.location.href = "login.html?his="+his;
					}else{
						for(var i=0;i<data.list.length;i++){
							bankTypeStr = '中国工商银行信用卡';
							if(data.list[i].bjke==1){
								bankTypeStr = '中国工商银行白金卡';
							}
							if(data.list[i].ctkh==1){
								bankTypeStr = '中国工商银行畅通卡';
							}
							var item=$('<div class="cardItem"  id="cardItem" data-bjke="'+data.list[i].bjke+'" ' +
								'data-ctkh="'+data.list[i].ctkh+'" data-cardId='+data.list[i].cardNumber+'>' +
								'<div class="card-logo" >' + '<img src="imgs/bank.jpg"></div><div class="card-info">' +
								'<div class="card-name">'+bankTypeStr+'</div><div class="card-tip">尾号'+data.list[i].cardNumber+'</div><div class="card-r">&gt;</div></div></div>')
						cardList.append(item);
						}
						if($(".cardList").children().length == 0){
							//alert("你还没有添加银行卡,请先添加银行卡，然后再操作！！");
							cardList.append("<h2 class= 'alert_q'>你还没有添加银行卡</h2>");
						}else{
							//一定要注意，在元素出来的时候再帮定事件，不然就没效
							$(".cardItem").click(function(){

								var cardItem = $(this).data("cardid");  //哪张银行卡

								//活动支付http://121.196.232.233/card/bank/encryption/pay/{cardno}/{applyId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
								var url = port+"/card/bank/encryption/pay/"+cardItem+"/"+applyid+"?token="+token;

								var orderId = window.location.search.split("=")[1];
								if(window.location.search.indexOf('oriented') > 0){
									orderId = window.location.search.split("&")[0].split("=")[1];
								}

								if(window.location.search.split("=")[0] == "?cardid"){
									//商品支付 http://121.196.232.233/card/bank/goods/pay/{cardno}/{orderId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
									url = port+"/card/bank/goods/pay/"+cardItem+"/"+orderId+"?token="+token;
								}
								if(window.location.search.split("=")[0] == "?mallOrderId"){
									url = port+"/card/bank/mall/pay/"+cardItem+"/"+orderId+"?token="+token;
								}
								if(window.location.search.split("=")[0] == "?productOrderId"){
								//主题产品支付	http://121.196.232.233/card/bank/subject/pay/{cardno}/{productOrderId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
									//  url = port+"/card/bank/subject/pay/"+cardItem+"/"+orderId+"?token="+token;

									if($(this).attr('data-bjke')=='1'){
										if(oriented[0]=='1'){
											url = port+"/card/bank/subject/pay/"+cardItem+"/"+orderId+"?token="+token;
										}else {
											$.alert(bankCardTypeMsgStr);
											return
										}
									}
									if($(this).attr('data-ctkh')=='1'){
										if(oriented[1]=='1'){
											url = port+"/card/bank/subject/pay/"+cardItem+"/"+orderId+"?token="+token;
										}else {
											$.alert(bankCardTypeMsgStr);
											return
										}
									}
									if($(this).attr('data-bjke')=='0' && $(this).attr('data-ctkh')=='0'){
										if(oriented[2]=='1'){
											url = port+"/card/bank/subject/pay/"+cardItem+"/"+orderId+"?token="+token;
										}else {
											$.alert(bankCardTypeMsgStr);
											return
										}
									}
								}


								console.log(window.location.href)
								console.log(window.location.search.split("=")[0])
								console.log(url);

								$.ajax({
									type: "GET",
									dataType: "text",
									url: url,
									success: function(data){
										var str='<input type="hidden" id="merSignMsg" name="merSignMsg" value="'+data+'"/> '+
											'<input type="hidden" id="companyCis" name="companyCis" value="bjzx"/> ';
										infoForm.innerHTML = str;
										infoForm.submit();
									},
									error: function(){
										//请求出错处理
									}
								});

							});
						}
					}
				},
				error:function(data){
					window.location.href = "login.html?his="+his;
				}
			});//ajax请求结束


		$(".addCard").click(function(){
			fidCard();
		});

		  function fidCard(){
				$.ajax({
					type:"GET",
			        dataType:"text",
					url: port+"/card/bank/encryption/register?token="+token,
						success:function(data){
							//alert("没有银行卡的时候");

							var str='<input type="hidden" id="merSignMsg" name="merSignMsg" value="'+data+'"/> '+
								'<input type="hidden" id="companyCis" name="companyCis" value="bjzx"/> ';

							addForm.innerHTML = str;
							addForm.submit();
					},
					error:function(data){
						$.ajax({
							type:"GET",
							dataType:"string",
							url: port+"/card/bank/encryption/register?token="+token,
							success:function(data){
								//alert("没有银行卡的时候");
								var str='<input type="hidden" id="merSignMsg" name="merSignMsg" value="'+data+'"/> '+
									'<input type="hidden" id="companyCis" name="companyCis" value="bjzx"/> ';
								addForm.innerHTML = str;
								addForm.submit();
							},
							error:function(data){
								window.location.href = "login.html?his="+his;
							}

						});
					}

				});
			}

	}else{
		//alert("您的账号还未登录,请登录后操作！");
		window.location.href = "login.html?his="+escape(his);
	}

	
	var  bankCardTypeMsgStr = '';
	var msg = [];
	function bankCardTypeMsg(oriented) {
		if(oriented[0] == '1'){
			msg[0] = '白金卡'
		}
		if(oriented[1] == '1'){
			msg[1] = '畅通卡'
		}
		if(oriented[2] == '1'){
			msg[2] = '普通卡'
		}
		bankCardTypeMsgStr = '该商品仅限'+msg.join('、')+'购买，请您选择'+msg.join('、')+'支付该订单';
	};
	bankCardTypeMsg(oriented);
});