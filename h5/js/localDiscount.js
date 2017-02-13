/**
 * Created by Administrator on 2016/10/9.
 */
$(document).ready(function(){
    var userId = 0;
    var token = getCookie("token") || 0;//便于本地测试
    //获取页面的名称
    var his = window.location.pathname.split("/");
    his = his[his.length-1];

    var subjectId = GetQueryString('id');
    var page = 0;

    var userId_2 = GetQueryString('userId');
    var isWX = browserFn('wx'); //判断是否为微信内置浏览器
    var isAndroid = terminalFn('Android');
    if(userId_2 && isWX){
        $('#mask').show();
        if(isAndroid){
            $('#mask').css({
                'background' : 'url("./imgs/mask_Android.png") no-repeat',
                'background-size' : '100%'
            });
        }
    }else if(userId_2 && !isWX){
        window.location.href = 'bjzx://data?itemType=16&itemId='+ subjectId +'&userId=' + userId_2 ;
        setTimeout(function () {
            window.location.href = './accountManager/download.html?itemType=16&itemId='+ subjectId +'&userId=' + userId_2 ;
        },4000);
    }


    //分享时候 传当前页面的url 和 对象obj
    get_url(window.location.href);

    if(userId_2){
        hitsOnFn(token,16,1,subjectId,userId_2);
    }else {
        hitsOnFn(token,16,1,subjectId);
    }


    //请求客户经理状态  获取userId
    $.get( port + '/card/icbcManger/check?token='+token ,function (res) {
        //是否是客户经理
        if(res.data){
            userId = res.data.userId;
        }
    });

    //获取主题信息
    $.ajax({
        type: 'get',
        url: port + '/card/subject/' + subjectId,
        success: function (result) {
            $('title').html(result.data.title);
            $( '.localTitle').html(result.data.title);
            console.log(userId)
            //调用分享借口
            jsSdkApi('share',{
                title: result.data.title,
                desc: result.data.subtitle,
                link: (userId==0||!userId )? portStr+'/localDiscount.html?id='+result.data.id :
                portStr+'/localDiscount.html?id='+result.data.id+'&userId='+userId ,
                imgUrl: result.data.pic
            },{
                token: token,
                type: 16,
                subType: 4,
                typeId: result.data.id
            });
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
                        '<div><div class="imgBox"><img data-original="'+result.data.list[i].pic+'"></div>' +
                        '<div class="second"><h3>'+result.data.list[i].title+'</h3><p>'+result.data.list[i].subtitle+'</p>' +
                        '<span>￥'+result.data.list[i].costPrice.toFixed(2)+'</span></div></div>' +
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