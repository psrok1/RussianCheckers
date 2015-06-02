import tornado.ioloop
import tornado.web 
import tornado.websocket
import json
#import Game
#import Checker
#import TopScorers

"""Klasa dziedziczaca po WebSocketHandler, odpowiada ze komunikacje serwera z przegladarka"""    
class WSHandler(tornado.websocket.WebSocketHandler):
    
    ''' wykonuje sie po otwarciu polaczenia z serwerem'''
    def open(self):
        print 'new connection'
    
    ''' odbiera wiadomosc tekstowa wyslana do serwera'''  
    def on_message(self, message):
	json_data = message;
	useful_data = json.loads(json_data)
	self.interpret(useful_data)
	  
        #self.write_message(message)
    
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
    def interpret(self, dict):
	if dict['message'] == 'rank':
	    # wez dane z pliku i wyslij :v
	    message = '{"message": "rank", "times": [100, 200, 300, 400, 500]}'
	    self.write_message(message)	
	else: 
		if dict['message'] == 'hello':	
		    self.hello(dict["pieces"])
		else: 
		    if dict['message'] == 'move':
	    		self.move(dict['moves'])
    
    def hello(self,pieces):
	if pieces == 'auto' or pieces == 'white':
	    message = '{"message": "hello", "pieces": "white"}'
	    self.write_message(message)
	if pieces == 'black':
	    message = '{"message": "hello", "pieces": "black"}'
	    self.write_message(message)

    def move(self,moves):
	message = {"message": "move", "moves": ["A2", "B3", "C4"]}
	self.write_message(message)
	message1 = {"message": "end", "time": 68, "clientWin": "true"}
	self.write_message(message1)	
	
if __name__ == "__main__":
    #game = Game.Game()
    #checker = Checker.Checker('b', True, "1a")
    #topscore = TopScorers.TopScorers()
    application = tornado.web.Application([
    (r'/', WSHandler)])
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
