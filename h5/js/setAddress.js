$(function(){

	//原生取消分享
	function showAndroidToast() {
		try{
			dissmissForward();  //ios
		}catch (e){
			//todo
		};
		try{
			javascript:  window.handler.dissmissForward();  //android
		}catch (e){
			//todo
		};
	}
	showAndroidToast();


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
	$(".add_add").click(function(){
		window.location.href = isPersonNalInfo > 0 ? window.location.href="addAddress.html?fromePersonNalInfo&&obj="+escape(JSON.stringify(obj)) :
			(window.location.search.indexOf('fromeGift')>0 ? window.location.href="addAddress.html?fromeGift&obj="+escape(JSON.stringify({})) :
				window.location.href="addAddress.html?obj="+escape(JSON.stringify(obj)));


		if(isPersonNalInfo > 0 ){
			window.location.href=window.location.href="addAddress.html?fromePersonNalInfo&&obj="+escape(JSON.stringify(obj));
		}else if(window.location.search.indexOf('fromeGift')>0){
			window.location.href=window.location.href="addAddress.html?fromeGift&obj="+escape(JSON.stringify({}));
		}else if(window.location.search.indexOf("isShoppingCart=false") > 0){
			window.location.href = "addAddress.html?isShoppingCart=false&obj="+escape(JSON.stringify(obj));
		}else {
			window.location.href = "addAddress.html?obj="+escape(JSON.stringify(obj));
		}
	});


    //用于判断从哪里跳进这个页面
	var isPersonNalInfo = window.location.href.indexOf('fromePersonNalInfo');
	var his = window.location.pathname.split("/");
	his = his[his.length-1];


	//获取从上个（fillInOrder.html 或者 set.html）页面传递来的obj
	var JSONstr = '';
	var obj = {};
	if(isPersonNalInfo > 0){
		// JSONstr = window.location.search.split("=")[1];
	}else {
		if(window.location.search.indexOf("isShoppingCart=false") > 0){
			JSONstr = window.location.search.split("=")[1].split("&&")[0];
		}else {
			JSONstr = window.location.search.split("=")[1];
		}
		obj = JSON.parse(unescape(JSONstr));
	}


	//获取上个页面的url
	var Add=$("#add");
	$.get(port+"/card/receiver?token="+token+"&currentPage=1",function(data){
		if(data.list.length==0){
			var str=$('<h3 class="noneAds">你还没有创建收货地址，赶快创建一个吧</h3>');
			$("#add").html(str);
		}
		for(var i=0,len=data.list.length;i<len;i++) {
			var item = '';
			var districtStr = '';
			if(!data.list[i].district){
				districtStr = '';
			}else {
				districtStr = '-' + data.list[i].district;
			}
			if(data.list[i].isDefault==1){
				item='<div class="itemAddress"><div class="ad_But clearfix" data-id="'+data.list[i].receiveId+'">' +
					'<span class="user_But">'+data.list[i].receiverName+'</span><span class="phone_But">'+data.list[i].receiverPhone+'</span></div>' +
					'<div class="reg_But" data-id="'+data.list[i].receiveId+'">'+data.list[i].province+'-'+data.list[i].city+ districtStr +'<span style="padding: 0.05rem;">'+data.list[i].detilAddress+'</span>'+'</div>' +
					'<div class="fr clearfix" data-id="'+data.list[i].receiveId+'" data-name="'+data.list[i].receiverName+'" data-phone="'+data.list[i].receiverPhone+'" data-address="'+data.list[i].province+','+data.list[i].city+','+data.list[i].district+','+data.list[i].detilAddress+'">' +
					'<div class="Check_But" data-id='+data.list[i].receiveId+'><img src="imgs/address/choose.png"></div>' +
					'<div class="set_But" data-id='+data.list[i].receiveId+' style="color:#b7a66e">默认地址</div>' +
					'<div class="add_editor" data-id='+data.list[i].receiveId+'><img src="imgs/address/edit.png"></div>' +
					'<div class="font_set" data-id='+data.list[i].receiveId+'>编辑</div>' +
					'<div class="add_delete" data-id='+data.list[i].receiveId+'><img src="imgs/address/delete.png"></div>' +
					'<div class="font_del" data-id='+data.list[i].receiveId+'>删除</div></div></div>';
				Add.prepend(item);
			}else{
				item +='<div class="itemAddress"><div class="ad_But clearfix" data-id="'+data.list[i].receiveId+'">' +
					'<span class="user_But">'+data.list[i].receiverName+'</span><span class="phone_But">'+data.list[i].receiverPhone+'</span></div>' +
					'<div class="reg_But" data-id="'+data.list[i].receiveId+'">'+data.list[i].province+'-'+data.list[i].city+ districtStr +'<span style="padding: 0.05rem;">'+data.list[i].detilAddress+'</span>'+'</div>' +
					'<div class="fr clearfix" data-id="'+data.list[i].receiveId+'" data-name="'+data.list[i].receiverName+'" data-phone="'+data.list[i].receiverPhone+'" data-address="'+data.list[i].province+','+data.list[i].city+','+data.list[i].district+','+data.list[i].detilAddress+'">' +
					'<div class="Check_But" data-id='+data.list[i].receiveId+'><img src="imgs/address/no-choose.png"></div>' +
					'<div class="set_But" data-id='+data.list[i].receiveId+'>设为默认</div>' +
					'<div class="add_editor" data-id='+data.list[i].receiveId+'><img src="imgs/address/edit.png"></div>' +
					'<div class="font_set" data-id='+data.list[i].receiveId+'>编辑</div>' +
					'<div class="add_delete" data-id='+data.list[i].receiveId+'><img src="imgs/address/delete.png"></div>' +
					'<div class="font_del" data-id='+data.list[i].receiveId+'>删除</div></div></div>';
				Add.append(item);
			}			
		}


		//选择地址跳转
		$(".reg_But,.ad_But").bind("click",function(){
			obj.receiveId = $(this).attr("data-id");
			if(isPersonNalInfo > 0){
				window.location.href="editAddress.html?fromePersonNalInfo&id="+$(this).data("id");
			}else {
				if(window.location.search.indexOf("isShoppingCart=false") > 0){
					window.location.href = 'fillInOrder.html?isShoppingCart=false'+'&goodsId='+obj.goodsId+'&skuId='+obj.skuId+'&num='+obj.num+'&receiveId='+obj.receiveId;
				}else if(window.location.href.search('fromeGift') > 0){
					window.location.href = "birthdayGift.html?token=" +  token + "&status=0&receiveId="+obj.receiveId;
				}else {
					window.location.href = "fillInOrder.html?isShoppingCart=true&cards&obj=" + escape(JSON.stringify(obj));
				}
			}
		});


		$(".Check_But,.set_But").click(function(){
			$(".Check_But").find("img").attr("src","imgs/address/no-choose.png")
			$(".set_But").html("设为默认");
			$(".set_But").css("color","#acacac");
			var Set_id = $(this).siblings(".set_But").data("id");
			var Check_id = $(this).data("id");
	 		$(this).parent().children(".Check_But").find("img").attr("src","imgs/address/choose.png");
			$(this).parent().children(".set_But").html("默认地址");
	 		$(this).parent().children(".set_But").css("color","#b7a66e");
	 		//更新默认地址
	 		var receiverid = $(this).data("id");
	 		var obj = $(this).parent();
	 		var ads = obj.data("address").split(",");
	 		$.ajax({
	 			type: "put",
	 			url: port+"/card/receiver/"+receiverid+"?token="+token,
	 			contentType: "application/json",
	 			async:true,
	 			data:JSON.stringify({
	 				receiveId:receiverid,
					receiverName:obj.data("name"),
					receiverPhone:obj.data("phone"),
					// addressId:,
					province:ads[0],
					city:ads[1],
					district:ads[2],
					detilAddress:ads[3],
					isDefault: 1
	 			}),
	 			success:function(data){
					if(isPersonNalInfo > 0){
						//window.location.href = "set.html?";
						return
					}
					if(window.location.href.indexOf('fromeGift') > 0){
						//window.location.href = "birthdayGift.html";
						window.location.href = "birthdayGift.html?token=" +  token + "&status=0&receiveId="+receiverid;
					}
	 			},
	 			error:function(data){
					//todo
	 			}
	 		});

		});



		$(".font_del,.add_delete").click(function(){	//删除地址
		 	var receiverId = $(this).data('id');
			$.modal({
				title: "确定删除？",
				text: data.message,
				buttons: [
					{ text: "确定", onClick: function(){
						$.ajax({
							type:"DELETE",
							url:port+"/card/receiver/"+receiverId+"?token="+token,
							contentType:"application/json",
							success:function(data){
								if(data.code==203){
									$.alert("删除成功",function () {
										window.location.reload();
									});
								}else{
									$.alert("删除失败");
								}
							}
						})
					}},
					{ text: "取消", className: "default", onClick: function(){
						//todo
					},
					}
				]
			});
		})//删除地址结束


		//编辑地址
		$(".add_editor,.font_set").bind("click",function(){
			// window.location.href = isPersonNalInfo > 0 ? window.location.href="editAddress.html?fromePersonNalInfo&id="+$(this).data("id") :
			// 	(window.location.search.indexOf('fromeGift')>0 ? window.location.href="editAddress.html?fromeGift&id="+$(this).data("id") :
			// 		window.location.href = "editAddress.html?id="+$(this).data("id")+'&obj='+escape(JSON.stringify(obj)));

			if(isPersonNalInfo > 0 ){
				window.location.href="editAddress.html?fromePersonNalInfo&id="+$(this).data("id");
			}else if(window.location.search.indexOf('fromeGift')>0){
				window.location.href="editAddress.html?fromeGift&id="+$(this).data("id");
			}else if(window.location.search.indexOf("isShoppingCart=false") > 0){
				window.location.href = "editAddress.html?isShoppingCart=false&id="+$(this).data("id")+'&obj='+escape(JSON.stringify(obj));
			}else {
				window.location.href = "editAddress.html?isShoppingCart=true&id="+$(this).data("id")+'&obj='+escape(JSON.stringify(obj));
			}

		});

	})//ajax请求结束
});