// ==UserScript==
// @name         ManualGetDouYinComments
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  手动根据关键词获取抖音评论信息
// @author       You
// @match        https://www.douyin.com/*
// @match        https://www.douyin.com/search/*
// @match        https://www.douyin.com/root/search/*
// @match        https://www.douyin.com/user/*
// @require       http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @require       https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// @require       https://cdn.jsdelivr.net/npm/jutils-src
// @grant        none
// ==/UserScript==


/*====== 你的代码 ======*/
var window_url = window.location.href;
var domain = window.location.host;
var source_url = window_url.split('?')[0];
console.log(window_url);
console.log(domain);
console.log(source_url);
console.log(window.location);

var isRun = true;
var allCommentNum=0;
var sucCommentNum=0;

(function() {
    'use strict';

    function initHtml(){
        var html = document.createElement('div');
        html.innerHTML = `<div id="adHtml" style="width: 100%; height: 30px;background-color:#000000;z-index: 9999999;position: fixed;top:0;color: white;font-size: 18px;padding:5px;font-size:13px;">
        <span style="margin-left:20px;">关键字:<input type="text" id="tags" name="tags" style="margin-left:6px;color:white;width:600px;background-color:#2c2c2c;" value="多钱,多少钱,多少米,怎么卖,怎么买,怎么联系,在哪买,想买,想要,有没有,电话,位置,联系,价格,求带,合作"></span>
        <span>时间范围:<select id="stime"><option value="3">3天</option><option value="7">7天</option><option value="15" selected>15天</option><option value="30">30天</option><option value="60">60天</option><option value="90">90天</option>
</select></span>
        <span><input type="checkbox" id="is_start" name="is_start" value="1" style="margin-left:20px;" checked>启用程序</span>
        <span class="m_act_btn" style="margin-left:60px;">统计: <b id="allCommentNum">0</b> <b id="sucCommentNum" style="margin-left:20px;">0</b></span>
        <span id="resetNum" style="margin-left:60px;color:#008eff;">[重置计数]</span>
        </div>`;
        document.body.appendChild(html);
    }

    initHtml();




    //return;
    //alert(30);


    $(document).on('click', '#is_start', function() {
         var flag = $("#is_start").is(':checked');
         isRun=flag;
    });
    $(document).on('click', '#resetNum', function() {
         allCommentNum=0;
         sucCommentNum=0;
        $("#allCommentNum").html(allCommentNum);
        $("#sucCommentNum").html(sucCommentNum);
    });
    $(document).on('click', '.user_manual_comment', function() {
        var user_nickname=$(this).siblings().eq(0).find("span").last().html();
        user_nickname = user_nickname.replace(/<[^>]*>/g, '');
        var user_sec_uid = $(this).siblings().eq(0).find("a").attr("href").split("/");
        user_sec_uid = user_sec_uid.pop();
        console.log(user_nickname,user_sec_uid);
        $(this).css("color","green");
    });

    //定时器持续查找元素并增加到元素后面
    var timerId = setInterval(function(){
        $(".comment-item-info-wrap").each(function(index, element) {
            var d = $(element).find("div").eq(0).attr("flag");
            if(d==undefined){
                $(element).find("div").eq(0).append("<div class='user_manual_comment' style='margin-left:5px;color:red;font-size:14px;font-weight:600;height:22px;'>[收集]</div>");
                $(element).find("div").eq(0).attr("flag","1");
            }
        });
    },1000);

    ah.proxy({
        onRequest: (request, handler) => {
			handler.next(request);
		},

        //请求成功后进入
        onResponse: (response, handler) => {
            //console.log("----->>>>",response.config.url,isRun);
            if(isRun){
                //搜索后list作品列表
                if(response.config.url.startsWith('/aweme/v1/web/comment/list/')){
                    console.log("+++++++");
                    var data = $.parseJSON(response.response);
                    console.log("评论列表数据:",data);
                    if(data.hasOwnProperty("comments")){
                        allCommentNum = data["comments"].length + allCommentNum;
                        var tag=$("#tags").val();
                        var stime = $("#stime").val();
                        var select_day = parseInt(stime);
                        if(tag !=""){ //有关键字
                            var tags=tag.split(",");
                            var nowTime = Math.floor(Date.now() / 1000);
                            var chaTime = 60*60*24*select_day; // ?天内
                            var comments=[];
                            for(let item of data["comments"]){
                                var text = item["text"];
                                var flag=false;
                                for(let t of tags){
                                    if (text.indexOf(t) !=-1){
                                        flag=true;
                                        break;
                                    }
                                }
                                if(flag==false) {
                                    continue;
                                }

                                var jsTime = nowTime - item.create_time;
                                if(jsTime <= chaTime) {
                                    var info={"aweme_id":"","text":"","user_nickname":"","user_uid":"","user_unique_id":"","user_sec_uid":"","user_signature":"","ip_label":"","create_time":item.create_time};
                                    if(item.hasOwnProperty("aweme_id")){
                                        info.aweme_id = item["aweme_id"];
                                    }
                                    if(item.hasOwnProperty("text")){
                                        info.text = item["text"];
                                    }
                                    if(item.hasOwnProperty("ip_label")){
                                        info.ip_label = item["ip_label"];
                                    }
                                    if(item.hasOwnProperty("user")){
                                        info.user_nickname = item["user"]["nickname"];
                                        info.user_sec_uid = item["user"]["sec_uid"];
                                        info.user_signature = item["user"]["signature"];
                                        info.user_uid = item["user"]["uid"];
                                        info.user_unique_id = item["user"]["unique_id"];
                                    }
                                    //保存数据,等会提交
                                    comments.push(info);
                                }
                            }
                            console.log("命中符合条件数据: " + comments.length );
                            sucCommentNum = sucCommentNum + comments.length;
                        }
                        $("#allCommentNum").html(allCommentNum);
                        $("#sucCommentNum").html(sucCommentNum);
                    }
                    /*
                    //printDebug("作品列表获取成功",tmp.data);
                    printDebug("作品列表获取成功");

                    //获取keyword
                    video["keyword"]=tmp.global_doodle_config.keyword;

                    for(let item of tmp.data){
                        if(item.hasOwnProperty("aweme_info") && item["aweme_info"].hasOwnProperty("statistics") && item["aweme_info"]["statistics"].hasOwnProperty("comment_count") ){
                            if(item.aweme_info.statistics.comment_count > 0 ){
                                videoList.push(item);
                            }
                        }
                    }

                    var flag=getListCommentsMore()
                    if(flag){
                        getComments(video['aweme_id'],0)
                    }
                    */
                }
            }
            handler.next(response)
        }
  })
})();
