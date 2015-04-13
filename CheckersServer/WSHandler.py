
import tornado.websocket

"""Klasa dziedziczaca po WebSocketHandler, odpowiada ze komunikacje serwera z przegladarka"""    
class WSHandler(tornado.websocket.WebSocketHandler):
    
    ''' wykonuje się po otwarciu połączenia z serwerem'''
    def open(self):
        print 'new connection'
    
    ''' odbiera wiadomość tekstową wysłaną do serwera'''  
    def on_message(self, message):
        print 'message' 
    
    ''' wykonuje się po zamknieciu połączenia z serwerem'''
    def on_close(self):
        print 'connection closed'
    
    ''' Pozwala na przyjmowanie zapytan z roznych zrodel'''
    def check_origin(self, origin): 
        return True    
    
    ''' Reaguje na zapytanie o serwer'''
    def get(self):
        print 'request'
