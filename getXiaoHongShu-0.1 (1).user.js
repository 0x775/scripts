// ==UserScript==
// @name         getXiaoHongShu
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  获取小红书内容及图片信息
// @author       You
// @match        https://www.xiaohongshu.com/search_result/*
// @match        https://www.xiaohongshu.com/explore/*
// @match        https://www.xiaohongshu.com/user/profile/*
// @require       http://cdn.bootcss.com/jquery/3.1.0/jquery.min.js
// @require       https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// @require       https://cdn.jsdelivr.net/npm/jutils-src
// @grant        none
// ==/UserScript==


/*====== 你的代码 ======*/
var window_url = window.location.href;
var domain = window.location.host;
var source_url = window_url.split('?')[0];
//console.log(window_url);
//console.log(domain);
//console.log(source_url);
//console.log(window.location);

var info={};
var timerId;


(function() {
    'use strict';

    $(document).on('click', '.download_data', function() {
         var index=1;
         for(let item of info["image_list"]){
             var img_url = item["url_default"];
             downloadImage(img_url,info["title"]+"_"+index+".jpg");
             index = index+1;
         }

        var tags=[];
        for(let item of info["tag_list"]){
            tags.push(item["name"]);
        }


        var data={"title":info["title"],"desc":info["desc"],"tags":tags};
        downloadJson(info["title"]+".json", data)
    });


    function downloadJson(fileName, json) {
        const jsonStr = (json instanceof Object) ? JSON.stringify(json, null, 4) : json;
        const url = window.URL || window.webkitURL || window;
        const blob = new Blob([jsonStr]);
        const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        saveLink.href = url.createObjectURL(blob);
        saveLink.download = fileName;
        saveLink.click();
    }


    function downloadImage(url,fileName){

          //图片的地址
            fetch(url)
            // 获取 blob 对象
            .then(res=>res.blob())
            .then(blob=>{
              // 创建a标签
              var link = document.createElement('a');
              // 设置a标签为不可见
              link.style.display = 'none';
              // 将a标签添加到body
              document.body.appendChild(link);
              // 生成Blob URL并设置给a标签的href属性
              var url = window.URL.createObjectURL(blob);
              link.href = url;
              // 设置a标签的download
              link.download = fileName;
              // 模拟点击事件进行下载
              link.click();
              //下载完成后清理URL对象和a标签
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
            })

    }

    ah.proxy({
        onRequest: (request, handler) => {
            /*
            if(request.url.startsWith('/aweme/v1/web/comment/list')){
                console.log(request.url)
            }
            */
			handler.next(request);
		},

	//请求成功后进入
  	onResponse: (response, handler) => {
        //console.log("----->>>>",response.config.url);

        //搜索后list作品列表
        if(response.config.url.startsWith('//edith.xiaohongshu.com/api/sns/web/v1/feed')){
            //console.log("+++++++");
            var tmp = $.parseJSON(response.response);
            //console.log(tmp);

            //插入元素
            timerId = setInterval(function(){
                if($(".note-detail-mask").find(".note-detail-follow-btn")){
                    console.log("find+++++");
                    clearInterval(timerId);
                    $('.note-detail-mask .note-detail-follow-btn').before('<button class="reds-button-new follow-button large primary download_data" style="background-color:green;border-radius:0">采集数据</button>');
                }

                console.log("---->>>timer");
            },1000);
            info = tmp["data"]["items"][0]["note_card"];
            console.log("内容解析完成: ",info);


/*
            for(let item of tmp.data){
                 if(item.hasOwnProperty("aweme_info")){
                     if(item.aweme_info.statistics.comment_count > 0 ){
                        videoList.push(item);
                     }
                 }
            }
            */

        }
      handler.next(response)
	}
  })

})();
