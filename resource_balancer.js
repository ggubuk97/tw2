
// resource balancer v.0.1
//  - wood, iron trade using merchant
//  - logic 
//      - wood src_vil_list : wood > iron*magic_number 
//      - wood target_vil_list : wood*magic_number < iron
//      - send resource from src to target until : totalSentAmount > average_resource of target( =(wood+clay+iron)/3 )
//  - recommendation
//      - use resource balancer after making mass troops.

if( window.socketService == undefined)
    window.socketService = window.injector.get('socketService');
if( window.routeProvider == undefined)
    window.routeProvider = window.injector.get('routeProvider');
if( window.modelDataService == undefined)
    window.modelDataService = window.injector.get('modelDataService');


var simulate = false;   // true : simulate, false : send resource
var magic_number = 3;       // decision multiplier of each resource ratio


var village_id_list = [];
var src_vil_list = [];
var target_vil_list = [];
var vilData;
var vil_count = 0;
var curResType = "";

function clearData() {
    src_vil_list = [];
    target_vil_list = [];
    vil_count = 0;
    curResType = "";
}

function getVillageInfo(){
    console.log("Get village data.");
    socketService.emit(routeProvider.GET_CHARACTER_VILLAGES, {}, function(data){
        for(i=0; i < data.villages.length; i++){
            village_id_list.push(data.villages[i].id);
        }
        setTimeout(getDetailVillageInfo, 3000, village_id_list);
    });
}

function getDetailVillageInfo(vil_ids) {
    socketService.emit(routeProvider.VILLAGE_BATCH_GET_VILLAGE_DATA, {village_ids:vil_ids}, function(data){
        console.log(data);
        vilData = data;
        if (curResType === 'wood') {
            setTimeout(selectWoodVillages(vilData), 5000);
        }
        else if (curResType === 'iron') {
            setTimeout(selectIronVillages(vilData), 5000);   
        }
    });
}


function getMerchantInfo() {
        current_vil_id_ = src_vil_list[vil_count].id;

        socketService.emit(routeProvider.TRADING_GET_MERCHANT_STATUS, {village_id:current_vil_id_}, function(merchant_data){
            var total = merchant_data.total;
            var free = merchant_data.free;
            var busy = merchant_data.busy;
            var percent = merchant_data.free / merchant_data.total * 100;
            var tmpFree = merchant_data.free;
            var maxCapacity = merchant_data.free * 1000;

            src_vil_list[vil_count].merchant_free = merchant_data.free;

            vil_count++;
            if (vil_count < src_vil_list.length) {
                setTimeout(getMerchantInfo, 200);
            }
            else {
                console.log("getMerchantInfo() finished");
                // Get all merchant infomation. Let's do What I want.
                setTimeout(sendResourcesStart, 1000);    // TODO : bad call sequence. need merchant service.(merchant manager?)
            }
        });
}

function sendResource(src_vil, target_vil, w, c, i)
{
    if (w < 0 || c < 0 || i < 0) {
        console.log("check if any resource < 0");
        return;
    }

    if (!simulate) {
        socketService.emit(routeProvider.TRADING_SEND_RESOURCES, {start_village: src_vil, target_village: target_vil, wood: w, clay: c, iron: i}, function(data){});
    }
    console.log("\tSent resource. wood + clay + iron : " + (w+c+i));
    return w + c + i;
}

function sendResourcesStart()
{
    // 1. distance calculate
    // 2. set shortest src vil
    // 3. send resources until : send_resource > average_resource( =(wood+clay+iron)/3 )
    for (var i=0; i < target_vil_list.length; i++) {
        sortSrcVillageByDist(target_vil_list[i]); //TODO : distance가 merchant 기준으로 일정 시간 이상이면 보내지 않는 threshold

        var average_resource = parseInt(target_vil_list[i].average_resource / 1000) * 1000;
        console.log("[send Resource to Target : " + target_vil_list[i].vilName + "]");
        //console.log("target vil average_resource : " + average_resource);
        var sendAmount = 0;
        var totalSentAmount = 0;
        var count = 1;
        for (var k=0; k < src_vil_list.length; k++) {
            if (src_vil_list[k].merchant_free <= 0 ) {
                console.log("\tno merchant_free.")
                continue;   // TODO : remove from src_vil_list when full resource is sent.
            }

            var woodAmount = curResType === 'wood' ? src_vil_list[k].merchant_free : 0;
            var clayAmount = curResType === 'clay' ? src_vil_list[k].merchant_free : 0;
            var ironAmount = curResType === 'iron' ? src_vil_list[k].merchant_free : 0;

            woodAmount = woodAmount * 1000;     // 1 merchant = 1000 resource
            clayAmount = clayAmount * 1000;
            ironAmount = ironAmount * 1000;

            sendAmount = woodAmount + clayAmount + ironAmount;

            if (average_resource < totalSentAmount + sendAmount) {
                sendAmount = average_resource - totalSentAmount;
                woodAmount = curResType === 'wood' ? sendAmount : 0;
                clayAmount = curResType === 'clay' ? sendAmount : 0;
                ironAmount = curResType === 'iron' ? sendAmount : 0;
            }

            console.log("\t[sendResource - " + count + "]" );
            console.log("\tFrom : " + src_vil_list[k].vilName + " To : " + target_vil_list[i].vilName);
            console.log("\twood:" + woodAmount + " " + "clay:" + clayAmount + " " + "iron:" + " " + ironAmount);
            //console.log("\tsrc vil merchant_free : " + src_vil_list[k].merchant_free);
            totalSentAmount += sendResource(src_vil_list[k].id, target_vil_list[i].id, woodAmount, clayAmount, ironAmount);
            console.log("\ttotalSentAmount = " + totalSentAmount);

            src_vil_list[k].merchant_free = src_vil_list[k].merchant_free - parseInt(sendAmount/1000);
            if (src_vil_list[k].merchant_free <= 0) src_vil_list[k].merchant_free = 0;
            //console.log("\t" + src_vil_list[k].vilName + " merchant_free = " + src_vil_list[k].merchant_free);

            if (totalSentAmount >= average_resource) break;
            count++;
        }
    }

    console.log(curResType + "balancer finished");
    if (curResType === 'wood') {
        setTimeout(ironResourceBalancerStart, 1000);
    }
}

//function woodResourceBalancerStart(data) {
function woodResourceBalancerStart() {
    clearData();
    curResType = 'wood';
    getVillageInfo();
}

function ironResourceBalancerStart() {
    clearData();
    curResType = 'iron';
    getVillageInfo();
}



function selectWoodVillages(data) {
    for(key in data) {
        var vilName = data[key]["Village/village"].name;
        var marketLevel = data[key]["Village/village"]["buildings"]["market"].level;
        var wood = data[key]["Village/village"]["resources"].wood;
        var clay = data[key]["Village/village"]["resources"].clay;
        var iron = data[key]["Village/village"]["resources"].iron;

        // create wood source villages
        if (marketLevel > 5 && (wood > iron*magic_number)) {
            console.log("wood src vil : " + parseInt(key) + " [" + vilName + "]");
            console.log("\twood:clay:iron = " + wood + ":" + clay + ":" + iron);

            var vil_info = {
                'id':parseInt(key),
                'vilName':vilName,
                'market':marketLevel,
                'wood':wood,'clay':clay,'iron':iron,
                'merchant_free':0,
                'x':data[key]["Village/village"].x,'y':data[key]["Village/village"].y
            };
            src_vil_list.push(vil_info);
            continue;   // source != target (is it possible?)
        }

        // create wood target villages
        if (wood*magic_number < iron) {
            console.log("wood target vil : " + parseInt(key) + " [" + vilName + "]");
            console.log("\twood:clay:iron = " + wood + ":" + clay + ":" + iron);
            var average_resource = (wood + clay + iron) / 3;

            var vil_info = {
                'id':parseInt(key),
                'vilName':vilName,
                'wood':wood,'clay':clay,'iron':iron,
                'average_resource':average_resource,
                'x':data[key]["Village/village"].x,'y':data[key]["Village/village"].y
            };
            target_vil_list.push(vil_info);
        }
    }

    sortVillageByArg(target_vil_list, 'wood');  // target은 자원이 작은 순서대로 sorting.
    console.log("get merchant info start");
    getMerchantInfo();
}

function selectIronVillages(data)
{
    for(key in data) {
        var vilName = data[key]["Village/village"].name;
        var marketLevel = data[key]["Village/village"]["buildings"]["market"].level;
        var wood = data[key]["Village/village"]["resources"].wood;
        var clay = data[key]["Village/village"]["resources"].clay;
        var iron = data[key]["Village/village"]["resources"].iron;

        // create iron source villages
        if (marketLevel > 5 && (iron > wood*magic_number)) {
            console.log("iron src vil : " + parseInt(key) + " [" + vilName + "]");
            console.log("\twood:clay:iron = " + wood + ":" + clay + ":" + iron);

            var vil_info = {
                'id':parseInt(key),
                'vilName':vilName,
                'market':marketLevel,
                'wood':wood,'clay':clay,'iron':iron,
                'merchant_free':0,
                'x':data[key]["Village/village"].x,'y':data[key]["Village/village"].y
            };
            src_vil_list.push(vil_info);
            continue;   // source != target (is it possible?)
        }

        // create iron target villages
        if (iron*magic_number < wood) {
            console.log("iron target vil : " + parseInt(key) + " [" + vilName + "]");
            console.log("\twood:clay:iron = " + wood + ":" + clay + ":" + iron);
            var average_resource = (wood + clay + iron) / 3;

            var vil_info = {
                'id':parseInt(key),
                'vilName':vilName,
                'wood':wood,'clay':clay,'iron':iron,
                'average_resource':average_resource,
                'x':data[key]["Village/village"].x,'y':data[key]["Village/village"].y
            };
            target_vil_list.push(vil_info);
        }
    }

    sortVillageByArg(target_vil_list, 'iron');  // target은 자원이 작은 순서대로 sorting.
    console.log("get merchant info start");
    getMerchantInfo();
}

function sortVillageByArg(villages, arg) {
    //console.log("sortVillage By argument : " + arg);

    for(var i=1; i<villages.length; i++) {
        for(var j=0; j<villages.length-i; j++) {
            if( villages[j][arg] > villages[j+1][arg] ) {
                var a = villages[ j ];
                var b = villages[j+1];
                villages[ j ] = b;
                villages[j+1] = a;
            }
        }
    }
}

function isOdd(num) { return num % 2;}
function spearTimeTravel(x1,y1,x2,y2) {
    if(!isOdd(y1))
        x1 = x1 - 0.5;
    if(!isOdd(y2))
        x2 = x2 - 0.5;
    return 14 * Math.sqrt((x1-x2)*(x1-x2) + 0.75*(y1-y2)*(y1-y2));
}

function sortSrcVillageByDist(target_vil) {
    for(i=0; i<src_vil_list.length; i++)
    {
        src_vil_list[i]['dist'] = spearTimeTravel(target_vil['x'], target_vil['y'], src_vil_list[i]['x'], src_vil_list[i]['y']);
    }
    sortVillageByArg(src_vil_list, 'dist');
}


woodResourceBalancerStart();
