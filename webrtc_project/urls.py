"""webrtc_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""

import os.path

from django.conf.urls import include, url, patterns
from django.contrib import admin

from webrtc_project.webrtc.views import *

js = os.path.join(
    os.path.dirname(__file__), 'js'
    )

css = os.path.join(
    os.path.dirname(__file__), 'css'
    )

urlpatterns = patterns('', 
	(r'^$', MainHandler),
    (r'room/([^/]*)/$', RoomHandler),
    (r'ws/([^/]*/$)', EchoWebSocket),
    (r'^js/(?P<path>.*)$', 'django.views.static.serve',
    {'document_root':js}),
    (r'^css/(?P<path>.*)$', 'django.views.static.serve',
    {'document_root':css}),
	)
