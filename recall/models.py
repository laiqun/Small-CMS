# coding:utf-8
from django.db import models
from django.forms import ModelForm
from django.contrib.auth.models import User
# Create your models here.
CATEGORY_CHOICES = (
    ('R', 'relationship'),
    ('M', 'money'),
    ('D', 'dream'),
    ('H', 'health'),
    # childhood memory
)


class Person(models.Model):
    user = models.OneToOneField(User)
    nick_name = models.CharField(max_length=30)
    photo = models.ImageField(upload_to="qun/", blank=True, null=True)

    def __unicode__(self):
        return self.nick_name


class BlogPost(models.Model):
    category = models.CharField(null=False, max_length=1, choices=CATEGORY_CHOICES)
    outline = models.CharField(max_length=150)
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    laud_num = models.IntegerField(null=True, blank=True)  # 冷气值
    user_id = models.ForeignKey('Person', related_name='author_set')  # 谁写的    用在我的投稿页面
    # user_collect = models.ForeignKey('Person', related_name='collect_set', blank=True, null=True)  #这篇文章被哪些用户收藏  用在我的收藏页面
    user_collect = models.ManyToManyField('Person', blank=True)  #null is useless
    photo = models.ImageField(upload_to="img/", blank=True, null=True)  #blog所包含的图片
    def __unicode__(self):
        return self.outline
  #  class Meta:
 #       verbose_name_plural

class Comment(models.Model):
    blog_id = models.ForeignKey('BlogPost')
    user_id = models.ForeignKey('Person')  # 用在我的评论页面
    body = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    parent_id = models.ForeignKey('self', null=True, blank=True)  # 实现盖楼发表
    laud_num = models.IntegerField(default=0)   #设置默认值为0
    #点了举报讲评论发送给管理员
    def get_comments(self):
        return self.comment_set.all().order_by('timestamp')


