import numpy as np
import matplotlib.pyplot as plt

SCALE_FACTOR = float(60*60*24)
ALIGN_SPACE = 15

WOOD_SP = 50
WOOD_SW = 30
WOOD_AR = 80
WOOD_HC = 200

CLAY_SP = 30
CLAY_SW = 30
CLAY_AR = 30
CLAY_HC = 150

IRON_SP = 20
IRON_SW = 70
IRON_AR = 60
IRON_HC = 600

TIME_SP = 136
TIME_SW = 194
TIME_AR = 243
TIME_HC = 518

FARM_SP = 1
FARM_SW = 1
FARM_AR = 1
FARM_HC = 6

#defense power. just average.
POWER_SP = (25+45+10) / 3
POWER_SW = (55+5+30) / 3
POWER_AR = (10+30+60) / 3
POWER_HC = (200+160+180) / 3

# TODO1 : change ARMY_STEP value
# to reduce calculation time.
ARMY_STEP = 1000

# TODO2  : change MAX_FARM value
# setting Farm value
MAX_FARM = 23000
FARM_RANGE = np.arange(0, MAX_FARM, ARMY_STEP)

# store result
# [TOTAL_TIME, TOTAL_POWER, SP_NUM, SW_NUM, AR_NUM, HC_NUM, STD]
dataList = []



def sec_to_date(sec):
    return float(sec/(60*60*24))

def sec_to_hour(sec):
    return float(sec/(60*60))  


def printMatrix(matrix):
    print str('TOTAL_TIME(date)').rjust(ALIGN_SPACE), str('TOTAL_POWER').rjust(ALIGN_SPACE),
    print str('SP_NUM').rjust(ALIGN_SPACE), str('SW_NUM').rjust(ALIGN_SPACE),
    print str('AR_NUM').rjust(ALIGN_SPACE), str('HC_NUM').rjust(ALIGN_SPACE),
    print str('WOOD(hour)').rjust(ALIGN_SPACE),
    print str('CLAY(hour)').rjust(ALIGN_SPACE), str('IRON(hour)').rjust(ALIGN_SPACE),
    print str('STD').rjust(ALIGN_SPACE)

    for eachList in matrix:
        print str(sec_to_date(eachList[0])).rjust(ALIGN_SPACE),
        print str(eachList[1]).rjust(ALIGN_SPACE),
        print str(eachList[2]).rjust(ALIGN_SPACE),
        print str(eachList[3]).rjust(ALIGN_SPACE),
        print str(eachList[4]).rjust(ALIGN_SPACE),
        print str(eachList[5]).rjust(ALIGN_SPACE),
        total_wood = eachList[2]*WOOD_SP + eachList[3]*WOOD_SW + eachList[4]*WOOD_AR + eachList[5]*WOOD_HC
        total_clay = eachList[2]*CLAY_SP + eachList[3]*CLAY_SW + eachList[4]*CLAY_AR + eachList[5]*CLAY_HC
        total_iron = eachList[2]*IRON_SP + eachList[3]*IRON_SW + eachList[4]*IRON_AR + eachList[5]*IRON_HC

        per_hour = sec_to_hour(eachList[0])
        print '{0} ({1:4.0f})'.format(str(total_wood), total_wood/per_hour).rjust(ALIGN_SPACE),
        print '{0} ({1:4.0f})'.format(str(total_clay), total_clay/per_hour).rjust(ALIGN_SPACE),
        print '{0} ({1:4.0f})'.format(str(total_iron), total_iron/per_hour).rjust(ALIGN_SPACE),
        print '{0:.0f}'.format(eachList[6]).rjust(ALIGN_SPACE)


for SP_NUM in FARM_RANGE:
    for SW_NUM in FARM_RANGE:
        for AR_NUM in FARM_RANGE:
            for HC_NUM in FARM_RANGE:
                TOTAL_FARM = FARM_SP*SP_NUM + FARM_SW*SW_NUM + FARM_AR*AR_NUM + FARM_HC*HC_NUM
                if ( TOTAL_FARM == MAX_FARM ):
                    TOTAL_TIME = SP_NUM*TIME_SP + SW_NUM*TIME_SW + AR_NUM*TIME_AR + HC_NUM*TIME_HC
                    TOTAL_POWER = SP_NUM*POWER_SP + SW_NUM*POWER_SW + AR_NUM*POWER_AR + HC_NUM*POWER_HC

                    total_wood = SP_NUM*WOOD_SP + SW_NUM*WOOD_SW + AR_NUM*WOOD_AR + HC_NUM*WOOD_HC
                    total_clay = SP_NUM*CLAY_SP + SW_NUM*CLAY_SW + AR_NUM*CLAY_AR + HC_NUM*CLAY_HC
                    total_iron = SP_NUM*IRON_SP + SW_NUM*IRON_SW + AR_NUM*IRON_AR + HC_NUM*IRON_HC
                    my_std = np.std([total_wood, total_clay, total_iron])

                    eachList = [TOTAL_TIME, TOTAL_POWER, SP_NUM, SW_NUM, AR_NUM, HC_NUM, my_std]
                    dataList.append(eachList)

                    print '.',
                    #print SP_NUM, SW_NUM, AR_NUM, HC_NUM

print ''

# sort each list. ordered by TOTAL_TIME.
dataList.sort(key = lambda row : row[0])

printMatrix(dataList)

# draw DATA.
# X : row, Y1 : TOTAL_TIME, Y2 : TOTAL_POWER
X = range(len(dataList))
Y1, Y2 = [], []
for i in dataList:
    Y1.append(sec_to_date(i[0]))
    Y2.append(float(i[1])/SCALE_FACTOR)


plt.plot(X, Y1, label='TOTAL_TIME')
plt.plot(X, Y2, label='TOTAL_POWER')
plt.legend()
plt.show()

