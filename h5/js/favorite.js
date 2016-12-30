


$(document).ready(function(){	
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

	console.log(window.name);
	var his = window.location.pathname.split("/");
	his = his[his.length-1];

	//返回页面的操作，添加链接地址，返回过程中依然要传递参数token，如果合并js就不用如此操作
    var fav_add=$(".fav_add").eq(0);
	    //进入页面就加载我的收藏
	if(token != undefined){
		$.ajax({
			type:"get",
			url:port+"/card/collect?type=0&token="+token,			
		    success:function(data){
		    console.log(typeof(data));    	
	    	if(typeof(data) == "string"){
				window.location.href = "login.html?his="+his;
			}else{
			console.log(data);
			for(var i=0,len=data.list.length; i<len;i++){
				var item=$('<div class="fav_content clearfix"><div class="fav_content_cen" data-itemtype="'+data.list[i].itemType+'" data-collectId="'+data.list[i].itemId+'"><img src="'+data.list[i].thumbnail+'"></div><div class="fav_content_ri" data-itemtype="'+data.list[i].itemType+'" data-collectId="'+data.list[i].itemId+'"><h2 data-itemtype="'+data.list[i].itemType+'" data-collectId="'+data.list[i].itemId+'">'+data.list[i].title+'</h2><p data-itemtype="'+data.list[i].itemType+'" data-collectId="'+data.list[i].itemId+'">'+data.list[i].about+'</p><div class="fav_content_ri_zf">'+new Date(data.list[i].createTime*1000).Formate()+'<img src="images/favorite.png" class="delete_q" data-collectId="'+data.list[i].collectId+'"></div></div></div>');					
				fav_add.append(item);
			}		
		    if(!data.list.length){
		    	fav_add.append("<h2 class = 'alert_fq'>暂无收藏！！</h2>");
		    }
		    less_q($('.fav_content p'));
			//这里处理点击选中删除操作  这里现在的数据是活动的 applyId
			//http://121.196.232.233:9292/card/activity/{id} 
			//数组用于保存选择的项目，然后在后边使用for循环来依次删除
			
			$(".fav_content_cen,.fav_content_ri h2,.fav_content_ri p").click(function(){	
				if($(this).data("itemtype") == 1){
					window.location.href = "enrol.html?activityId="+$(this).data("collectid");
				}else if($(this).data("itemtype") == 2){
					window.location.href = "life.html?id="+$(this).data("collectid");
				}				
			});
			$(".delete_q").click(function(){//删除图片事件，删除操作
				//for(var i = 0,len=arr.length;i<len;i++){	
				//http://121.196.232.233:9292/card/collect/{collectId}?token=e7120d7a-456b-4471-8f86-ac638b348a53  删除收藏接口				
				var delete_id = $(this).data("collectid");
				var r=confirm("确认删除这条收藏？")
				if (r==true){
					$.ajax({
						type:"DELETE",
						url:port+"/card/collect/"+delete_id+"?token="+token,
						contentType: "application/json",
						success:function(data){
							console.log(data);
							window.location.reload();
						},
						error:function(data){
							window.location.href = "login.html?his="+his;
						}
					});	
				}			
			})//删除操作结束位置				
		}
	},
		 error:function(data){
		 	console.log(data);
		 	window.location.href = "login.html?his="+his;
		 }
		})//进入页面get请求的结束位置
	}else{
		//alert("你还没有登录，请登录后再操作！！！！");
        window.location.href="login.html?his="+his;
	}
	Date.prototype.Formate=function(){
	    var y=this.getFullYear();
	    var m=this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);
	    var d=this.getDate()>9?this.getDate():'0'+this.getDate();
		var h=this.getHours()>9?this.getHours():'0'+this.getHours();
		var f=this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();
	    return (y+'-'+m+'-'+d+' '+h+':'+f);
	}
	//两行加省略
function less_q(text){
    // var text = $('.tit-wrap .detile p');
    var textLen = 26;
    for(var k=0,len=text.length;k<len;k++){
        console.log($(text[k]).html());
        if($(text[k]).html().length>textLen){
            var str = $(text[k]).html().substring(0,textLen)+"..."
            $(text[k]).html(str);
        }
    }
}
})









