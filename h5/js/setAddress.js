

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
	//token = getCookie("token") ||"19cdc036-c98e-4958-8d89-1b55f0e09695";//便于本地测试
	token = getCookie("token");
	//获取页面的名称
	$(".add_add").click(function(){
		window.location.href="addAddress.html?obj="+escape(JSON.stringify(obj));
	});
	console.log(token)
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	
	//获取从fillInOrder页面传递来的obj
	if(window.location.search != ""){
		if(window.location.search.indexOf("isShoppingCart=false") > 0){
			var  JSONstr = window.location.search.split("=")[1].split("&&")[0];
		}else {
			var  JSONstr = window.location.search.split("=")[1];
		}
		var obj = JSON.parse(unescape(JSONstr));
	}


	//获取上个页面的url
	var Add=$("#add");
	$.get(port+"/card/receiver?token="+token+"&currentPage=1",function(data){
		console.log(data);
		if(data.list.length==0){
			var str=$('<h3 class="noneAds">你还没有创建收货地址，赶快创建一个吧</h3>');
			$("#add").html(str);
		}
		for(var i=0,len=data.list.length;i<len;i++) {
			var item;
			if(data.list[i].isDefault==1){
				item=$('<div class="ad_But clearfix" data-id="'+data.list[i].receiveId+'"><span class="user_But">'+data.list[i].receiverName+'</span><span class="phone_But">'+data.list[i].receiverPhone+'</span></div><div class="reg_But" data-id="'+data.list[i].receiveId+'">'+data.list[i].province+''+data.list[i].city+''+data.list[i].district+''+data.list[i].detilAddress+'</div><div class="fr clearfix" data-id="'+data.list[i].receiveId+'" data-name="'+data.list[i].receiverName+'" data-phone="'+data.list[i].receiverPhone+'" data-address="'+data.list[i].province+','+data.list[i].city+','+data.list[i].district+','+data.list[i].detilAddress+'"><div class="Check_But" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic4.png"></div><div class="set_But" data-id='+data.list[i].receiveId+' style="color:#b7a66e">默认地址</div><div class="add_editor" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic1.png"></div><div class="font_set" data-id='+data.list[i].receiveId+'>编辑</div><div class="add_delete" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic2.png"></div><div class="font_del" data-id='+data.list[i].receiveId+'>删除</div></div>');
				Add.prepend(item);
			}else{
				item=$('<div class="ad_But clearfix" data-id="'+data.list[i].receiveId+'"><span class="user_But">'+data.list[i].receiverName+'</span><span class="phone_But">'+data.list[i].receiverPhone+'</span></div><div class="reg_But" data-id="'+data.list[i].receiveId+'">'+data.list[i].province+''+data.list[i].city+''+data.list[i].district+''+data.list[i].detilAddress+'</div><div class="fr clearfix" data-id="'+data.list[i].receiveId+'" data-name="'+data.list[i].receiverName+'" data-phone="'+data.list[i].receiverPhone+'" data-address="'+data.list[i].province+','+data.list[i].city+','+data.list[i].district+','+data.list[i].detilAddress+'"><div class="Check_But" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic3.png"></div><div class="set_But" data-id='+data.list[i].receiveId+'>设为默认</div><div class="add_editor" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic1.png"></div><div class="font_set" data-id='+data.list[i].receiveId+'>编辑</div><div class="add_delete" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic2.png"></div><div class="font_del" data-id='+data.list[i].receiveId+'>删除</div></div>');
				Add.append(item);
			}			
		}

		//选择地址跳转
		$(".reg_But,.ad_But").bind("click",function(){
			obj.receiveId = $(this).data("id");

			if(window.location.search.indexOf("isShoppingCart=false") > 0){
				// window.location.href = "fillInOrder.html?obj=" + escape(JSON.stringify(obj));

				window.location.href = "fillInOrder.html?cost="+ obj.cost + "&&goodsId="+obj.goodsId+ "&&num=" +obj.num+ "&&pic=" +obj.pic+ "&&skuId="+obj.skuId+ "&&subTitle="+obj.subTitle + "&&title="+obj.title + "&&receiveId="+obj.receiveId;

			}else {
				window.location.href = "fillInOrder.html?obj=" + escape(JSON.stringify(obj));
			}
		});


		$(".Check_But,.set_But").click(function(){//切换默认地址，接口还没写好
			$(".Check_But").find("img").attr("src","imgs/add_pic3.png")
			$(".set_But").html("设为默认");
			$(".set_But").css("color","#acacac");
			var Set_id = $(this).siblings(".set_But").data("id");
			var Check_id = $(this).data("id");
	 		$(this).parent().children(".Check_But").find("img").attr("src","imgs/add_pic4.png");
			$(this).parent().children(".set_But").html("默认地址");
	 		$(this).parent().children(".set_But").css("color","#b7a66e");
	 		//更新默认地址
	 		var receiverid = $(this).data("id");
	 		var obj = $(this).parent();
	 		var ads = obj.data("address").split(",");
	 		$.ajax({
	 			type:"put",
	 			url:port+"/card/receiver/"+receiverid+"?token="+token,
	 			dataType:"josn",
	 			contentType:"application/json",
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
					isDefault:1
	 			}),
	 			success:function(data){
	 				console.log(data);
	 			},
	 			error:function(data){
	 				console.log(data);
	 			}
	 		});

		});
		$(".font_del,.add_delete").click(function(){	//删除地址
		 	var receiverId=$(this).data('id');
		 	$.ajax({
		 		type:"DELETE",
		 		url:port+"/card/receiver/"+receiverId+"?token="+token,
		 		contentType:"application/json",
		 		success:function(data){
		 			if(data.code==203){
						$.alert("删除成功");
						window.location.reload();
					}else{	
						$.alert("删除失败");
					}	
		 		}
		 	})
		})//删除地址结束	
		$(".add_editor,.font_set").bind("click",function(){
			window.location.href = "editAddress.html?id="+$(this).data("id");
		});	
	})//ajax请求结束
});