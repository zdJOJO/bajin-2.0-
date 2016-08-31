/**
 * Created by Administrator on 2016/8/31.
 */

$(function () {

    //点击属性 平滑滚动
    $("#cardDetail").find('a').click(function() {
        $("html, body").animate({
            scrollTop: $($(this).attr("href")).offset().top + "px"
        }, {
            duration: 500,
            easing: "swing"
        });
        return false;
    });
    
    
});