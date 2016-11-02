/**
 * Created by Administrator on 2016/10/9.
 */
$(document).ready(function(){

    token = getCookie("token");//便于本地测试
    //获取页面的名称
    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var subjectId = window.location.search.split('=')[1];
    var page = 0;

    //获取主题信息
    $.ajax({
        type: 'get',
        url: port + '/card/subject/' + subjectId,
        success: function (result) {
            $('title').html(result.data.title);
            $( '.localTitle').html(result.data.title);
        },
        error: function (e) {
            //todo
        }
    });

    //分页获取产品
    function getLocalDisList(pageNum) {
        $.ajax({
            type: 'get',
            url: port + '/card/product/page?currentPage=' + pageNum + '&subjectId=' + subjectId,
            success: function (result) {
                var $tmpStr = '';
                var len = result.data.list.length;
                for(var i=0;i<len;i++){
                    $tmpStr = $('<div class="itemCell" data-productId="'+result.data.list[i].id+'" data-presold="'+result.data.list[i].preSold+'" data-num="'+result.data.list[i].sum+'">' +
                        '<div><img class="second" data-original="'+result.data.list[i].pic+'">' +
                        '<div class="second"><h3>'+result.data.list[i].title+'</h3><p>'+result.data.list[i].subtitle+'</p>' +
                        '<span>￥ '+result.data.list[i].costPrice.toFixed(2)+'</span></div></div>' +
                        '<div class="mask"></div><span class="none">距开抢 00天00时00分00秒</span></div>' );
                    //计时器
                    var difference = Math.round( parseInt( $tmpStr.attr('data-presold'))-new Date().getTime()/1000 );
                    if(difference < 0){
                        if($tmpStr.attr('data-num')==0){
                            $tmpStr.find('.none').html('已抢光');
                            $tmpStr.find('.mask').addClass('active');
                        }else {
                            $tmpStr.find('.none').hide();
                        }
                    }else {
                        $tmpStr.find('.mask').addClass('active');
                        leftTimer(difference,$tmpStr);
                    }
                    $('#localList').append($tmpStr);
                }

                //图片预加载
                $("#localList img").lazyload({
                    placeholder : "",
                    threshold: 0,
                    effect : "fadeIn",
                    effectspeed: 250,
                    event: 'scroll',
                });
                // 每次数据加载完，必须重置
                dropload.resetload();

                $('#localList').children('.itemCell').click(function () {
                    hitsOnFn(token,17,1,$(this).attr('data-productId'));
                    window.location.href = 'localDisDetail.html?productId=' + $(this).attr('data-productId');
                });
            },
            error: function (e) {
                //todo
            }
        });
    }

    var dropload = $('#localList').dropload({
        scrollArea : window,
        domDown : {
            domClass   : 'dropload-down',
            domRefresh : '<div class="dropload-refresh">↑上拉加载更多</div>',
            domLoad    : '<div class="dropload-load"><span class="loading"></span>加载中...</div>',
            domNoData  : '<div class="dropload-noData">已无数据</div>'
        },
        loadDownFn : function(me){
            page++;
            getLocalDisList(page,0);
            if(page == 1){
            	setTimeout('$(".dropload-down").css("height","0")',200);
            }
        }
    });


    //倒计时
    function leftTimer(difference,dom) {
        var timeP = setInterval(timer,1000);
        var $time = dom.find('.none');
        if(difference == 0){
            clearInterval(timeP);
        }
        function timer() {
            if(difference == 0){
                dom.find('.mask').removeClass('active');
                $time.hide()
            }

            var day = Math.floor(difference/(3600*24));
            var hour = Math.floor((difference-day*3600*24)/3600);
            var minute = Math.floor((difference-day*3600*24-hour*3600)/60);
            var second = difference - day*3600*24 - hour*3600 - minute*60;

            var da = day < 10 ? '0' + day : day;
            var hou = hour < 10 ? '0' + hour : hour;
            var min = minute < 10 ? '0'+ minute : minute ;
            var sec = second < 10 ? '0' + second-- : second-- ;
            $time.html('距开抢 ' + da + '天' + hou + '时' + min + '分' + sec + '秒');
            difference--;
        }
    }

});