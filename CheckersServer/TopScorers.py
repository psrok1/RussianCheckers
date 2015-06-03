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
	self.scorers.append([float(x) for x in target.readline().split()])
	target.close()        


    
    """Zapisuje obecny stan listy, nadpisujac plik"""
    def update(self):
	target = open('TopScorers', 'w')
	for i in range(0,5):
	    target.write(str(self.scorers[0][i]))
	    target.write(" ")
        target.close()
    
    """Tworzy pakiet gotowy do wyslania na serwer"""
    def sendingList(self):
	message = '{"message": "rank", "times": ['+ str(self.scorers[0][0]) + ', ' + str(self.scorers[0][1]) + ', ' + str(self.scorers[0][2]) + ', ' + str(self.scorers[0][3]) + ', ' + str(self.scorers[0][4]) + ']}'
	
        return message
    
    """Sprawdza czy podany czas jest lepszy niz najgorszy wynik na liscie"""
    def isGoodEnough(self, time):
	return time < self.scorers[0][4] 
    
    """Dodaje wynik oraz dane gracza na odpowiednie miejsce listy"""
    def addNewTopScorer(self, time):
	for i in range(0,5):
	    if self.scorers[0][i] > time:
	        j = 4
	        while j > i:
		    self.scorers[0][j] = self.scorers[0][j-1]
	            j = j - 1
	        self.scorers[0][i] = time
		return
"""
if __name__ == "__main__":
    top = TopScorers()
    top.read()
    if top.isGoodEnough(150):
	top.addNewTopScorer(150);
    
    print str(top.sendingList())
    top.update()""" 	

