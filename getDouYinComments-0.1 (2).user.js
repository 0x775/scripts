// ==UserScript==
// @name         getDouYinComments
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  根据关键词获取抖音列表和评论信息
// @author       You
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

var aweme_source="douyin.com";
var aweme_id="";
var aweme_title="";
var aweme_url="";
var aweme_user_uid="";
var aweme_user_name="";
var aweme_user_desc="";
var listData=[];
var last_awid="";
var keyword="";


var xhr=null;
var videoList=[];
var getMore=false;
var config={};
var video={};
var y_height=0;
var timerId;


(function() {
    'use strict';

    //let bsCss = GM_getResourceText('bootstrapCss')
    //GM_addStyle(bsCss)

    function showHidePanelHtml(flag){
		if(flag){
			$("#adHtml").css("top","30%");
			$("#adHtml").css("left","0px");
			$("#adHtml").css("width","100%");
            $("#adHtml").css("height","480px");
			$("#adRunLog").css("display","unset");
			$("#adRunData").css("display","unset");
			$(".m_act_btn").show();
		}
		else {
			$("#adHtml").css("top","0px");
			$("#adHtml").css("left","160px");
			$("#adHtml").css("width","140px");
            $("#adHtml").css("height","40px");
			$("#adRunLog").css("display","none");
			$("#adRunData").css("display","none");
			$(".m_act_btn").hide();
		}
	}

    $(document).on('click', '#ac_showpanel', function() {
         var flag = $("#ac_showpanel").is(':checked');
         showHidePanelHtml(flag);
    });

    $(document).on('click', '#ac_fullscreen', function() {
         console.log("+++checkbox");
         var flag = $("#ac_fullscreen").is(':checked');
         if(flag){
             $("#adHtml").css("top","0px");
             $("#adHtml").css("height","100%");
             $("#adRunLog").css("height","97%");
			 $("#adRunData").css("height","97%");
             if(document.fullscreenEnabled){
                 document.documentElement.requestFullscreen();
             }
         }else{
             $("#adHtml").css("top","30%");
             $("#adHtml").css("height","480px");
             $("#adRunLog").css("height","92%");
			 $("#adRunData").css("height","92%");
             if(document.fullscreenEnabled){
                 document.exitFullscreen();
             }
         }
    });

	var tag="";
	var aweme_id="";
	var uid="2348";
	var keywords=["多钱","多少钱","多少米","怎么卖","怎么买","怎么联系","在哪买","想买","想要","有没有","电话","位置","联系","价格","求带","合作"];
	//var keywords=["多少钱","怎么办","费用","财务","地址","注册","报税","做账","注销","电话","位置","联系","价格","微信"];

    function sleep(delay){
        return new Promise((resolve) => setTimeout(resolve,delay));
    }

    function addHtml(){
        var html = document.createElement('div');
        html.innerHTML = `<div id="adHtml" style="width: 100%; height: 680px;background-color:#000000;z-index: 9999999;position: fixed;top:20%;color: white;font-size: 18px;padding:5px;"><div id="adRunLog" style="width: 23%; height:92%;float:left;margin-right:20px;"></div>
		<div id="adRunData" style="width:75%;height:92%;float:left;border-left: solid 1px white;"></div><div id="adAction" style="font-weight: 700;width: 100%;height: 40px;display: flex;">
            <span style="margin-left: 20px;height:35px;line-height: 35px;"><input type="checkbox" id="ac_showpanel" name="showpanel" value="1" style="margin-right: 10px;">显示界面</span>
			<span class="m_act_btn" style="margin-left: 60px;height:35px;line-height: 35px;"><input type="checkbox" id="ac_fullscreen" name="fullscreen" value="1" style="margin-right: 10px;">全屏显示</span>
		</div></div>`;
        document.body.appendChild(html);
        init2();
    }
    addHtml();
    showHidePanelHtml(false);

    function init2(){
        printDebug("init初始化数据")
        /*
        $.getJSON("/api/import",function(result){
            //
        });
        */
        printDebug("初始化Success")
        config["keyword"]="";
        config["tags"]=["多钱","多少钱","多少米","怎么卖","怎么买","怎么联系","在哪买","想买","想要","有没有","电话","位置","联系","价格","求带","合作"];
        //TODO...
        //$("#douyin-header").find("input").eq(0).val("中文呢")
    }

    function printDebug(str){
        var now_time = new Date().toLocaleTimeString('chinese', { hour12: false })
        str = "["+now_time + "] " +str
        var len = $("#adRunLog").find("div").length;
        if(len*33 >= $("#adRunLog").height() ){
            $("#adRunLog").html("");
        }
        $("#adRunLog").append("<div style='overflow:hidden;height:30px;line-height:30px;'>"+str+"</div>")
    }

    function printData(data){
        var len = $("#adRunData").find("div").length;
        //printDebug("++++++  " + len*54 + " -- " +  $("#adRunData").height());
        if(len*54 >= $("#adRunData").height() ){
            $("#adRunData").html("");
        }
        var text="<span style='width:320px;margin-left:30px;overflow:hidden;height:30px;float: left;'>"+data["title"]+"</span><span style='width:480px;margin-left:60px;overflow:hidden;height:30px;float: left;text-align:center;'>"+data["text"]+"</span><span style='width:240px;margin-left:60px;overflow:hidden;height:30px;float: left;'>"+data["user_name"]+"  ["+data["user_label"]+"]"+"</span><span style='width:180px;margin-left:30px;overflow:hidden;height:30px;float: left;'>"+data["post_time"]+"</span>";
        $("#adRunData").append("<div style='overflow:hidden;height:30px;line-height:30px;margin:20px 0px'>"+text+"</div>")
    }

    //XMLHttpRequest回调
    async function successCallBack(){
        if (this.readyState == 4 && this.status == 200) {
            //console.log("+++++++",this)
            var data = $.parseJSON(this.response);
            //console.log(data);
            if(data.hasOwnProperty("comments")==false) {
                printDebug("获取失败,msg:"+this.response)
                printDebug("未知错误,尝试下一个数据 ..")
                printDebug("<br>")
                var flag2=getListCommentsMore()
                if(flag2){
                    getComments(video['aweme_id'],0)
                }
                return false;
            }
            printDebug("获取成功,长度:"+data["comments"].length+"  偏移:"+data.cursor)

            //post.server
            if(data["comments"].length >0){
                //fix,只要评论时间在60天以内的,太老的评论不要
                var nowTime = Math.floor(Date.now() / 1000);
                var chaTime = 60*60*24*90; //90天内
                var comments=[];
                for(let item of data["comments"]){
                    var jsTime = nowTime - item.create_time;
                    if(jsTime <= chaTime) {
                        //console.log("----->>>",item);
                        var post_time = jutils.formatDate(new Date(parseInt(item["create_time"])*1000),"YYYY-MM-DD HH:ii:ss");
                        var text_data={"title":video["title"],"text":item["text"],"user_name":item["user"]["nickname"],"user_label":item["ip_label"],"post_time":post_time};
                        printData(text_data);
                        //时间小于90天
                        comments.push(item);
                    }
                }

                if(comments.length >0) {
                   var result_data={"comments":comments,"aweme_id":comments[0]["aweme_id"],"keyword":video["keyword"],"title":video["title"]}
                   $.ajax({
                       url:"http://127.0.0.1:8888/api/comments/create",
                       method:"post",
                       //headers:{"content-type":"application/json"},
                       //data:JSON.stringify({"domain":"douyin.com","platform":"web","data":result_data}),
                       data:{"domain":"douyin.com","platform":"web","data":result_data},
                       dataType:"json",
                       success:function(data,status){
                           //console.log(data,status);
                           if(data.retcode==200){
                               printDebug("数据提交正常!")
                           }
                       },
                       error:function(e){
                             //console.log("ajax.error:",e);
                             printDebug("异常: 数据提交失败")
                       }
                   });
                }
            }

            //只要是more有更多，随机延时继续获取列表
            if(data.has_more==1){
                printDebug("还有更多数据,继续 ..")
                var aweme_id = data["comments"][0]["aweme_id"]
                var time1= Math.floor(Math.random() * (6000 - 2500 + 1)) + 2500;
                setTimeout(() => {
                    getComments(aweme_id,data.cursor)
                }, time1);
            } else {
                printDebug("没有更多了,尝试下一个数据 ..")
                printDebug("<br>")
                var flag=getListCommentsMore()
                if(flag){
                    getComments(video['aweme_id'],0)
                }
            }
        }
    }

    function getComments(aweme_id,offset_num){
        //return false;
        //xhr.open('GET',"/aweme/v1/web/comment/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id="+aweme_id+"&cursor="+offset_num+"&count=20&item_type=0&insert_ids=&whale_cut_token=&cut_version=1&rcFT=&update_version_code=170400&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1920&screen_height=1200&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=128.0.0.0&browser_online=true&engine_name=Blink&engine_version=128.0.0.0&os_name=Windows&os_version=10&cpu_core_num=4&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=741401503161930704")
        xhr.open('GET',"/aweme/v1/web/comment/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id="+aweme_id+"&cursor="+offset_num+"&count=20&item_type=0&insert_ids=&whale_cut_token=&cut_version=1&rcFT=&update_version_code=170400&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true")
        xhr.send()
    }

    //获取一个视频信息
    function getListCommentsMore(){
        video["title"]=""
        video["aweme_id"]=""
        if(videoList.length >0 ){
            video["title"]=videoList[0].aweme_info.desc;
            video["aweme_id"]=videoList[0].aweme_info.aweme_id;
            printDebug("主题: " + video["title"] )
            printDebug("评论:["+ videoList[0].aweme_info.statistics.comment_count+ "]");
            printDebug("获取评论数据" )
            videoList.splice(0, 1);
            return true;
        }
        printDebug("<br>")
        printDebug("主题列表数据为空,没有更多数据了")
        printDebug("<br>")
        //
        timerId = setInterval(function(){
            y_height = y_height + 500;
            printDebug("<br>")
            printDebug("没有更多主题数据,尝试滚动获取更多:"+y_height);
            window.scrollTo(0, y_height);
            if( videoList.length >0){
                clearInterval(timerId);
            }
        },1500);
        return false;
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
        //console.log("+++++++",window.location.href);
        var data="";


        //搜索后list作品列表
        if(response.config.url.startsWith('/aweme/v1/web/general/search/single/') && response.config.xhr.hasOwnProperty("bot")==false ){
            console.log("+++++++");
            var tmp = $.parseJSON(response.response);
            //printDebug("作品列表获取成功",tmp.data);
            printDebug("作品列表获取成功");

            if(xhr==null){
                xhr=response.config.xhr
                xhr.bot=1;//这里是要区分下是自己的open.send提交还是系统的，自己send提交的这里也会捕捉
                xhr.addEventListener('readystatechange',successCallBack);
            }

            //获取keyword
            video["keyword"]=tmp.global_doodle_config.keyword;

            for(let item of tmp.data){
                 if(item.hasOwnProperty("aweme_info")){
                     if(item.aweme_info.statistics.comment_count > 0 ){
                        videoList.push(item);
                     }
                 }
            }

            var flag=getListCommentsMore()
            if(flag){
                getComments(video['aweme_id'],0)
            }

            /*
            for(let item of tmp.data){
                listData.push(item);
            }
            console.log("作品列表:",listData);
            keyword=tmp["global_doodle_config"]["keyword"];

            for(let item of listData) {
                if(item.aweme_info.statistics.comment_count > 0 ){
                    response.config.xhr.open('GET',"/aweme/v1/web/comment/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id="+item.aweme_info.aweme_id+"&cursor=20&count=20&item_type=0&insert_ids=&whale_cut_token=&cut_version=1&rcFT=&update_version_code=170400&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1920&screen_height=1200&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=128.0.0.0&browser_online=true&engine_name=Blink&engine_version=128.0.0.0&os_name=Windows&os_version=10&cpu_core_num=4&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=741401503161930704")
                    response.config.xhr.send()
                    console.log("+++++++++++++")
                    break
                }
            }
            */

            /*
            $.ajax({
                url:"http://127.0.0.1:8001/api/xiansuo/create",
                method:"post",
                headers:{"content-type":"application/json"},
                data:JSON.stringify({"platform":"web","type":"list","keyword":keyword,"data":response.response}),
                dataType:"json",
                success:function(data,status){
                    console.log(data,status);
                },
                error:function(e){
                    console.log("ajax.error:",e);
                }
            });
            */
        }

        //评论接口
      if(response.config.url.startsWith('/aweme/v1/web/comment/list--------暂时弃用---------')){
          data = $.parseJSON(response.response);
          console.log("评论信息:",data)
          if(data.hasOwnProperty("comments")) {
			  if(data["comments"].length >0){
              	$.ajax({
                    url:"http://127.0.0.1:8001/api/xiansuo/create",
                    method:"post",
                    headers:{"content-type":"application/json"},
                    data:JSON.stringify({"platform":"web","type":"info","keyword":keyword,"data":response.response}),
                    dataType:"json",
                    success:function(data,status){
                        console.log(data,status);
                    },
                    error:function(e){
                        console.log("ajax.error:",e);
                    }
                });
              }

            //测试
            if(data.has_more==1){
                console.log("还有更多页面,尝试下自动获取")
                console.log(response.config.url)
                console.log("test:+++++++++++")
                var offset1 = response.config.xhr._url.match(/cursor=\d+/)
                if (offset1 !=null){
                    var old_url = response.config.xhr._url
                    var o = offset1[0].split("=")[1]
                    var n = parseInt(o) + 20
                    var next_url= old_url.replace("cursor="+o,"cursor="+n)
                    console.log("--->",next_url)

                    var time1= Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
                    //time.sleep
                    setTimeout(() => {
                        response.config.url = next_url
                        response.config.xhr.open('GET',next_url)
                        response.config.xhr.send()
                    }, time1);

                    response.config.xhr.addEventListener('readystatechange', function(){
                        console.log("+++++++++++++++++++++++++++++readystatechange",this);
                        if (this.readyState == 4 && this.status == 200) {
                            // 处理返回值
                            if(this._url.startsWith('/aweme/v1/web/comment/list')){
                                var data = $.parseJSON(this.response);
                                console.log(data);
                            }
                       }
                    });
                }
                //response.config.xhr.open('GET',"/aweme/v1/web/comment/list/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id=7412858957728877835&cursor=20&count=20&item_type=0&insert_ids=&whale_cut_token=&cut_version=1&rcFT=&update_version_code=170400&pc_client_type=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1920&screen_height=1200&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=128.0.0.0&browser_online=true&engine_name=Blink&engine_version=128.0.0.0&os_name=Windows&os_version=10&cpu_core_num=4&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=741401503161930704")
               // response.config.xhr.send()
            }
          }
      }
      handler.next(response)
	}
  })

})();
