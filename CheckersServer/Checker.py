"""Klasa przechowujaca dane dotyczace pionka"""
class Checker(object):
    """Konstruktor, inicjuje wartosci przechowywane w klasie wartosciami podanymi w parametrach"""
    def __init__(self, c, k, pos): 
        
        self.__color = c    
        self.__king = k
        self.__captured = False
        self.__pos
    """udostepnianie wartosci zmiennej color """ 
    def color(self): 
    
        return self.__color
    ''' Sprawdzenie czy dany pionek jest damka'''    
    def isKing(self): 
        
        return self.__king 
    ''' Ustawienie statusu pionka na przekazany w parametrze'''
    def setKing(self, d):
        
        self.__damka = d
    ''' Ustawienie znacznika zbicia pionka na wartosc prezkazana w parametrze'''
    def setCaptured(self, z):
        
        self.__zbity = z
    ''' Sprawdzenie czy pionek jest zbity'''    
    def isCapture(self):
        
        return self.__zbity
    ''' Ustalenie polozenia pionka''' 
    def setPosition(self, pos):
        self.__position = pos    
        
    """ Pobranie dancyh dotyczacych polozenia pionka"""
    def getPosition(self):
        return self.__position
    