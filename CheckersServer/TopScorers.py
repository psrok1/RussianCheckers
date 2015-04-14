"""Klasa przechowujaca obecna liste graczy o najlepszych czasach wygranej, lista jest wczytywana z pliku

1.XXX czas:0.00
2.YYY czas:0.01
3.ZZZ czas:0.02
    ...
"""
class TopScorers(object):

    def __init__(self):
        print 'Konstruktor TopScores'
	self.scorers = []
        
    """Wczytuje ostatnio zapisana wersje listy"""
    def read(self):
        pass
    
    """Zapisuje obecny stan listy, nadpisujac plik"""
    def update(self):
        pass
    
    """Tworzy pakiet gotowy do wyslania na serwer"""
    def sendingList(self):
        pass
    
    """Sprawdza czy podany czas jest lepszy niz najgorszy wynik na liscie"""
    def isGoodEnough(self):
        pass
    
    """Dodaje wynik oraz dane gracza na odpowiednie miejsce listy"""
    def addNewTopScorer(self):
        pass
    
