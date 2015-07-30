
// JavaScript Document
//页面逻辑�?
(function(window,undefined){
	//tip
	if(typeof(gp)=='undefined'){
		gp={location:''}
	}
//$(this)当前单击的元�?
	//评论的公用操�?   定义�?个函�?  等待调用
	var commentOper=function(opts)
    {
		var settings=$.extend({
			containerId:"layout",//评论模�?�外容器
			all:true,//是否加载评论的所有操�?
			rmCollect:false//取消收藏后移除模�?
		},opts);
		var $container=$("#"+settings.containerId);//#代表元素的id选择�?    $变量�?  表示从jquery中得到内容的变量,可能是个数组,调试下看�?
		//评论发表
		var commRel=function(){
			$container.on("click","[data-comm-rel]",function()
            {
				var self=$(this),$content_module=self.closest("[data-joke-id]"),url="floorcomm";//closeet是否参数中是否为可以用参数匹配到的父或自�?
                //http://stackoverflow.com/questions/8975985/whats-the-difference-between-closest-and-parentsselector    16
				var $cont=$content_module.find("[data-comm-cont]"),content_id=$content_module.data("joke-id"),content=$cont.val();
				var $normal=$content_module.find("[data-normal]"),$comm_num=$content_module.find("[data-comm-num]");
				var data={
					content_id:content_id,
					comment:content
				};

				var date = new Date();
				var commentText = $cont.val(),
					now = date.getTime();
					
				//判断cookie�?用参�?
				var comm_cookie = {};
				comm_cookie.txt = commentText;
				comm_cookie.times = now;

				if(!ming.trim(content)){
					ming.fullMsg.msg().html("来点评论�?...").showAndAutoHide();
					return false;
				}
				//判断是否重复评论,十分钟内不允许重复评�?
				if(ming.cookie("cmmTxt"+content_id) != null&&commentText.length > 3){
					var comm_false;
					var arr = [];
					arr = JSON.parse(ming.cookie("cmmTxt"+content_id));
					for(var a in arr){
						//是否有超时评�?
						if((now - arr[a].times) >= 600000){
							arr.splice(a,1);
						}
						//是否有重�?
						var match_num = ming.LD_str(arr[a].txt, commentText);
						if(match_num >= 0.5){
							ming.fullMsg.msg().html('亲爱哒，已经存在类似评论了哟~？！').showAndAutoHide();
							comm_false = true;
							return false;
						}
					}
					if(comm_false == true){
						return false;
					}
					arr.push(comm_cookie);
            		ming.cookie("cmmTxt"+content_id, JSON.stringify(arr), {expires: (10/(24*60))});
				}
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						var list=d.list,html=commHtmlBuild(list);
						$cont.val("");
						$comm_num.html(parseInt($comm_num.html())+1);
						$dt=$normal.find("dt");

						if(!$dt.size()){
							html='<dl class="jokeCommentList" data-normal=true><dt class="jokeCommentTit"><span class="icoJokeAct icoNewComment"></span>�?新评�?</dt>'+html+'<dl>';
							$content_module.append(html);
						}else{
							var wHeight=ming.wClientHeight(),dtTop=$dt.offset().top;
							var h=dtTop-wHeight/3-$dt.height();
							ming.anScroll(h);
							$dt.after(html);//讲新内容插入到该元素后面, before插前�?
						}
					}
					ming.fullMsg.msg().html(d.msg||'评论成功').showAndAutoHide();
					//add cookie
					if(ming.cookie("cmmTxt"+content_id) == null){
						var arr = [];
						arr.push(comm_cookie);
						ming.cookie("cmmTxt"+content_id, JSON.stringify(arr), {expires: (10/(24*60))});
					}
				}});
				return false;
			 });
		};
		//盖楼评论发表
		var floorCommRel=function(){
			//显示隐藏操作�?
			$container.on("click",'[data-comm-cont]',function(){
				var self=$(this),$content_module=self.closest("[data-joke-id]");
				if(self.closest("dl").data("normal")){//点击的是普�?�评�?
					$content_module.find("[data-marrow]").find("dd").removeClass("commentOn");//改版css
				}else{//点击的是精华评论
					$content_module.find("[data-normal]").find("dd").removeClass("commentOn");//css
				}
				self.closest("dd").toggleClass("commentOn");
				self.siblings("dd").removeClass("commentOn");
				return false;
			});
			
			$container.on("click",'[data-floorcomm-box]',function(){//切换到回复框
				var self=$(this),$replyBox=$("#commRelyBox"),$layout=$("#layout"),total=140;
				$layout.hide();
				$replyBox.show();
				holder=self.closest("dd").find("[data-comm-author]").html();
				$replyBox.find("[data-floorcomm-cont]").attr("placeholder",'回复'+holder);//增加属�??
				//评论回复提交
				$replyBox.on("click",'[data-floorcomm-rel]',function(){
					var $dd=self.closest("dd"),$content_module=self.closest("[data-joke-id]"),url="http://127.0.0.1:8000/floorcomm";
					var $cont=$replyBox.find("[data-floorcomm-cont]"),content=$cont.val(),content_id=$content_module.data("joke-id"),comment_id=$dd.data("comm-id");
					var $normal=$content_module.find("[data-normal]"),$comm_num=$content_module.find("[data-comm-num]");
					
					var data={
						content_id:content_id,//哪个笑话
						comment:content,      //回复内容
						comment_id:comment_id //要回复的评论id  ,也是正确�?
					};

					var date = new Date();
					var commentText = $cont.val(),
						now = date.getTime();

					//判断cookie�?用参�?
					var comm_cookie = {};
					comm_cookie.txt = commentText;
					comm_cookie.times = now;

					
					if(!ming.trim(content)){
						ming.fullMsg.msg().html("来点评论�?...").showAndAutoHide();
						return false;
					}
					if(content.length>total){
						ming.fullMsg.msg().html("字数不能超过"+total+"个字").showAndAutoHide();
						return false;
					}
					//判断是否重复评论,十分钟内不允许重复评�?
					if(ming.cookie("cmmTxt"+content_id) != null&&commentText.length > 3){
						var arr = [];
						arr = JSON.parse(ming.cookie("cmmTxt"+content_id));
						for(var a in arr){
							//是否有超时评�?
							if((now - arr[a].times) >= 600000){
								arr.splice(a,1);
							}
							//是否有重�?
							var match_num = ming.LD_str(arr[a].txt, commentText);
							if(match_num >= 0.5){
								ming.fullMsg.msg().html('亲爱哒，已经存在类似评论了哟~？！').showAndAutoHide();
								var comm_false = true;
								return false;
							}
						}
						if(comm_false == true){
							return false;
						}
						arr.push(comm_cookie);
	            		ming.cookie("cmmTxt"+content_id, JSON.stringify(arr), {expires: (10/(24*60))});
					}
					$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
						if(d.flag){
							$layout.show();
							$replyBox.hide();
							var list=d.list,html=commHtmlBuild(list);
							$cont.val("");
							$comm_num.html(parseInt($comm_num.html())+1);
							$dt=$normal.find("dt");
							var wHeight=ming.wClientHeight(),dtTop=$dt.offset().top;
							var h=dtTop-wHeight/3-$dt.height();
							ming.anScroll(h);
							$dt.after(html);	
						}
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
						//add cookie
						if(ming.cookie("cmmTxt"+content_id) == null){
							var arr = [];
							arr.push(comm_cookie);
							ming.cookie("cmmTxt"+content_id, JSON.stringify(arr), {expires: (10/(24*60))});
						}
					}});
					return false;
				});
				
				//评论的回复字数限�?
				$replyBox.on("keyup",'[data-floorcomm-cont]',function(){
					var e=e||window.event,keycode=e.keyCode;
					if(keycode!=32){
						var self=$(this),cont=ming.trim(self.val()),len=cont.length;
						var rest=total-len>0?total-len:'0';
						$replyBox.find("[data-cont-rest]").html(rest);
					}
					return false;
				});
				return false;
			});
		};
		//评论加载更多
		var commMore=function(){
			$container.on("click",'[data-comm-more]',function(){
				var self=$(this),commid_fst=self.data("comm-more");
				var url="touch.php?a=detail&m=index",$layout=$("#layout"),id=$layout.find("[data-joke-id]").data("joke-id");
				var $normal=$layout.find("[data-normal]");
				self.find("span").html("正在努力地加�?...");
				if(!commid_fst){
					ming.fullMsg.msg().html("木有更多评论�?").showAndAutoHide();
				}
				var data={
					id:id,
					commid_fst:commid_fst,
					ldmore:true
				};
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					
					if(d.flag){
						var list=d.list,html='';
						if(list){							
							$normal.append(list);
						}
						self.attr("data-comm-more",d.commid_fst);
						self.find("span").html("挖掘更多神评�?");
					}else{
						self.find("span").html("挖掘更多神评�?");
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
					}
				}});
				return false;
			});
		};
		 //�?
		var top=function(){	
			$container.on("click",'a[data-top]',function(){ //这里a代表连接标签a
				var self=$(this),url="http://127.0.0.1:8000/commtop",$dd=self.closest("dd"),comment_id=$dd.data("comm-id");
				if( ming.getItem("top"+comment_id)){
					ming.fullMsg.msg().html("赞过�?,休息下吧...").showAndAutoHide();
		            return false;
			    }
				var data={
					comment_id:comment_id
				};
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						self.find("[data-top-num]").html(d.topNum+'�?');
						//ming.setItem("top"+comment_id,"true");
						ming.fullMsg.msg().html("+1").showAndAutoHide();
						ming.setItem("top"+comment_id,"true",{expires:(10/(24*60))});
					}else{
						ming.fullMsg.msg().html(d.msg||"�?,您已赞过了哦...").showAndAutoHide();
					}
				}});
				return false;
			});
		 };
			//举报
		var report=function(){
			$container.on("click",'[data-report]',function(){
				var self=$(this),$dd=self.closest("dd"),comment_id=$dd.data("comm-id");
				if( ming.getItem("report"+comment_id)){
					ming.fullMsg.msg().html("您已经举报过了哦...").showAndAutoHide();
		            return false;
			    }
				var url="touch.php?a=report&m=comment",data={comment_id:comment_id};
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){    //判断是否有该评论,有举报成�?,否则举报失败
						ming.setItem("report"+comment_id,"true",{expires:(10/(24*60))});//本地存储
						ming.fullMsg.msg().html("举报成功�?").showAndAutoHide();
						//ming.setItem("report"+comment_id,"true");
					}else{
						ming.fullMsg.msg().html(d.msg||"�?,您已举报过了�?...").showAndAutoHide();
					}
						
				}});
				return false;
			});
		};
		//评论交互填充html组装
		var commHtmlBuild=function(list){// 返回list包括icon comment_id nickname create_time comment floor  floors  list.click_count(顶的数目)
			var html='',icon=list.icon,icon=icon?icon:'/statics/images/avatar.png';
			html+='<dd class="jokeCommentCont clearfix" data-comm-cont=true data-comm-id='+list.comment_id+'>';
			html+='	  <div class="commentAuthorImg"><img src="'+icon+'" /></div>';
			html+='   <div class="commentAuthorCont">';
			html+='   	<div class="commentAuthorTit clearfix"><span class="commentAuthorName" data-comm-author=true>'+list.nickname+'</span><span class="commentAuthorTime">'+list.create_time+'</span></div>';
			//评论盖楼
			html+='<p class="commentAuthorTxt">'+list.comment+'</p>';
			if(list.floors){
				var len=list.floors.length,floors=list.floors;
				html+='  <ul class="commentRelyList">';
				for(var i=0;i<len;i++){	
					html+=' <li class="subCommentRely" >';
					html+='	   <div class="commentRelyTit clearfix">';
					html+='	   	  <span class="commentRelyName">'+floors[i].nickname+': </span>';
					html+='	   	  <em class="commentRelyTip">'+floors[len-i-1].level+'</em>';
					html+='	   </div>';
					html+='	   <p class="commentRelyTxt">'+floors[i].comment+'</p>';
					html+=' </li>';
				}
				html+='</ul>';
			}
			html+='</div>';
			html+='<div class="commentActList"><a href="javascript:void(0)" class="commentAct" data-top=true>';
			html+='    <span class="commentActIco clearfix"><span class="icoJokeAct icoCommentTop"></span></span>';
			html+='    <span class="commentActTxt" data-top-num=true>'+list.click_count+'�?</span>';
			html+='  </a><a href="javascript:void(0)" class="commentAct" data-floorcomm-box=true>';
			html+='	   <span class="commentActIco clearfix"><span class="icoJokeAct icoCommentRely"></span></span>';
			html+='	   <span class="commentActTxt">回复</span>';
			html+='  </a><a href="javascript:void(0)" class="commentAct" data-report=true>';
			html+='    <span class="commentActIco clearfix"><span class="icoJokeAct icoCommentReport"></span></span>';
			html+='    <span class="commentActTxt">举报</span>';
			html+='  </a><div class="icoCommentActPoint"></div></div>';
			html+='</dd>';
			return html;
		};
		//cold按钮
		var cold=function(){
			$container.on("click",'[data-cold]',function()
            {
			 var self=$(this),url="",content_id=self.closest("[data-joke-id]").data("joke-id");
				if(typeof content_id!="undefined"&&ming.getItem("cold"+content_id)){
					ming.fullMsg.msg().html("已经赞过�?!").showAndAutoHide();
		            return false;
			    }
				//添加冷气�?
				$.ajax({type:"post",url:url,data:{blog_id:content_id},dataType:"json",success:function(d){   //
					if(d.flag){
						var cold=self.find("[data-cold-num]"),num=parseInt(cold.html())+1;
						cold.html(num||d.laud_num);//  #从服务器返回的赞�?
						ming.setItem("cold"+content_id,"true",{expires:(10/(24*60))});
					}
					ming.fullMsg.msg().html("+1").showAndAutoHide();
				}});
				return false;
			});
		}; 
		//用户评论
		var commInpute=function(){
			$container.on("focus",'[data-comm-input]',function(){
				var self=$(this),url="touch.php?a=add&m=comment",content_id=self.closest("[data-joke-id]").data("joke-id");		
				//添加评论
				$.ajax({type:"post",url:url,data:{content_id:content_id},dataType:"json",success:function(d){
					if(!d.flag && d.type == "unlogin"){
						var $login_pop = $("#login_popbox");
						// console.log($login_pop)
						$login_pop.show();
						$login_pop.on('click', '[data-login-close]', function(){
							var $self = $(this);
							$login_pop.hide();
						});
					}
				}});
				return false;
			});
		};
		//笑话收藏
		var collect=function(){
			$container.on("click",'[data-collect]',function(){
				var self=$(this),url="http://127.0.0.1:8000/mycollection/",content_id=self.closest("[data-joke-id]").data("joke-id");
				//添加收藏
				$.ajax({type:"post",url:url,data:{content_id:content_id},dataType:"json",success:function(d){
					/*if(d['type'] == 'unlogin'){
						ming.formDialog.dialog(set_login_pop).execute();
						*return false;
					}*/
					/*before*/
					/*if(d.flag){
						self.toggleClass("collectionOn");
					}
					if(settings.rmCollect){
						if(d.st=='del'){
							self.closest("[data-joke-id]").remove();
						}
					}
					ming.fullMsg.msg().html(d.msg).showAndAutoHide();*/
					if(d.flag){
						self.toggleClass("collectionOn");
						if(settings.rmCollect){    //我的收藏页面,取消收藏�?,撒谎年初该元�?
							//if(d.st=='del'){我注释的
								self.closest("[data-joke-id]").remove();//删除元素 而empty是删除内�?
							//}我注释的
						}
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
					}else{
						var $login_pop = $("#login_popbox");
						$login_pop.show();
						$login_pop.on('click', '[data-login-close]', function(){
							var $self = $(this);
							$login_pop.hide();
						});
					}
				}});
				return false;
			});
		};

		if(settings.all){
			commRel();
			cold();
			floorCommRel();
			top();
			report();
			commMore();
			commInpute();
			collect();
		}
		//隐藏掉评论的操作
		$(document).on('click',function(){
			$container.find("[data-marrow]").find("dd").removeClass("commentOn");
			$container.find("[data-normal]").find("dd").removeClass("commentOn");
		});
		return {
			cold:cold,
			collect:collect,
			commInpute:commInpute
		}
	};



	//分享的模�?  定义�?个函�?  等待调用
	var share=function(){
		$layout=$("#layout");
		$layout.on("click","[data-share]",function(){
			var self=$(this),$popbox=$("#share_popbox");
			
			if(!self.data("share")){
				var $login_pop = $("#login_popbox");
				$login_pop.show();
				$login_pop.on('click', '[data-login-close]', function(){
					var $self = $(this);
					$login_pop.hide();
				});
				return false;
			}
			var $content_module=self.closest("[data-joke-id]"),cont=$content_module.find("[data-joke-cont]").data("joke-cont");
			var pic=$content_module.find("[data-content-img]").data("content-img"),url=$content_module.find("[data-share-href]").data("share-href");
			
			$popbox.show();
			//新浪微博分享
			$popbox.on("click","[data-sinawb-share]",function(){
				if(typeof pic=="undefined"){
					pic="";
				}
				cont=cont.replace(/<\/?.+?>/g,"")+' @冷笑话精�?';
				var set={title:cont,pic:pic,location:url};
				ming.sinaWbShare(set);
				return false;
			});
			//腾讯微博分享
			$popbox.on("click","[data-txwb-share]",function(){
				if(typeof pic=="undefined"){
					pic="";
				}
				cont=cont.replace(/<\/?.+?>/g,"");
				var set={title:cont,pic:pic,site:url};
				ming.txWbShare(set);
				return false;
			});
			//微信朋友圈分�?
			$popbox.on("click","[data-fri-share]",function(){
				if(typeof pic=="undefined"){
					pic="";
				}
				cont=cont.replace(/<\/?.+?>/g,"");
				var set={img_url:pic,link:url,desc:cont,title:cont};
				ming.wxFriShare(set);
				return false;
			});
			//微信好友分享
			$popbox.on("click","[data-wx-share]",function(){
				if(typeof pic=="undefined"){
					pic="";
				}
				cont=cont.replace(/<\/?.+?>/g,"");
				var set={appid:'',img_url:pic,link:url,desc:cont,title:cont};
				ming.wxShare(set);
				return false;
			});
			//qq空间分享
			$popbox.on("click","[data-qzone-share]",function(){
				var $content_module=self.closest("[data-joke-id]"),cont=$content_module.find("[data-joke-cont]").html();
				var pic=$content_module.find("[data-content-img]").attr("src"),url=$content_module.find("[data-share-href]").data("share-href");
				
				if(typeof pic=="undefined"){
					pic="";
				}
				cont=cont.replace(/<\/?.+?>/g,"");
				var set={title:cont,pic:pic,url:url};
				ming.qZoneShare(set);
				return false;
			});
			//人人网分�?
			$popbox.on("click","[data-rr-share]",function(){
				if(typeof pic=="undefined"){
					pic="";
				}
				cont=cont.replace(/<\/?.+?>/g,"");
				var set={title:cont,pic:pic,link:url};
				ming.rrShare(set);
				return false;
			});
			//分享关闭
			$popbox.on("click","[data-share-close]",function(){
				$popbox.hide();
				$popbox.off("click");//消除事件的重复绑�?
				return false;
			});
			return false;
		});
	};




	//返回顶部   定义�?个函�?  等待调用
	var goTop=function($container){
		$container=$container?$container:$("#layout");
		$container.on("click",'[data-gotop]',function(){
			ming.anScroll(0);
			return false;
		});
	};
	/*var login = function(){
		var $layout = $("#layout");
		var $login_popbox = $("#login_popbox");
		$layout.on('click', '[data-collect]', function(){
			$login_popbox.show();
		})
	}*/


	//底部操作  定义�?个函�?  等待调用    这里才有有意义的事件绑定
	var footerBanner=function($container){
		$container=$container?$container:$("#layout");
		$footer=$container.find("[data-footer-banner]");
		if($footer.size()>0){
		    //返回顶部
			$container.on("click",'[data-gotop]',function(){
				ming.anScroll(0);
				return false;
			});
			//底部登录
			$container.on("click","[data-login]",function(){
				var v=$(this).data("login");
				if(!v){     //这种判断登录的方式真�?
					var $login_pop = $("#login_popbox");
					$login_pop.show();
					$login_pop.on('click', '[data-login-close]', function(){
						$login_pop.hide();
						return false;
					});
				}else{
					ming.fullMsg.msg().html('已登�?').showAndAutoHide();
				}
				return false;
			});

			$container.on("click","[data-add]",function(){
				var v=$(this).data("add");
				if(!v){     //这种判断登录的方式真�?
					var $login_pop = $("#login_popbox");
					$login_pop.show();
					$login_pop.on('click', '[data-login-close]', function(){
						$login_pop.hide();
						return false;
					});
				}else{
					ming.fullMsg.msg().html('已登�?').showAndAutoHide();
				}
				return false;
			});
			//底部客户端下�?
			//底部客户端下�?
			var media=function(){//媒介判断
				var media='';
				if(/android/i.test(navigator.userAgent)){
					media="android";
				}else if(/ipad|iphone|mac/i.test(navigator.userAgent)){
					media="ios";
				}else{
					media="other";
				}
				return media;
			};
			$app=$container.find("[data-appld]");
			var media=media();
			if(media=='android'){
				$app.attr("href",$("#app_android").val());
			}
			if(media=='ios'){
				$app.attr("href",$("#app_ios").val());
			}
			if(media=='other'){
				$app.attr("href",$("#app_android").val());
			}

		}
	};
	footerBanner();//调用
	


	/*slide*/  // 定义�?个函�?  等待调用
	var slide = function(){
		var $pointer = $("#pointer");// css  id选择�? 左上边的小房子超连接
		var $layout = $("#layout");  //整个页面,不算弹出来的登录与分�?
		//var $lay_slide = $("#lay_slide");//包裹  slide_dist  冷客�?�?  和搜索栏的div
		var $slide_list = $("#slide_list");//和冷�?  搜索栏在�?起的东西
		var $lay_content = $("#lay_content");  //正文笑话�?
		var $slide_tit = $("#slide_tit");//冷客�?�?
		var $slide_search = $("#slide_search");//搜索�?
		var $slide_search_input = $("#slide_search_input");//搜索栏中的input�?
		var $search_list_input = $("#search_list_input");   //点开搜索页才有的 window.location.href="/touch.php?m=search";   //打开搜索�?
		var slide_height = function(){
			// alert($(window).height());
			var height = $(window).height();
            //$slide_tit.height()  冷客�?�? �?占空�?
            //$slide_search.height()  搜索栏所占空�?
			var list_height = height - $slide_tit.height() - $slide_search.height();
			$slide_list.height(list_height);
			$slide_list.css('overflow', 'auto');
			$layout.height(height);//设置layout宽度为显示屏大小
		};
		var lay_content = function(){   //设置�?小高�?
			var height = $(window).height();
			$lay_content.css('min-height', height);
		};
		lay_content();
		$(window).bind( 'orientationchange', function(e){//横竖屏切�?
			if($(layout).hasClass('slideOn')){
				$layout.height("auto");
				$layout.removeClass('slideOn');
			}
			lay_content();
		});
		$pointer.on('click', function(){   //做上�?  小房子一样的图标
			if($(layout).hasClass('slideOn')){
				$layout.height("auto");
				$layout.removeClass('slideOn');
			} else {
				slide_height();
				$layout.addClass('slideOn');
			}
			return false;
		});
	//	$lay_slide.on('click', '[data-slide-tit]', function(){
	//		var tit_ul = $(this).next();//得到右边兄弟元素  反过来prev  类似还有parent 和children(得到全部子元�?)
			//if(tit_ul.is(':visible')){
	//			tit_ul.slideUp();
		//	} else {
	//			tit_ul.slideDown();
		//	};
	//	});
		$slide_search_input.on('focus', function(){
			window.location.href="/search/";   //打开搜索�?
		});
		$search_list_input.on('focus',function(){
			// console.log($search_list_input.closest(".layHeader"))
			$search_list_input.closest(".layHeader").addClass('searchOn');//右边加上�?个蓝色对�?
		});
		$search_list_input.on('blur',function(){
			if(this.value == ""){
				$search_list_input.closest(".layHeader").removeClass('searchOn');//右边变成蓝色X�?
			}
		});
	};



	//页面，定位到具体的单个页面，�?个页面对应一个case   这里才有有意义的事件绑定
	switch(gp.location){

        case "home"://首页   html�?始标记的javascript来设置gp.location变量
			$("img[data-lazy]").scrollLoading();
			var oper=commentOper({all:false});//调用结果�??
			oper.cold();
			oper.collect();
			slide();

            $layout=$("#layout");
			//内容加载更多

			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=document.getElementById("datamore").value,url="",data={p:p};

				if(p=="0"){   //如果p�?0字符�?,不再发�?�请�?
					ming.fullMsg.msg().html('加载到最多了').showAndAutoHide();
					return false;
				}
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d)
				{
					$layout.find("[data-jokelist]").append(d.list);//放li的ul
					//图片预加�?

					//$("#datamore").attr("value",d.p.toString());
					document.getElementById("datamore").value= d.p;

				}}
				);
				$("img[data-lazy]").scrollLoading();
				return false;
			});
			share();
			break;
		case "detail"://笑话详情�?
			//$layout=$("#layout"),$marrow=$layout.find("[data-marrow]"),h=$marrow.offset().top;

            commentOper();
			share();
			slide();
			$("img[data-lazy]").scrollLoading();


			// ming.anScroll(h);
			//var oper=commentOper({all:false});
			//oper.commInpute();
			break;

		case "top"://排行�?

			$("img[data-lazy]").scrollLoading();
            commentOper();
			share();
			slide();

            var $layout=$("#layout");
			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),url="",data={p:p};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$layout.find("[data-jokelist]").append(d.list);
						//图片预加�?
						$("img[data-lazy]").scrollLoading();
					}else
					{
						ming.fullMsg.msg().html("木有笑话了！").showAndAutoHide();
					}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});
			break;
		case "my_collect"://我的收藏
			$("img[data-lazy]").scrollLoading();
			commentOper({rmCollect:true});
			share();
			slide();
			var $layout=$("#layout");
			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),url="http://127.0.0.1:8000/mycollection",data={p:p};//   页码 加载更多
                if(!p){   //如果p�?0,不再发�?�请�?
					ming.fullMsg.msg().html('加载到最多了').showAndAutoHide();
					return false;
				}
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$layout.find("[data-jokelist]").append(d.html);
						$("img[data-lazy]").scrollLoading();
					}
                    //else
					//{
					//	ming.fullMsg.msg().html("木有笑话了！").showAndAutoHide();
					//}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});

			$layout.on("click","[data-delete]",function(){
				if(confirm('确定要删�?')){
					var self=$(this),content_id=self.closest("[data-content-id]").data("content-id");
					var url="touch.php?a=del_fav&m=user",data={content_id:content_id};
					$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
						if(d.flag){
							var oLayer=self.closest("[data-content-id]");
							oLayer.remove();
						}
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
					}});
				}
				return false;
			});
			break;

		case "draftAdd"://投稿�?
			var $container=$("#jokeContribute"),$cont=$container.find("[data-content]");
			$container.on("click","[data-sina-unlogin]",function(){//新浪登录
				window.location.href=$("#sina_login_url").val();
				return false;
			});
			$container.on("click","[data-qq-unlogin]",function(){
				window.location.href="touch.php?a=login_qq&m=login";
				return false;
			});
			//分享
			$container.on("click","[data-share]",function(){
				var self=$(this),type=self.data("share");
				self.toggleClass("shareOn");
				type=type.toLocaleLowerCase();
				var val=$("#share_"+type).val()=="0"?"1":"0";
				$("#share_"+type).val(val);
				return false;
			});

			//发表投稿
			$container.on("click","[data-confirm]",function(){
				var self=$(this),islogin=self.data("islogin"),$notice_cont=$container.find("[data-notice-cont]");
				if(!islogin){
					ming.fullMsg.msg().html("请先登录...").showAndAutoHide();
					return false;
				}
				content=ming.trim($cont.val());
				$cont.removeClass("err");
				$notice_cont.removeClass("colorerr");
				if(!content){
					ming.fullMsg.msg().html("段位不够，冷先森接收不了空段子�??").showAndAutoHide();
					$cont.addClass("err");
					return false;
				}
				if(content.length>500){
					ming.fullMsg.msg().html("内容字数不能超过500�?...").showAndAutoHide();
					return false;
				}
				$("#form_draft").submit();
			});

			break;
		case "draftReview"://审稿�?
			var $container=$("#layout");
			var cont = $container.find("[data-review-content]");
			var stamp = cont.find("[data-stamp]");
			var hx = cont.find("[data-hx]");
			var bgl = cont.find("[data-bgl]");
			var wg = cont.find("[data-wg]");
			var islogin=$("#islogin").val();

			slide();
			//盖章判断
			var timeout,is_submit=false;
			$container.on("click","[data-funlevel]",function(){
				if(islogin==0){
					ming.fullMsg.msg().html("请先登录").showAndAutoHide();
					return false;
				}
				if(!is_submit){
					var self=$(this),level=self.attr("data-funlevel");
					var $item=$container.find("[data-jokeitem]");
					//交互
					var url="touch.php?a=stamp&m=draft",data={id:$("#cont_id").val(),level:level};
					$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d)
                    {
						is_submit=true;
						ming.setItem("jokereview","true");
						if(d.flag){
							var fn=function(){
								if(d.list){
									var html='<p class="jokeTxt">'+d.list.content+'</p>';
									if(d.list.img_file!=''&&d.list.img_file!=false&&d.list.img_file!=null){
										html+='<p class="jokeImg"><img src='+d.list.img_file+'></p>';
									}
									$item.html(html);
									$("#cont_id").val(d.list.id);
									is_submit=false;
								}else{
									$item.html('<p>暂无冷货</p>');
								}
							};
							var y=self.offset().top,y=Math.floor(y/3),x=self.offset().left,x=Math.floor(x/2),h=self.height();
						    if(level=="funny"){
						    	x=-$container.find("[data-levelmid]").offset().left;
						    }
						    if(level=="nofunny"){
						    	x=0;
						    }
							var set={
								hideEndBin:fn,
								autoPosition:{xAdd:x,yAdd:h}
							};
							ming.fullMsg.msg(set).html(d.msg).showAndAutoHide();
						}else{
							if(d['type'] == 'unlogin'){
								//ming.formDialog.dialog(set_login_pop).execute();
								//return false;
							}
							ming.fullMsg.msg().html(d.msg||"审稿失败!").showAndAutoHide();
						}

					}});
				}else{
					//ming.fullMsg.msg().html("已经评审过了").showAndAutoHide();
				}
				return false;
			});
		break;
		//我的投稿页面(已�?�过审核�?)
		case "my_content":


			var oper=commentOper({all:false});
			share();
			oper.cold();
			oper.collect();
			slide();


			var $layout=$("#layout");
			$("img[data-lazy]").scrollLoading();
			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),st=$layout.data("st"),url="touch.php?a=my_content&m=user",data={p:p,st:st};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$layout.find("[data-jokelist]").append(d.html);
						$("img[data-lazy]").scrollLoading();
					}else
					{
						ming.fullMsg.msg().html("木有笑话了！").showAndAutoHide();
					}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});
			$layout.on("click","[data-delete]",function(){
				var self=$(this),ctid=self.closest("[data-content-id]").data("content-id");
				var url="touch.php?a=del_mycontent&m=user",data={ctid:ctid};
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						var oLayer=self.closest("[data-content-id]");
						oLayer.remove();
					}
					ming.fullMsg.msg().html(d.msg).showAndAutoHide();
				}});
				return false;
			});
		break;
		//我的投稿页面(未�?�过审核�?)
		case "my_content_nopass":
			slide();
			$("img[data-lazy]").scrollLoading();

			var $container=$("#layout"),edit_menu=$container.find("[data-edit-menu]");
			$container.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),st=$container.data("st"),url="touch.php?a=my_content&m=user",data={p:p,st:st};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$container.find("[data-jokelist]").append(d.html);
						$("img[data-lazy]").scrollLoading();
					}else
					{
						ming.fullMsg.msg().html("木有笑话了！").showAndAutoHide();
					}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});
			//投稿的编�?
			$container.on("click","[data-draft-edit]",function(){
				$container.toggleClass("editJoke");
				if($container.hasClass("editJoke")){
					$container.find("[data-footer-banner]").hide();
				}else{
					$container.find("[data-footer-banner]").show();
				}

				return false;
			});
			//投稿的�?�中
			$container.on("click","[data-chk]",function(){
				var self=$(this),id=self.data("id");
				self.closest("li").toggleClass("jokeClick");
				return false;
			});
			//投稿删除
			$container.on("click","[data-del]",function(){
				var self=$(this),ids=[];
				var li=$container.find("li.jokeClick");
				li.each(function(i,v){
					ids.push($(v).data("id"));
				});
				var data={ctid:ids},url="touch.php?a=del_mycontent&m=user";
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
						li.remove();
					}
				}});
				return false;
			});
			//投稿全�??
			$container.on("click","[data-chk-all]",function(){
				var self=$(this);
				$container.find("li[data-id]").removeClass("jokeClick").addClass("jokeClick");//改变css
				return false;
			});
			//投稿全不�?
			$container.on("click","[data-chk-none]",function(){
				var self=$(this);
				$container.find("li[data-id]").removeClass("jokeClick");//改变css
				return false;
			});
		break;
		case "my_comment"://我的评论
			slide();
			var $container=$("#layout");
			$container.on("click","[data-comm-id]",function(){//显示操作列表
				var self=$(this);
				self.toggleClass("commentActOn");
				self.siblings().removeClass("commentActOn");
				return false;
			});
			$container.on("click","[data-comm-del]",function(){//显示操作列表
				var self=$(this),li=self.closest("li"),comment_id=self.closest("[data-comm-id]").data("comm-id");
				var url="touch.php?a=del_mycomment&m=user",data={comment_id:comment_id};
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					ming.fullMsg.msg().html(d.msg).showAndAutoHide();
				}});
				li.remove();
				return false;
			});
			$container.on("click","[data-comm-detail]",function(){//显示操作列表
				var self=$(this),li=self.closest("li"),href=self.attr("href");
				window.location.href=href;
				return false;
			});
			$container.on("click","[data-comm-more]",function(){//显示更多评论
				var self=$(this),p=self.data("comm-more"),ct=self.data("comm-ct"),url="touch.php?a=my_comment&m=user",data={p:p,ct:ct};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
					$container.find("[data-commlist]").append(d.list);
					}else{
						ming.fullMsg.msg().html('木有�?...').showAndAutoHide();
					}
					self.attr("data-comm-more",d.p);
				}});
				return false;
			});
			break;
		case "cartoonDetail"://漫画详情�?
			// var oper=commentOper({all:false});
			// commentOper().oper();
			// commentOper();
			share();
			var share_img = function(){/*分享图片*/
				/*分享详情*/
				$img_box.on('mouseover', '[data-cartoon-share]', function(){
					$(this).addClass('shareOn');
					var shareLink = $(this).children('.shareLink');
					shareLink.css('background-image', 'url(/statics/images/pc/share-btn-hover.png)');
				});
				$img_box.on('mouseout', '[data-cartoon-share]', function(){
					$(this).removeClass('shareOn');
					var shareLink = $(this).children('.shareLink');
					shareLink.css('background-image', 'url(/statics/images/pc/share-btn.png)');
				});
				/*分享Btn*/
				$img_box.on({
					'mouseover':function(){
						$(this).addClass("cartoonShareOn");
					},
					'mouseout':function(){
						$(this).removeClass("cartoonShareOn");
					}
				});
			};
			break;
		case "index_feedback"://用户反馈
			var $container=$("#feedback");
			$container.on("click","[data-confirm]",function(){
				var content = $container.find('[data-content]').val();
				var email = $container.find('[data-email]').val();
				if(!content){
					ming.fullMsg.msg().html("请写下您宝贵的建议哦�?").showAndAutoHide();
					return false;
				}
				var url = "/feedback/";
				var data={
						text:content,
						email:email
				};
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						ming.fullMsg.msg().html("反馈成功!").showAndAutoHide();
					}
				}});
			});
			break;
		case "cartoonIndex"://漫画列表�?
			$layout=$("#layout");
			slide();
			//内容加载更多
			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),url="touch.php?a=index&m=cartoon",data={p:p};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$layout.find("[data-cartoonlist]").append(d.html);
						//图片预加�?
						$("img[data-lazy]").scrollLoading();
					}else
					{
						ming.fullMsg.msg().html("木有漫画了！").showAndAutoHide();
					}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});
		break;
		case "searchIndex"://搜索
			var $container=$("#search");
			slide();
			$container.on("click","[data-confirm]",function(){
				var text = $container.find('[data-text]').val();
				if(text.length>0){
					location.href="/search/"+text;
				}

			});
		break;
		case "search"://搜索结果
			$("img[data-lazy]").scrollLoading();
			var oper=commentOper({all:false});
			oper.cold();
			oper.collect();
			share();
			var $layout=$("#layout");
			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),keyword=self.data("keyword"),url="touch.php?a=search&m=search",data={p:p,keyword:keyword};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$layout.find("[data-jokelist]").append(d.list);
						//图片预加�?
						$("img[data-lazy]").scrollLoading();
					}else
					{
						ming.fullMsg.msg().html("木有笑话了！").showAndAutoHide();
					}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});
		break;

		case "nopic"://无图段子
			$("img[data-lazy]").scrollLoading();
			var oper=commentOper({all:false});
			oper.cold();
			oper.collect();
			share();
			slide();
			var $layout=$("#layout");
			$layout.on("click","[data-cont-more]",function(){
				var self=$(this),p=self.data("cont-more"),url="touch.php?a=nopic&m=index",data={p:p};
				$.ajax({type:"get",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						$layout.find("[data-jokelist]").append(d.list);
						//图片预加�?
						$("img[data-lazy]").scrollLoading();
					}else
					{
						ming.fullMsg.msg().html("�?			slide();			slide();有笑话了�?").showAndAutoHide();
					}
					self.attr("data-cont-more",d.p);
				}});
				return false;
			});
		break;

		case "setting_wbfollow"://微博关注
			var $layout=$("#layout");
			//微博选中
			$layout.on("click","[data-chk]",function(){
				var self=$(this),id=self.data("id");
				self.closest("dd").toggleClass("selectOn");
				return false;
			});

			//微博批量关注
			$layout.on("click","[data-confirm]",function(){
				var self=$(this),ids=[];
				var dd=$layout.find("dd.selectOn");
				dd.each(function(i,v){
					ids.push($(v).data("id"));
				});
				if(ids.length == 0){
					ming.fullMsg.msg().html("请�?�择账号").showAndAutoHide();
					return false;
				}
				var data={sid:ids,dosubmit:true},url="touch.php?a=wbfollow&m=setting";
				$.ajax({type:"post",url:url,data:data,dataType:"json",success:function(d){
					if(d.flag){
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
					}else{
						ming.fullMsg.msg().html(d.msg).showAndAutoHide();
					}
				}});
				return false;
			});

		break;
        case "login_register":
            $container=$(".wrap-content").on("click","[data-login]",function()
                {

                    $(this).addClass("on");
                    var $item=$container.find("[data-register]");
                    $item.removeClass("on");
                    $("#divlogin").show();
                    $("#divregister").hide();
                    return false;
                });
            $container.on("click","[data-register]",function()
                {
                    $(this).addClass("on");
                    var $item=$container.find("[data-login]");
                    $item.removeClass("on");
                    $("#divlogin").hide();
                    $("#divregister").show();
                    return false;
                });

	}
})(window);
