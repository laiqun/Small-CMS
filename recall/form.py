# coding:utf-8
from django import forms
from django.contrib.auth.forms import UserCreationForm

CATEGORY_CHOICES = (
    ('R', 'relationship'),
    ('M', 'money'),
    ('D', 'dream'),
    ('H', 'health'),
    # childhood memory
)


class BlogForm(forms.Form):
    # write catagory body outlie  autowrite time and user
    # pass
    # category = forms.CharField( max_length=1,widget=forms.)
    category = forms.CharField(widget=forms.Select(choices=CATEGORY_CHOICES))
    outline = forms.CharField(max_length=150, widget=forms.TextInput(
        attrs={'placeholder': '投稿标题', 'style': 'width :100%;  text-align: center '}))

    body = forms.CharField(widget=forms.Textarea(
        attrs={'class': 'jokeContent', 'style': 'height:10em', 'placeholder': '你想讲个段子', 'cols': ' ',
               'rows': ' ',
               'tata-content': 'true'}))
    # category =forms.CharField()


class LoginForm(forms.Form):
    username = forms.CharField(label=u'User name',widget=forms.TextInput(attrs={'placeholder': 'Email/手机号', 'class': ' lh15m h15m c999', 'style': 'height: 37px'}))
    password = forms.CharField(label=u'Password', widget=forms.PasswordInput(render_value=False))
    password = forms.CharField(label=u'Password',widget=forms.TextInput(attrs={'placeholder': '密码', 'class': ' lh15m h15m c999', 'style': 'height: 37px'}))


class PersonForm(UserCreationForm):
    nickname = forms.CharField(max_length=30)
    photo = forms.ImageField(required=False)
    email = forms.EmailField()

