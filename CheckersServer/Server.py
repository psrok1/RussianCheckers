import tornado.ioloop
import tornado.web 
import tornado.websocket
import json
import GameState
#import Checker
import TopScorers
import time

"""Klasa dziedziczaca po WebSocketHandler, odpowiada ze komunikacje serwera z przegladarka"""    
class WSHandler(tornado.websocket.WebSocketHandler):
    
    ''' wykonuje sie po otwarciu polaczenia z serwerem'''
    def open(self):
	self.tops = TopScorers.TopScorers()
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
	    self.tops.read()
	    self.write_message(self.tops.sendingList())	
	else: 
	    if dict['message'] == 'hello':	
	        self.hello(dict["pieces"])
	    else: 
	        if dict['message'] == 'move':
	    	    self.move(dict['moves'])
		else:
	  	    if dict['message'] == 'ready':			
			self.ready()
    
    

    def hello(self,pieces):
	if pieces == 'auto' or pieces == 'white':
	    self.game = GameState.GameState('b', 'w')
	    message = '{"message": "hello", "pieces": "white"}'
	    self.write_message(message)
	if pieces == 'black':
	    self.game = GameState.GameState('w', 'b')	    
	    message = '{"message": "hello", "pieces": "black"}'
	    self.write_message(message)


    def ready(self):
	self.gameTime = time.clock()
	if self.game.getPlayerColor() == 'b':
	    s = str()
	    s += '{"message": "move", "moves": '
	    s += self.game.makeMove()
	    s += '}'
	    self.write_message(s)




    def move(self,moves):
	s = str()
	for m in moves:
	    s += str(m)
	print s
	self.game.insertPlayerData(s)
	if self.game.playerWin():
	    self.gameTime = time.clock() - self.gameTime
	    message = {"message": "end", "time": self.gameTime, "clientWin": "true"}
	    self.write_message(message)
	    if tops.isGoodEnough():
		tops.addNewTopScorer()
		tops.update()
	else:
	    res = str()
	    res += '{"message": "move", "moves": '
	    res += self.game.makeMove()
	    res += '}'
	    self.write_message(res)
	    if self.game.playerLoss():
		self.gameTime = time.clock() - self.gameTime
		message = {"message": "end", "time": self.gameTime, "clientWin": "false"}
		self.write_message(message)



	
	#message = {"message": "move", "moves": ["A2", "B3", "C4"]}
	#self.write_message(message)
	#message1 = {"message": "end", "time": 68, "clientWin": "true"}
	#self.write_message(message1)





	
	
if __name__ == "__main__":
    #game = Game.Game()
    #checker = Checker.Checker('b', True, "1a")
    #topscore = TopScorers.TopScorers()
    application = tornado.web.Application([
    (r'/', WSHandler)])
    application.listen(3000)
    tornado.ioloop.IOLoop.instance().start()
