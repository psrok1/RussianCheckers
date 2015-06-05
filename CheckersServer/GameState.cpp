#define GCC_INSIDE
#define BOOST_PYTHON

#ifdef GCC_INSIDE
#define __debugbreak __builtin_trap
#endif

#define MAX_INIT_BETA 10000000
#define MIN_INIT_ALPHA -MAX_INIT_BETA

#include "GameState.h"
#include <deque>
//#include "EvaluateBoard.cpp"

GameState* FIRST_INSTANCE;

#ifndef BOOST_PYTHON
int main()
{
	int x1, x2, y1, y2;
	GameState gs('b', 'w');
	FIRST_INSTANCE = &gs;
	while (true)
	{
		std::deque<int> ruchy;
		int val;
		do {
			cin >> val;
			if (val != 100)
				ruchy.push_back(val);
		} while (val != 100);
		while (!ruchy.empty())
		{
			x1 = ruchy[0];
			y1 = ruchy[1];
			x2 = ruchy[2];
			y2 = ruchy[3];
			for (int i = 0; i < 4; i++)
				ruchy.pop_front();
			gs.playerMove(x1, y1, x2, y2);
		}
		gs.makeMove();
	}
	return 0;
}
#endif

/** Zlicza pionki na planszy i aktualizuje ich stan*/
void GameState::update()
{
	int b = 0;
	int w = 0;
	for (int i = 0; i < lenght; i++)
	{
		for (int j = 0; j < lenght; j++)
		{
			if (field[i][j].color == 'b') b++;
			if (field[i][j].color == 'w') w++;
		}
	}
	whitePieces = w;
	blackPieces = b;
}
/** Zwraca kolor pionków gracza. */
char const* GameState::getPlayerColor()
{
	string s;
	s.push_back(playerColor);
	return s.c_str();
}
/** Informuje czy gracz wygrał czy nie. */
bool GameState::playerWin()
{
	if (playerColor == 'b')
	{
		return whitePieces == 0;
	}
	if (playerColor == 'w')
	{
		return blackPieces == 0;
	}
	return false;
}
/** Informuje czy gracz przegrał czy nie. */
bool GameState::playerLoss()
{
	if (playerColor == 'w')
	{
		return whitePieces == 0;
	}
	if (playerColor == 'b')
	{
		return blackPieces == 0;
	}
	return false;
}
/** Konstruktor klasy GameState.
 * 
 * Ustala kolor pionków gracza i komputera, rozmieszcza pionki na planszy. 
 * cc - kolor pionków komputera
 * pc - kolor pionków gracza
 */
GameState::GameState(char cc, char pc) : playerColor(pc), computerColor(cc), whitePieces(12), blackPieces(12)
{
	for (int i = 0; i < 8; ++i)
		for (int j = 0; j < 8; ++j)
		{
			field[i][j].color = 0;
			field[i][j].king = false;
		}

	for (int i = 0; i < 8; i++)
	{
		for (int j = ((i + 1) % 2); j < 8; j += 2)
		{
			if (i < 3)
			{
				field[i][j].color = 'b';
			}
			else
				if (i > 4)
				{
					field[i][j].color = 'w';
				}
				else
					field[i][j].color = 0;
		}
	}
}
/** Funkcja sprawdzająca wartość stanu planszy. */

int GameState::stateValue()
{
	return (playerColor == 'w') ? evaluateBoard() : -(evaluateBoard());
}
void GameState::ASSERTION_MUST_BE_IN_RANGE(int x, int y)
{
	if (x < 0 || x > 7 || y < 0 || y > 7)
		__debugbreak(); // PRZEKROCZENIE ZAKRESU!
}

void GameState::ASSERTION_MUST_BE_EMPTY(int x, int y)
{
	if (field[x][y].color != 0)
		__debugbreak(); // NIE PUSTY - PROBLEM
	else if (field[x][y].king == true)
		__debugbreak(); // BRAK SPÓJNOŚCI! COLOR = 0, KING = TRUE
}

void GameState::ASSERTION_MUST_BE_NON_EMPTY(int x, int y)
{
	if (field[x][y].color == 0)
		__debugbreak(); // PUSTY - PROBLEM
}
/** Bicie pionka.
 * Usuwa pionek ze wskazanego pola oraz zmniejsza liczbę pionków.
 */
GameState& GameState::beat(int x, int y)
{
	this->ASSERTION_MUST_BE_NON_EMPTY(x, y);

	if (field[x][y].king)
	{
		if (field[x][y].color == 'w')
		{
			removeKing(wKings, x, y);
		}
		if (field[x][y].color == 'b')
		{
			removeKing(bKings, x, y);
		}
	}
	if (field[x][y].color == 'b')
		blackPieces--;
	if (field[x][y].color == 'w')
		whitePieces--;
	field[x][y].color = 0;
	// nie było usunięcia flagi King
	field[x][y].king = false;
	return *this;
}
/** Realizuje ruch.
 * 
 * Przesuwa pionek z położenia początkowego na końcowe, bijąc napotakne po drodze pionki.
 * x1,y1 - położenie poczatkowe
 * x2, y2 - położenie końcowe
 */
// REALIZUJE RUCH (czym to się niby różni od move?) << właściwie to niczym się nie różniło ale powstało 4 dni później i w sumie z początku nie było aż tak podobne do move (chyba)
// Wykonuje bicie dodatkowo!!!!!
void GameState::executeMove(int x1, int y1, int x2, int y2)
{	
	this->ASSERTION_MUST_BE_IN_RANGE(x1, y1);
	this->ASSERTION_MUST_BE_IN_RANGE(x2, y2);
	this->ASSERTION_MUST_BE_NON_EMPTY(x1, y1);
	this->ASSERTION_MUST_BE_EMPTY(x2, y2);

	if (x1 == x2 || y1 == y2)
		__debugbreak(); // Przemieszczenie na samego siebie
	
	// Skopiuj pionek z pola x1,y1 na pole x2,y2
	field[x2][y2] = field[x1][y1];
	// Jeśli pole x1,y1 było damką
	if (field[x1][y1].king)
	{
		// W odpowiednim wektorze...
		std::vector<int> &kings = (field[x1][y1].color == 'b') ? bKings : wKings;
		// Usuń damkę w źródłowym
		removeKing(kings, x1, y1);
		// Dodaj damkę w docelowym
		addKing(x2, y2);
	}
	// Wyzeruj pole skąd przyszło
	field[x1][y1].color = 0;
	field[x1][y1].king = false;
	// Wyzeruj pola na drodze
	int i = (x1 < x2) ? 1 : -1;
	int j = (y1 < y2) ? 1 : -1;
	for (; x1 != x2 && y1 != y2; x1 += i, y1 += j)
	{
		if (field[x1][y1].king == true && field[x1][y1].color == 0)
			__debugbreak(); // NIESPÓJNOŚĆ PLANSZY!
		// Jeśli coś tam stało: zbij
		if (field[x1][y1].color != 0)
			beat(x1, y1);
	}
	// ZMIANA: Aktualizacja liczby pionków
	update();
	// Jeśli pole nie było damką
	if (field[x2][y2].king == false)
	{
		// A stoi na polu przemiany
		if ((field[x2][y2].color == 'b' && x2 == 7) || (field[x2][y2].color == 'w' && x2 == 0))
		{ 
			field[x2][y2].king = true; 
			addKing(x2, y2); 
			//cout << "pole:" << x2 << y2 << " stalo sie damka"; 
		}
	}
}
/** Ruch o wektor przemieszczenia na planszy
 * 
 * x,y - współrzędne położenia początkowego
 * i,j - wektor przemieszczenia
 */
// Ruch o wektor przemieszczenia na planszy
// moving_color - niewykorzystywana zmienna! << TO WYJEBAĆ JĄ ????
GameState GameState::move(int x, int y, int i, int j, char moving_color)
{
	GameState gs(*this);
	// Z tym, że uwaga! Wykonuje dodatkowe bicie!
	gs.executeMove(x, y, x + i, y + j);
	return gs;
}

/**
 * 
 * 
 * 
 *
 */
// TYLKO ALIAS: Na ruch gracza << WYJEBAĆ ??
void GameState::playerMove(int x1, int y1, int x2, int y2)
{
	executeMove(x1, y1, x2, y2);
}

/** Sprawdza czy gracz moze wykonac jakis ruch.
 * Zwraca prawdę jeśli gracz może wykonać jakikolwiek ruch, fałsz w przeciwnym przypadku.
 */
bool GameState::playerBlocked()
{
	moves m;
	alfabeta(1, MIN_INIT_ALPHA, MAX_INIT_BETA, true, playerColor, true, m);
	return m.empty();
}
/** Realizuje ruch ze strony serwera oraz czy żaden z graczy nie będzie zablokowany.
 *
 * Szuka najlepszej możliwości ruchu dla gracza komputerowego, jeśli jej nie znajdzie sygnalizuje blokade.
 * Wykonuje znaleziony ruch i sprawdza klient nie jest zablokowany.
 * Zwraca wykonany ruch w postaci ciągu znaków.
 */
// Realizuje ruch ze strony serwera
char const* GameState::makeMove()
{
	char c;
	string s;
	printAll(0); // DEBUG
	moves m;
	int depth = 10;
	do
	{
		m.clear();
		evaluate(depth--, m); // Wylicz ruchy do wektora m z głębokością 10
	} while (m.size() == 0 && depth > 0);
	// Filtrowanie duplikatów
	for (int i = m.size() - 1; i - 3 >= 0; i -= 2)					
	{
		if (m[i - 1] == m[i - 3] && m[i] == m[i - 2])
		{
			m.erase(m.begin() + (i - 1), m.begin() + (i + 1));
		}
	}
	// Zrealizuj te ruchy na planszy
	if (m.size() > 0)													
	{																	
		for (int i = m.size() - 1; i - 3 >= 0; i -= 2)					
		{																
			executeMove(m[i - 1], m[i], m[i - 3], m[i - 2]);            
		}
		// Aktualizacja liczby pionków
		update();
		// Sprawdzamy czy gracz może się ruszyć
		if (playerBlocked())
		{
			// Nie? Przegrał
			(playerColor == 'b' ? blackPieces : whitePieces) = 0;
		}
	}
	else
	{
		//
		cout << "player win" << endl;                                   
		if (computerColor == 'b') blackPieces = 0;                      
		else if (computerColor == 'w') whitePieces = 0;                 
	}  																	
	printAll(0); // DEBUG
	// Stwórz komunikat
	s.push_back('[');
	s.push_back(' ');
	for (int i = m.size() - 1; i >= 0; i -= 2)
	{
		s.push_back('\"');
		c = 'A' + (char)m[i];
		s.push_back(c);
		//ss << c;
		c = '8' - (char)m[i - 1];
		s.push_back(c);
		s.push_back('\"');
		if (i != 1) s.push_back(',');
		s.push_back(' ');
	}
	s.push_back(']');
	cout << s; // DEBUG
	// Wyślij komunikat do części Python
	return s.c_str();
}

/** Parsuje dane o ruchu przychodzace od klienta
 * oraz wykonujace wskazane ruchy */
void GameState::insertPlayerData(char const* s)
{
	moves m;
	char c;
	cout << s;
	string str(s);
	for (int i = 1; i < str.size(); i += 2)
	{
		c = 8 - (str[i] - '0');
		m.push_back((int)c);
		c = str[i - 1] - 'A';
		m.push_back((int)c);
	}
	for (int i = 0; (i + 3) < m.size(); i += 2)
		playerMove(m[i], m[i + 1], m[i + 2], m[i + 3]);
	update();
}
/** Wyszukuje ruch dla gracza komputerowego i zapisuje go w zadanym wektorze.
 * 
 * depth - głębokość przeszukania drzewa gry
 * m - wektor ruchów
 */
// Wylicza ruch serwera do zrealizowania
// PO CO TU JEST ZWRACANY INT << BO MYŚLAŁEM ŻE TO BĘDZIE ZWRACAĆ WARTOŚĆ WYLICZONEJ ALFY ALE OKAZAŁO SIĘ ŻE NIE MA TAKIE POTRZEBY
int GameState::evaluate(int depth, moves& m)
{
	cout << alfabeta(depth, MIN_INIT_ALPHA, MAX_INIT_BETA, true, computerColor, true, m);
	cout << endl;

	for (int i = m.size() - 1; i >= 0; i -= 2)
	{
		cout << m[i - 1] << "-" << m[i] << endl;
	}
	// PO CO TU JEST 0 << BO MYŚLAŁEM ŻE TO BĘDZIE ZWRACAĆ WARTOŚĆ WYLICZONEJ ALFY ALE OKAZAŁO SIĘ ŻE NIE MA TAKIE POTRZEBY
	return 0;
}

/// wypisuje cala plansze w razie potrzeby - cele debug
void GameState::printAll(int depth)
{
	char c;
	for (int i = 0; i < depth; i++)
		cout << "  ";
	cout << "  0  1  2  3  4  5  6  7" << endl;
	for (int i = 0; i < 8; i++)
	{
		for (int i = 0; i < depth; i++)
			cout << "  ";
		for (int j = 0; j < 8; j++)
		{		
			c = (field[i][j].king && field[i][j].color != 0) ? field[i][j].color - 'a' + 'A' : field[i][j].color;
			if (j == 0) cout << i << '|';
			cout << ((field[i][j].color == 0) ? ' ' : c) << ((j == 7) ? "|\n" : "| ");
		}
	}
}

int DEBUG_MODE = 0;

/** Wyszukuje ruch dla gracza komputerowego.
 * 
 * Przeszukuje drzewo gry na daną głębokość i na podstawie otrzymanych wartości wybiera ruch do wykonania przez komputer.
 * depth - glebokosc przeszukiwania
 * alpha, beta - współczynniki algorytmu minmax + alfabeta
 * max_min - czy szukamy maksymalnej czy minimalnej wartosci
 * moving_color - jaki kolor pioka wykonuje ruch
 * recordon - czy pozycje pionka będą zapisywane do wektora
 * m - wektor ruchów
 */
int GameState::alfabeta(int depth, int alpha, int beta, bool max_min, char moving_color, bool recordon, moves& m)
{
	if (DEBUG_MODE)
	{
		std::cout << "------------------------------------------------\n";
		printAll(depth);
	}
	// W LIŚCIU OBECNEGO DRZEWA GRY:
	// gdy osiągnęliśmy maksymalną głębokość lub skończyły się pionki
	if (blackPieces == 0 || whitePieces == 0 || depth == 0) // <-- jesteśmy w liściu obecnego drzewa gry
	{
		if (blackPieces == 0) // Jeśli skończyły się czarne
		{
			if (playerColor == 'b') // A my jesteśmy czarnymi
			{
				if (DEBUG_MODE)
				{
					for (int i = 0; i < depth; i++)
						cout << "  ";
					std::cout << "leaf: -1000000\n";
				}
				return -1000000;  // Ten ruch prowadzi do definitywnej przegranej
			}
			else
			{
				if (DEBUG_MODE)
				{
					for (int i = 0; i < depth; i++)
						cout << "  ";
					std::cout << "leaf: 1000000\n";
				}
				return 1000000; // Ten ruch prowadzi do definitywnej wygranej
			}
		}
		if (whitePieces == 0) // Jeśli skończyły się białe
		{
			if (playerColor == 'w')
			{
				if (DEBUG_MODE)
				{
					for (int i = 0; i < depth; i++)
						cout << "  ";
					std::cout << "leaf: -1000000\n";
				}
				return -1000000; // Ten ruch prowadzi do definitywnej przegranej
			}
			else
			{
				if (DEBUG_MODE)
				{
					for (int i = 0; i < depth; i++)
						cout << "  ";
					std::cout << "leaf: 1000000\n";
				}
				return 1000000; // Ten ruch prowadzi do definitywnej wygranej
			}
		}
		if (depth == 0) // Jeśli nic się nie skończyło, ale osiągneliśmy maksymalną głębokość
			return stateValue(); // Wylicz wartość planszy

	}
	// op_color: kolor przeciwnika
	char op_color = (moving_color == 'b') ? 'w' : 'b';
	int i, j;
	// Nasze damki (po co tu była kopia?) Do tego stałość!!
	const vector<int>& kings = (moving_color == 'b') ? bKings : wKings;
	bool beating = false;// <-- zmienna informująca o możliwości bicia
	// Sprawdzenie pionków przeciwnika, które mogą być bite
	for (i = 1; i < 7; i++)// <-- sprawdzenie pionków przeciwnika które nie są na krawędziach planszy (mogą byc bite)
	{
		for (j = 2 - ((i + 1) % 2); j < 7; j += 2)
		{
			if (field[i][j].color == op_color)
			{
				// Czy pionek i,j może być bity przez zwykły?
				beating = (possibleNRoyalBeats(depth, alpha, beta, max_min, i, j, moving_color, op_color, recordon, m)) ? true : beating;

				if (alpha >= beta)
				{
					if (DEBUG_MODE) {
						for (int i = 0; i < depth; i++)
							cout << "  ";
						std::cout << "ret: " << ((max_min) ? alpha : beta) << "\n";
					}
					return (max_min) ? alpha : beta;
				}
			}
		}
	}
	if (kings.size() % 2 == 1)
		__debugbreak(); // ASSERT: Nieparzysta liczba parametrów w kings
	// Jeśli są jakieś damki, sprawdzamy czy mogą bić
	if (!kings.empty())
	{
		for (unsigned int k = 0; k < kings.size(); k += 2)
		{
			beating = (possibleRoyalBeats(depth, alpha, beta, max_min, kings[k], kings[k + 1], moving_color, op_color, recordon, m)) ? true : beating;
			
			if (alpha >= beta)
			{
				if (DEBUG_MODE) {
					for (int i = 0; i < depth; i++)
						cout << "  ";
					std::cout << "ret kings: " << ((max_min) ? alpha : beta) << "\n";
				}
				return (max_min) ? alpha : beta;
			}
		}
	}

	if (!beating)// <-- nie ma opcji bicia
	{

		int start_value = (moving_color == 'b') ? 0 : 1;
		int end_value = (moving_color == 'b') ? 7 : 8;
		int moving_value = (moving_color == 'b') ? 1 : -1;
		int i, j;
		for (i = start_value; i < end_value; ++i)
		{
			for (j = 2 - ((i + 1) % 2); j < 7; j += 2)
			{
				if (field[i][j].color == moving_color && field[i][j].king != true)
				{
					commonCenterMoves(depth, alpha, beta, i, j, moving_value, max_min, moving_color, recordon, m);
					if (alpha >= beta)
					{
						if (DEBUG_MODE)
						{
							for (int i = 0; i < depth; i++)
								cout << "  ";
							std::cout << "ret !beating: " << ((max_min) ? alpha : beta) << "\n";
						}
						return (max_min) ? alpha : beta;
					}
				}
			}
		}
		for (i = start_value; i < end_value; i++)
		{
			if (field[i][0].color == moving_color && field[i][0].king != true)
			{
				commonSideMoves(depth, alpha, beta, i, 0, moving_value, max_min, moving_color, recordon, m);
				if (alpha >= beta)
				{
					return (max_min) ? alpha : beta;
				}
			}
			if (field[i][7].color == moving_color && field[i][7].king != true)
			{
				commonSideMoves(depth, alpha, beta, i, 7, moving_value, max_min, moving_color, recordon, m);
				if (alpha >= beta)
				{
					if (DEBUG_MODE)
					{
						for (int i = 0; i < depth; i++)
							cout << "  ";
						std::cout << "ret !beating: " << ((max_min) ? alpha : beta) << "\n";
					}
					return (max_min) ? alpha : beta;
				}
			}
		}
		for (unsigned i = 0; i < kings.size() && i + 1 < kings.size(); i += 2)
		{

			royalMove(depth, alpha, beta, kings[i], kings[i + 1], max_min, moving_color, recordon, m);
		}
	}
	if (DEBUG_MODE)
	{
		for (int i = 0; i < depth; i++)
			cout << "  ";
		std::cout << "ret last: " << ((max_min) ? alpha : beta) << "\n";
	}
	return (max_min) ? alpha : beta;
}
/** Dla zadanej damki szuka dostępnych bić.
 * 
 * Szuka pionkow przeciwnika i sprawdza które z nich mogą być bite przez damkę.
 * Zwraca prawdę jeśli istnieją jakieś bicia, fałsz w przeciwnym wypadku.
 * x,y - pozycja damki
 */
bool GameState::possibleRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{
	int temp;
	bool anybeats = false; 
	for (int i = 1; i < 7; i++)
	{
		for (int j = 2 - ((i + 1) % 2); j < 7; j += 2)
		{
			if (field[i][j].color == op_color && ((i - j) == (x - y) || (i + j) == (x + y))) // pionek w zaięgu damki
			{
				int iteri = (x < i) ? 1 : -1;
				int iterj = (y < j) ? 1 : -1;
				if (isRoyalBeatPossible(x, y, i, j, iteri, iterj))
				{
					anybeats = true;
					temp = alpha;
					move(x, y, i + iteri - x, j + iterj - y, moving_color)/*.beat(i, j)*/.checkNextRoyalBeats(depth, alpha, beta, max_min, i+iteri, j+iterj, moving_color, op_color, iteri, iterj, recordon, m);
					if (recordon) { if (temp < alpha) { m.push_back(x); m.push_back(y); temp = alpha; } }
					if (alpha >= beta)
						return true;
				}
			}
		}
	}
	return anybeats;
}
/** Wyszukuje dalszych bić dla damki lub 
 * x,y - położenie po biciu
 * iteri, iterj - wektor kierunku poszukiwań 
 */

void GameState::checkNextRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, int iteri, int iterj, bool recordon, moves& m)
{

	int temp;
	int i = 0;
	int j = 0;

	bool anybeats = false;
	// Od miejsca gdzie jest damka, która wykonała bicie
	// Do miejsca gdzie może się dalej ruszyć
	while (x + i < 8 && x + i >= 0 && y + j < 8 && y + j >= 0)
	{
		temp = alpha;
		// Sprawdzenie, czy z (x+i,y+j) da się wykonać damką bicie
		anybeats = (
			(i == 0 && j == 0 ? GameState(*this) : move(x, y, i, j, moving_color))
			.possibleRoyalBeats(depth, alpha, beta, max_min, x + i, y + j, moving_color, op_color, recordon, m)) ? true : anybeats;
		// Pisanie do wektora jeśli jesteś na głębokości 1
		if (recordon) { if (temp < alpha) { m.push_back(x); m.push_back(y); temp = alpha; } }
		i += iteri;
		j += iterj;
		if (field[x + i][y + j].color != 0)
			break;
	}
	// cofanie inkrementacji poza zakresem
	i -= iteri;
	j -= iterj;
	// Jeśli nie znaleziono takich możliwości
	// Czyli nic więcej nie zrobimy tą damką
	if (!anybeats)
	{
		// Jeśli nie może się ruszyć w tym kierunku
		if (i == 0 || j == 0)
		{
			// Sprawdzamy dalsze ruchy dla obecnej pozycji damki
			if (max_min)
			{
				if (!(x + i < 8 && x + i >= 0 && y + j < 8 && y + j >= 0))
					__debugbreak(); // problem
				if (this->field[x][y].color == 0)
					__debugbreak(); // piece existance problem!
				temp = alpha;
				alpha = max(alpha, GameState(*this).alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + i); m.push_back(y + j); temp = alpha; } }

				if (alpha >= beta)
					return;
			}
			else
			{
				if (!(x + i < 8 && x + i >= 0 && y + j < 8 && y + j >= 0))
					__debugbreak(); // problem
				if (this->field[x][y].color == 0)
					__debugbreak(); // piece existance problem!
				// PATCH DONE!
				beta = min(beta, GameState(*this).alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (alpha >= beta)
					return;
			}
		}
		// Sprawdzamy ruchy dla dalszych pozycji
		while (i != 0 && j != 0)
		{
			if (max_min)
			{
				if (!(x + i < 8 && x + i >= 0 && y + j < 8 && y + j >= 0))
					__debugbreak(); // problem
				if (this->field[x][y].color == 0)
					__debugbreak(); // piece existance problem!
				temp = alpha;
				alpha = max(alpha, move(x, y, i, j, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + i); m.push_back(y + j); temp = alpha; } }

				if (alpha >= beta)
					return;
			}
			else
			{
				if (!(x + i < 8 && x + i >= 0 && y + j < 8 && y + j >= 0))
					__debugbreak(); // problem
				if (this->field[x][y].color == 0)
					__debugbreak(); // piece existance problem!
				// PATCH DONE!
				beta = min(beta, move(x, y, i, j, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (alpha >= beta)
					return;
			}
			i -= iteri;
			j -= iterj;
		}
	}
}

/** 
 * Sprawdza czy damka o takich wspolrzednych moze wykonac bicie
 * beatingX, beatingY - wspolrzedne damki bijacej
 * beatenX, beatenY - wspolrzedne pionka potencjalnie bitego
 * iteri, iterj - wektor kierunku
 */
bool GameState::isRoyalBeatPossible(int beatingX, int beatingY, int beatenX, int beatenY, int iteri, int iterj)
{
	int i = iteri;
	int j = iterj;
	for (; beatingX + i != beatenX && beatingY != beatenY; i += iteri, j += iterj)
	{
		// sprawdzamy czy pomiedzy damka a pionkiem bitym nie znajduja sie inne pionki
		if (field[beatingX + i][beatingY + j].color != 0)
			return false;
	// jesli nie ma pomiedzy nimi pionkow zwracamy wartosc mowiaca
	// czy pole za pionkiem bitym jest wolne
	}
	return (field[beatenX + iteri][beatenY + iterj].color == 0);
}

/**Funkcja wykonujaca bicie zyklym pionkiem
 * beatenX, beatenY - wspolrzedne pionka bitego
 * x, y - kierunek z ktorego pionek jest bity
 */
void GameState::commonBeat(int depth, int& alpha, int& beta, bool max_min, int beatenX, int beatenY, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{
	int temp;
	// ruch na podane pole i bicie pionka po drodze
	GameState gs = move(beatenX + x, beatenY + y, -2 * x, -2 * y, moving_color);
	temp = alpha;
	if (gs.field[beatenX - x][beatenY - y].king == true)
	{
		temp = alpha;
		if (!gs.possibleRoyalBeats(depth, alpha, beta, max_min, beatenX - x, beatenY - y, moving_color, op_color, recordon, m))
		{
			if (max_min)
			{
				temp = alpha;
				// jesli damka nie moze wykonac zadnego bicia przechodzimy do nastepnego ruchu przeciwnika
				alpha = max(alpha, gs.alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (recordon) { if (temp < alpha) { m.clear(); m.push_back(beatenX - x); m.push_back(beatenY - y); m.push_back(beatenX + x); m.push_back(beatenY + y); temp = alpha; } }
			}
			else
			{
				beta = min(beta, gs.alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
			}
		}
		else { if (recordon) { if (temp < alpha) { m.push_back(beatenX + x); m.push_back(beatenY + y); temp = alpha; } } }
		if (alpha >= beta)
			return;
	}// jesli nie, sprawdzamy dalsze mozliwosci ruchu bicia dla pionka
	else
	{
		//jesli nie ma dlaszych mozliwosci bicia przechodzimy do nastepnego ruchu przeciwnika
		if (!(gs.nextCommonBeats(depth, alpha, beta, max_min, beatenX - x, beatenY - y, moving_color, op_color, recordon, m)))
		{
			if (max_min)
			{
				temp = alpha;
				alpha = max(alpha, gs.alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (recordon) { if (temp < alpha) { m.clear(); m.push_back(beatenX - x); m.push_back(beatenY - y); m.push_back(beatenX + x); m.push_back(beatenY + y); temp = alpha; } }
			}
			else
			{
				beta = min(beta, gs.alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
			}
		}
		if (recordon) { if (temp < alpha) { m.push_back(beatenX + x); m.push_back(beatenY + y); temp = alpha; } }
	}
}
/** Sprawdza wszystkie bicia możliwe do wykonania przez poinek o podanych współrzędnych (perspektywa pionka bijącego) */
bool GameState::nextCommonBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{

	bool anybeats = false;
	if (x > 1 && y > 1 && field[x - 1][y - 1].color == op_color && field[x - 2][y - 2].color == 0)
	{

		commonBeat(depth, alpha, beta, max_min, x - 1, y - 1, 1, 1, moving_color, op_color, recordon, m);

		anybeats = true;
		if (alpha >= beta) return true;
	}
	if (x > 1 && y < 6 && field[x - 1][y + 1].color == op_color && field[x - 2][y + 2].color == 0)
	{

		commonBeat(depth, alpha, beta, max_min, x - 1, y + 1, 1, -1, moving_color, op_color, recordon, m);
		anybeats = true;
		if (alpha >= beta) return true;
	}
	if (x < 6 && y < 6 && field[x + 1][y + 1].color == op_color && field[x + 2][y + 2].color == 0)
	{

		commonBeat(depth, alpha, beta, max_min, x + 1, y + 1, -1, -1, moving_color, op_color, recordon, m);
		anybeats = true;
		if (alpha >= beta) return true;
	}
	if (x < 6 && y > 1 && field[x + 1][y - 1].color == op_color && field[x + 2][y - 2].color == 0)
	{

		commonBeat(depth, alpha, beta, max_min, x + 1, y - 1, -1, 1, moving_color, op_color, recordon, m);
		anybeats = true;
		if (alpha >= beta) return true;
	}
	return anybeats;
}
/** Sprawdza wszyskie możliwości bicia pionka o podanych współrzędnych (perspektywa pionka bitego) */
bool GameState::possibleNRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{
	bool beating = false;
	if (isNRoyalBeatPossible(x, y, 1, 1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, 1, 1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	if (isNRoyalBeatPossible(x, y, -1, 1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, -1, 1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	if (isNRoyalBeatPossible(x, y, -1, -1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, -1, -1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	if (isNRoyalBeatPossible(x, y, 1, -1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, 1, -1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	return beating;
}
/** Usunięcie damki z wektora damek */
void GameState::removeKing(vector<int>& v, int x, int y)
{
	if (FIRST_INSTANCE == this)
		std::cout << "REMOVE KING " << x << "," << y << "\n";
	for (unsigned int i = 0; i < v.size(); i += 2)
	{
		if (v[i] == x && v[i + 1] == y)
		{
			vector<int>::iterator first = v.begin();
			advance(first, i);
			vector<int>::iterator last = first + 2;
			v.erase(first, last);
		}
	}
}
/** Dodanie wspołrzędnych damki do wektora damek */
void GameState::addKing(int x, int y)
{
	if (FIRST_INSTANCE == this)
		std::cout << "ADD KING " << x << "," << y << "\n";
	if (field[x][y].color == 'w')
	{
		wKings.push_back(x);
		wKings.push_back(y);
	}
	if (field[x][y].color == 'b')
	{
		bKings.push_back(x);
		bKings.push_back(y);
	}
}

/**  Szuka mozliwosci ruchu dla damki */
void GameState::royalMove(int depth, int& alpha, int& beta, int x, int y, bool max_min, char moving_color, bool recordon, moves& m)
{
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, -1, -1, ((x < y) ? x : y), recordon, m);
	if (alpha >= beta)return;
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, -1, 1, (x < 7 - y) ? x : 7 - y, recordon, m);
	if (alpha >= beta)return;
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, 1, 1, (7 - x < 7 - y) ? 7 - x : 7 - y, recordon, m);
	if (alpha >= beta)return;
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, 1, -1, (7 - x < y) ? 7 - x : y, recordon, m);
}
/** Szuka mozliwosci ruchu dla podanej damki.
 * x,y - wspolrzedne pola na ktorym znajduje sie damka 
 * dirX, dirY - kierunek poruszania sie damki
 * iterations - ilosc pol do konca planszy w danym kierunku poruszania sie
 */
void GameState::checkDirection(int depth, int& alpha, int& beta, int x, int y, bool max_min, char moving_color, int dirX, int dirY, int iterations, bool recordon, moves& m)
{
	int temp;
	int i = dirX;
	int j = dirY;
	while (iterations > 0 && field[x + i][y + j].color == 0)
	{
		if (max_min)
		{
			temp = alpha;
			alpha = max(alpha, this->move(x, y, i, j, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, moving_color, false, m));
			if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + i); m.push_back(y + j); m.push_back(x); m.push_back(y); temp = alpha; } }

		}
		else
		{
			beta = min(beta, this->move(x, y, i, j, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, moving_color, false, m));
		}
		if (alpha >= beta)
			return;
		i += dirX;
		j += dirY;
		iterations--;
	}
}
/** Sprawdza czy dla pionka w centralnej części planszy może zostać wykonany ruch */

void GameState::commonCenterMoves(int depth, int& alpha, int& beta, int x, int y, int moving_value, bool max_min, char moving_color, bool recordon, moves& m)
{
	int temp;
	char next_color = (moving_color == 'w') ? 'b' : 'w';
	if (field[x + moving_value][y - 1].color == 0)
	{
		if (max_min)
		{
			temp = alpha;
			alpha = max(alpha, this->move(x, y, moving_value, -1, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
			if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + moving_value); m.push_back(y - 1); m.push_back(x); m.push_back(y); temp = alpha; } }

		}
		else
		{
			beta = min(beta, this->move(x, y, moving_value, -1, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
		}
	}
	if (alpha > beta) return;
	if (field[x + moving_value][y + 1].color == 0)
	{
		if (max_min)
		{
			temp = alpha;
			alpha = max(alpha, this->move(x, y, moving_value, 1, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
			if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + moving_value); m.push_back(y + 1); m.push_back(x); m.push_back(y); temp = alpha; } }
		}
		else
		{
			beta = min(beta, this->move(x, y, moving_value, 1, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
		}
	}
}
/**  Sprawdza czy dla pionka przy krawędzi części planszy może zostać wykonany ruch */
void GameState::commonSideMoves(int depth, int& alpha, int& beta, int x, int y, int moving_value, bool max_min, char moving_color, bool recordon, moves& m)
{
	int temp;
	char next_color = (moving_color == 'w') ? 'b' : 'w';
	int side_moving_value = (y > 0) ? -1 : 1;
	if (field[x + moving_value][y + side_moving_value].color == 0)
	{
		if (max_min)
		{
			temp = alpha;
			alpha = max(alpha, this->move(x, y, moving_value, side_moving_value, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
			if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + moving_value); m.push_back(y + side_moving_value); m.push_back(x); m.push_back(y); temp = alpha; } }
		}
		else
		{
			beta = min(beta, this->move(x, y, moving_value, side_moving_value, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
		}
	}

}
/** Sprawdzenie czy podane pole może być bite
 * 
 * i,j - współrzędne pola
 * ri, rj - wektor kierunku z którego pole ma być bite
 */

///
bool GameState::isNRoyalBeatPossible(int i, int j, int ri, int rj, char color)
{
	return (field[i + ri][j + rj].color == color && 
		field[i+ri][j+rj].king == false && 
		field[i - ri][j - rj].color == 0);
}


/*
..A - roznica w liczbie pionkow 1.00 ~1
..b - roznica w liczbie damek 8.68 ~9
..c - roznica w sumie odleglosci pionow od linii promocji -1.48 ~-1
..d - roznica w sumie wolnych pol na linii promocji -1.32 ~-1
..e - roznica w sumie pionow do zbicia liczonych szacunkowo 3.65 ~4
..f - roznica w sumie damek do zbicia liczonych szacunkowo 3.91 ~4
..g - roznica w sumie pionow na bezpiecznych pozycjach  0.93 ~1
..h - roznica w liczbie damek na bezpiecznych pozycjach 8.76  ~9
i - roznica w sumie pionow, ktore nie moga wykonac ruchu ze wzgledu na zablokowane pola 1.04 ~1
j - roznica w sumie damek, ktore nie moga wykonac ruchu ze wzgledu na zablokowane pola 5.8 ~6
*/

/**
 * 
 * 
 * 
 *
 */
int GameState::beaten(bool beat[8][8])
{
	int sum = 0;
	for (int i = 0; i < 8; ++i)
		for (int j = 0; j < 8; ++j)
		{
			beat[i][j] = false;
		}
	for (int i = 0; i < 8; ++i)
		for (int j = 0; j < 8; ++j)
		{
			char c = field[i][j].getColor();
			if (c == 0) continue;
			if (field[i][j].getKing() == 0)
			{
				if (c == 'b')
				{
					if (i < 6 && j>1 && field[i + 1][j - 1].getColor() == 'w' && field[i + 2][j - 2].getColor() == 0) beat[i + 1][j - 1] = true;
					if (i < 6 && j < 6 && field[i + 1][j + 1].getColor() == 'w' && field[i + 2][j + 2].getColor() == 0) beat[i + 1][j + 1] = true;
					if (i < 7 && ((j>0 && field[i + 1][j - 1].getColor() == 'b') || j == 0) && ((j < 7 && field[i + 1][j + 1].getColor() == 'b') || j == 7)) //pionek bez ruchu
						sum += 1;
				}
				else
				{
					if (i>1 && j > 1 && field[i - 1][j - 1].getColor() == 'b' && field[i - 2][j - 2].getColor() == 0) beat[i - 1][j - 1] = true;
					if (i > 1 && j < 6 && field[i - 1][j + 1].getColor() == 'b' && field[i - 2][j + 2].getColor() == 0) beat[i - 1][j + 1] = true;
					if (i>0 && ((j > 0 && field[i - 1][j - 1].getColor() == 'w') || j == 0) && ((j < 7 && field[i - 1][j + 1].getColor() == 'w') || j == 7)) //pionek bez ruchu
						sum -= 1;
				}
			}
			else
			{
				int i1[] = { -1, -1, 1, 1 };
				int i2[] = { 1, -1, 1, -1 };
				bool moved = false;
				for (int k = 0; k < 4; ++k)
				{
					int tempi = i + i1[k];
					int tempj = j + i2[k];
					while (tempi > 0 && tempj > 0 && tempi < 7 && tempj < 7 && field[tempi][tempj].getColor() == 0)
					{
						moved = true;
						tempi += i1[k];
						tempj += i2[k];
					}
					if (tempi >= 0 && tempj >= 0 && tempi <= 7 && tempj <= 7 && field[tempi][tempj].getColor() != c && field[tempi][tempj].getColor() != 0 && field[tempi + i1[k]][tempj + i2[k]].getColor() == 0)
					{
						beat[tempi][tempj] = true;
						moved = true;
					}
				}
				if (moved == false)
				{
					if (c == 'b') //czarna damka bez ruchu
						sum += 6;
					else sum -= 6; // bia³a damka bez ruchu
				}
			}
		}
	return sum;
}

/**
 * 
 * 
 * 
 *
 */

/*
A - roznica w liczbie pionkow 1.00 ~1
b - roznica w liczbie damek 8.68 ~9
c - roznica w sumie odleglosci pionow od linii promocji -1.48 ~-1
d = roznica w sumie wolnych pol na linii promocji -1.32 ~-1
..e - roznica w sumie pionow do zbicia liczonych szacunkowo 3.65 ~4
..f - roznica w sumie damek do zbicia liczonych szacunkowo 3.91 ~4
..g - roznica w sumie pionow na bezpiecznych pozycjach  0.93 ~1
..h - roznica w liczbie damek na bezpiecznych pozycjach 8.76  ~9
i - roznica w sumie pionow, ktore nie moga wykonac ruchu ze wzgledu na zablokowane pola 1.04 ~1
j - roznica w sumie damek, ktore nie moga wykonac ruchu ze wzgledu na zablokowane pola 5.8 ~6
*/
int GameState::evalBeaten(bool beat[8][8])
{
	int sum = 0;
	for (int i = 0; i < 8; ++i)
		for (int j = 0; j < 8; ++j)
		{
			int temp;
			if (field[i][j].getColor() == 'b') temp = 1;
			else if (field[i][j].getColor() == 'w') temp = -1;
			else continue;
			if (field[i][j].getKing() == 0)
			{
				if (beat[i][j] == false)
					sum -= temp;// czarny pionek na bezpiecznej pozycji
				else
					sum += (temp * 4);//czary pionek pod biciem - bia³e maj¹ pionek do zbicia
			}
			else
				if (beat[i][j] == false)
					sum -= (temp * 9);// czarna dama na bezpiecznej pozycji
				else
					sum += (temp * 4);//czarna dama pod biciem - bia³e maj¹ dame do zbicia
		}

	return sum;
}

/*
..A - roznica w liczbie pionkow 1.00 ~1
..b - roznica w liczbie damek 8.68 ~9
..c - roznica w sumie odleglosci pionow od linii promocji -1.48 ~-1
..d = roznica w sumie wolnych pol na linii promocji -1.32 ~-1
..e - roznica w sumie pionow do zbicia liczonych szacunkowo 3.65 ~4
..f - roznica w sumie damek do zbicia liczonych szacunkowo 3.91 ~4
..g - roznica w sumie pionow na bezpiecznych pozycjach  0.93 ~1
..h - roznica w liczbie damek na bezpiecznych pozycjach 8.76  ~9
i - roznica w sumie pionow, ktore nie moga wykonac ruchu ze wzgledu na zablokowane pola 1.04 ~1
j - roznica w sumie damek, ktore nie moga wykonac ruchu ze wzgledu na zablokowane pola 5.8 ~6
*/
int GameState::evaluateBoard()
{
	bool beat[8][8];
	int sum = 0;
	sum = 0;
	for (int i = 0; i < 8; ++i)
	{
		if (field[0][i].getColor() == 0) sum += 1;
		if (field[7][i].getColor() == 0) sum -= 1;
	}
	sum += beaten(beat);
	//sum += evalBeaten(beat);
	for (int i = 0; i < 8; ++i)
		for (int j = 0; j < 8; ++j)
		{
			//int temp;
			if (field[i][j].getColor() == 'b')
			{
				if (field[i][j].getKing() == 0)
				{
					sum -= 1; // czarny pionek
					sum += (7 - i); // odleglosc czarnego pionka od linii promocji

				}
				else
				{
					sum -= 9; // czarna damka
				}
			}
			else if (field[i][j].getColor() == 'w')
			{
				if (field[i][j].getKing() == 0)
				{
					sum += 1; // bia³y pionek
					sum -= i; // odleglosc bialego pionka od linii promocji
				}
				else
				{
					sum += 9; // bia³a damka
				}
			}


		}
	return sum;

}

