function drawDate(username, date, device, token){
    $.ajax({
        type: 'GET',
        url: dsu + "dataPoints/"+getDatapointId(username, date, device),
        headers: {
            "Authorization": "Bearer " + token
        },
        success : function(data) {
            showLocation(data, device);
        },
        error: function(data){
            var myNode = document.getElementById("google-locations");
            if (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            $("#google-locations").html("No Data for mapping!");
        }
    });
}

function showLocation(data, device) {
    if(device == "android" || device == "ios") {
        rows = data["body"]["episodes"].map(function (epi) {
            var state = epi["inferred-state"].toLocaleUpperCase();
            var start = new Date(epi["start"]);
            var end = new Date(epi["end"]);
            var long_lat = epi["location-samples"];

            if (state == "STILL") {
                var longitude_sum = 0;
                var latitude_sum = 0;
                long_lat.forEach(function(obj) {
                    longitude_sum += obj['longitude'];
                    latitude_sum += obj['latitude'];
                });
                return [state, start, end, longitude_sum / long_lat.length, latitude_sum / long_lat.length];
            }
        });
        var locations = [];
        rows.forEach(function(obj){
            if (typeof obj !== 'undefined') {
                locations.push(obj);
            }
        });
        $.each(locations, function(i, val){
            getLocationMap(val[4], val[3], val[1], val[2], i);
        });
    }
}

function getLocationMap(averg_lac, averg_long, start_time, end_time, index) {
    var start_time = moment(start_time).format("hh:mm A");
    var end_time = moment(end_time).format("hh:mm A");

    $.ajax({
        type: 'POST',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + averg_lac + ',' + averg_long + '&result_type=neighborhood&key=AIzaSyC1GFrL26ugupKi80EQynafH6-uiLcgZDg',
        dataType: 'json',
        success: function(data) {
            if (data['results'].length > 0) {
                var unit_div = document.createElement('div');
                var info_div = document.createElement('div');
                var time_div = document.createElement('div');
                var time_p = document.createElement('p');
                var time_text = document.createTextNode(start_time+ "    ~    " + end_time);
                var hr_line = document.createElement('hr');

                time_p.appendChild(time_text);
                time_div.appendChild(time_p);
                info_div.appendChild(time_div);
                unit_div.appendChild(hr_line);
                unit_div.appendChild(info_div);
                time_p.className = 'time';
                time_div.className = 'col-xs-2';

                var location_div = document.createElement('div');
                var location_p = document.createElement('p');

                var neighborhood = data['results'][0]['formatted_address'];
                var location_text = document.createTextNode(neighborhood);

                location_p.appendChild(location_text);
                location_div.appendChild(location_p);
                info_div.appendChild(location_div);

                location_p.className = 'locations';
                location_div.className = 'col-xs-9 col-xs-offset-1';
                info_div.className = 'row location-info';

                var map_div = document.createElement('div');
                var img_div = document.createElement('img');
                img_div.src = "https://maps.googleapis.com/maps/api/staticmap?center="+ averg_lac + ',' + averg_long + "&zoom=14&size=400x400"
                map_div.appendChild(img_div);
                location_div.appendChild(map_div);
                map_div.className = 'maps';
                unit_div.className = index;

                document.getElementById('google-locations').appendChild(unit_div);
                sortMe();

            }else {
                console.log("You seem haven't been to a lot of places.");
            }
        },
        error: function(data) {
           alert("Can't find the neighborhood!");
        }
    });
}
function sortMe() {
      var arr = $.makeArray($('#google-locations > div'));
      var len = arr.length;
      var parent = $('#google-locations');
      var i = 0;
      console.log(len);

      while( i < len ) {
          var num = arr[ i ].className;
          console.log(num);
          arr[ i ] = {num:num,el:arr[ i ]};

          i++;
      }
      arr.sort(function(a,b) {
          return a.num - b.num;
      });

      i = 0;
      while( i < len ) {
          parent.append(arr[i].el);
          i++;
    }
}

function deletePreviousImg() {
    var myNode = document.getElementById("google-locations");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    };
}

function deletePreviousBar() {

    var distanceNumber = document.getElementById("miles-difference");
    while (distanceNumber.firstChild) {
       distanceNumber.removeChild(distanceNumber.firstChild);
    }

    var trekNumber = document.getElementById("trek-difference");
    while (trekNumber.firstChild) {
       trekNumber.removeChild(trekNumber.firstChild);
    }

    var activeNumber = document.getElementById("active-difference");
    while (activeNumber.firstChild) {
        activeNumber.removeChild(activeNumber.firstChild);
    }

    var awayNumber = document.getElementById("away-difference");
    while (awayNumber.firstChild) {
        awayNumber.removeChild(awayNumber.firstChild);
    }
}

function showSummary(username, date, device, token) {
    var today = moment(date).format('YYYY-MM-DD');
    $.ajax({
        type: 'GET',
        url: dsu + "dataPoints/" + getSummaryDatapointId(username, today, device),
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function(data) {

            var distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
            if (typeof distance != 'undefined') {
                $("#walking-distance").data('value', distance);
                if (distance < 2) {
                    $("#walking-distance").html(distance + 'mile');
                }
                else {
                    $("#walking-distance").html(distance + 'miles');
                }
            } else {
                $("#walking-distance").data('value', 'No Data');
                $("#walking-distance").html('No Data');
            }

            var trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
            if (typeof trek != 'undefined') {
                $("#trek-mile").data('value', trek);
                if (trek < 2) {
                    $("#trek-mile").html(trek + 'mile');
                }
                else {
                    $("#trek-mile").html(trek + 'miles');
                }
            } else {
                $("#trek-mile").data('value', 'No Data');
                $("#trek-mile").html('No Data');
            }

            var active = data.body["active_time_in_seconds"];
            if (typeof active != 'undefined') {
                var active_data = (active/60).toFixed(0);
                $("#active-time").data('value', active_data);
                if (active_data < 60) {
                    $("#active-time").html(active_data + 'min');
                }
                else {
                    var active_minute = active_data % 60;
                    var active_hour = Math.floor(active_data/60);
                    $("#active-time").html(active_hour + 'hr' + active_minute + 'min');
                }
            } else {
                $("#active-time").data('value','No Data');
                $("#active-time").html('No Data');
            }

            var away = data.body["time_not_at_home_in_seconds"];
            if (typeof away != 'undefined') {
                var away_data = (away/60).toFixed(0);
                $("#away-from-home").data('value', away_data);
                if (away_data < 60) {
                    $("#away-from-home").html(away_data + 'min');
                }
                else {
                    var away_minute = away_data % 60;
                    var away_hour = Math.floor(away_data/60);
                    $("#away-from-home").html(away_hour + 'hr' + away_minute + 'min');
                }

            } else {
                $("#away-from-home").data('value', 'No Data');
                $("#away-from-home").html('No Data');
            }

            var yesterday_date = moment(today).subtract(1, 'days');
            pastSevenDaysSummary(username, yesterday_date, device, token);

            },
        error: function(data){
            $("#walking-distance").html('No Data');
            $("#walking-distance").data('value', 'No Data');
            $("#trek-mile").html('No Data');
            $("#trek-mile").data('value', 'No Data');
            $("#away-from-home").html('No Data');
            $("#away-from-home").data('value', 'No Data');
            $("#active-time").html('No Data');
            $("#active-time").data('value','No Data');

            var yesterday_date =  moment(today).subtract(1, 'days');
            showYesterdaySummary(username, yesterday_date, device, token);
        }
    });
}

function pastSevenDaysSummary(username, date, device, token) {
    var one_day_before =  moment(date).format('YYYY-MM-DD');
    var two_day_before = moment(date).subtract(1, 'days').format('YYYY-MM-DD');
    var three_day_before = moment(date).subtract(2, 'days').format('YYYY-MM-DD');
    var four_day_before = moment(date).subtract(3, 'days').format('YYYY-MM-DD');
    var five_day_before =  moment(date).subtract(4, 'days').format('YYYY-MM-DD');
    var six_day_before = moment(date).subtract(5, 'days').format('YYYY-MM-DD');
    var seven_day_before = moment(date).subtract(6, 'days').format('YYYY-MM-DD');

    var one_day_active; var one_day_trek; var one_day_away; var one_day_distance;

    var two_day_active; var two_day_trek; var two_day_away; var two_day_distance;

    var three_day_active; var three_day_trek; var three_day_away; var three_day_distance;

    var four_day_active; var four_day_trek; var four_day_away; var four_day_distance;

    var five_day_active; var five_day_trek; var five_day_away; var five_day_distance;

    var six_day_active; var six_day_trek; var six_day_away; var six_day_distance;

    var seven_day_active; var seven_day_trek; var seven_day_away; var seven_day_distance;

    var distance_array = []; var active_array = []; var away_array = []; var trek_array = [];

    $.when(
        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, one_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                one_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof one_day_distance == 'undefined') {
                    one_day_distance = 0;
                }

                one_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof one_day_trek == 'undefined') {
                    one_day_trek = 0;
                }

                one_day_active = data.body["active_time_in_seconds"];
                if (typeof one_day_active == 'undefined') {
                    one_day_active = 0;
                }

                one_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof one_day_away == 'undefined') {
                    one_day_away = 0;
                }
                distance_array.push(parseFloat(one_day_distance));
                away_array.push(parseFloat(one_day_away));
                active_array.push(parseFloat(one_day_active));
                trek_array.push(parseFloat(one_day_trek));
            },
            error: function(data) {
                one_day_active = 'No Data';
                one_day_trek = 'No Data';
                one_day_away = 'No Data';
                one_day_distance = 'No Data';
            }
        }),

        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, two_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                two_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof two_day_distance == 'undefined') {
                    two_day_distance = 0;
                }

                two_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof two_day_trek == 'undefined') {
                    two_day_trek = 0;
                }

                two_day_active = data.body["active_time_in_seconds"];
                if (typeof two_day_active == 'undefined') {
                    two_day_active = 0;
                }

                two_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof two_day_away == 'undefined') {
                    two_day_away = 0;
                }
                distance_array.push(parseFloat(two_day_distance));
                away_array.push(parseFloat(two_day_away));
                active_array.push(parseFloat(two_day_active));
                trek_array.push(parseFloat(two_day_trek));
            },
            error: function(data) {
                two_day_active = 'No Data';
                two_day_trek = 'No Data';
                two_day_away = 'No Data';
                two_day_distance = 'No Data';
            }
        }),

        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, three_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                three_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof three_day_distance == 'undefined') {
                    three_day_distance = 0;
                }

                three_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof three_day_trek == 'undefined') {
                    three_day_trek = 0;
                }

                three_day_active = data.body["active_time_in_seconds"];
                if (typeof three_day_active == 'undefined') {
                    three_day_active = 0;
                }

                three_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof three_day_away == 'undefined') {
                    three_day_away = 0;
                }
                distance_array.push(parseFloat(three_day_distance));
                away_array.push(parseFloat(three_day_away));
                active_array.push(parseFloat(three_day_active));
                trek_array.push(parseFloat(three_day_trek));
            },
            error: function(data) {
                three_day_active = 'No Data';
                three_day_trek = 'No Data';
                three_day_away = 'No Data';
                three_day_distance = 'No Data';
            }
        }),

        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, four_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                four_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof four_day_distance == 'undefined') {
                    four_day_distance = 0;
                }

                four_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof four_day_trek == 'undefined') {
                    four_day_trek = 0;
                }

                four_day_active = data.body["active_time_in_seconds"];
                if (typeof four_day_active == 'undefined') {
                    four_day_active = 0;
                }

                four_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof four_day_away == 'undefined') {
                    four_day_away = 0;
                }
                distance_array.push(parseFloat(four_day_distance));
                away_array.push(parseFloat(four_day_away));
                active_array.push(parseFloat(four_day_active));
                trek_array.push(parseFloat(four_day_trek));
            },
            error: function(data) {
                four_day_active = 'No Data';
                four_day_trek = 'No Data';
                four_day_away = 'No Data';
                four_day_distance = 'No Data';
            }
        }),

        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, five_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                five_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof five_day_distance == 'undefined') {
                    five_day_distance = 0;
                }

                five_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof five_day_trek == 'undefined') {
                    five_day_trek = 0;
                }

                five_day_active = data.body["active_time_in_seconds"];
                if (typeof five_day_active == 'undefined') {
                    five_day_active = 0;
                }

                five_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof five_day_away == 'undefined') {
                    five_day_away = 0;
                }
                distance_array.push(parseFloat(five_day_distance));
                away_array.push(parseFloat(five_day_away));
                active_array.push(parseFloat(five_day_active));
                trek_array.push(parseFloat(five_day_trek));
            },
            error: function(data) {
                five_day_active = 'No Data';
                five_day_trek = 'No Data';
                five_day_away = 'No Data';
                five_day_distance = 'No Data';
            }
        }),

        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, six_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                six_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof six_day_distance == 'undefined') {
                    six_day_distance = 0;
                }

                six_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof six_day_trek == 'undefined') {
                    six_day_trek = 0;
                }

                six_day_active = data.body["active_time_in_seconds"];
                if (typeof six_day_active == 'undefined') {
                    six_day_active = 0;
                }

                six_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof six_day_away == 'undefined') {
                    six_day_away = 0;
                }
                distance_array.push(parseFloat(six_day_distance));
                away_array.push(parseFloat(six_day_away));
                active_array.push(parseFloat(six_day_active));
                trek_array.push(parseFloat(six_day_trek));
            },
            error: function(data) {
                six_day_active = 'No Data';
                six_day_trek = 'No Data';
                six_day_away = 'No Data';
                six_day_distance = 'No Data';
            }
        }),

        $.ajax({
            type: 'GET',
            url: dsu + "dataPoints/" + getSummaryDatapointId(username, seven_day_before, device),
            headers: {
            "Authorization": "Bearer " + token
            },
            success: function(data) {
                seven_day_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                if (typeof seven_day_distance == 'undefined') {
                    seven_day_distance = 0;
                }

                seven_day_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                if (typeof seven_day_trek == 'undefined') {
                    seven_day_trek = 0;
                }

                seven_day_active = data.body["active_time_in_seconds"];
                if (typeof seven_day_active == 'undefined') {
                    seven_day_active = 0;
                }

                seven_day_away = data.body["time_not_at_home_in_seconds"];
                if (typeof seven_day_away == 'undefined') {
                    seven_day_away = 0;
                }
                distance_array.push(parseFloat(seven_day_distance));
                away_array.push(parseFloat(seven_day_away));
                active_array.push(parseFloat(seven_day_active));
                trek_array.push(parseFloat(seven_day_trek));
            },
            error: function(data) {
                seven_day_active = 'No Data';
                seven_day_trek = 'No Data';
                seven_day_away = 'No Data';
                seven_day_distance = 'No Data';
            }
        })
    ).then(function() {
        var distance_max = Math.max.apply(Math, distance_array);
        var away_max = Math.max.apply(Math, away_array);
        var active_max = Math.max.apply(Math, active_array);
        var trek_max = Math.max.apply(Math, trek_array);
        showYesterdaySummary(trek_max, active_max, away_max, distance_max);
    })
}


function showYesterdaySummary(trek_max, active_max, away_max, distance_max) {
    var distance = $("#walking-distance").data('value');
    var div_3 = document.getElementById('miles-3');
    var div_2 = document.getElementById('miles-2');
    var div_1 = document.getElementById('miles-1');
    div_3.className = "dashed_border miles-walked-color";

    if (distance == 'No Data' || distance == 0) {
        div_3.setAttribute('style', 'border-right-style: dashed;');
        div_2.className = "";
        div_1.className = "";
    }else {
        if (Number(distance_max) <= Number(distance)) {
            div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
            div_2.setAttribute('style', 'width: 100%');
            div_3.setAttribute('style', 'border-right-style: solid;');
            div_1.className = "";
        }else {
            var distance_percentage = Number(distance) / Number(distance_max);
            div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
            div_2.setAttribute('style', 'width:' + distance_percentage*100 + "%");
            div_1.className = "";
            div_3.setAttribute('style', 'border-right-style: dashed;');

        }
    }

    if (distance != 'No Data' && distance_max != 'No Data') {
        var distance_difference = Number(distance) - Number(distance_max);
        if (distance_difference > 0 ) {
            var arrow_up = document.createElement('img');
            arrow_up.src = 'images/arrow_up.png';
            arrow_up.className = 'arrow';
            var differences_text;
            if (distance_difference < 2) {
                differences_text = document.createTextNode(distance_difference.toFixed(1) + 'mile');

            }else {
                differences_text = document.createTextNode(distance_difference.toFixed(1) + 'miles');
            }
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('miles-difference').appendChild(arrow_up);
            document.getElementById('miles-difference').appendChild(differences_span);

        } else if (distance_difference < 0){
            var arrow_down = document.createElement('img');
            arrow_down.src = 'images/arrow_down.png';
            arrow_down.className = 'arrow';

            var differences_text;
            if (distance_difference < 2) {
                differences_text = document.createTextNode(Math.abs(distance_difference).toFixed(1) + 'mile');

            }else {
                differences_text = document.createTextNode(Math.abs(distance_difference).toFixed(1) + 'miles');
            }

            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);
            document.getElementById('miles-difference').appendChild(arrow_down);
            document.getElementById('miles-difference').appendChild(differences_span);

        } else {
            var differences_text = document.createTextNode("No Change!");
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);
            document.getElementById('miles-difference').appendChild(differences_span);
        }
    }

//////////////////////////////////////////////////////////////


    var trek = $("#trek-mile").data('value');
    var trek_3 = document.getElementById('trek-3');
    var trek_2 = document.getElementById('trek-2');
    var trek_1 = document.getElementById('trek-1');
    trek_3.className = "dashed_border trek-mile-color";


    if (trek == 'No Data' || trek == 0) {
        trek_3.setAttribute('style', 'border-right-style: dashed;');
        trek_2.className = "";
        trek_1.className = "";
    }else {
        if (Number(trek_max) <= Number(trek)) {
            trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
            trek_2.setAttribute('style', 'width: 100%');
            trek_3.setAttribute('style', 'border-right-style: solid');
            trek_1.className = "";
        }else {
            var trek_percentage = Number(trek) / Number(trek_max);
            trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
            trek_2.setAttribute('style', 'width:' + trek_percentage*100 + "%");
            trek_1.className = "";
            trek_3.setAttribute('style', 'border-right-style: dashed');
        }
    }


    if (trek != 'No Data' && trek_max != 'No Data') {
        var trek_difference = Number(trek) - Number(trek_max);
        if (trek_difference > 0) {
            var arrow_up = document.createElement('img');
            arrow_up.src = 'images/arrow_up.png';
            arrow_up.className = 'arrow';

            var differences_text;
            if (trek_difference < 2) {
                differences_text = document.createTextNode(trek_difference.toFixed(1) + 'mile');

            }else {
                differences_text = document.createTextNode(trek_difference.toFixed(1) + 'miles');
            }

            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('trek-difference').appendChild(arrow_up);
            document.getElementById('trek-difference').appendChild(differences_span);

        } else if (trek_difference < 0){
            var arrow_down = document.createElement('img');
            arrow_down.src = 'images/arrow_down.png';
            arrow_down.className = 'arrow';

            var differences_text;
            if (trek_difference < 2) {
                differences_text = document.createTextNode(Math.abs(trek_difference).toFixed(1) + 'mile');

            }else {
                differences_text = document.createTextNode(Math.abs(trek_difference).toFixed(1) + 'miles');
            }

            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('trek-difference').appendChild(arrow_down);
            document.getElementById('trek-difference').appendChild(differences_span);

        } else {
            var differences_text = document.createTextNode("No Change!");
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('trek-difference').appendChild(differences_span);

        }

    }
/////////////////////////////////////////////////////////////////////////////

    var active = $("#active-time").data('value');
    var active_3 = document.getElementById('active-3');
    var active_2 = document.getElementById('active-2');
    var active_1 = document.getElementById('active-1');
    active_3.className = "dashed_border minutes-active-color";

    if (active === 'No Data' || active == 0) {
        active_2.className = "";
        active_3.setAttribute('style', 'border-right-style: dashed');
        active_1.className = "";
    }else {
        if (Number(active_max/60) <= Number(active)) {
            active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
            active_2.setAttribute('style', 'width: 100%');
            active_3.setAttribute('style', 'border-right-style: solid');
            active_1.className = "";
        }else {
            var active_percentage = Number(active) / Number(active_max/60);
            active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
            active_2.setAttribute('style', 'width:' + active_percentage*100 + "%");
            active_1.className = "";
            active_3.setAttribute('style', 'border-right-style: dashed');
        }
    }

    if (active != 'No Data' && active_max != 'No Data') {
        var active_difference = active - (active_max/60).toFixed(0);
        if (active_difference > 0) {
            var arrow_up = document.createElement('img');
            arrow_up.src = 'images/arrow_up.png';
            arrow_up.className = 'arrow';

            var differences_text;
            if (active_difference < 60) {
                differences_text = document.createTextNode(active_difference + 'min');
            } else {
                var active_minute = active_difference % 60;
                var active_hour = Math.floor(active_difference/60);
                differences_text = document.createTextNode(active_hour + 'hr' + active_minute + 'min');
            }
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('active-difference').appendChild(arrow_up);
            document.getElementById('active-difference').appendChild(differences_span);

        } else if (active_difference < 0){
            var arrow_down = document.createElement('img');
            arrow_down.src = 'images/arrow_down.png';
            arrow_down.className = 'arrow';
            var differences_text;

            if (Math.abs(active_difference) < 60) {
                differences_text = document.createTextNode(Math.abs(active_difference) + 'min');
            } else {
                var active_minute = Math.abs(active_difference % 60);
                var active_hour = Math.abs(Math.floor(active_difference/60)) - 1;
                differences_text = document.createTextNode(active_hour + 'hr' + active_minute + 'min');
            }

            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('active-difference').appendChild(arrow_down);
            document.getElementById('active-difference').appendChild(differences_span);

        } else {
            var differences_text = document.createTextNode("No Change!");
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);
            document.getElementById('active-difference').appendChild(differences_span);
        }
    }

//////////////////////////////////////////////////////////////


    var away = $("#away-from-home").data('value');
    var away_3 = document.getElementById('away-3');
    var away_2 = document.getElementById('away-2');
    var away_1 = document.getElementById('away-1');
    away_3.className = "dashed_border hours-out-of-house-color";
    if (away === 'No Data' || away == 0) {
        away_3.setAttribute('style', 'border-right-style: dashed;');
        away_2.className = "";
        away_1.className = "";
    }else {
        if (Number(away_max/60) <= Number(away)) {
            away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
            away_2.setAttribute('style', 'width: 100%');
            away_3.setAttribute('style', 'border-right-style: solid');
            away_1.className = "";

        } else {
            var away_percentage = Number(away) / Number(away_max/60);
            away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
            away_2.setAttribute('style', 'width:' + away_percentage*100 + "%");
            away_1.className = "";
            away_3.setAttribute('style', 'border-right-style: dashed');
        }
    }

    if (away != 'No Data' && away_max != 'No Data') {
         var away_difference = Number(away) - Number(away_max/60).toFixed(0);
         if (away_difference > 0) {
            var arrow_up = document.createElement('img');
            arrow_up.src = 'images/arrow_up.png';
            arrow_up.className = 'arrow';

            var differences_text = document.createTextNode(away_difference.toFixed(0));

            var differences_text;
            if (away_difference < 60) {
                differences_text = document.createTextNode(away_difference + 'min');
            } else {
                var away_minute = away_difference % 60;
                var away_hour = Math.floor(away_difference/60);
                differences_text = document.createTextNode(away_hour + 'hr' + away_minute + 'min');
            }
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('away-difference').appendChild(arrow_up);
            document.getElementById('away-difference').appendChild(differences_span);

        } else if (away_difference < 0){
            var arrow_down = document.createElement('img');
            arrow_down.src = 'images/arrow_down.png';
            arrow_down.className = 'arrow';

            var differences_text;
            if (Math.abs(away_difference) < 60) {
                differences_text = document.createTextNode(Math.abs(away_difference) + 'min');
            } else {
                var away_minute = Math.abs(away_difference % 60);
                var away_hour = Math.abs(Math.floor(away_difference/60)) - 1;
                differences_text = document.createTextNode(away_hour + 'hr' + away_minute + 'min');
            }
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('away-difference').appendChild(arrow_down);
            document.getElementById('away-difference').appendChild(differences_span);

        } else {
            var differences_text = document.createTextNode("No Change!");
            var differences_span = document.createElement('span');
            differences_span.className = 'data-difference';
            differences_span.appendChild(differences_text);

            document.getElementById('away-difference').appendChild(differences_span);

        }
    }

}


//////////////////////////////////////////////////////////////////////////////////

//         var distance = $("#walking-distance").data('value');
//         var div_3 = document.getElementById('miles-3');
//         var div_2 = document.getElementById('miles-2');
//         var div_1 = document.getElementById('miles-1');
//         div_3.className = "dashed_border miles-walked-color";

//         if ((distance === 'No Data') || (distance == 0)) {
//             div_3.setAttribute('style', 'border-right-style: dashed;');
//             div_2.className = "";
//             div_1.className = "";
//         }else {
//             div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//             div_2.setAttribute('style', 'width: 100%');
//             div_3.setAttribute('style', 'border-right-style: solid;');
//             div_1.className = "";
//         }

//         var trek = $("#trek-mile").data('value');
//         var trek_3 = document.getElementById('trek-3');
//         var trek_2 = document.getElementById('trek-2');
//         var trek_1 = document.getElementById('trek-1');
//         trek_3.className = "dashed_border trek-mile-color";

//         if ((trek == 'No Data') || (trek == 0)) {
//             trek_3.setAttribute('style', 'border-right-style: dashed;');
//             trek_2.className = "";
//             trek_1.className = "";
//         }else {
//             trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//             trek_2.setAttribute('style', 'width: 100%');
//             trek_3.setAttribute('style', 'border-right-style: solid;');
//             trek_1.className = "";
//         }


//         var active = $("#active-time").data('value');
//         var active_3 = document.getElementById('active-3');
//         var active_2 = document.getElementById('active-2');
//         var active_1 = document.getElementById('active-1');
//         active_3.className = "dashed_border minutes-active-color";

//         if ((active === 'No Data') || (active == 0)) {
//             active_3.setAttribute('style', 'border-right-style: dashed;');
//             active_2.className = "";
//             active_1.className = "";
//         }else {
//             active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//             active_2.setAttribute('style', 'width: 100%');
//             active_3.setAttribute('style', 'border-right-style: solid;');
//             active_1.className = "";
//         }

//         var away = $("#away-from-home").data('value');
//         var away_3 = document.getElementById('away-3');
//         var away_2 = document.getElementById('away-2');
//         var away_1 = document.getElementById('away-1');
//         away_3.className = "dashed_border hours-out-of-house-color";
//         if ((away == 0) || (away == 'No Data')) {
//             away_3.setAttribute('style', 'border-right-style: dashed;');
//             away_2.className = "";
//             away_1.className = "";
//         }else {
//             away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//             away_2.setAttribute('style', 'width: 100%');
//             away_3.setAttribute('style', 'border-right-style: solid;');
//             away_1.className = "";
//         }

//     });
// }


// function showYesterdaySummary(username, date, device, token) {
//     var yesterday = moment(date).format('YYYY-MM-DD');
//     $.ajax({
//         type: 'GET',
//         url: dsu + "dataPoints/" + getSummaryDatapointId(username, yesterday, device),
//         headers: {
//             "Authorization": "Bearer " + token
//         },
//         success: function(data) {
//             var yesterday_distance;
//             var distance = $("#walking-distance").data('value');
//             var div_3 = document.getElementById('miles-3');
//             var div_2 = document.getElementById('miles-2');
//             var div_1 = document.getElementById('miles-1');
//             div_3.className = "dashed_border miles-walked-color";

//             if (distance == 'No Data') {
//                 div_3.setAttribute('style', 'border-right-style: dashed;');
//                 div_2.className = "";
//                 div_1.className = "";
//             }else {
//                 if (isNaN(data.body["walking_distance_in_km"]) && distance !== 0) {
//                     div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//                     div_2.setAttribute('style', 'width: 100%');
//                     div_3.setAttribute('style', 'border-right-style: solid;');
//                     div_1.className = "";
//                 }else {
//                     yesterday_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
//                     var distance_difference = Number(distance) - Number(yesterday_distance);
//                     var total_distance = Math.abs(distance_difference) + Number(distance);

//                     var distance_percentage = Number(distance) / Number(total_distance);
//                     var yesterday_distance_percentage = Number(yesterday_distance)/Number(total_distance);

//                     if (distance_difference > 0) {
//                         var arrow_up = document.createElement('img');
//                         arrow_up.src = 'images/arrow_up.png';
//                         arrow_up.className = 'arrow';
//                         var differences_text;
//                         if (distance_difference < 2) {
//                             differences_text = document.createTextNode(distance_difference.toFixed(1) + 'mile');

//                         }else {
//                             differences_text = document.createTextNode(distance_difference.toFixed(1) + 'miles');
//                         }
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);


//                         document.getElementById('miles-difference').appendChild(arrow_up);
//                         document.getElementById('miles-difference').appendChild(differences_span);


//                         if (Number(distance_difference) == Number(distance)) {
//                             div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//                             div_2.setAttribute('style', 'width: 100%');
//                             div_3.setAttribute('style', 'border-right-style: solid;');
//                             div_1.className = "";


//                         } else {
//                             div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//                             div_2.setAttribute('style', 'width: 100%');

//                             div_1.className = ('solid_border dashed-right');
//                             div_1.setAttribute('style', 'width:' + yesterday_distance_percentage*100 + "%");

//                             div_3.setAttribute('style', 'border-right-style: solid');


//                         }
//                     } else if (distance_difference < 0){
//                         var arrow_down = document.createElement('img');
//                         arrow_down.src = 'images/arrow_down.png';
//                         arrow_down.className = 'arrow';

//                         var differences_text;
//                         if (distance_difference < 2) {
//                             differences_text = document.createTextNode(Math.abs(distance_difference).toFixed(1) + 'mile');

//                         }else {
//                             differences_text = document.createTextNode(Math.abs(distance_difference).toFixed(1) + 'miles');
//                         }

//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);


//                         document.getElementById('miles-difference').appendChild(arrow_down);
//                         document.getElementById('miles-difference').appendChild(differences_span);

//                         if (Math.abs(distance_difference) == Number(yesterday_distance)) {
//                             div_2.className = "";
//                             div_3.setAttribute('style', 'border-right-style: dashed;');
//                             div_1.className = "";

//                         } else {
//                             div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//                             div_2.setAttribute('style', 'width:' + distance_percentage*100 + "%");
//                             div_1.className = "";
//                             div_3.setAttribute('style', 'border-right-style: dashed;');

//                         }
//                     } else {
//                         var differences_text = document.createTextNode("No Change!");
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('miles-difference').appendChild(differences_span);
//                         if (Number(distance) != 0) {
//                             div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//                             div_2.setAttribute('style', 'width: 100%');
//                             div_1.className = "";
//                         } else {
//                             div_3.setAttribute('style', 'border-right-style: dashed;');
//                             div_2.className = "";
//                             div_1.className = "";
//                         }
//                     }
//                 }
//             }


//             var yesterday_trek;
//             var trek = $("#trek-mile").data('value');
//             var trek_3 = document.getElementById('trek-3');
//             var trek_2 = document.getElementById('trek-2');
//             var trek_1 = document.getElementById('trek-1');
//             trek_3.className = "dashed_border trek-mile-color";


//              if (trek == 'No Data') {
//                 trek_3.setAttribute('style', 'border-right-style: dashed;');
//                 trek_2.className = "";
//                 trek_1.className = "";
//             }else {
//                 if (isNaN(data.body["longest-trek-in-km"]) && trek !== 0) {
//                     trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//                     trek_2.setAttribute('style', 'width: 100%');
//                     trek_3.setAttribute('style', 'border-right-style: solid');
//                     trek_1.className = "";
//                 }else {
//                     yesterday_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
//                     var trek_difference = Number(trek) - Number(yesterday_trek);
//                     var total_trek = Math.abs(trek_difference) + Number(trek);

//                     var trek_percentage = Number(trek) / Number(total_trek);
//                     var yesterday_trek_percentage = Number(yesterday_trek)/Number(total_trek);


//                     if (trek_difference > 0) {
//                         var arrow_up = document.createElement('img');
//                         arrow_up.src = 'images/arrow_up.png';
//                         arrow_up.className = 'arrow';

//                         var differences_text;
//                         if (trek_difference < 2) {
//                             differences_text = document.createTextNode(trek_difference.toFixed(1) + 'mile');

//                         }else {
//                             differences_text = document.createTextNode(trek_difference.toFixed(1) + 'miles');
//                         }

//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('trek-difference').appendChild(arrow_up);
//                         document.getElementById('trek-difference').appendChild(differences_span);


//                         if (Number(trek_difference) == Number(trek)) {
//                             trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//                             trek_2.setAttribute('style', 'width: 100%');
//                             trek_3.setAttribute('style', 'border-right-style: solid');
//                             trek_1.className = "";


//                         } else {
//                             trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//                             trek_2.setAttribute('style', 'width: 100%');

//                             trek_1.className = ('solid_border dashed-right');
//                             trek_1.setAttribute('style', 'width:' + yesterday_trek_percentage*100 + "%");

//                             trek_3.setAttribute('style', 'border-right-style: solid');


//                         }
//                     } else if (trek_difference < 0){
//                         var arrow_down = document.createElement('img');
//                         arrow_down.src = 'images/arrow_down.png';
//                         arrow_down.className = 'arrow';

//                         var differences_text;
//                         if (trek_difference < 2) {
//                             differences_text = document.createTextNode(Math.abs(trek_difference).toFixed(1) + 'mile');

//                         }else {
//                             differences_text = document.createTextNode(Math.abs(trek_difference).toFixed(1) + 'miles');
//                         }

//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('trek-difference').appendChild(arrow_down);
//                         document.getElementById('trek-difference').appendChild(differences_span);

//                         if (Math.abs(trek_difference) == Number(yesterday_trek)) {
//                             trek_2.className = "";
//                             trek_3.setAttribute('style', 'border-right-style: dashed');
//                             trek_1.className = "";

//                         } else {
//                             trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//                             trek_2.setAttribute('style', 'width:' + trek_percentage*100 + "%");
//                             trek_1.className = "";
//                             trek_3.setAttribute('style', 'border-right-style: dashed');

//                         }
//                     } else {
//                         var differences_text = document.createTextNode("No Change!");
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('trek-difference').appendChild(differences_span);
//                         if (Number(trek) != 0) {
//                             trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//                             trek_2.setAttribute('style', 'width: 100%');
//                             trek_1.className = "";
//                         } else {
//                             trek_3.setAttribute('style', 'border-right-style: dashed;');
//                             trek_2.className = "";
//                             trek_1.className = "";
//                         }
//                     }

//                 }
//             }

//             var yesterday_active;
//             var active = $("#active-time").data('value');
//             console.log(active);
//             var active_3 = document.getElementById('active-3');
//             var active_2 = document.getElementById('active-2');
//             var active_1 = document.getElementById('active-1');
//             active_3.className = "dashed_border minutes-active-color";

//             if (active === 'No Data') {
//                 active_2.className = "";
//                 active_3.setAttribute('style', 'border-right-style: dashed');
//                 active_1.className = "";
//             }else {
//                 if ((isNaN(data.body["active_time_in_seconds"])) && (active !== 0)) {
//                     active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//                     active_2.setAttribute('style', 'width: 100%');
//                     active_3.setAttribute('style', 'border-right-style: solid');
//                     active_1.className = "";
//                 }else {
//                     yesterday_active = (data.body["active_time_in_seconds"]/60).toFixed(0);
//                     var active_difference = active - yesterday_active;
//                     var total_active = Math.abs(active_difference) + Number(active);

//                     var active_percentage = Number(active) / Number(total_active);
//                     var yesterday_active_percentage = Number(yesterday_active)/ Number(total_active);

//                     if (active_difference > 0) {
//                         var arrow_up = document.createElement('img');
//                         arrow_up.src = 'images/arrow_up.png';
//                         arrow_up.className = 'arrow';


//                         var differences_text;
//                         if (active_difference < 60) {
//                             differences_text = document.createTextNode(active_difference + 'min');
//                         } else {
//                             var active_minute = active_difference % 60;
//                             var active_hour = Math.floor(active_difference/60);
//                             differences_text = document.createTextNode(active_hour + 'hr' + active_minute + 'min');
//                         }
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('active-difference').appendChild(arrow_up);
//                         document.getElementById('active-difference').appendChild(differences_span);


//                         if (Number(active_difference) == Number(active)) {
//                             active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//                             active_2.setAttribute('style', 'width: 100%');
//                             active_3.setAttribute('style', 'border-right-style: solid');
//                             active_1.className = "";


//                         } else {
//                             active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//                             active_2.setAttribute('style', 'width: 100%');
//                             active_1.className = ('solid_border dashed-right');
//                             active_1.setAttribute('style', 'width:' + yesterday_active_percentage*100 + "%");
//                             active_3.setAttribute('style', 'border-right-style: solid');


//                         }
//                     } else if (active_difference < 0){
//                         var arrow_down = document.createElement('img');
//                         arrow_down.src = 'images/arrow_down.png';
//                         arrow_down.className = 'arrow';
//                         var differences_text;

//                         if (Math.abs(active_difference) < 60) {
//                             differences_text = document.createTextNode(Math.abs(active_difference) + 'min');
//                         } else {
//                             var active_minute = Math.abs(active_difference % 60);
//                             var active_hour = Math.abs(Math.floor(active_difference/60)) - 1;
//                             differences_text = document.createTextNode(active_hour + 'hr' + active_minute + 'min');
//                         }

//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('active-difference').appendChild(arrow_down);
//                         document.getElementById('active-difference').appendChild(differences_span);

//                         if (Math.abs(active_difference) == Number(yesterday_active)) {
//                             active_2.className = "";
//                             active_3.setAttribute('style', 'border-right-style: dashed');
//                             active_1.className = "";

//                         } else {
//                             active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//                             active_2.setAttribute('style', 'width:' + active_percentage*100 + "%");
//                             active_1.className = "";
//                             active_3.setAttribute('style', 'border-right-style: dashed');

//                         }
//                     } else {
//                         var differences_text = document.createTextNode("No Change!");
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('active-difference').appendChild(differences_span);
//                         if (Number(active) != 0) {
//                             active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//                             active_2.setAttribute('style', 'width: 100%');
//                             active_1.className = "";

//                         } else {
//                             active_3.setAttribute('style', 'border-right-style: dashed;');
//                             active_2.className = "";
//                             active_1.className = "";
//                         }
//                     }

//                 }

//             }


//             var yesterday_away;
//             var away = $("#away-from-home").data('value');
//             var away_3 = document.getElementById('away-3');
//             var away_2 = document.getElementById('away-2');
//             var away_1 = document.getElementById('away-1');
//             away_3.className = "dashed_border hours-out-of-house-color";
//             if (away === 'No Data') {
//                 away_3.setAttribute('style', 'border-right-style: dashed;');
//                 away_2.className = "";
//                 away_1.className = "";
//             }else {
//                 if ((isNaN(data.body["time_not_at_home_in_seconds"])) && (away !== 0)) {
//                     away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//                     away_2.setAttribute('style', 'width: 100%');
//                     away_3.setAttribute('style', 'border-right-style: solid');
//                     away_1.className = "";
//                 }else {
//                     yesterday_away = (data.body["time_not_at_home_in_seconds"] /60).toFixed(0);
//                     var away_difference = Number(away) - Number(yesterday_away);
//                     var total_away = Math.abs(away_difference) + Number(away);

//                     var away_percentage = Number(away) / Number(total_away);
//                     var yesterday_away_percentage = Number(yesterday_away)/Number(total_away);

//                     // var away_difference_percentage = Math.abs(away_difference) / Number(total_away);
//                     if (away_difference > 0) {
//                         var arrow_up = document.createElement('img');
//                         arrow_up.src = 'images/arrow_up.png';
//                         arrow_up.className = 'arrow';

//                         var differences_text = document.createTextNode(away_difference.toFixed(0));

//                         var differences_text;
//                         if (away_difference < 60) {
//                             differences_text = document.createTextNode(away_difference + 'min');
//                         } else {
//                             var away_minute = away_difference % 60;
//                             var away_hour = Math.floor(away_difference/60);
//                             differences_text = document.createTextNode(away_hour + 'hr' + away_minute + 'min');
//                         }
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('away-difference').appendChild(arrow_up);
//                         document.getElementById('away-difference').appendChild(differences_span);


//                         if (Number(away_difference) == Number(away)) {
//                             away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//                             away_2.setAttribute('style', 'width: 100%');
//                             away_3.setAttribute('style', 'border-right-style: solid');
//                             away_1.className = "";


//                         } else {
//                             away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//                             away_2.setAttribute('style', 'width: 100%');

//                             away_1.className = ('solid_border dashed-right');
//                             away_1.setAttribute('style', 'width:' + yesterday_away_percentage*100 + "%");

//                             away_3.setAttribute('style', 'border-right-style: solid');


//                         }
//                     } else if (away_difference < 0){
//                         var arrow_down = document.createElement('img');
//                         arrow_down.src = 'images/arrow_down.png';
//                         arrow_down.className = 'arrow';

//                         var differences_text;
//                         if (Math.abs(away_difference) < 60) {
//                             differences_text = document.createTextNode(Math.abs(away_difference) + 'min');
//                         } else {
//                             var away_minute = Math.abs(away_difference % 60);
//                             var away_hour = Math.abs(Math.floor(away_difference/60)) - 1;
//                             differences_text = document.createTextNode(away_hour + 'hr' + away_minute + 'min');
//                         }
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('away-difference').appendChild(arrow_down);
//                         document.getElementById('away-difference').appendChild(differences_span);

//                         if (Math.abs(away_difference) == Number(yesterday_away)) {
//                             away_2.className = "";
//                             away_3.setAttribute('style', 'border-right-style: dashed');
//                             away_1.className = "";

//                         } else {
//                             away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//                             away_2.setAttribute('style', 'width:' + away_percentage*100 + "%");
//                             away_1.className = "";
//                             away_3.setAttribute('style', 'border-right-style: dashed');

//                         }
//                     } else {
//                         var differences_text = document.createTextNode("No Change!");
//                         var differences_span = document.createElement('span');
//                         differences_span.className = 'data-difference';
//                         differences_span.appendChild(differences_text);

//                         document.getElementById('away-difference').appendChild(differences_span);
//                         if (Number(away) != 0) {
//                             away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//                             away_2.setAttribute('style', 'width: 100%');
//                             away_1.className = "";

//                         } else {
//                             away_3.setAttribute('style', 'border-right-style: dashed;');
//                             away_2.className = "";
//                             away_1.className = "";
//                         }
//                     }

//                 }

//             }

//         },
//         error: function(data) {
//             var distance = $("#walking-distance").data('value');
//             var div_3 = document.getElementById('miles-3');
//             var div_2 = document.getElementById('miles-2');
//             var div_1 = document.getElementById('miles-1');
//             div_3.className = "dashed_border miles-walked-color";

//             if ((distance === 'No Data') || (distance == 0)) {
//                 div_3.setAttribute('style', 'border-right-style: dashed;');
//                 div_2.className = "";
//                 div_1.className = "";
//             }else {
//                 div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
//                 div_2.setAttribute('style', 'width: 100%');
//                 div_3.setAttribute('style', 'border-right-style: solid;');
//                 div_1.className = "";
//             }

//             var trek = $("#trek-mile").data('value');
//             var trek_3 = document.getElementById('trek-3');
//             var trek_2 = document.getElementById('trek-2');
//             var trek_1 = document.getElementById('trek-1');
//             trek_3.className = "dashed_border trek-mile-color";

//             if ((trek == 'No Data') || (trek == 0)) {
//                 trek_3.setAttribute('style', 'border-right-style: dashed;');
//                 trek_2.className = "";
//                 trek_1.className = "";
//             }else {
//                 trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
//                 trek_2.setAttribute('style', 'width: 100%');
//                 trek_3.setAttribute('style', 'border-right-style: solid;');
//                 trek_1.className = "";
//             }


//             var active = $("#active-time").data('value');
//             var active_3 = document.getElementById('active-3');
//             var active_2 = document.getElementById('active-2');
//             var active_1 = document.getElementById('active-1');
//             active_3.className = "dashed_border minutes-active-color";

//             if ((active === 'No Data') || (active == 0)) {
//                 active_3.setAttribute('style', 'border-right-style: dashed;');
//                 active_2.className = "";
//                 active_1.className = "";
//             }else {
//                 active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
//                 active_2.setAttribute('style', 'width: 100%');
//                 active_3.setAttribute('style', 'border-right-style: solid;');
//                 active_1.className = "";
//             }

//             var away = $("#away-from-home").data('value');
//             var away_3 = document.getElementById('away-3');
//             var away_2 = document.getElementById('away-2');
//             var away_1 = document.getElementById('away-1');
//             away_3.className = "dashed_border hours-out-of-house-color";
//             if ((away == 0) || (away == 'No Data')) {
//                 away_3.setAttribute('style', 'border-right-style: dashed;');
//                 away_2.className = "";
//                 away_1.className = "";
//             }else {
//                 away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
//                 away_2.setAttribute('style', 'width: 100%');
//                 away_3.setAttribute('style', 'border-right-style: solid;');
//                 away_1.className = "";
//             }

//         }
//     });
// }
