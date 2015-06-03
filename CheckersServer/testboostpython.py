import GameState

game = GameState.GameState('w', 'b')
s = str()
s+= "A5B4C3"
game.insertPlayerData(s)
c = str()
c+=game.makeMove()
print c
