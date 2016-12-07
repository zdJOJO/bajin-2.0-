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
	// token = getCookie("token") || "527224cd-4e00-4145-aadf-5e25115087f4";//便于本地测试
	token = getCookie("token");
	//获取页面的名称
	var his = window.location.pathname.split("/");
	his = his[his.length-1];




	var inpuJO = {};


	//获取购物车的商品
	function getShoppingCart(page) {
		if(token != undefined){
			$.ajax({
				type:"get",
				url:port+"/card/car?currentPage="+page+"&size="+ 10 +"&token="+token,
				dataType:"json",
				async:true,
				success:function(data){
					//填写数据,要区分
					if(data.list.length != 0){
						if(page == 1 && data.list.length < 10){
							$(".dropload-down").css("height","0");
						}
						for(var i=0,len = data.list.length;i<len;i++){
							str += '<div class="singleBrand" >' +
								'<input type="checkbox" id="checkbox-'+ i +'" value="false" data-cardid = "'+data.list[i].carModel.id+ '" data-cost="'+data.list[i].skuModel.skuPrice+'" data-num="'+data.list[i].carModel.num+'" class="regular-checkbox" />' +
								'<label for="checkbox-'+ i +'"></label>' +
								'<img src="'+ data.list[i].goodsModel.hotPic+'" class="activityPic" data-id="'+ data.list[i].carModel.goodsId+'"/>' +
								'<div class="detail" data-id="'+ data.list[i].carModel.goodsId+'"><h3>'+
								data.list[i].goodsModel.goodsTitle+'</h3><p class="subtitle">'+
								data.list[i].skuModel.skuGague +'</p><p class="singleCost"><span>￥&nbsp;'+
								data.list[i].skuModel.skuPrice.toFixed(2)+'</span><span>×'+
								data.list[i].carModel.num+'</span><div class="count"><span class="reduce count-i" data-cardid="'+
								data.list[i].carModel.id+'" data-skuid="'+data.list[i].carModel.skuId+'" data-stockNumber="'+data.list[i].skuModel.stockNumber+'">-</span>' +
								'<span class="num count-i">'+data.list[i].carModel.num+'</span><span class="add count-i" data-cardid="'+
								data.list[i].carModel.id+'" data-skuid="'+data.list[i].carModel.skuId+'" data-stockNumber="'+data.list[i].skuModel.stockNumber+'">+</span></div></p></div></div>';
						}

						$(".content").append(str);
						str = '';
						myDropload.resetload();

						less_q($(".singleBrand .detail p.subtitle"));


						inpuJO = $('.singleBrand>input');
						//单个选择事件
						$(".singleBrand >label").click(function(){
							if( $(this).siblings('input').attr('value') == 'false'){
								$(this).siblings('input').attr('value','true');
								costAll();
							}else{
								$(this).siblings('input').attr('value','false');
								costAll();
							}
						});

						//全选 按钮
						$('#checkboxAll').click(function () {
							if($(this).attr('value') == 'false'){
								$(this).attr('value','true').prop('checked',true);
								inpuJO.each(function () {
									$(this).attr('value','true').prop('checked',true)
								});
								costAll()
							}else {
								$(this).attr('value','false').prop('checked',false);
								inpuJO.each(function () {
									$(this).attr('value','false').prop('checked',false)
								});
								costAll()
							}
						});


						//点击信息与图片跳转到商品详情，点击前边选择框选中商品
						$(".singleBrand>img , .detail").bind("click",function(){
							window.location.href = "brandDetail.html?id=" + $(this).data("id");
						});

					}else{
						if(page > 1){
							// 锁定
							myDropload.lock();
							// 无数据
							myDropload.noData();
							setTimeout('$(".dropload-down").css("height","0")',1000);
						}else {
							if(page == 1){
								$(".dropload-down").css("height","0");
							}
							var emptyPage = $('<center><img src="imgs/shoppingCart.png"/><h2>你的购物车空空如也</h2><p>快去逛逛吧</p><p class="turnPage">再去逛逛</p></center>');
							$(".content").append(emptyPage);
							$(".content .turnPage").click(function(){
								window.location.href = "pierre.html";
							});
						}
					}

					//加减操作
					var addBtn=$('.add');
					var personNum=$('.num');
					var reduceBtn=$('.reduce');
					var curNum=1;

					addBtn.click(function(){
						setNum(true,this);
					});
					reduceBtn.click(function(){
						setNum(false,this);
					});
					//true为++，false为--
					function setNum(type,self){
						var cardid = $(self).data("cardid");
						var skuId = $(self).data("skuid");
						var stockNumber = $(self).data("stockNumber");
						curNum = $(self).siblings(".num").html();
						if(type){
							if(curNum == stockNumber){
								$.alert('数量不能超过限量哦');
								return;
							}else {
								curNum++
							}
						}else{
							if(curNum==1){
								return
							}else {
								curNum--;
							}
						}
						$(self).siblings(".num").html(curNum);
						$(self).parent().siblings(".singleCost").find("span:nth-child(2)").html("×"+curNum);
						//调用函数来更新数量
						update(cardid,curNum,skuId);
					}
				},
				error:function(data){
					//	todo
				}
			});
		}else{
			window.location.href = "login.html?his="+his;
		}
	}




	//编辑按钮切换
	$("header .edit_all").bind("click",function(){
		$(".detail").unbind('click');
		$(".edit_all").css("display","none");
		$(".edit_").css("display","block");
		$(".edit").css("display","block");
		$(".done").css("display","none");
		//清除全选的按钮
		$(this).siblings().find(".select_all p img").attr("src","imgs/notSel.png");
		//同时需要清除已经选中的状态
		$(".done .cost").html("￥&nbsp;0");
		$(".done .brandNum span").html("");
		//切换的时候要清除选中的状态
		$(".singleBrand .sel").attr("src","imgs/notSel.png");
		$(".singleBrand .singleCost").css("display","none");
		$(".singleBrand .count").css("display","block");
	});


	$("header .edit_").bind("click",function(){
		$(".edit_").css("display","none");
		$(".edit").css("display","none");
		$(".edit_all").css("display","block");
		$(".done").css("display","block");

		$(".singleBrand .sel").attr("src","imgs/notSel.png");
		$(".done .cost").html("￥&nbsp;0");
		$(".done .brandNum span").html("");
		$(this).siblings().find(".select_all_ p img").attr("src","imgs/notSel.png");
		$(".singleBrand .singleCost").css("display","block");
		$(".singleBrand .count").css("display","none");
		location.reload();
	});




	//编辑删除页面的全选与全取消
	$(".edit .select_all_").bind("click",function(){
		if($(this).find("img").attr("src")=="imgs/notSel.png"){
			$(this).find("img").attr("src","imgs/sel.png");
			$(".singleBrand .sel").attr("src","imgs/sel.png");
		}else{
			$(this).find("img").attr("src","imgs/notSel.png");
			$(".singleBrand .sel").attr("src","imgs/notSel.png");
		}
	});




	// 购物车 商品选择 选择之后触发的事件
	function costAll(){
		var checkNum = 0;  //被勾选的数量，用于底部小括号的数字
		var brandObj = {
			cards: [],
			numAll: 0
		};
		var cost = 0;//价格
		var number = 1;//单个商品的数量
		var cardids=[];

		for(var i=0;i<inpuJO.length;i++){
			if( $(inpuJO[i]).attr('value') == 'true'){
				number = $(inpuJO[i]).data('num');
				brandObj.numAll += number;
				cost += $(inpuJO[i]).data("cost") * number;
				var cardid = $(inpuJO[i]).data("cardid");
				cardids.push(cardid);
				checkNum++;
			}
		}
		$(".done").find('.cost').html("总计:"+ '<span style="color: #c1af74">￥'+cost.toFixed(2)+'</span>');

		if($('.done').is(':hidden')){
			$(".delete_all").children('span').html('删除 ('+checkNum+')');
		}else  {
			$(".done").find('.brandNum p').html('结算 ('+checkNum+')');
		}

		brandObj.cards = cardids;

		return brandObj;
	}



	//购物车，购买商品按钮,这里如果全部信息都通过url明显是不现实的，所以需要传递改变的量，也就是确定颜色的商品的skuId，对应商品的数量
	//然后在填写订单的页面再请求的到需要的字段,
	$(".done .brandNum").bind("click",function(){
		if(costAll().numAll==0){
			$.alert("你还没选择商品")
		}else {
			var skuIdStr = '';
			var tmpArray = costAll().cards;
			for(var i=0; i<tmpArray.length; i++){
				skuIdStr +=  tmpArray[i] + '&&' ;
			}
			//cards 用于判读
			if(tmpArray.length > 0){
				window.location.href = "fillInOrder.html?isShoppingCart=true&cards&obj=" + escape(JSON.stringify(costAll()));
			}else {
				$.alert('请选择商品');
			}
		}



	});
	//更新数量函数
	function update(cardid,num,skuId){
		$.ajax({
			type:"put",
			url:port+"/card/car/"+cardid+"?token="+token,
			async:true,
			dataType:"json",
			contentType : "application/json;charset=UTF-8",
			data:JSON.stringify({
				num:num,
				skuId:skuId
			}),
			success:function(data){
				console.log(data);
			},
			error:function(data){
				console.log(data);
			}
		});
	}//更新数量函数结束



	//删除购物车里边的东西的函数
	function deleteDate(cardid){
		$.ajax({
			type:"DELETE",
			async:true,
			dataType:"json",
			url:port+"/card/car/goods/"+cardid+"?token="+token,
			success:function(data){
				console.log(data);
				window.location.reload();
			},
			error:function(data){
				console.log(data);
			}
		});
	}//删除购物车里边的东西的函数结束


	//删除按钮事件
	$(".delete_all").bind("click",function(){
		if(costAll().numAll==0){
			$.alert("你还没选择商品")
		}else {
			$.modal({
				title: "提示",
				text: "确认删除所选商品？",
				buttons: [
					{ text: "确认", onClick: function(){
						var obj = costAll();
						// for(var i in obj){
						// 	deleteDate(obj[i]);
						// }
						var cards = obj.cards;
						for(var i=0,len=cards.length;i<len;i++){
							deleteDate(cards[i]);
						}
						//删除成功，然后重新请求数据，再点击一下编辑按钮。
						$(".done .edit_all").click();
					} },
					{ text: "取消", className: "default", onClick: function(){ console.log(3)} },
				]
			});
		}
	});//删除按钮事件结束






	//初始化  滚动
	if(!token){
		window.location.href = "login.html?his="+his;
	}else {
		//  loading 加载 插件
		var pageNum = 0 ;
		var str = '';
		// dropload
		var myDropload = $('.wrapper').dropload({
			scrollArea : window,
			loadDownFn : function(){
				pageNum++;
				getShoppingCart(pageNum)
			}
		});
	}


})



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