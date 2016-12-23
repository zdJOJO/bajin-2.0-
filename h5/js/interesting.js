/**
 * Created by Administrator on 2016/12/22 0022.
 */

$(function(){
    //兴趣的分页 暂且没做
    var token = getCookie('token');

    var id_Array = []; //存放选中的兴趣id
    var ids = '';  // id_Array.join('bjzx')
    var $list = $('#zc_content').children('ul');
    var interestingStr = '';


    $('#gb_but').click(function () {
        history.go(1)
    });

    function getInterestingList(currentPage,size) {
        $.ajax({
            type: 'get',
            url: port + '/card/interest?currentPage='+currentPage+'&size='+size,
            success: function (res) {
                var len = res.data.list.length;
                for (var i=0;i<len;i++){
                    interestingStr += '<li class="itemInterest">' +
                        '<input type="checkbox" id="i'+res.data.list[i].id+'">' +
                        '<label for="i'+res.data.list[i].id+'" data-id="'+res.data.list[i].id+'">' +
                        '<img src="'+res.data.list[i].pic+'">' +
                        '<span>'+res.data.list[i].title+'</span></label></li>';
                }
                $list.append(interestingStr);

                $('.itemInterest label').click(function () {
                    var array = [];
                    array.push($(this).attr('data-id'));
                    if($(this).siblings("input[type='checkbox']").is(':checked')){
                        id_Array = id_Array.concat(array).unique_delete();
                    }else {
                        id_Array = id_Array.concat(array).unique();
                    }
                });
            },
            error: function (e) {
                //todo
            }

        })
    }
    getInterestingList(1,10);


    $('#finished').click(function () {
        ids = id_Array.join('bjzx');
        if(ids.length == 0){
            alert('请选择兴趣')
        }
        $.ajax({
            type: 'put',
            url: port + '/card/interest/update/userInterest?token='+token+'&ids='+ids,
            success: function (res) {
                if(res.code == '201'){
                    //测试  环境
                    window.location.href = 'index.html';

                    // //正式环境  微信授权
                    // var token = getCookie("token");
                    // window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx886a1d1acb7084a5&redirect_uri=http%3a%2f%2fwww.winthen.com%2fcard%2fweixin%2fauthorize&response_type=code&scope=snsapi_base&state=" + token + "bjzx" + "index.html#wechat_redirect";
                }
            },
            error: function (e) {
                //todo
            }
        });
    });
});


// 数组合并（不重复）
Array.prototype.unique = function(){
    var a = {};
    for(var i = 0; i < this.length; i++){
        if(typeof a[this[i]] == "undefined")
            a[this[i]] = 1;
    }
    this.length = 0;
    for(var i in a)
        this[this.length] = i;
    return this;
}

// 数组合并（去掉重复）
Array.prototype.unique_delete = function(){
    var a = {},
        b = {},
        n = this.length;
    for(var i = 0; i < n; i++){
        if(typeof(b[this[i]]) != "undefined")
            continue;
        if(typeof(a[this[i]]) == "undefined"){
            a[this[i]] = 1;
        }else{
            b[this[i]] = 1;
            delete a[this[i]];
        }
    }
    this.length = 0;
    for(var i in a)
        this[this.length] = i;
    return this;
}
