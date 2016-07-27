/**
 * Created by Administrator on 2016/7/27.
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


//获取页面的名称
var his = window.location.href.split("/");
his = his[his.length-1];



var mallobj = {};
mallobj.mallId = window.location.search.split("&")[0].split("=")[1];
mallobj.currentDiscount = window.location.search.split("&")[1].split("=")[1];

var price1 = 0 ;
var price2 = 0 ;
var totalPrice = '';   //折后合计
var userId = '';

//计算价格
var calculateDisAmountFn = function (id) {

    price1 = parseFloat($('#' + id).val());

    if( !price1){
        price1 = 0;
    }
    
    $('#hasDisAmount_2').html('￥' + (price1 * mallobj.currentDiscount).toFixed(2) );
    
    //合计
    $('#totalAmount_1').html('￥' + (price1 + price2).toFixed(2));
    $('#totalAmount_2').html('￥' + ( price1* mallobj.currentDiscount + price2).toFixed(2));
    totalPrice = (price1* mallobj.currentDiscount + price2).toFixed(2);
};

var calculateUnDisAmountFn = function (id) {
    price2 = parseFloat($('#' + id).val());

    if( !price2){
        price2 = 0;
    }

    $('#unDisAmount_2').html('￥' + price2.toFixed(2) );

    //合计
    $('#totalAmount_1').html('￥' + (price1 + price2).toFixed(2));
    $('#totalAmount_2').html('￥' + ( price1* mallobj.currentDiscount + price2).toFixed(2));
    totalPrice = (price1* mallobj.currentDiscount + price2).toFixed(2);
};




//  已优惠消费--disPrice  未优惠消费--nodisPrice   折后合计--price
//提交 商铺订单
$('#sure').click(function () {
    if(token){
        var data = {
            mallId: mallobj.mallId,
            userId: userId,
            disPrice: price1,
            nodisPrice: price2,
            price: totalPrice
        }
        if(totalPrice == 0){
            $.alert('请正确填写价格');
            return;
        }

        $.ajax({
            type: 'post',
            dataType: "json",
            contentType : "application/json",
            url: port + '/card/mallorder',
            data: JSON.stringify(data),
            success: function (result) {
                $.alert('创建成功');
            },
            error: function () {
                //todo
            }
        });

    }else {
        //todo

        // $.modal({
        //     title: "支付失败",
        //     text: "请登录后再支付",
        //     buttons: [
        //         { text: "点击登录", onClick: function(){ window.location.href = "login.html?his=" + escape(his);} },
        //         { text: "确定", className: "default", onClick: function(){} },
        //     ]
        // });
    }

});


//获取userId
$.get(port+"/card/user?token="+token , function (data) {
    userId = data.userId ;
});







































