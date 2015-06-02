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
	target = open('TopScorers')
	self.scorers = []
	self.scorers.append([int(x) for x in target.readline().split()])
	target.close()        


    
    """Zapisuje obecny stan listy, nadpisujac plik"""
    def update(self):
	target = open('TopScorers', 'w')
	for s in self.scorers:
	    target.write(str(s))
	    target.write(" ")
        target.close()
    
    """Tworzy pakiet gotowy do wyslania na serwer"""
    def sendingList(self):
	#message = '{"message": "rank", "times": ['+ self.scorers[0] + ', ' + self.scorers[1] + ', ' + self.scorers[2] + ', ' + self.scorers[3] + ', ' + self.scorers[4] + ']}'
	message = '{"message": "rank", "times": ' + str(self.scorers) + '}'
        return message
    
    """Sprawdza czy podany czas jest lepszy niz najgorszy wynik na liscie"""
    def isGoodEnough(self, time):
	return time < self.scorers[4] 
    
    """Dodaje wynik oraz dane gracza na odpowiednie miejsce listy"""
    def addNewTopScorer(self, time):
	for i in range(0,5):
	    if self.scorers[i] > time:
	        j = i+1
	        while j < 5:
		    self.scorers[j] = self.scorers[j-1]
	            j = j + 1
	        self.scorers[i] = time


if __name__ == "__main__":
    top = TopScorers()
    top.read()
    print top.sendingList()
    top.update()	

