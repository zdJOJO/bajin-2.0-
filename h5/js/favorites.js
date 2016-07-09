$(document).ready(function(){	
	//获取token
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
	// token = getCookie("token") || "795f7773-3efe-4c14-ab3e-19631cc38333";//便于本地测试
	token = getCookie("token");
	//获取页面的名称
	var his = window.location.pathname.split("/");
	his = his[his.length-1];
	
	//套路
	//加载活动的列表，依次加载出活动，商品和阅读
	function getActivity(type){
		if(token != undefined){
			$.ajax({
				type:"get",
				url:port+"/card/collect?type="+type+"&token="+token,			
			    success:function(data){
			    	console.log(data);    	
			    	if(typeof(data) == "string"){
						window.location.href = "login.html?his="+his;
					}else{
						$(".content").html("");
						//获取数据正常的时候渲染页面
						if(type == 1){//活动
							if(data.list.length != 0){//有收藏活动的时候
								for(var i=0,len=data.list.length;i<len;i++){
									var str = $('<div class="activity contentStyle" data-itemid="'+data.list[i].itemId+'"><img src="imgs/notSel.png" data-collectid="'+data.list[i].collectId+'" class="sel"/><img src="'+data.list[i].thumbnail+'" class="activityPic"/><div class="detail"><h3>'+data.list[i].title+'</h3><p>'+data.list[i].about+'</p></div></div>');									
									$(".content").append(str);
								}
								less_q($(".activity .detail p"));
								$(".contentStyle .detail,.contentStyle .activityPic").click(function(){//这里需要区分类型的
									window.location.href="enrol.html?id="+$(this).parent().data("itemid");
				    			});
							}else{//没有活动收藏
								var emptyPage = $('<center><img src="imgs/save_.png"/><h2>你还没有收藏任何活动</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>');
								$(".content").append(emptyPage);
								$(".content .turnPage").click(function(){
									window.location.href = "culb.html";
								});
							}							
						}else if(type == 2){//阅读							
							if(data.list.length != 0){
								for(var i=0,len=data.list.length;i<len;i++){
									var str = $('<div class="read contentStyle" data-itemid="'+data.list[i].itemId+'"><img src="imgs/notSel.png" data-collectid="'+data.list[i].collectId+'" class="sel"/><img src="'+data.list[i].thumbnail+'" class="activityPic"/><div class="detail"><h3>'+data.list[i].title+'</h3><p>'+data.list[i].about+'</p></div></div>');									
									$(".content").append(str);
								}
								less_q($(".read .detail p"));
								$(".contentStyle .detail,.contentStyle .activityPic").click(function(){//这里需要区分类型的
									window.location.href="life.html?id="+$(this).parent().data("itemid");
				    			});
							}else{
								var emptyPage = $('<center><img src="imgs/save_.png"/><h2>你还没有收藏任何阅读</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>');
								$(".content").append(emptyPage);
								$(".content .turnPage").click(function(){
									window.location.href = "read.html";
								});
							}
						}else if(type == 3){//商品收藏现在没有做，显示一个跳转到app下载的页面								
							if(data.list.length != 0){
								for(var i=0,len=data.list.length;i<len;i++){
									var str = $('<div class="brand contentStyle" data-itemid="'+data.list[i].itemId+'"><img src="imgs/notSel.png" data-collectid="'+data.list[i].collectId+'" class="sel"/><img src="'+data.list[i].thumbnail+'" class="activityPic"/><div class="detail"><h3>'+data.list[i].title+'</h3><p>'+data.list[i].about+'<br>'+data.list[i].price+'</p></div></div>');									
									$(".content").append(str);
								}
								less_q($(".brand .detail p"));
								$(".contentStyle .detail,.contentStyle .activityPic").click(function(){//这里需要区分类型的
									window.location.href="brandDetail.html?id="+$(this).parent().data("itemid");
				    			});
							}else{
								var emptyPage = $('<center><img src="imgs/save_.png"/><h2>你还没有收藏任何商品</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>');
								$(".content").append(emptyPage);
								//给再去看看的地方添加事件，导向到对应的页面
								$(".content .turnPage").click(function(){
									window.location.href = "pierre.html";
								});
							}	
						}else if(type == 5){//商铺收藏
							if(data.list.length != 0){
								for(var i=0,len=data.list.length;i<len;i++){
									var str = $('<div class="brand contentStyle" data-itemid="'+data.list[i].itemId+'"><img src="imgs/notSel.png" data-collectid="'+data.list[i].collectId+'" class="sel"/><img src="'+data.list[i].thumbnail+'" class="activityPic"/><div class="detail"><h3>'+data.list[i].title+'</h3><p>'+data.list[i].about+'<br></p></div></div>');									
									$(".content").append(str);
								}
								less_q($(".brand .detail p"));
								$(".contentStyle .detail,.contentStyle .activityPic").click(function(){//这里需要区分类型的
									window.location.href="mall.html?id="+$(this).parent().data("itemid");
				    			});
							}else{
								var emptyPage = $('<center><img src="imgs/save_.png"/><h2>你还没有收藏任何商铺</h2><p>再去看看吧</p><p class="turnPage">再去看看</p></center>');
								$(".content").append(emptyPage);
								//给再去看看的地方添加事件，导向到对应的页面
								$(".content .turnPage").click(function(){
									window.location.href = "pierre.html";
								});
							}
						}		
					}
				    //点击切换编辑与完成 
				    //现在要切换显示两块，不然添加事件不好操作
				    $(".edit .edit_all").bind("click",function(){//完成按钮
				    	$(this).parent().css("display","none");
				    	$(".sucs").css("display","block");
				    	// $(".select_all").children().children("img").attr("src","imgs/notSel.png");
				    	$(".contentStyle img.sel").css("display","none");
				    });
				    $(".sucs").bind("click",function(){//编辑按钮
				    	var seeMore = $(this).parent().siblings(".wrapper").find("center");
				    	console.log(!!seeMore.length);//这里需要判断是否为空页面
				    	if(!seeMore.length){
	  				    	$(this).css("display","none");
				    		$(".edit").css("display","block");
				    		$(".contentStyle img.sel").css("display","block");  		
				    	}else{
				    		return;
				    	}
				    });
			    	//单选按钮 绑定元素的事件，要等元素渲染出来的时候再进行,为避免事件冲突，在选择框来进行删除操作，右边的图片和内容绑定这个收藏详细链接
					$(".contentStyle .sel").click(function(){
						var itemid = $(this).data("itemid");				    	
						if($(this).attr("src") == "imgs/notSel.png"){
					    	$(this).attr("src","imgs/sel.png");
						}else{
							$(this).attr("src","imgs/notSel.png");
						}
						console.log(itemid);
					}); 				
				},
				error:function(data){
					console.log(data);
				}
			})
		}else{
			window.location.href = "login.html?his="+his;
		}
	}//填充页面的获取函数结束
	
	//这里处理活动||商品||阅读的页面切换
	$("header .activitys").click(function(){	
		switch_(this);
		getActivity(1);		
	});
	$("header .goods").click(function(){
		switch_(this);
		getActivity(3);
	});
	$("header .reads").click(function(){
		switch_(this);
		getActivity(2);
	});
	$("header .malls").click(function(){
		switch_(this);
		getActivity(5);
	});
	// 按钮切换事件函数
	function switch_(self){
		$(self).css("border-bottom","2px solid #666;");
		$(self).siblings().css("border-bottom","none");
		$(".edit").css("display","none");
		$(".sucs").css("display","block");
		$($(".edit .select_all")).children().children("img").attr("src","imgs/notSel.png");
		//点击切换的时候，全选应该置为空
	}
	//全选按钮
	$(".edit .select_all").click(function(){
		if($(this).children().children("img").attr("src") == "imgs/notSel.png"){
			$(this).children().children("img").attr("src","imgs/sel.png");
			$(".contentStyle .sel").attr("src","imgs/sel.png");	
		}else{
			$(this).children().children("img").attr("src","imgs/notSel.png");
			$(".contentStyle .sel").attr("src","imgs/notSel.png");
		}
	});

	//默认进入页面点击一次活动按钮，作为初始化
	$("header .activitys").click();
	// getActivity(1);
	// getActivity(2);
	// getActivity(3);

	//数组用于保存选择的收藏,执行删除操作需要使用
	//这里获取删除的id，要最后点击删除的时候来获取上面的id，以图片的地址来区分
    function deleteItem(){
	    var arr=[];
    	var selId = $(".contentStyle .sel");
    	for(var j=0,len=selId.length;j<len;j++){
	    	if($(selId[j]).attr("src") =="imgs/sel.png"){
	    		arr.push($(selId[j]).data("collectid"));	
			}
    	}
    	var target = selId.parent().attr("class").split(" ")[0]; 
    	console.log(arr);
    	$.ajax({
			type:"POST",
			url:port+"/card/collect/delete?token="+token,
			contentType: "application/json",
			data:JSON.stringify({
				idsList:arr
			}),
			success:function(data){
				console.log(data);
				console.log(target);
				$("header .activitys").click();
				if(target == "activity"){
					$("header .activitys").click();
				}else if(target == "read"){
					$("header .reads").click();
				}else if(target == "good"){
					$("header .goods").click();
				}				
				// window.location.reload();
			},
			error:function(data){
				window.location.href = "login.html?his="+his;
			}
		});
    }

	//删除操作的ajax请求
	// $.ajax({
	// 	type:"DELETE",
	// 	url:"http://121.196.232.233:9292/card/collect/"+delete_id+"?token="+token,
	// 	contentType: "application/json",
	// 	success:function(data){
	// 		console.log(data);
	// 		window.location.reload();
	// 	},
	// 	error:function(data){
	// 		window.location.href = "login.html?his="+his;
	// 	}
	// });

	$("header .activitys").click();//默认进入页面点击一次活动按钮，作为初始化
	// getActivity(1);
	// getActivity(2);
	// getActivity(3);


	$(".delete_all").bind("click",deleteItem);

	//格式化两行换行
	function less_q(text){
	    // var text = $('.tit-wrap .detile p');
	    var textLen = 26;
	    for(var k=0,len=text.length;k<len;k++){
	        // console.log($(text[k]).html());
	        if($(text[k]).html().length>textLen){
	            var str = $(text[k]).html().substring(0,textLen)+"..."
	            $(text[k]).html(str);
	        }
	    }
	}
})