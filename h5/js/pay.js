

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

	var applyid= window.location.search.split('=')[1];
	var infoForm = document.getElementById("infoFormSubmit");
	var addForm = document.getElementById("addFormButton");  //addFormButton

	if(token != undefined){
		  var cardList = $(".cardList").eq(0);
		  $.ajax({
			 	type:"get",
			 	url:port+'/card/card?token='+token,
			 	success:function(data){
		    	if(typeof(data) == "string"){
					window.location.href = "login.html?his="+his;
				}else{
				 	for(var i=0;i<data.list.length;i++){
						var item=$('<div class="cardItem"  id="cardItem" data-cardId='+data.list[i].cardNumber+'><div class="card-logo" ><img src="imgs/bank.jpg"></div><div class="card-info"><div class="card-name">中国工商银行</div><div class="card-tip">尾号'+data.list[i].cardNumber+'</div><div class="card-r">&gt;</div></div></div>')
					cardList.append(item);
					}
				    if($(".cardList").children().length == 0){
				      	//alert("你还没有添加银行卡,请先添加银行卡，然后再操作！！");
				      	cardList.append("<h2 class= 'alert_q'>你还没有添加银行卡</h2>");
			        }else{


			        	//一定要注意，在元素出来的时候再帮定事件，不然就没效
						$(".cardItem").click(function(){
							//商品支付http://121.196.232.233/card/bank/goods/pay/{cardno}/{orderId}?token=e7120d7a-456b-4471-8f86-ac638b348a53
							//活动支付http://121.196.232.233/card/bank/encryption/pay/{cardno}/{applyId}?token=e7120d7a-456b-4471-8f86-ac638b348a53

							var cardItem = $(this).data("cardid");
							var url = port+"/card/bank/encryption/pay/"+cardItem+"/"+applyid+"?token="+token;

							var orderId = window.location.search.split("=")[1];

							if(window.location.search.split("=")[0] == "?cardid"){
								url = port+"/card/bank/goods/pay/"+cardItem+"/"+orderId+"?token="+token;
							}
							if(window.location.search.split("=")[0] == "?mallOrderId"){
								url = port+"/card/bank/mall/pay/"+cardItem+"/"+orderId+"?token="+token;
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
				} },
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
		//alert("您的账号还未登陆,请登陆后操作！");
		window.location.href = "login.html?his="+escape(his);
	}
});