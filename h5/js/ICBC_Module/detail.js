/**
 * Created by Administrator on 2016/8/31.
 */

$(function () {

    var port = "http://test.winthen.com";

    var searchStr = window.location.search;
    var cardId = searchStr.split('=')[1];

    //请求卡详情
    $.ajax({
        type: 'get',
        url: port + '/card/cardtype/' + cardId,
        success: function (result) {
            var cardTypeLen = result.data.cardMapModelList.length;
            var $propertyUl = $('#cardDetail').children('.ctg').find('ul');
            var $detailUl = $('#cardDetail').children('.content').find('.ul');
            $propertyUl.before('<img src="'+result.data.pic+'"><h3>'+ result.data.name +'</h3>');
            for(var i=0;i<cardTypeLen;i++){
                $detailUl.append('<div class="li">' +
                    '<span id="property'+ result.data.cardMapModelList[i].cardPropertyId +'"></span>' +
                    '<div class="p">'+ result.data.cardMapModelList[i].description +'</div></div>');

                $.get( port + '/card/property/' + result.data.cardMapModelList[i].cardPropertyId ,function (result_property) {
                    $propertyUl.append('<li><a href="#property'+ result_property.data.id +'">'+ result_property.data.title +'</a></li>');
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