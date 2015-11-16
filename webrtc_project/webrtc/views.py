from django.shortcuts import render

# Create your views here.

import logging
import os
import uuid

from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.websocket import WebSocketHandler
 
from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponseRedirect

global_rooms = {}

def MainHandler(request):
    print("[Debug] mainhandler called")
    room = str(uuid.uuid4().hex.upper()[0:6])
    return HttpResponseRedirect('/room/'+room)

def RoomHandler(request, slug):
    print("[Debug] room handler")
    variables = RequestContext(request, {
		'slug': slug,
	})
    return render_to_response(
		'room.html', variables
	)


class EchoWebSocket(WebSocketHandler):
    def open(self, slug):
        print("[Debug] open")
        if slug in global_rooms:
            global_rooms[slug].clients.append(self)
        else:
            global_rooms[slug] = Room(slug, [self])
        self.room = global_rooms[slug]
        if len(self.room.clients) > 2:
            self.write_message('fullhouse')
        elif len(self.room.clients) == 1:
            self.write_message('initiator')
        else:
            self.write_message('not initiator')
        logging.info(
            'WebSocket connection opened from %s', self.request.remote_ip)

    def on_message(self, message):
        print("[Debug] on message")
        logging.info(
            'Received message from %s: %s', self.request.remote_ip, message)
        for client in self.room.clients:
            if client is self:
                continue
            client.write_message(message)

    def on_close(self):
        print("[Debug] on close")
        logging.info('WebSocket connection closed.')
        self.room.clients.remove(self)



def main():
    os.environ['DJANGO_SETTINGS_MODULE'] = 'myproject.settings' # path to your settings module
    application = get_wsgi_application()
    container = tornado.wsgi.WSGIContainer(application)
    http_server = tornado.httpserver.HTTPServer(container)
    http_server.listen(8888)
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()