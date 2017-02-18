// resource balancer

if( window.socketService == undefined)
    window.socketService = window.injector.get('socketService');
if( window.routeProvider == undefined)
    window.routeProvider = window.injector.get('routeProvider');
if( window.modelDataService == undefined)
    window.modelDataService = window.injector.get('modelDataService');


var magic_number = 3;       // decision multiplier of each resource ratio

var village_id_list = [];
var src_vil_list = [];
var target_vil_list = [];

var vil_count = 0;

// https://en.wiki.tribalwars2.com/index.php?title=Market
var marketTrader = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 19, 26, 35, 46, 59, 74, 91, 110, 131, 154, 179, 206, 235];


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
        setTimeout(resourceBalancerStart, 5000, data);
    });
}


function getMerchantInfo() {
        console.log("id : " + src_vil_list[vil_count].id);
        current_vil_id = src_vil_list[vil_count].id;

        socketService.emit(routeProvider.TRADING_GET_MERCHANT_STATUS, {village_id:current_vil_id}, function(merchant_data){
            var total = merchant_data.total;
            var free = merchant_data.free;
            var busy = merchant_data.busy;
            var percent = merchant_data.free / merchant_data.total * 100;
            var tmpFree = merchant_data.free;

            var maxCapacity = merchant_data.free * 1000;
            console.log("vil id : " + current_vil_id);
            console.log("merchant_data.total : " + merchant_data.total);
            console.log("merchant_data.free : " + merchant_data.free);
            console.log("merchant_data.busy : " + merchant_data.busy);

            // TODO : inject merchant info to src_vil_list

            vil_count++;
            if (vil_count < src_vil_list.length) {
                setTimeout(getMerchantInfo, 200);
            }
            else {
                // do what I want()
                console.log("done?");
            }
        });
}

function sendResources()
{

    // 1. distance calculate
    // 2. set shortest src vil
    // 3. send resources until : send_resource > average_resource ( (wood+clay+iron) / 3)
    // 4. delete village from src village
    // 6. 
    // loop to 1.

/*
    for (var i = 0; i < target_vil_list.length; i++) {
        sortSrcVillageByDist(target_vil_list[i]);

        var res_sent = 0;
        for (var j=0; j < src_vil_list.length; j++) {
            src_vil_list[i].
        }

    }
*/

}

function resourceBalancerStart(data) {
    // wood
    selectWoodVillages(data);
    getMerchantInfo();
}

function selectWoodVillages(data) {
    for(key in data) {
        var marketLevel = data[key]["Village/village"]["buildings"]["market"].level;
        var wood = data[key]["Village/village"]["resources"].wood;
        var clay = data[key]["Village/village"]["resources"].clay;
        var iron = data[key]["Village/village"]["resources"].iron;

        console.log("create wood source villages");

        // make source villages
        if (marketLevel > 5 && (wood > iron*magic_number)) {
            console.log("village id : " + parseInt(key));
            console.log("Market level : " +  marketLevel);
            console.log("wood:clay:iron = " + wood + ":" + clay + ":" + iron);

            var vil_info = {
                'id':parseInt(key),
                'market':marketLevel,
                'wood':wood,'clay':clay,'iron':iron,
                'x':data[key]["Village/village"].x,'y':data[key]["Village/village"].y
            };
            src_vil_list.push(vil_info);
        }

        console.log("create wood target villages");

        // make target villages
        if (wood*magic_number < iron) {
            console.log("village id : " + parseInt(key));
            console.log("wood:clay:iron = " + wood + ":" + clay + ":" + iron);

            var vil_info = {
                'id':parseInt(key),
                'wood':wood,'clay':clay,'iron':iron,
                'x':data[key]["Village/village"].x,'y':data[key]["Village/village"].y
            };
            target_vil_list.push(vil_info);
        }
    }

    //sortVillageByArg(src_vil_list, 'wood');   // src는 distance 기준으로 보내므로 자원 기준으로 sorting 하지 않음.
    sortVillageByArg(target_vil_list, 'wood');  // target은 자원이 작은 순서대로 sorting.

    for(var i=0; i<src_vil_list.length; i++) {
        console.log("wood src : " + src_vil_list[i]['wood']);
    }
    for(var i=0; i<target_vil_list.length; i++) {
        console.log("wood target : " + target_vil_list[i]['wood']);
    }
}

function sortVillageByArg(villages, arg) {
    console.log("sortVillage By argument : " + arg);

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
    var minIndex;
    for(i=0; i<src_vil_list.length; i++)
    {
        src_vil_list[i]['dist'] = spearTimeTravel(target_vil['x'], target_vil['y'], src_vil_list[i]['x'], src_vil_list[i]['y']);
    }
    sortVillageByArg(src_vil_list, 'dist');
}




getVillageInfo();
