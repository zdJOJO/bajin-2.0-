/**
 * Created by Administrator on 2017/01/04 0004.
 */
$(function(){
    var userId = GetQueryString('userId');
    var page = 1;
    var headPic = '../img/headPic_default.png';

    function getList(currentPage,size) {
        $.ajax({
            type: 'get',
            url: port + '/card/icbcManger/invite/result?userId='+userId+'&currentPage='+currentPage+'&size='+size,
            success: function (res) {
                if(res.data.list.length > 0){
                    var str = '';
                    var typeStr = '';
                    for (var i=0;i<res.data.list.length;i++){
                        switch (res.data.list[i].itemType){
                            case 1:
                                typeStr = '活动';
                                break
                            case 3:
                                typeStr = '臻品';
                                break
                            case 16:
                                typeStr = '主题';
                                break
                            case 17:
                                typeStr = '乐享'; //本地优惠
                                break
                            case 26:
                                typeStr = '注册';
                                break
                        }
                        headPic = res.data.list[i].userModel.headPic || headPic ;
                        str += ' <li class="sort_list"><img src="'+headPic+'"><div class="second">' +
                            '<span class="name">'+res.data.list[i].userModel.userName+'</span><p class="content">' +
                            '<span>'+res.data.list[i].title+'</span></p></div>' +
                            '<div class="third">' +
                            '<span class="time">'+timeAgo(new Date().getTime()/1000-res.data.list[i].updateTime)+'</span><br>' +
                            '<span>'+typeStr+'</span></div></li>';
                    }
                    $('ul').append(str);
                    $('#loadMore').children('.spinner').hide();
                }else {
                    setTimeout(function () {
                        $('#loadMore').fadeOut();
                    },5000)
                }
            },
            error: function (e) {
                //todo
            }
        })
    }

    $('#loadMore').click(function () {
        $(this).children('.spinner').show().siblings().hide();
        page++;
        getList(page,20);
    });

    getList(page,20);


    var timeAgo = function (preTime) {
        if(preTime<60){
            return parseInt(preTime)+"秒前";
        }else if((preTime/60)<60){
            return parseInt(preTime/60)+"分钟前";
        }else if((preTime/3600)<24){
            return parseInt(preTime/3600)+"小时前";
        }else if((preTime/3600/24)<30){
            return parseInt(preTime/3600/24)+"天前";
        }else if((preTime/3600/24/30)<12){
            return parseInt(preTime/3600/24/30)+"月前";
        }else{
            return parseInt(preTime/3600/24/365)+"年前";
        }
    };
});