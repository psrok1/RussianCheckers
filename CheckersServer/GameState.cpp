#include "GameState.h"
//#include "EvaluateBoard.cpp"

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
