/**
 * Created by Administrator on 2016/8/31.
 */

$(function () {
    var href = window.location.href;
    var searchStr = window.location.search;

    //微信分享时候 会在url后面带参数
    var cardId = searchStr.split('=')[1];
    if(searchStr.indexOf('isappinstalled') > 0){
        cardId = searchStr.split('&')[0].split('=')[1];
    }


    //分享时候 传当前页面的url 和 对象obj
    get_url(href);

    //请求卡详情
    $.ajax({
        type: 'get',
        url: port + '/card/cardtype/' + cardId,
        success: function (result) {

            var shareDesc = result.data.cardMapModelList[0].description.replace(/<[^>]+>/g,"").replace(/[^\u4e00-\u9fa5]/gi,"");
            // //调用分享借口
            jsSdkApi('share',{
                title: result.data.name,
                desc: shareDesc,
                link: href,
                imgUrl: result.data.pic
            });

            var cardTypeLen = result.data.cardMapModelList.length;
            var $propertyUl = $('#cardDetail').children('.ctg').find('ul');
            var $detailUl = $('#cardDetail').children('.content').find('.ul');
            $propertyUl.before('<img src="'+result.data.pic+'"><h3>'+ result.data.name +'</h3>');
            for(var i=0;i<cardTypeLen;i++){
                $detailUl.append('<div class="li">' +
                    '<span id="property'+ result.data.cardMapModelList[i].cardPropertyId +'"></span>' +
                    '<div class="p">'+ result.data.cardMapModelList[i].description +'</div></div>');

                $.get( port + '/card/property/' + result.data.cardMapModelList[i].cardPropertyId ,function (result_property) {
                    $('#property' + result_property.data.id).html( '| ' + result_property.data.title);

                    //点击属性 平滑滚动
                    scrollSmoothSlib('cardDetail');
                });
            }
        },
        error: function (e) {
            //todo
        }
    });

});