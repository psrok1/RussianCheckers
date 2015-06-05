#include <iostream>
#include <string>
#include <sstream>
#include <algorithm>
#include <vector>
//#include <boost/python.hpp>
using namespace std;

void initModule()
{
std::cout << "Modul C++ boost::python zaimportowany" << std::endl;
}
/*Klasa reprezentujaca pionek na planszy
* zawiera w sobie informacje o kolorze pionka oraz czy jest on damka.
*/
struct SimpleChecker
{
	char color;
	bool king;
	SimpleChecker()
	{
		color = 0;
		king = false;
	}

	bool getKing()
	{
		return king;
	}

	char getColor()
	{
		return color;
	}
	//konstruktor z parametrami c - kolor b/w oraz k true/false
	SimpleChecker(char c, bool k) : color(c), king(k){}
	//zmiana stanu z normalnego pionka na damke

};

class GameState;

extern GameState* FIRST_INSTANCE;

/* Klasa przechowująca stan gry posiada kolekcje przechowujaca dane o polach planszy
* posiada reprezentacje planszy w postaci tablicy  oraz ktory kolor pionkow nalezy do gracza a ktory do komputera
*/
class GameState
{
private:
	static const int lenght = 8;

	SimpleChecker field[lenght][lenght];
	char playerColor;
	char computerColor;
	int whitePieces;
	int blackPieces;
	vector<int> wKings;
	vector<int> bKings;
	//Ocenia ruch przegladajac rekurencyjnie drzewo gry kilka poziomow w glab i zliczajac punkty przyznane po odpowiednim przeliczeniu za każdego pionka
	//Parametr depth - jesli jest rozny od zera przegladamy mozliwe stany jesli jest rowny 0 zliczamy punkty.

	typedef vector < int > moves;
	
	
	void printAll(int depth);

	int stateValue();
	int beaten(bool beat[8][8]);
	int evalBeaten(bool beat[8][8]);
	int evaluateBoard();
	
	
	void executeMove(int x1, int y1, int x2, int y2);
#ifndef BOOST_PYTHON
public:
#endif
	void playerMove(int, int, int, int);
private:
	void update();
	
	int alfabeta(int depth, int alpha, int beta, bool max_min, char moving_color, bool recordon, moves& m);
	int evaluate(int depth, moves& m);
	
	
	void commonCenterMoves(int depth, int& alfa, int& beta, int x, int y, int moving_value, bool max_min, char moving_color, bool recordon, moves& m);
	void commonSideMoves(int depth, int& alfa, int& beta, int x, int y, int moving_value, bool max_min, char moving_color, bool recordon, moves& m);
	void royalMove(int depth, int& alpha, int& beta, int x, int y, bool max_min, char moving_color, bool recordon, moves& m);
	void checkDirection(int depth, int& alpha, int& beta, int x, int y, bool max_min, char moving_color, int dirX, int dirY, int iterations, bool recordon, moves& m);
	
	
	bool isBeatPossible(int i, int j, int rj, int ri, char color);
	bool nextCommonBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m);
	void commonBeat(int depth, int& alpha, int& beta, bool max_min, int beatenX, int beatenY, int x, int y, char moving_color, char op_color, bool recordon, moves& m);
	
	
	bool possibleBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m);
	void checkNextRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, int iteri, int iterj, bool recordon, moves& m);
	bool possibleRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m);
	bool isRoyalBeatPossible(int beatingX, int beatingY, int beatenX, int beatenY, int iteri, int iterj);
	
	
	GameState move(int x, int y, int i, int j, char moving_color);
	void removeKing(vector<int>& v, int x, int y);
	void addKing(int x, int y);
	GameState& beat(int x, int y);
	
	
	
	
public:
	void insertPlayerData(char const*);
	/* konstruktor tworzacy nowa plansze gry
	* Parametry cc oraz pc przyporzadkowuja kolory pionkow
	*/
	GameState(char cc, char pc);
	char const* getPlayerColor();
	
	/* konstruktor zmiany stanu, wprowadzamy ostatni stan oraz dane wykonanej zmiany
	*/
	//GameState(GameState&, int, int, int, int);

	bool playerWin();
	bool playerLoss();
	//wykonanie ruchu przez komputer, wywoluje evaluate
	char const* makeMove();
};

#ifdef BOOST_PYTHON

#include <boost/python.hpp>
using namespace boost;
using namespace boost::python;


BOOST_PYTHON_MODULE(GameState)
{
initModule();
// Create the Python type object for our extension class and define __init__ function.
class_<GameState>("GameState", init<char, char>())
.def("makeMove", &GameState::makeMove)  // Add a regular member function.
.def("insertPlayerData", &GameState::insertPlayerData)
.def("playerWin", &GameState::playerWin)
.def("playerLoss", &GameState::playerLoss)
.def("getPlayerColor", &GameState::getPlayerColor)
;
class_<SimpleChecker>("SimpleChecker", init<char, bool>())
.def("getColor", &SimpleChecker::getColor)
.def("getKing", &SimpleChecker::getKing)
;
}

#endif
