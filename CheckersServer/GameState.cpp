#include "GameState.h"
//#include "EvaluateBoard.cpp"
/*
int main()
{
	int x1,x2,y1,y2;
	GameState gs('b', 'w');
	while(true)
	{
		
		cin >> x1 >> y1 >> x2 >> y2;
		gs.playerMove(x1,y1,x2,y2);
		gs.makeMove();
	}
	return 0;
}
*/

char const* GameState::getPlayerColor()
{
	string s;
	s.push_back(playerColor);
	//s.push_back(' ');
	return s.c_str();
}

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
}
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
}

GameState::GameState(char cc, char pc) : playerColor(pc), computerColor(cc), whitePieces(12), blackPieces(12)
{
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
			field[i][j].king = false;
		}
	}
}

int GameState::stateValue()
{

	return (playerColor == 'w') ? evaluateBoard() : -(evaluateBoard());
}

void GameState::executeMove(int x1, int y1, int x2, int y2)
{

	field[x2][y2] = field[x1][y1];
	int i = (x1 < x2) ? 1: -1;
	int j = (y1 < y2) ? 1: -1;
	for(; x1 != x2 && y1 != y2; x1+=i, y1+=j)
	{
		field[x1][y1].color = 0;
		field[x1][y1].king = false;
	}
}

char const* GameState::makeMove()
{
	char c;
	string s;

	moves m;
	evaluate(10, m);
	//printAll();
	//if(field[m[m.size()-1]][m[m.size()-2]].color == 0) cout << "STALO SIE";
	//printAll();
	for(int i = m.size() - 1 ; i - 3 >= 0; i-=2)
	{
		executeMove(m[i-1], m[i], m[i-3], m[i-2]);
	}
	cout << endl;
	//printAll();
	s.push_back('[');
	s.push_back(' ');
	for(int i = m.size() - 1 ; i >=0 ; i-=2)
	{
		s.push_back('\"');
		c = 'A' + (char)m[i];
		s.push_back(c);
		//ss << c;
		c = '8' - (char)m[i-1];
		s.push_back(c);
		s.push_back('\"');
		if(i!=1) s.push_back(',');
		s.push_back(' ');
	}
	s.push_back(']');
	cout << s;
	return s.c_str();
}

void GameState::insertPlayerData(char const* s)
{
	moves m;
	char c;
	cout << s;
	string str(s);
	for(int i = 1 ; i < str.size(); i+=2)
	{
		c = 8 - (str[i]- '0');
		m.push_back((int)c);
		c = str[i-1] - 'A';
		m.push_back((int)c);
	}
	for(int i = 0 ; i + 3 < m.size(); i+=2)
		playerMove(m[i], m[i+1], m[i+2], m[i+3]);
	
}

void GameState:: playerMove(int x1, int y1, int x2, int y2)
{
	//printAll();
	executeMove(x1,y1,x2,y2);
	//printAll();
}

int GameState::evaluate(int depth, moves& m)
{
	
	cout << alfabeta(depth, -1000000, 1000000, true, computerColor, true, m);
	cout << endl;

	for (int i = m.size() - 1; i >= 0; i -= 2)
	{
		cout << m[i - 1] << "-" << m[i] << endl;
	}
	return 0;
}
// wypisuje cala plansze w razie potrzeby
void GameState::printAll()
{
	cout << "  0  1  2  3  4  5  6  7" << endl;
	for (int i = 0; i < 8; i++)
	{
		for (int j = 0; j < 8; j++)
		{
			
			if(j == 0) cout << i << '|';
			cout << ((field[i][j].color == 0) ? ' ' : field[i][j].color) << ((j == 7) ? "|\n" : "| ");
		}
	}
}


//sprawdza wszystkie możliwości ruchu i wykonuje po kolei 
int GameState::alfabeta(int depth, int alpha, int beta, bool max_min, char moving_color, bool recordon, moves& m)
{
	//printAll();
	if (blackPieces == 0 || whitePieces == 0 || depth == 0) // <-- jesteśmy w liściu obecnego drzewa gry
	{
		if (blackPieces == 0)
		{
			if (playerColor == 'b')
				return -1000000;
			else
				return 1000000;
		}
		if (whitePieces == 0)
		{
			if (playerColor == 'w')
				return -1000000;
			else
				return 1000000;
		}
		if (depth == 0)
			return stateValue();

	}
	char op_color = (moving_color == 'b') ? 'w' : 'b';
	int i, j;
	vector<int> kings = (moving_color == 'b') ? bKings : wKings;
	bool beating = false;// <-- zmienna informująca o możliwości bicia
	for (i = 1; i < 7; i++)// <-- sprawdzenie pionków przeciwnika które nie są na krawędziach planszy (mogą byc bite)
	{
		for (j = 2 - ((i + 1) % 2); j < 7; j += 2)
		{
			if (field[i][j].color == op_color)
			{

				beating = (possibleBeats(depth, alpha, beta, max_min, i, j, moving_color, op_color, recordon, m)) ? true : beating;

				//if(recordon) { if(temp < alpha) { m.push_back(i); m.push_back(j); m.push_back(x); m.push_back(y); temp = alpha;}}
				if (alpha >= beta)
				{
					return (max_min) ? alpha : beta;
				}
			}
		}
	}
	if (!kings.empty())// <--jeśli mamy damki, sprawdzamy ich możliwość bicia
	{
		for (unsigned int k = 0; k < kings.size(); k += 2)
		{

			beating = (possibleRoyalBeats(depth, alpha, beta, max_min, kings[k], kings[k + 1], moving_color, op_color, recordon, m)) ? true : beating;
			//if(recordon) { if(temp < alpha) { m.push_back(i); m.push_back(j); m.push_back(x); m.push_back(y); temp = alpha;}}
			if (alpha >= beta) return (max_min) ? alpha : beta;
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
					//if(recordon) { if(temp < alpha) { m.push_back(i); m.push_back(j); m.push_back(x); m.push_back(y); temp = alpha;}}
					if (alpha >= beta)
					{
						return (max_min) ? alpha : beta;
					}
				}
			}
		}
		for (i = start_value; i < end_value; i += 2)
		{
			if (field[i][0].color == moving_color && field[i][0].king != true)
			{

				commonSideMoves(depth, alpha, beta, i, 0, moving_value, max_min, moving_color, recordon, m);
				//if(recordon) { if(temp < alpha) { m.push_back(i); m.push_back(j); m.push_back(x); m.push_back(y); temp = alpha;}}
				if (alpha >= beta)
				{
					return (max_min) ? alpha : beta;
				}
			}
			if (field[i][7].color == moving_color && field[i][7].king != true)
			{

				commonSideMoves(depth, alpha, beta, i, 7, moving_value, max_min, moving_color, recordon, m);
				//if(recordon) { if(temp < alpha) { m.push_back(i); m.push_back(j); m.push_back(x); m.push_back(y); temp = alpha;}}
				if (alpha >= beta)
				{
					return (max_min) ? alpha : beta;
				}
			}
		}
		for (unsigned i = 0; i < kings.size() && i + 1 < kings.size(); i += 2)
		{

			royalMove(depth, alpha, beta, kings[i], kings[i + 1], max_min, moving_color, recordon, m);
		}

	}

	return (max_min) ? alpha : beta;
}

bool GameState::possibleRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{
	int temp;
	bool anybeats = false;
	for (int i = 1; i < 7; i++)
	{
		for (int j = 2 - ((i + 1) % 2); j < 7; j += 2)
		{
			if (field[i][j].color == op_color && ((i - j) == (x - y) || (i + j) == (x + y))) // <------------- pionek w zaięgu damki
			{
				int iteri = (x < i) ? 1 : -1;
				int iterj = (y < j) ? 1 : -1;
				if (isRoyalBeatPossible(x, y, i, j, iteri, iterj))
				{
					anybeats = true;//<---------------------------------------------------------------------------------------------------------------------------------------------------------
					//if(i+iteri - x  < 0 || i+iteri > 7 || j+iterj < 0 || j+iterj > 7) cout << i << " " << j << " " <<  x << " " << y << " " <<  iteri << " " << iterj << endl;
					temp = alpha;
					move(x, y, i + iteri - x, j + iterj - y, moving_color).beat(i, j).checkNextRoyalBeats(depth, alpha, beta, max_min, i, j, moving_color, op_color, iteri, iterj, recordon, m);
					if (recordon) { if (temp < alpha) { m.push_back(x); m.push_back(y); temp = alpha; } }
					if (alpha >= beta)
						return true;
				}
			}
		}
	}
	return anybeats;
}

void GameState::checkNextRoyalBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, int iteri, int iterj, bool recordon, moves& m)
{
	int temp;
	int i = iteri;
	int j = iterj;
	int countx = (iteri > 0) ? 7 - x : x;
	int county = (iterj > 0) ? 7 - y : y;
	int count = min(countx, county);

	bool anybeats = false;
	while (count >= 0 && field[x + i][y + j].color == 0 && x + i + iteri < 8 && x + i + iteri >= 0 && y + j +iterj < 8 && y+ j + iterj >= 0)
	{
		temp = alpha;
		anybeats = (possibleRoyalBeats(depth, alpha, beta, max_min, x + i, y + j, moving_color, op_color, recordon, m)) ? true : anybeats;
		if (recordon) { if (temp < alpha) { m.push_back(x); m.push_back(y); temp = alpha; } }
		count--;
		i += iteri;
		j += iterj;

	}
	i -= iteri;
	j -= iterj;
	if (!anybeats)
	{

		while (i != 0 && j != 0)
		{
			if (max_min)//<-------------------------------------------------------------------------------------------------------------------
			{
				temp = alpha;
				alpha = max(alpha, move(x + iteri, y + iterj, i, j, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (recordon) { if (temp < alpha) { m.clear(); m.push_back(x + iteri + i); m.push_back(y + iterj + j); m.push_back(x + iteri); m.push_back(y + iterj); temp = alpha; } }

				if (alpha >= beta)
					return;
			}
			else
			{
				beta = min(beta, move(x + iteri, y + iterj, i, j, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, op_color, false, m));
				if (alpha >= beta)
					return;
			}
			i -= iteri;
			j -= iterj;
		}
	}
}

bool GameState::isRoyalBeatPossible(int beatingX, int beatingY, int beatenX, int beatenY, int iteri, int iterj)
{
	int i = iteri;
	int j = iterj;
	for (; beatingX + i != beatenX && beatingY != beatenY; i += iteri, j += iterj)
	{
		if (field[beatingX + i][beatingY + j].color != 0)
			return false;
	}
	return (field[beatenX + iteri][beatenY + iterj].color == 0);
}


void GameState::commonBeat(int depth, int& alpha, int& beta, bool max_min, int beatenX, int beatenY, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{
	int temp;
	GameState gs = beat(beatenX, beatenY);
	gs = gs.move(beatenX + x, beatenY + y, -2 * x, -2 * y, moving_color);
	temp = alpha;
	if (gs.field[beatenX - x][beatenY - y].king == true || !(gs.nextCommonBeats(depth, alpha, beta, max_min, beatenX - x, beatenY - y, moving_color, op_color, recordon, m)))
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
	if (recordon) { if (temp < alpha) { m.push_back(beatenX - x); m.push_back(beatenY - y); m.push_back(beatenX + x); m.push_back(beatenY + y); temp = alpha; } }
}


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


bool GameState::possibleBeats(int depth, int& alpha, int& beta, bool max_min, int x, int y, char moving_color, char op_color, bool recordon, moves& m)
{
	bool beating = false;
	if (isBeatPossible(x, y, 1, 1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, 1, 1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	if (isBeatPossible(x, y, -1, 1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, 1, -1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	if (isBeatPossible(x, y, -1, -1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, -1, -1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	if (isBeatPossible(x, y, 1, -1, moving_color))
	{
		beating = true;
		commonBeat(depth, alpha, beta, max_min, x, y, -1, 1, moving_color, op_color, recordon, m);
		if (alpha >= beta) return true;
	}
	return beating;
}

GameState& GameState::beat(int x, int y)
{
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
	
	return *this;
}


void GameState::removeKing(vector<int>& v, int x, int y)
{
	for (unsigned int i = 0; i < v.size(); i += 2)
	{
		if (v[i] == x && v[i + 1] == y)
		{
			vector<int>::iterator first = v.begin();
			advance(first, i);
			vector<int>::iterator last = first + 1;
			v.erase(first, last);
		}
	}
}

void GameState::addKing(int x, int y)
{
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


void GameState::royalMove(int depth, int& alpha, int& beta, int x, int y, bool max_min, char moving_color, bool recordon, moves& m)
{
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, -1, -1, ((x<y) ? x : y), recordon, m);
	if (alpha >= beta)return;
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, -1, 1, (x<7 - y) ? x : 7 - y, recordon, m);
	if (alpha >= beta)return;
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, 1, 1, (7 - x<7 - y) ? 7 - x : 7 - y, recordon, m);
	if (alpha >= beta)return;
	checkDirection(depth, alpha, beta, x, y, max_min, moving_color, 1, -1, (7 - x<y) ? 7 - x : y, recordon, m);
}

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
			if (recordon) { if (temp < alpha) { m.push_back(x + i); m.push_back(y + j); m.push_back(x); m.push_back(y); temp = alpha; } }

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
			beta = min(beta, this->move(x, y, moving_value, 1, moving_color).alfabeta(depth - 1, alpha, beta, !max_min, next_color, false, m));
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
GameState GameState::move(int x, int y, int i, int j, char moving_color)
{
	GameState gs(*this);
	if (x + i < 0 || x + i > 7 || y + j < 0 || y + j > 7)
	{
		cout << x << " " << y << " " << i << " " << j << " " << i + x << " " << j + y << endl;
	}
	else
	{
		if (gs.field[x][y].king)
		{
			vector<int> kings = (gs.field[x][y].color == 'b') ? gs.bKings : gs.wKings;
			for (unsigned int k = 0; k < kings.size(); k += 2)
			{
				if (kings[k] == x && kings[k + 1])
				{
					kings[k] = x + i;
					kings[k + 1] = y + j;
					break;
				}
			}
		}
		gs.field[x + i][y + j] = gs.field[x][y];
		gs.field[x][y].color = 0;

		if ((moving_color == 'b' && x + i == 7) || (moving_color == 'w' && y + j == 0))
		{
			gs.field[x + i][y + j].king = true;
			gs.addKing(x + i, y + j);
		}
	}
	return gs;
}

//sprawdzenie czy podane pole może być bite
bool GameState::isBeatPossible(int i, int j, int rj, int ri, char color)
{
	return (field[i + ri][j + rj].color == color && field[i - ri][j - rj].color == 0);
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


int GameState::beaten(bool beat[8][8])
{
	int sum = 0;
	for (int i = 0; i<8; ++i)
		for (int j = 0; j<8; ++j)
		{
			beat[i][j] = false;
		}
	for (int i = 0; i<8; ++i)
		for (int j = 0; j<8; ++j)
		{
			char c = field[i][j].getColor();
			if (c == 0) continue;
			if (field[i][j].getKing() == 0)
			{
				if (c == 'b')
				{
					if (i<6 && j>1 && field[i + 1][j - 1].getColor() == 'w' && field[i + 2][j - 2].getColor() == 0) beat[i + 1][j - 1] = true;
					if (i<6 && j<6 && field[i + 1][j + 1].getColor() == 'w' && field[i + 2][j + 2].getColor() == 0) beat[i + 1][j + 1] = true;
					if (i<7 && ((j>0 && field[i + 1][j - 1].getColor() == 'b') || j == 0) && ((j<7 && field[i + 1][j + 1].getColor() == 'b') || j == 7)) //pionek bez ruchu
						sum += 1;
				}
				else
				{
					if (i>1 && j>1 && field[i - 1][j - 1].getColor() == 'b' && field[i - 2][j - 2].getColor() == 0) beat[i - 1][j - 1] = true;
					if (i>1 && j<6 && field[i - 1][j + 1].getColor() == 'b' && field[i - 2][j + 2].getColor() == 0) beat[i - 1][j + 1] = true;
					if (i>0 && ((j>0 && field[i - 1][j - 1].getColor() == 'w') || j == 0) && ((j<7 && field[i - 1][j + 1].getColor() == 'w') || j == 7)) //pionek bez ruchu
						sum -= 1;
				}
			}
			else
			{
				int i1[] = { -1, -1, 1, 1 };
				int i2[] = { 1, -1, 1, -1 };
				bool moved = false;
				for (int k = 0; k<4; ++k)
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
	for (int i = 0; i<8; ++i)
		for (int j = 0; j<8; ++j)
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
	for (int i = 0; i<8; ++i)
	{
		if (field[0][i].getColor() == 0) sum += 1;
		if (field[7][i].getColor() == 0) sum -= 1;
	}
	sum += beaten(beat);
	//sum += evalBeaten(beat);
	for (int i = 0; i<8; ++i)
		for (int j = 0; j<8; ++j)
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
