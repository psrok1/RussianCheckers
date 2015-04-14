#include <iostream>
#include <string>
#include <algorithm>


void initModule()
{
	std::cout << "Modul C++ boost::python zaimportowany" << std::endl;
}
 /*Klasa reprezentujaca pionek na planszy
 * zawiera w sobie informacje o kolorze pionka oraz czy jest on damka. 
 */
class SimpleChecker
{
	private:
		char color;
		bool king;
	public:
		SimpleChecker()
		{
			std::cout << "Konstruktor SimpleChecker" << std::endl;
		}
		//konstruktor z parametrami c - kolor b/w oraz k true/false
		SimpleChecker(char c, bool k): color(c), king(k){}
		//zmiana stanu z normalnego pionka na damke
		void makeKing()
		{
			return;
		}
		//zwraca kolor pionka
		char getColor()
		{
			return ' ';
		}
		//pokazuje czy pionek jest damka
		bool isKing()
		{
			return true;
		}
};

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
		//Ocenia ruch przegladajac rekurencyjnie drzewo gry kilka poziomow w glab i zliczajac punkty przyznane po odpowiednim przeliczeniu za każdego pionka
		//Parametr depth - jesli jest rozny od zera przegladamy mozliwe stany jesli jest rowny 0 zliczamy punkty.
		int evaluate(int depth);
		
	public:
		/* konstruktor tworzacy nowa plansze gry
		 * Parametry cc oraz pc przyporzadkowuja kolory pionkow
		 */
		GameState(char cc, char pc): playerColor(pc), computerColor(cc){std::cout << "Konstruktor GameState" << std::endl;}
		//wykonanie ruchu przez komputer, wywoluje evaluate
		std::string makeMove()
		{
			return "";
		}
		//aktualizuje plansze po wykonaniu ruchu przez gracza
		void updateState(std::string stateChange)
		{
			return;
		}
};


#include <boost/python.hpp>
using namespace boost;
using namespace boost::python;


BOOST_PYTHON_MODULE(GameState)
{
	initModule();
    // Create the Python type object for our extension class and define __init__ function.
    class_<GameState>("GameState", init<char, char>())
        .def("makeMove", &GameState::makeMove)  // Add a regular member function.
        .def("updateState", &GameState::updateState)  // Add invite() as a regular function to the module.
    ;
    class_<SimpleChecker>("SimpleChecker", init<char, bool>())
		.def("makeKing", &SimpleChecker::makeKing)
		.def("getColor", &SimpleChecker::getColor)
		.def("isKing", &SimpleChecker::isKing)
		;
}

