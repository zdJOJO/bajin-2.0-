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
	token = getCookie("token") ||"56ec9682-6180-4672-9ab2-3ac12604fab9";//便于本地测试
	//获取页面的名称

	console.log(token)
	console.log(window.name);
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	
	//返回页面的操作，添加链接地址，返回过程中依然要传递参数token，如果合并js就不用如此操作
	var Add=$("#add")
	$.get( port + "/card/receiver?token=" + token + '&currentPage=1',function(data){
		for(var i=0; i<data.list.length;i++) {
			var item;
			if(data.list[i].receiveId==7){
				item=$('<div class="ad_But clearfix"><span class="user_But">'+data.list[i].receiverName+'</span><span class="phone_But">'+data.list[i].receiverPhone+'</span></div><div class="reg_But">'+data.list[i].province+'</div><div class="fr clearfix"><div class="Check_But" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic4.png"></div><div class="set_But" data-id='+data.list[i].receiveId+' style="color:#b7a66e">默认地址</div><div class="add_editor" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic1.png"></div><div class="font_set" data-id='+data.list[i].receiveId+'>编辑</div><div class="add_delete" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic2.png"></div><div class="font_del" data-id='+data.list[i].receiveId+'>删除</div></div>')
				 // $(".set_But").html("默认地址")
 			 //     $(".set_But").css("color","#b7a66e")
 			 // $(".checkbox").attr("type").css("background","url(../imgs/add_pic4.png)");
 			 console.log($(".checkbox").attr("type"));

 			     console.log("default = "+i);
			}else{
				console.log("not default = "+i);
				item=$('<div class="ad_But clearfix"><span class="user_But">'+data.list[i].receiverName+'</span><span class="phone_But">'+data.list[i].receiverPhone+'</span></div><div class="reg_But">'+data.list[i].province+'</div><div class="fr clearfix"><div class="Check_But" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic3.png"></div><div class="set_But" data-id='+data.list[i].receiveId+'>设为默认</div><div class="add_editor" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic1.png"></div><div class="font_set" data-id='+data.list[i].receiveId+'>编辑</div><div class="add_delete" data-id='+data.list[i].receiveId+'><img src="imgs/add_pic2.png"></div><div class="font_del" data-id='+data.list[i].receiveId+'>删除</div></div>')
			}
			Add.append(item);
		}
			// if($(".checkbox").is(':checked')){
			// 	console.log($(this));
			// }


		$(".Check_But").click(function(e){
			$(".Check_But").find("img").attr("src","imgs/add_pic3.png")
			$(".set_But").html("设为默认");
			$(".set_But").css("color","#acacac");

		var Set_id = $(this).siblings(".set_But").data("id");
		var Check_id = $(this).data("id");
		
		
		 		$(this).find("img").attr("src","imgs/add_pic4.png");
				$(this).siblings(".set_But").html("默认地址");
		 		$(this).siblings(".set_But").css("color","#b7a66e");


		



		})
	})
})