import numpy as np
import matplotlib.pyplot as plt

SCALE_FACTOR = float(60*60*24)
ALIGN_SPACE = 15

WOOD_AX = 60
WOOD_LC = 125
WOOD_MA = 250

CLAY_AX = 30
CLAY_LC = 100
CLAY_MA = 200

IRON_AX = 40
IRON_LC = 250
IRON_MA = 100

TIME_AX = 213
TIME_LC = 340
TIME_MA = 388

FARM_AX = 1
FARM_LC = 4
FARM_MA = 5

POWER_AX = 45
POWER_LC = 130
POWER_MA = 140

# TODO1 : change ARMY_STEP value
# to reduce calculation time.
ARMY_STEP = 100

# TODO2  : change MAX_FARM value
# setting Farm value
MAX_FARM = 23000
FARM_RANGE = np.arange(0, MAX_FARM, ARMY_STEP)

# store result
# [TOTAL_TIME, TOTAL_POWER, AX_NUM, LC_NUM, MA_NUM, STD]
dataList = []


def sec_to_date(sec):
    return float(sec/(60*60*24))

def sec_to_hour(sec):
    return float(sec/(60*60))   


def printMatrix(matrix):
    print str('TOTAL_TIME(date)').rjust(ALIGN_SPACE), str('TOTAL_POWER').rjust(ALIGN_SPACE),
    print str('AX_NUM').rjust(ALIGN_SPACE), str('LC_NUM').rjust(ALIGN_SPACE),
    print str('MA_NUM').rjust(ALIGN_SPACE), str('WOOD(hour)').rjust(ALIGN_SPACE),
    print str('CLAY(hour)').rjust(ALIGN_SPACE), str('IRON(hour)').rjust(ALIGN_SPACE),
    print str('STD').rjust(ALIGN_SPACE)

    for eachList in matrix:
        print str(sec_to_date(eachList[0])).rjust(ALIGN_SPACE),
        print str(eachList[1]).rjust(ALIGN_SPACE),
        print str(eachList[2]).rjust(ALIGN_SPACE),
        print str(eachList[3]).rjust(ALIGN_SPACE),
        print str(eachList[4]).rjust(ALIGN_SPACE),
        total_wood = eachList[2]*WOOD_AX + eachList[3]*WOOD_LC + eachList[4]*WOOD_MA
        total_clay = eachList[2]*CLAY_AX + eachList[3]*CLAY_LC + eachList[4]*CLAY_MA
        total_iron = eachList[2]*IRON_AX + eachList[3]*IRON_LC + eachList[4]*IRON_MA

        per_hour = sec_to_hour(eachList[0])
        print '{0} ({1:4.0f})'.format(total_wood, total_wood/per_hour).rjust(ALIGN_SPACE),
        print '{0} ({1:4.0f})'.format(total_clay, total_clay/per_hour).rjust(ALIGN_SPACE),
        print '{0} ({1:4.0f})'.format(total_iron, total_iron/per_hour).rjust(ALIGN_SPACE),        
        print '{0:.0f}'.format(eachList[5]).rjust(ALIGN_SPACE)



for AX_NUM in FARM_RANGE:
    for LC_NUM in FARM_RANGE:
        for MA_NUM in FARM_RANGE:
            TOTAL_FARM = FARM_AX*AX_NUM + FARM_LC*LC_NUM + FARM_MA*MA_NUM
            if ( TOTAL_FARM == MAX_FARM ):
                TOTAL_TIME = AX_NUM*TIME_AX + LC_NUM*TIME_LC + MA_NUM*TIME_MA
                TOTAL_POWER = AX_NUM*POWER_AX + LC_NUM*POWER_LC + MA_NUM*POWER_LC

                total_wood = AX_NUM*WOOD_AX + LC_NUM*WOOD_LC + MA_NUM*WOOD_MA
                total_clay = AX_NUM*CLAY_AX + LC_NUM*CLAY_LC + MA_NUM*CLAY_MA
                total_iron = AX_NUM*IRON_AX + LC_NUM*IRON_LC + MA_NUM*IRON_MA
                my_std = np.std([total_wood, total_clay, total_iron])

                eachList = [TOTAL_TIME, TOTAL_POWER, AX_NUM, LC_NUM, MA_NUM, my_std]
                dataList.append(eachList)

                print '.',

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

