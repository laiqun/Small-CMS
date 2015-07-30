# coding:utf-8
from django.conf.urls import include, url
from django.contrib import admin
from recall.views import blogall, mycomment, feedback, floorcomm,topcomm,qqlogin
from recall.views import register
from recall.views import loginrequest, logoutrequest
from recall.views import addblog
from recall.views import blog_detail
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
                  # Examples:
                  # url(r'^$', 'Blog.views.home', name='home'),
                  # url(r'^blog/', include('blog.urls')),
                  # background
                  url(r'^admin/', include(admin.site.urls)),
                  # home page
                  url(r'^$', blogall),
                  url(r'^myblog', blogall,{'top':True}),  #我的文章
                  url(r'^mycollection', blogall,{'collect':True}),  #我的收藏
                  url(r'^top', blogall,{'top':True}),  #按文章赞的个数排列  后期要实现人群分类
                  url(r'^search/(?P<cont>\w*)', blogall,{'search':True}),

                  url(r'^mycomment', mycomment),  #我的评论
                  url(r'^commtop', topcomm),  #顶评论
                  url(r'^floorcomm', floorcomm),  #盖楼评论

                  url(r'^blog/(?P<id>\d+)/$', blog_detail),  #单个文章
                  url(r'^addblog', addblog),

 #                 url(r'^login', loginrequest),  # 登录
                  url(r'^logout', logoutrequest),  # 登出
                  url(r'^register', register),  # 注册
                  url(r'^qqlogin', qqlogin),  # 注册



                  url(r'^feedback', feedback),  #我的收藏

                  url(r'^about', TemplateView.as_view(template_name="about.html")),  #我的收藏

              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + static(settings.MEDIA_URL,
                                                                                           document_root=settings.MEDIA_ROOT)
