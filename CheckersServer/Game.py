import GameState

""" Klasa obslugujaca gre, przechowuje dane na temat jej stanu oraz modyfikuje je zgodnie z logika gry"""
class Game(object):
    '''inicjuje kolekcje przechowujaca dane dotyczace pionkow'''
    def __init__(self):
        print 'Konstruktor Game'
        self.__checkers = []
    	
    '''Rozpoczyna gre, podany w parametrze kolor jest przypisany jako kolor gracza, w zaleznosci od tego moze zostac wywolana funkcja makeMove
        lub oczekiwanie na ruch gracza, wprowadzane tez sa pozycje wszyskich pionkow'''
    def startGame(self, color):
        
        self.__color = color
    
    '''Wykonanie ruchu przez komputer, wywolywana jest funkcja wybierajaca ruch w danym ustawieniu wygladajacy na najlepszy '''
    def makeMove(self):
        pass
        
    '''infromacja o zrobieniu ruchu przez gracza, zmienia stan gry w zaleznosci od wykonanego ruchu'''
    def inform(self):
        pass
