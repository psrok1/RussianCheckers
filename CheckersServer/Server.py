"""@package docstring
Dokumentacja Serwera WebSocket

"""
import tornado.ioloop
import tornado.web 
import tornado.websocket
import json
import GameState
import TopScorers
import time

    
class WSHandler(tornado.websocket.WebSocketHandler):
    """Klasa odpowiadajaca za komunikacje serwera z przegladarka.
	
    Tworzy serwer websocket ktorzy odbiera komunikaty od klienta oraz implementuje gracza komputerowego.
	"""
    
    def open(self):
	""" Wykonuje sie po otwarciu polaczenia z serwerem
	Wczytywane sa wyniki z pliku tekstowego.
	"""
	self.tops = TopScorers.TopScorers()
	self.tops.read()
        print 'new connection'
    
    
    def on_message(self, message):
	""" Odbiera wiadomosc tekstowa wyslana do serwera

	Funkcja odbiera wiadomosc z serwera, nastepnie konwertuje ja z JSON do dict i interpretuje.
	"""  
	json_data = message;
	useful_data = json.loads(json_data)
	print useful_data
	self.interpret(useful_data)

    def on_close(self):
	""" wykonuje sie po zamknieciu polaczenia z serwerem"""
        print 'connection closed'
    
    
    def check_origin(self, origin): 
	""" Pozwala na przyjmowanie zapytan z roznych zrodel"""
        return True    
    
    def interpret(self, dict):
	"""Funkcja interpretujaca wiadomosc od klienta.
	
	Sprawdza tresc nadeslanej przez klienta wiadomosci 
	"""
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
	"""Funkcja rozpoczynajaca gre.

	Przyjmuje powitanie oraz preferowany przez gracza kolor pionkow, odpowiada wysylajac wiadomosc o wybranym kolorze.	
	"""
	if pieces == 'auto' or pieces == 'white':
	    self.game = GameState.GameState('b', 'w')
	    message = '{"message": "hello", "pieces": "white"}'
	    self.write_message(message)
	if pieces == 'black':
	    self.game = GameState.GameState('w', 'b')	    
	    message = '{"message": "hello", "pieces": "black"}'
	    self.write_message(message)

    def ready(self):
	"""Odbiera od klienta wiadomosc o gotowosci.
	
	Odbiera od klienta wiadomosc o gotowosci, rozpoczyna liczenie czasu gry i zaleznie od wybranego koloru czeka na gracza lub wykonuje ruch.
	"""
	self.gameTime = time.time()
	if self.game.getPlayerColor() == 'b':
	    s = str()
	    s += '{"message": "move", "moves": '
	    s += self.game.makeMove()
	    s += '}'
	    self.write_message(s)


    def move(self,moves):
	"""Wykonuje ruchy, stwierdza koniec gry.
	Na podstawie otrzymanych od klienta danych wykonuje ruch, nastepnie sprawdza czy gra nie zostala zakonczona,
	Nastepnie wykonuje ruch komputera i ponownie sprawdza czy gra nie zostala zakonczona.
	Komunikaty o wykonanych ruchach sa przekazywane w postaci JSON do klienta.
	Jesli gra zostala zakonczona, sprawdza czas gry i wysyla wiadomosc klientowi.
	"""	
	s = str()
	for m in moves:
	    s += str(m)
	print s
	self.game.insertPlayerData(s)
	res = str()
	res += '{"message": "move", "moves": '
	res += self.game.makeMove()
	res += '}'
	self.write_message(res)
	if self.game.playerWin():
	    self.gameTime = time.time() - self.gameTime
	    message = {"message": "end", "time": self.gameTime, "clientWin": True}
	    self.write_message(message)
	    if self.tops.isGoodEnough(self.gameTime):
		self.tops.addNewTopScorer(self.gameTime)
		self.tops.update()
	else:
	    if self.game.playerLoss():
		self.gameTime = time.time() - self.gameTime
		message = {"message": "end", "time": self.gameTime, "clientWin": False}
		self.write_message(message)

		    
	
if __name__ == "__main__":
    application = tornado.web.Application([
    (r'/', WSHandler)])
    application.listen(3000)
    tornado.ioloop.IOLoop.instance().start()
