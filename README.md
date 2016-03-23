# tw2




[tw2 strategy guide]

아래는 공격/방어 도시를 Farm(L25) 23,000으로 채우는 최단 시간을 시뮬레이션 한 결과에 대한 리포트이다.


[village 일반]

 # barrack 20랩에서 10% 보너스, 25랩에서 생산력 15% 보너스가 있다. technology item은 25랩 15%를 사용하자.

 # wall, hospital의 경우 wood, clay가 상대적으로 많이 사용된다. 나머지는 전반적으로 비슷한 자원이 필요하다.

 # @초반에 wall을 먼저 올릴경우 wood, clay level을 먼저 올리자.
 

[attack village]

 # Minimum time(21day) LC:MA = 1:1, WD:CL:IR = 1865:1492:1715 = L26:L24:L26

 # 초반에는 건물 올리는데 wood, clay가 많이 사용되므로

    Method1 : LC:MA = 2:1 비율로 만들다가 이후 건물 안정화가 되면 1:1 비율로 전환한다.

    Method2 : 초반에 wood, clay level을 먼저 올리면서 진행하다가 나중에 최적 비율을 맞춘다.


[defense village]

 # Minimum time(29day) SP:HC = 11:2, WD:CL:IR = 1351:896:2020 = L24:L20:L27

 # 초반에는 wood, clay를 높이면서 SP만 생산하고 farming을 한다.

 # 배럭 L21을 찍으면 HC위주로 최대한 생산한다.

 # IRON이 부족하면 SP 비율을 높이고, IRON이 충분하면 SP 비율을 낮춘다.



[python program]

 # 계산 시간을 절약하기 위해서 생산 유닛은 scale factor를 사용하였다.(ARMY_STEP)


Unit 생산시간, 자원에 대한 것은 다음 링크를 참고한다.

  https://en.wiki.tribalwars2.com/index.php?title=Units



이 게임에서 가장 중요한 것은 전쟁을 통해 상대를 죽이는 것이 아니라

무한 확장을 통해서 최대한 많은 Province에 거점을 만들고 지배 영역을 넓히는 것이다.

왜냐하면 Morale에 의한 attack/defense modifier 비율이 거의 의미가 없기 때문이다.


