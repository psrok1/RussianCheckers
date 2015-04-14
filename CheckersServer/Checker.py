"""Klasa przechowujaca dane dotyczace pionka"""
class Checker(object):
    """Konstruktor, inicjuje wartosci przechowywane w klasie wartosciami podanymi w parametrach"""
    def __init__(self, c, k, pos): 
        print 'Konstruktor Chceker'
        self.color = c    
        self.king = k
        self.captured = False
        self.pos = pos
    """udostepnianie wartosci zmiennej color """ 
    def color(self): 
    
        return self.color
    ''' Sprawdzenie czy dany pionek jest damka'''    
    def isKing(self): 
        
        return self.__king 
    ''' Ustawienie statusu pionka na przekazany w parametrze'''
    def setKing(self, d):
        
        self.damka = d
    ''' Ustawienie znacznika zbicia pionka na wartosc prezkazana w parametrze'''
    def setCaptured(self, z):
        
        self.zbity = z
    ''' Sprawdzenie czy pionek jest zbity'''    
    def isCapture(self):
        
        return self.zbity
    ''' Ustalenie polozenia pionka''' 
    def setPosition(self, pos):
        self.position = pos    
        
    """ Pobranie dancyh dotyczacych polozenia pionka"""
    def getPosition(self):
        return self.position
    
