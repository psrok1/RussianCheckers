import tornado.ioloop
import tornado.web 
import tornado.websocket
import Game
import Checker
import TopScorers

"""Klasa dziedziczaca po WebSocketHandler, odpowiada ze komunikacje serwera z przegladarka"""    
class WSHandler(tornado.websocket.WebSocketHandler):
    
    ''' wykonuje sie po otwarciu polaczenia z serwerem'''
    def open(self):
        print 'new connection'
    
    ''' odbiera wiadomosc tekstowa wyslana do serwera'''  
    def on_message(self, message):
        print 'message' 
        self.write_message(message)
    
    ''' wykonuje sie po zamknieciu polaczenia z serwerem'''
    def on_close(self):
        print 'connection closed'
    
    ''' Pozwala na przyjmowanie zapytan z roznych zrodel'''
    def check_origin(self, origin): 
        return True    
    
    ''' Reaguje na zapytanie o serwer'''
    #def get(self):
    #   pass
        #self.render("zrodlostrony.html") #.js tez powinno pociagnac

if __name__ == "__main__":
    game = Game.Game()
    checker = Checker.Checker('b', True, "1a")
    topscore = TopScorers.TopScorers()
    application = tornado.web.Application([
    (r'/', WSHandler)])
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()

