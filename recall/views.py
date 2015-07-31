# coding:utf-8    
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.db.models import Q
from recall.models import BlogPost, Person, Comment
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.utils.translation import ugettext
from recall.form import BlogForm, LoginForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.template.loader import get_template
from django.template import Context
from recall.form import PersonForm
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from socialoauth import SocialSites,SocialAPIError
from Blog.settings import SOCIALOAUTH_SITES 
# Create your views here.
import datetime, json
# loging
import logging

logger = logging.getLogger('mylogger')


def blogall(request, top=False, my=False, collect=False,search=False,cont='',loginflag=False):  # 和top完全一样,加个参数融合成一个
    if request.method == 'POST' and collect == False:
        blogid = int(request.POST.get('blog_id', False))
        blog = BlogPost.objects.get(id=blogid)
        blog.laud_num += 1
        blog.save()
        data = {'flag': 'true', 'laud_num': blog.laud_num}
        return HttpResponse(json.dumps(data), content_type='application/json')
    if request.method == 'POST' and collect == True:  # 我的收藏是需要登录的
        blogid = request.POST.get('content_id', False)  # blogid
        if blogid:
            if request.user.is_authenticated():
                # 更新数据库  不存在则添加,存在则将其删除
                blog = BlogPost.objects.get(id=blogid)
                if request.user.person in blog.user_collect.all():  # 已经收藏
                    blog.user_collect.remove(request.user.person)
                    data = {'flag': 'false', 'msg': '取消收藏'}
                else:
                    blog.user_collect.add(request.user.person)
                    data = {'flag': 'true', 'msg': '收藏成功'}
                blog.save()
                return HttpResponse(json.dumps(data), content_type='application/json')
            else:  # 反馈未登录
                data = {'flag': 'false'}
                return HttpResponse(json.dumps(data), content_type='application/json')
            #前面是动作处理
    if top:
        postsall = BlogPost.objects.all().order_by("-laud_num")
    elif my:
        # @login_required 我的稿子,需要判断用户是否登录,登录才显示 两种方案  1 重定向到登录页面 2 操作客户端页面打开登录
        postsall = BlogPost.objects.all().filter(user_id=request.user.person).order_by("-timestamp")
    elif search:
        if cont == '':
            return render_to_response('search.html', {})
        else:  # 返回搜索页面
            search_result = BlogPost.objects.filter(Q(body__contains=cont))
            logger.debug(search_result)  # 应该修改为分页形式的
            postsall = search_result.all().order_by("-timestamp")

    else:
        postsall = BlogPost.objects.all().order_by("-timestamp")
    #前面都是获取数据
    paginator = Paginator(postsall, 20)
    if request.method == 'GET':
        more = int(request.GET.get('p', False))
        if not more:  # 第一次打开,绘制整个框架
            posts = paginator.page(1)
            try:
                postsall_collect = request.user.person.blogpost_set.all()
                for post in postsall:
                    if post in postsall_collect:
                        post.collect = True
                if collect == True:
                    return render_to_response('listall.html',
                                              {'posts': posts, 'postsall_collect': postsall_collect, 'collect': True,'loginflag':loginflag})
                else:
                    return render_to_response('listall.html',
                                              {'posts': posts, 'postsall_collect': postsall_collect, 'collect': False,'loginflag':loginflag})
            except AttributeError:
                if collect == True:
                    return render_to_response('listall.html', {'posts': posts, 'collect': True,'loginflag':loginflag})
                else:
                    return render_to_response('listall.html', {'posts': posts, 'collect': False,'loginflag':loginflag})
        else:
            try:  # 请求更多,则json
                posts = paginator.page(more)
                next_p = more + 1
                if next_p > paginator.num_pages:
                    next_p = 0
            except PageNotAnInteger:
                posts = paginator.page(1)
            except EmptyPage:  # beyound
                next_p = 0
                posts = {}
            t = get_template('morelist.html')
            html = t.render(Context({'posts': posts}))
            data = {'flag': 'true', 'list': html, 'p': next_p}
            return HttpResponse(json.dumps(data), content_type='application/json')


def blog_detail(request, id):
    if request.method == 'POST':
        logger.debug(request.POST)
        try:
            commentnew = Comment(blog_id=BlogPost.objects.get(id=int(request.POST['blogid'])),
                                 user_id=request.user.person,
                                 body=request.POST['content'])
            commentnew.save()
        except AttributeError:
            return HttpResponseRedirect('/login')
        return HttpResponseRedirect('/')
    else:
        post = BlogPost.objects.get(id=id)
        comments = Comment.objects.all().filter(blog_id=id, parent_id__isnull=True).order_by("-timestamp")
        try:
            postsall_collect = request.user.person.blogpost_set.all()
            if post in postsall_collect:
                post.collect = True
            return render_to_response('detail.html', {'post': post, 'comments': comments})
        except AttributeError:
            return render_to_response('detail.html', {'post': post, 'comments': comments})


@login_required
def addblog(request):
    if request.method == 'POST':
        form = BlogForm(request.POST, request.FILES)
        if form.is_valid():
            category = form.cleaned_data['category']
            body = form.cleaned_data['body']
            outline = form.cleaned_data['outline']
            try:
                photo = request.FILES['imgfile']
            except:
                photo = ''
            blognew = BlogPost(category=category, body=body, outline=outline,
                               laud_num=0,
                               user_id=request.user.person, photo=photo)
            blognew.save()
            return HttpResponseRedirect('/')
        else:  # if there is blank in post data
            form = BlogForm()
            return render_to_response("addblog.html", {'form': form})
    else:
        form = BlogForm()
        return render_to_response("addblog.html", {'form': form})




def register(request):
    if request.user.is_authenticated():
        return HttpResponseRedirect('/')
    if request.method == 'POST':
        form = PersonForm(request.POST, request.FILES)
        if form.is_valid():
            user = User.objects.create_user(username=form.cleaned_data['username'], email=form.cleaned_data['email'],
                                            password=form.cleaned_data['password1'])
            user.save()
            nickname = form.cleaned_data['nickname']
            photo = request.FILES.get('photo', '')
            person = Person(user=user, nick_name=nickname, photo=photo)
            person.save()
            # use the register login
            person = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'])
            login(request, person)
            return HttpResponseRedirect('/')
    else:
        form = PersonForm()
    return render_to_response("register.html", {'form': form, })


def loginrequest(request):
    logger.debug("come")
    if request.user.is_authenticated():
        return HttpResponseRedirect('/')
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            logger.debug(username)
            password = form.cleaned_data['password']
            logger.debug(password)
            person = authenticate(username=username, password=password)
            if person is not None:
                login(request, person)
                nexturl=request.GET.get('next', False)
                return HttpResponseRedirect(nexturl)
            else:
                return HttpResponseRedirect(request.get_full_path())#return original url include parmater
    else:
        form = LoginForm()
        regform = PersonForm()
        context = {'form': form,'regform':regform}
        return render_to_response('loginnew.html', context, context_instance=RequestContext(request))


def logoutrequest(request):
    logout(request)
    return HttpResponseRedirect('/')


def i18ntest(request):
    title = ugettext('Users')
    return HttpResponse(title)


def feedback(request):
    if request.method == 'POST':

        text = request.POST['text']
        email = request.POST['email']
        logger.debug(text)
        logger.debug(email)  # 应该将右键发给管理员的,以后补充
        data = {'flag': 'true'}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        return render_to_response('feedback.html')


@login_required
def mycomment(request):
    postsall = Comment.objects.all().filter(user_id=request.user.person).order_by("-timestamp")  # 也需要分页
    # 找到它所属的文章   显示文章,评论就在其下
    paginator = Paginator(postsall, 2)
    # 修改  加入分页效果   手动渲染,然后加入flsg和分页p
    # list flag p
    if request.method == 'POST':
        # 判断要哪一页,讲需要的页封装 发回给浏览器
        pagenum = int(request.POST.get('p', False))  # 获取失败为False
        try:
            posts = paginator.page(pagenum)
            next_p = pagenum + 1
            if next_p > paginator.num_pages:
                next_p = 0
        except PageNotAnInteger:
            posts = paginator.page(1)
            next_p = 2
        except EmptyPage:  # 超出范围  将P标记为0
            # posts = paginator.page(paginator.num_pages)
            next_p = 0
            posts = {}
        t = get_template('morelist.html')
        html = t.render(Context({'posts': posts}))  # succes
        data = {'flag': 'true', 'list': html, 'p': next_p}
        return HttpResponse(json.dumps(data), content_type='application/json')
    else:
        posts = paginator.page(1)
        return render_to_response('mycomment.html', {'posts': posts})


def floorcomm(request):  # 盖楼评论
    logger.debug(request.POST['content_id'])  # 应该修改为分页形式的
    logger.debug(request.POST['comment'])  # 应该修改为分页形式的
    logger.debug(request.POST['comment_id'])  # 应该修改为分页形式的

    # if request.method == 'POST':
    # logger.debug(request)  # 应该修改为分页形式的
    # data = {'flag': 'true'}
    # return HttpResponse(json.dumps(data), content_type='application/json')
    commentnew = Comment(blog_id=BlogPost.objects.get(id=int(request.POST['content_id'])), user_id=request.user.person,
                         body=request.POST['comment'],
                         parent_id=Comment.objects.get(id=int(request.POST['comment_id'])))
    commentnew.save()
    data = {'flag': 'true', 'list': "", 'msg': "回复成功!"}
    return HttpResponse(json.dumps(data), content_type='application/json')


def topcomm(request):
    if request.method == 'POST':
        comment_id = int(request.POST['comment_id'])
        comment = Comment.objects.get(id=comment_id)
        comment.laud_num += 1
        comment.save()
        data = {'flag': 'true', 'topNum': comment.laud_num, 'msg': "没顶成功!"}
        return HttpResponse(json.dumps(data), content_type='application/json')


def qqlogin(request):
    #构造url,直接打开
    
    socialsites=SocialSites(SOCIALOAUTH_SITES)
    def _link(site_class):
        _s=socialsites.get_site_object_by_class(site_class)
        return _s.authorize_url
    link=map(_link,socialsites.list_sites_class())#获取到了url
#获取返回的code
    code = request.GET.get('code')
    if not code:
        return render_to_response('index.html',{'link':link[0]}, RequestContext(request))
    s=socialsites.get_site_object_by_name('qq')
    s.get_access_token(code)
    #s.site_name s.uid s.name s.avatar
    sitename=s.site_name
    uid= s.uid
    name= s.name
    avatar = s.avatar
       #根据昵称 ID  图标来添加新用户
    #判断获取的s的数据是否正确，如果正确，则添加新用户
    try:
        user = User.objects.get(username=s.uid)  #只需要uid，便可以登录
#        user = User.objects.create_user(username=s.uid)  #只需要uid，便可以登录
    except :
        user = User.objects.create_user(username=s.uid,password='123456')  #只需要uid，便可以登录
        user.save()
        person=Person(user=user,nick_name=s.name,photo=s.avatar)#不再本地保存头像，保存url
        person.save()
    person=authenticate(username=s.uid,password='123456')
    #login(user.username,user.password)
   #用code换取token ，重定向到主页
    if person is not None:
        login(request, person)
#    return HttpResponseRedirect('/') 
    return blogall(request,loginflag=True)
