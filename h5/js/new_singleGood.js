/**
 * Created by Administrator on 2016/7/24.
 */
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
token = getCookie("token");//便于本地测试
// token = getCookie("token");
//获取页面的名称
var his = window.location.pathname.split("/");
his = his[his.length-1];
his = his + window.location.search;

//获取商品http://121.196.232.233/card/goods/{goodsId}
var goodsid = window.location.search.split("=")[1]?window.location.search.split("=")[1]:1;
if(/&/g.test(goodsid)){
    goodsid = goodsid.split("&")[0];
}








var data_pic = '';
var buyNum = 1;

var currentNum = 0;  //加减时候 用到
var chooseSpeStr = '' ; // 用于赋值给 弹框外部的 ‘已选择’的值


//获取商品详细信息
var getGoodDetail = function () {
    $.ajax({
        type: "get",
        url: port+"/card/goods/" + 26,
        async: true,
        dataType: "json",
        success: function(data){
            data_pic = data.hotPic;

            $(".buyNow").attr("data-goodsid",data.goodsId);
            $(".wrapper .title").html(data.goodsTitle);
            $(".wrapper .subtitle").html(data.goodsSubtitle);


            // $(".buyNow").attr("data-pic",data.maxPic);



            $(".message_1").html(data.goodsDetail);
            $(".message_1 img , .message_1 a").css({
                'width': '100%',
                'height': 'auto'
            });

            
            var picList = data.goodsPics;
            picList = JSON.parse(picList);
            $(".brandDetail").click();
            $(".saveAndShare").attr("data-itemid",data.goodsId);

            var picArray = []
            for(var i in picList){
                picArray.push(picList[i]);
            }
            var str = '';
            for(var i=0 ; i<picArray.length;i++){
                str += '<div class="swiper-slide"><img src="'+ picArray[i] +'"/></div>' ;
            }
            $(".swiper-wrapper").append($(str));
            //保存当前的商品的图片地址到立即购买按钮上
            if(picArray.length > 1){
                var mySwiper = new Swiper('.swiper-container', {
                    loop: false,
                    autoplay: 3000,
                    speed:	300,
                    scrollbar:'.swiper-scrollbar',
                    scrollbarHide : false,
                    scrollbarDraggable : true ,
                    scrollbarSnapOnRelease : true ,
                });
            }

            getGoodSkuInfo();
        },
        error: function () {
            //todo
        }
    })
};

getGoodDetail();






// 获取商品 sku 详细信息
var getGoodSkuInfo = function () {
    $.ajax({
        type: "get",
        url: port + "/card/goods/" + 26 + "/sku",
        dataType: "json",
        success: function (result) {
            sureGoodInfo(result);
        },
        error: function () {
            //todo
        }
    })
};


// 对弹出框 进行 商品各个规格 赋值
var sureGoodInfo = function (data_sku) {

    $('#goodDetail >.name>.goodHeadPic').attr('src',data_pic);
    // $('#goodDetail >.name>.info').append('<li class="price">+'data.'+</li><li></li><li></li>');

    var speStr = '';
    for(var i=0; i<data_sku.length; i++){
        speStr += '<li class="spe" data-num=" '+ i +' ">'+ data_sku[i].skuGague +'</li>'
    }
    $('#goodDetail>.specifications>.speList').append(speStr);

    //初始化 默认值
    $('.wrapper>.primeCost>span').html('￥ ' + data_sku[0].costPrice.toFixed(2));
    $('.wrapper>.currentCost>span').html('￥ ' + data_sku[0].skuPrice.toFixed(2));
    $('.wrapper>.stock >span').html( data_sku[0].skuGague + '×'+ buyNum);  // 默认是1
    $('#goodDetail>.specifications li').eq(0).addClass('active');
    $('#goodNum').val(1);  // 默认是1
    currentNum = data_sku[0].stockNumber;
    chooseSpeStr = data_sku[0].skuGague;
    oneSpe(data_sku[0]);


    //每个型号选择
    $('#goodDetail>.specifications li').click(function () {

        currentNum = data_sku[ parseInt($(this).attr('data-num')) ].stockNumber;
        chooseSpeStr = data_sku[ parseInt($(this).attr('data-num')) ].skuGague;

        if($(this).hasClass('active')){
            return
        }else {
            $(this).addClass('active').siblings().removeClass('active');
        }

        oneSpe( data_sku[ parseInt($(this).attr('data-num')) ] );
    });



}



//点击 具体规格时候
var oneSpe = function (sku_info) {

    $('#goodDetail>.name>.price').html('￥ ' + sku_info.skuPrice.toFixed(2));
    $('#goodDetail>.name>.count').html('库存' + sku_info.stockNumber + ' 件');
    $('#goodDetail>.name>.spe>span').html(sku_info.skuGague);

}


//加减
$('#plus').click(function () {

    if(buyNum <= currentNum){
        buyNum++ ;
        $('#goodNum').val(buyNum);
        $('.wrapper>.stock >span').html( chooseSpeStr + '×'+ buyNum);
    }else {
        $.alert("数量不能大于库存");
        return;
    }
});

$('#sub').click(function () {
    if(buyNum > 1 && buyNum <= currentNum){
        buyNum--;
        $('#goodNum').val(buyNum);
        $('.wrapper>.stock >span').html( chooseSpeStr + '×'+ buyNum);
    }else {
        $.alert("数量不能小于1");
        return;
    }
});











//立即购买
$('#buyNow').click(function () {

});






// 弹出层 确认 操作，  从  立即购买/加入购物车/选择 三个按钮进入
$('#goodDetail>button').click(function () {
    
});



//加入购物车 立即购买  选择
$('#addToShoppingCart ,#buyNow, .wrapper>.stock').click(function () {
    if($(this).attr('id') == 'addToShoppingCart'){
        $('#goodDetail>.btnBox').hide();
        $('#goodDetail>button').show();
        $('#goodDetail>button').html('确认加入');
    }else  if($(this).attr('id') == 'buyNow'){
        $('#goodDetail>.btnBox').hide();
        $('#goodDetail>button').show();
        $('#goodDetail>button').html('确认购买');
    }else{
        $('#goodDetail>.btnBox').show();
        $('#goodDetail>button').hide();
    }

    $('footer').hide();
    $('#mask').fadeIn(150);
    $("#goodDetail").show().animate({
        height:'65%'
    });
});



//弹出层
$('#mask').click(function () {
    $(this).fadeOut(150);
    $('#goodDetail').animate({
        height:'0'
    });
    setTimeout('$("#goodDetail").hide()',200);
    $('footer').show();
});

//关闭弹出
$("#goodDetail>.name>.close").click(function () {
    $('#mask').click();
});