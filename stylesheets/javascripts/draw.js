google.load("visualization", "1", {packages:["timeline", "map"]});

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
            var myNode = document.getElementById("google_img");
            if (myNode.firstChild) {
                myNode.removeChild(myNode.firstChild);
            }
            $("#google_img").html("No Data for mapping!");
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
        rows.forEach(function(obj){
            if (typeof obj !== 'undefined') {
                drawLocationMaps(obj[3], obj[4], obj[1], obj[2]);
            }
        });
    }
}

function deletePreviousImg() {
    var myNode = document.getElementById("google_locations");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    };
}

function deletePreviousBar() {
    var distanceBar = document.getElementById("distance_bar");
    while (distanceBar.firstChild) {
        distanceBar.removeChild(distanceBar.firstChild);
    }

    var speedBar = document.getElementById("speed_bar");
    while (speedBar.firstChild) {
        speedBar.removeChild(speedBar.firstChild);
    }

    var awayBar = document.getElementById("away_bar");
    while (awayBar.firstChild) {
        awayBar.removeChild(awayBar.firstChild);
    }
}

function drawLocationMaps(averg_long, averg_lac, start, end) {
    console.log(averg_long);
    console.log(averg_lac);
    var start_hours = start.getHours();
    var end_hours = end.getHours();
    var start_minutes = start.getMinutes();
    var end_minutes = end.getMinutes();

    $.ajax({
        type: 'POST',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + averg_lac + ',' + averg_long + '&result_type=neighborhood&key=AIzaSyAG_w_kb82S-oQr0sCstdIyNgOPVdXeu9Q',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            console.log(data['results'].length);

            if (data['results'].length > 0) {
                var neighborhood = data['results'][0]['formatted_address'];
                console.log(neighborhood);
                var elem_location = document.createTextNode(neighborhood);
                var elem_li = document.createElement('LI');
                elem_li.appendChild(elem_location);
                elem_li.className ='li-style';
                document.getElementById('google_locations').appendChild(elem_li);

            }else {
                console.log("Where are you?");
            }


        },
        error: function(data) {
           alert("Can't find the neighborhood!");
        }

    });
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

            var distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(2);
            $("#walking-distance").html(distance);

            var speed = data.body["max_gait_speed_in_meter_per_second"];
            $("#gait-speed").html(speed);

            var away = data.body["time_not_at_home_in_seconds"];
            $("#away-from-home").html(away / 3600);

            var yesterday_date = date.setDate(date.getDate() - 1);
            showYesterdaySummary(username, yesterday_date, device, token);

            },
        error: function(data){
            $("#walking-distance").html(0);
            $("#away-from-home").html(0);
            $("#gait-speed").html(0);
            var yesterday_date = date.setDate(date.getDate() - 1);
            showYesterdaySummary(username, yesterday_date, device, token);
        }
    });
}

function showYesterdaySummary(username, date, device, token) {
    var yesterday = moment(date).format('YYYY-MM-DD');
    $.ajax({
        type: 'GET',
        url: dsu + "dataPoints/" + getSummaryDatapointId(username, yesterday, device),
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function(data) {
            var yesterday_distance;
            if (isNaN(data.body["walking_distance_in_km"])) {
                yesterday_distance = 0;

            }else {
                yesterday_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(2);

            }


            var distance = $("#walking-distance").html();
            var distance_round = Number(distance).toFixed(2);
            var yesterday_distance_round = Number(yesterday_distance).toFixed(2);

            var distance_difference = distance - yesterday_distance;
            var distance_difference_round = Math.abs(distance_difference).toFixed(2);
            var distance_difference_absolute = Math.abs(distance_difference);

            var total_distance = Number(distance_difference_absolute) + Number(distance);

            var distance_percentage = distance/total_distance;
            var yesterday_distance_percentage = yesterday_distance/total_distance;

            var distance_difference_percentage = Math.abs(distance_difference) / total_distance;

            if (distance_difference > 0) {
                var th_1 = document.createElement('td');

                if (distance_difference == distance) {
                    th_1.className = 'solid_border width_100 distance-color';

                    var th_1_text = document.createTextNode(distance_round + "miles more than yesterday");
                    th_1.appendChild(th_1_text);

                    document.getElementById('distance_bar').appendChild(th_1);
                } else {
                    th_1.className = 'solid_border';
                    th_1.setAttribute("style", 'width: ' + yesterday_distance_percentage*100 + '%; background-color: #FFAC46');

                    var th_1_text = document.createTextNode(yesterday_distance_round);
                    th_1.appendChild(th_1_text);
                    document.getElementById('distance_bar').appendChild(th_1);

                    var th_2 = document.createElement('td');
                    th_2.className = 'solid_border border_left_color';
                    th_2.setAttribute("style", 'width: ' + distance_difference_percentage*100 + '%; background-color: #FFAC46');

                    var th_2_text = document.createTextNode(distance_difference_round + "miles more than yesterday");
                    th_2.appendChild(th_2_text);
                    document.getElementById('distance_bar').appendChild(th_2);
                }
            } else if (distance_difference < 0){
                var th_1 = document.createElement('td');

                if (Math.abs(distance_difference) == yesterday_distance) {
                    th_1.className = 'dashed_border width_100 distance';

                    var th_1_text = document.createTextNode(distance_difference_round + "miles less than yesterday");
                    th_1.appendChild(th_1_text);
                    $("#walking-distance").html(0);
                    document.getElementById('distance_bar').appendChild(th_1);

                } else {
                    th_1.className = 'solid_border';
                    th_1.setAttribute("style", 'width: ' + distance_percentage*100 + '%; background-color: #FFAC46');

                    var th_1_text = document.createTextNode(distance_round);
                    th_1.appendChild(th_1_text);
                    document.getElementById('distance_bar').appendChild(th_1);

                    var th_2 = document.createElement('td');
                    th_2.className = 'dashed_border border_left_color distance';
                    th_2.setAttribute("style", 'width: ' + distance_difference_percentage*100 + '%; color: #FFAC46;');

                    var th_2_text = document.createTextNode(distance_difference_round +  "miles less than yesterday");
                    th_2.appendChild(th_2_text);
                    document.getElementById('distance_bar').appendChild(th_2);
                }
            } else {
                var th_1 = document.createElement('td');
                th_1.className = 'solid_border distance-color';
                th_1.setAttribute("style", "width: 30%");

                var th_1_text = document.createTextNode(distance_round + "same as yesterday");
                th_1.appendChild(th_1_text);
                document.getElementById('distance_bar').appendChild(th_1);
            }

            var yesterday_speed;
            if (isNaN(data.body["max_gait_speed_in_meter_per_second"])) {
                yesterday_speed = 0;

            }else {
                yesterday_speed = data.body["max_gait_speed_in_meter_per_second"];

            }


            var speed = $("#gait-speed").html();


            var speed_difference = speed - yesterday_speed;

            var speed_difference_absolute = Math.abs(speed_difference);
            var total_speed = Number(speed) + Number(speed_difference_absolute);

            var speed_percentage = speed / total_speed;
            var yesterday_speed_percentage = yesterday_speed/total_speed;

            var speed_round = Number(speed).toFixed(2);
            var yesterday_speed_round = Number(yesterday_speed).toFixed(2);
            var speed_difference_percentage = Math.abs(speed_difference) / total_speed;

            var speed_difference_round = Number(speed_difference).toFixed(2);

            if (speed_difference > 0) {
                var th_1 = document.createElement('td');
                if (speed_difference == speed) {
                    th_1.className = 'solid_border width_100 speed-color';

                    var th_1_text = document.createTextNode(speed_round + "m/s faster than yesterday");
                    th_1.appendChild(th_1_text);

                    document.getElementById('speed_bar').appendChild(th_1);
                } else {
                    th_1.className = 'solid_border speed-color';
                    th_1.setAttribute("style", 'width: ' + yesterday_speed_percentage*100 + "%");

                    var th_1_text = document.createTextNode(yesterday_speed_round);
                    th_1.appendChild(th_1_text);
                    document.getElementById('speed_bar').appendChild(th_1);

                    var th_2 = document.createElement('td');
                    th_2.className = 'solid_border border_left_color speed-color';
                    th_2.setAttribute("style", 'width: ' + speed_difference_percentage*100 + "%");

                    var th_2_text = document.createTextNode(speed_difference_round + "m/s faster than yesterday");
                    th_2.appendChild(th_2_text);

                    document.getElementById('speed_bar').appendChild(th_2);
                }
            } else if (speed_difference < 0){
                var th_1 = document.createElement('td');
                if (Math.abs(speed_difference) == yesterday_speed) {
                    th_1.className = 'dashed_border width_100 speed';

                    var th_1_text = document.createTextNode(Math.abs(speed_difference_round) + "m/s slower than yesterday");
                    th_1.appendChild(th_1_text);

                    $("#gait-speed").html(0);

                    document.getElementById('speed_bar').appendChild(th_1);
                } else {
                    th_1.className = 'solid_border speed-color';
                    th_1.setAttribute("style", 'width: ' + speed_percentage*100 + "%");

                    var th_1_text = document.createTextNode(speed_round);
                    th_1.appendChild(th_1_text);
                    document.getElementById('speed_bar').appendChild(th_1);

                    var th_2 = document.createElement('td');
                    th_2.className = 'dashed_border border_left_color speed';
                    th_2.setAttribute("style", 'width: ' + speed_difference_percentage*100 + "%");

                    var th_2_text = document.createTextNode(Math.abs(speed_difference_round) + "m/s slower than yesterday");
                    th_2.appendChild(th_2_text);

                    document.getElementById('speed_bar').appendChild(th_2);
                }
            } else {
                if (speed == 0 && yesterday_away == 0) {
                    var th_1 = document.createElement('td');
                    var th_1_text = document.createTextNode("Today is also 0!");
                    th_1.appendChild(th_1_text);
                    document.getElementById('speed_bar').appendChild(th_1);
                } else {
                    var th_1 = document.createElement('td');
                    th_1.className = 'solid_border speed-color';
                    th_1.setAttribute("style", "width: 30%");
                    var th_1_text = document.createTextNode(speed_percentage + "same speed as yesterday");
                    th_1.appendChild(th_1_text);
                    document.getElementById('speed_bar').appendChild(th_1);
                }

            }

            var yesterday_away;
            if (isNaN(data.body["time_not_at_home_in_seconds"])) {
                yesterday_away = 0;

            }else {
                yesterday_away = data.body["time_not_at_home_in_seconds"] / 3600;
            }

            var away = $("#away-from-home").html();

            var away_round = Number(away).toFixed(2);
            var yesterday_away_round = Number(yesterday_away).toFixed(2);

            var away_difference = away - yesterday_away;

            var away_difference_round = Math.abs(away_difference).toFixed(2);

            var total_away = Math.abs(away) + Number(away_difference);

            var away_percentage = away / total_away;
            var yesterday_away_percentage = yesterday_away / total_away;

            var away_difference_percentage = Math.abs(away_difference) / total_away;



            if (away_difference > 0) {
                var th_1 = document.createElement('td');
                if (away_difference == away) {
                    th_1.className = 'solid_border width_100 away-color';

                    var th_1_text = document.createTextNode(away_round + "hours longer than yesterday");
                    th_1.appendChild(th_1_text);
                    document.getElementById('away_bar').appendChild(th_1);

                } else {
                    th_1.className = 'solid_border';
                    th_1.setAttribute("style", 'width: ' + yesterday_away_percentage*100 + "%; background-color: #46D1FF");

                    var th_1_text = document.createTextNode(yesterday_away_round);
                    th_1.appendChild(th_1_text);
                    document.getElementById('away_bar').appendChild(th_1);

                    var th_2 = document.createElement('td');
                    th_2.className = 'solid_border border_left_color';
                    th_2.setAttribute("style", 'width: ' + away_difference_percentage*100 + "%; background-color: #46D1FF");

                    var th_2_text = document.createTextNode(away_difference_round + "hours longer than yesterday");
                    th_2.appendChild(th_2_text);
                    document.getElementById('away_bar').appendChild(th_2);

                }

            } else if (away_difference < 0) {
                var th_1 = document.createElement('td');
                if (Math.abs(away_difference) == yesterday_away) {
                    th_1.className = 'dashed_border width_100 away';

                    var th_1_text = document.createTextNode(away_difference_round + "hours shorter than yesterday");
                    th_1.appendChild(th_1_text);
                    $("#away-from-home").html(0);
                    document.getElementById('away_bar').appendChild(th_1);

                } else {
                    th_1.className = 'solid_border';
                    th_1.setAttribute("style", 'width: ' + away_percentage*100 + "%; background-color: #46D1FF");

                    var th_1_text = document.createTextNode(away_round);
                    th_1.appendChild(th_1_text);
                    document.getElementById('away_bar').appendChild(th_1);

                    var th_2 = document.createElement('td');
                    th_2.className = 'dashed_border border_left_color away';
                    th_2.setAttribute("style", 'width: ' + away_difference_percentage*100 + "%");

                    var th_2_text = document.createTextNode(away_difference_round + "hours shorter than yesterday");
                    th_2.appendChild(th_2_text);
                    document.getElementById('away_bar').appendChild(th_2);
                }

            } else {
                var th_1 = document.createElement('td');
                th_1.className = 'solid_border away-color';
                th_1.setAttribute("style", "width: 200%");

                var th_1_text = document.createTextNode(away_round + " same hours as yesterday");
                th_1.appendChild(th_1_text);
                document.getElementById('away_bar').appendChild(th_1);

            }

        },
        error: function(data) {
            var distance = $("#walking-distance").html();
            var distance_round = Number(distance).toFixed(2);
            var th_1 = document.createElement('td');
            th_1.className = 'solid_border width_100 distance-color';

            var th_1_text = document.createTextNode(distance_round + "hours longer than yesterday");
            th_1.appendChild(th_1_text);
            document.getElementById('distance_bar').appendChild(th_1);


            var speed = $("#gait-speed").html();
            var speed_round = Number(speed).toFixed(2);
            var th_1 = document.createElement('td');
            th_1.className = 'solid_border width_100 speed-color';

            var th_1_text = document.createTextNode(speed_round + "hours longer than yesterday");
            th_1.appendChild(th_1_text);
            document.getElementById('speed_bar').appendChild(th_1);


            var away = $("#away-from-home").html();
            var away_round = Number(away).toFixed(2);
            var th_1 = document.createElement('td');
            th_1.className = 'solid_border width_100 away-color';

            var th_1_text = document.createTextNode(away_round + "hours longer than yesterday");
            th_1.appendChild(th_1_text);
            document.getElementById('away_bar').appendChild(th_1);
        }


    });
}











