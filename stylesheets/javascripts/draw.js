// google.load("visualization", "1", {packages:["timeline", "map"]});

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
            var no_data = document.createElement('div');
            var no_data_text = document.createTextNode("No Data for Mapping!");
            no_data.setAttribute('style', 'padding-top: 2em; padding-bottom: 2em;')

            no_data.appendChild(no_data_text);
            $("#google-locations").appendChild(no_data);

            console.log('It is working!');
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
                console.log(latitude_sum / long_lat.length);
                console.log(longitude_sum / long_lat.length);
                console.log(start);
                console.log(end);
                return [state, start, end, latitude_sum / long_lat.length, longitude_sum / long_lat.length];
            }

        });
        console.log(rows);
        rows.forEach(function(obj){
            if (typeof obj !== 'undefined') {
                drawLocationMaps(obj[3], obj[4], obj[1], obj[2]);
                // console.log('defined!');

            }
        });
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

    var activeNumber = document.getElementById("active-difference");
    while (activeNumber.firstChild) {
        activeNumber.removeChild(activeNumber.firstChild);
    }

    var awayNumber = document.getElementById("away-difference");
    while (awayNumber.firstChild) {
        awayNumber.removeChild(awayNumber.firstChild);
    }
}

function drawLocationMaps(averg_lac, averg_long, start, end) {
    var start_hours = start.getHours();
    var end_hours = end.getHours();
    var start_minutes = start.getMinutes();
    var end_minutes = end.getMinutes();

    $.ajax({
        type: 'POST',
        url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + averg_lac + ',' + averg_long + '&key=AIzaSyC1GFrL26ugupKi80EQynafH6-uiLcgZDg',
        dataType: 'json',
        success: function(data) {

            if (data['results'].length > 0) {
                var unit_div = document.createElement('div');
                var info_div = document.createElement('div');
                var location_div = document.createElement('div');
                var location_p = document.createElement('p');

                var neighborhood = data['results'][0]['formatted_address'];
                var location_text = document.createTextNode(neighborhood);

                location_p.appendChild(location_text);
                location_div.appendChild(location_p);
                info_div.appendChild(location_div);

                location_p.className = 'locations';
                location_div.className = 'col-xs-8 col-xs-offset-1';
                info_div.className = 'row location-info';



                var time_div = document.createElement('div');
                var time_p = document.createElement('p');
                var time_text = document.createTextNode(start_hours + ":" + start_minutes + "~" + end_hours + ":" + end_minutes);
                var hr_line = document.createElement('hr');

                time_p.appendChild(time_text);
                time_div.appendChild(time_p);
                info_div.appendChild(time_div);
                unit_div.appendChild(hr_line);
                unit_div.appendChild(info_div);
                time_p.className = 'time';
                time_div.className = 'col-xs-3 pull-right';


                var map_div = document.createElement('div');
                var img_div = document.createElement('img');
                // img_div.src = "http://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=14&size=512x512&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Ccolor:red%7Clabel:C%7C40.718217,-73.998284&sensor=false&key=AIzaSyC1GFrL26ugupKi80EQynafH6-uiLcgZDg";

                img_div.src = "https://maps.googleapis.com/maps/api/staticmap?center="+ averg_lac + "," + averg_long + "&zoom=15&size=2000x1000&maptype=roadmap&markers=color:red%7Clabel:S%7C" + averg_lac + "," + averg_long + "&markers=size:mid&key=AIzaSyC1GFrL26ugupKi80EQynafH6-uiLcgZDg";
                img_div.setAttribute('style', 'width: 100%');
                map_div.appendChild(img_div);
                unit_div.appendChild(map_div);
                unit_div.appendChild(hr_line);
                map_div.className = 'maps';
                unit_div.className = 'location-unit';

                document.getElementById('google-locations').appendChild(unit_div);

            }else {

            }

        },
        error: function(data) {
           console.log('Could not find it!');
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
            if (typeof distance != 'undefined') {
                $("#walking-distance").html(distance);
            } else {
                $("#walking-distance").html('No Data');
            }

            var active = data.body["active_time_in_seconds"];
            if (typeof active != 'undefined') {
                $("#active-time").html((active/60).toFixed(2));
            } else {
                $("#active-time").html('No Data');
            }

            var away = data.body["time_not_at_home_in_seconds"];
            if (typeof away != 'undefined') {
                $("#away-from-home").html((away/3600).toFixed(2));

            } else {
                $("#away-from-home").html('No Data');
            }

            var yesterday_date = moment(today).subtract(1, 'days');
            showYesterdaySummary(username, yesterday_date, device, token);

            },
        error: function(data){
            $("#walking-distance").html('No Data');
            $("#away-from-home").html('No Data');
            $("#active-time").html('No Data');
            var yesterday_date =  moment(today).subtract(1, 'days');
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
            if (distance == 'No Data') {
                distance = 0;
            }

            var distance = $("#walking-distance").html();
            var distance_difference = Number(distance) - Number(yesterday_distance);
            var total_distance = Math.abs(distance_difference) + Number(distance);

            var distance_percentage = Number(distance) / Number(total_distance);
            var yesterday_distance_percentage = Number(yesterday_distance)/Number(total_distance);

            var div_3 = document.getElementById('miles-3');
            var div_2 = document.getElementById('miles-2');
            var div_1 = document.getElementById('miles-1');


            div_3.className = "dashed_border miles-walked-color";

            if (distance_difference > 0) {
                var arrow_up = document.createElement('img');
                arrow_up.src = 'stylesheets/images/arrow_up.png';
                arrow_up.className = 'arrow';

                var differences_text = document.createTextNode(distance_difference.toFixed(2));
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('miles-difference').appendChild(arrow_up);
                document.getElementById('miles-difference').appendChild(differences_span);


                if (Number(distance_difference) == Number(distance)) {
                    div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                    div_2.setAttribute('style', 'width: 100%');
                    div_3.setAttribute('style', 'border-right-style: solid');
                    div_1.className = "";


                } else {
                    div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                    div_2.setAttribute('style', 'width: 100%');

                    div_1.className = ('solid_border dashed-right');
                    div_1.setAttribute('style', 'width:' + yesterday_distance_percentage*100 + "%");

                    div_3.setAttribute('style', 'border-right-style: solid');


                }
            } else if (distance_difference < 0){
                var arrow_down = document.createElement('img');
                arrow_down.src = 'stylesheets/images/arrow_down.png';
                arrow_down.className = 'arrow';
                var differences_text = document.createTextNode(Math.abs(distance_difference).toFixed(2));
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('miles-difference').appendChild(arrow_down);
                document.getElementById('miles-difference').appendChild(differences_span);

                if (Math.abs(distance_difference) == Number(yesterday_distance)) {
                    div_2.className = "";
                    div_3.setAttribute('style', 'border-right-style: dashed');
                    div_1.className = "";

                } else {
                    div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                    div_2.setAttribute('style', 'width:' + distance_percentage*100 + "%");
                    div_1.className = "";
                    div_3.setAttribute('style', 'border-right-style: dashed');

                }
            } else {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('miles-difference').appendChild(differences_span);
                if (Number(distance) != 0) {
                    div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                    div_2.setAttribute('style', 'width: 100%');
                    div_1.className = "";

                    div_3.setAttribute('style', 'border-right-style: dashed');
                } else {
                    div_3.setAttribute('style', 'border-right-style: dashed;');
                    div_2.className = "";
                    div_1.className = "";
                }
            }




            var yesterday_active;
            if (isNaN(data.body["active_time_in_seconds"])) {
                yesterday_active = 0;
            }else {
                yesterday_active = (data.body["active_time_in_seconds"]/60).toFixed(2);
            }
            var active = $("#active-time").html();
            if (active === 'No Data') {
                active = 0;
            }


            var active = $("#active-time").html();
            var active_difference = active - yesterday_active;
            var total_active = Math.abs(active_difference) + Number(active);

            var active_percentage = Number(active) / Number(total_active);
            var yesterday_active_percentage = Number(yesterday_active)/ Number(total_active);

            var active_3 = document.getElementById('active-3');
            var active_2 = document.getElementById('active-2');
            var active_1 = document.getElementById('active-1');


            active_3.className = "dashed_border minutes-active-color";

            if (active_difference > 0) {
                var arrow_up = document.createElement('img');
                arrow_up.src = 'stylesheets/images/arrow_up.png';
                arrow_up.className = 'arrow';


                var differences_text = document.createTextNode(active_difference.toFixed(2));
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('active-difference').appendChild(arrow_up);
                document.getElementById('active-difference').appendChild(differences_span);


                if (Number(active_difference) == Number(active)) {
                    active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                    active_2.setAttribute('style', 'width: 100%');
                    active_3.setAttribute('style', 'border-right-style: solid');
                    active_1.className = "";


                } else {
                    active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                    active_2.setAttribute('style', 'width: 100%');
                    active_1.className = ('solid_border dashed-right');
                    active_1.setAttribute('style', 'width:' + yesterday_active_percentage*100 + "%");
                    active_3.setAttribute('style', 'border-right-style: solid');


                }
            } else if (active_difference < 0){
                var arrow_down = document.createElement('img');
                arrow_down.src = 'stylesheets/images/arrow_down.png';
                arrow_down.className = 'arrow';

                var differences_text = document.createTextNode(Math.abs(active_difference).toFixed(2));
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('active-difference').appendChild(arrow_down);
                document.getElementById('active-difference').appendChild(differences_span);

                if (Math.abs(active_difference) == Number(yesterday_active)) {
                    active_2.className = "";
                    active_3.setAttribute('style', 'border-right-style: dashed');
                    active_1.className = "";

                } else {
                    active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                    active_2.setAttribute('style', 'width:' + active_percentage*100 + "%");
                    active_1.className = "";
                    active_3.setAttribute('style', 'border-right-style: dashed');

                }
            } else {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('active-difference').appendChild(difference_span);
                if (Number(active) != 0) {
                    active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                    active_2.setAttribute('style', 'width: 100%');
                    active_1.className = "";

                    active_3.setAttribute('style', 'border-right-style: dashed');
                } else {
                    active_3.setAttribute('style', 'border-right-style: dashed;');
                    active_2.className = "";
                    active_1.className = "";
                }
            }



            var yesterday_away;
            if (isNaN(data.body["time_not_at_home_in_seconds"])) {
                yesterday_away = 0;
            }else {
                yesterday_away = (data.body["time_not_at_home_in_seconds"] /3600).toFixed(2);
            }
            var away = $("#away-from-home").html();
            console.log(away);
            if (away === 'No Data') {
                away = 0;
            }


            var away = $("#away-from-home").html();
            var away_difference = Number(away) - Number(yesterday_away);
            var total_away = Math.abs(away_difference) + Number(away);

            var away_percentage = Number(away) / Number(total_away);
            var yesterday_away_percentage = Number(yesterday_away)/Number(total_away);

            var away_difference_percentage = Math.abs(away_difference) / Number(total_away);

            var away_3 = document.getElementById('away-3');
            var away_2 = document.getElementById('away-2');
            var away_1 = document.getElementById('away-1');


            away_3.className = "dashed_border hours-out-of-house-color";

            if (away_difference > 0) {
                 var arrow_up = document.createElement('img');
                arrow_up.src = 'stylesheets/images/arrow_up.png';
                arrow_up.className = 'arrow';

                var differences_text = document.createTextNode(away_difference.toFixed(2));
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('away-difference').appendChild(arrow_up);
                document.getElementById('away-difference').appendChild(differences_span);


                if (Number(away_difference) == Number(away)) {
                    away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                    away_2.setAttribute('style', 'width: 100%');
                    away_3.setAttribute('style', 'border-right-style: solid');
                    away_1.className = "";


                } else {
                    away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                    away_2.setAttribute('style', 'width: 100%');

                    away_1.className = ('solid_border dashed-right');
                    away_1.setAttribute('style', 'width:' + yesterday_away_percentage*100 + "%");

                    away_3.setAttribute('style', 'border-right-style: solid');


                }
            } else if (away_difference < 0){
                var arrow_down = document.createElement('img');
                arrow_down.src = 'stylesheets/images/arrow_down.png';
                arrow_down.className = 'arrow';

                var differences_text = document.createTextNode(Math.abs(away_difference).toFixed(2));
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('away-difference').appendChild(arrow_down);
                document.getElementById('away-difference').appendChild(differences_span);

                if (Math.abs(away_difference) == Number(yesterday_away)) {
                    away_2.className = "";
                    away_3.setAttribute('style', 'border-right-style: dashed');
                    away_1.className = "";

                } else {
                    away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                    away_2.setAttribute('style', 'width:' + away_percentage*100 + "%");
                    away_1.className = "";
                    away_3.setAttribute('style', 'border-right-style: dashed');

                }
            } else {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById('away-difference').appendChild(differences_span);
                if (Number(away) != 0) {
                    away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                    away_2.setAttribute('style', 'width: 100%');
                    away_1.className = "";

                    away_3.setAttribute('style', 'border-right-style: dashed');
                } else {
                    away_3.setAttribute('style', 'border-right-style: dashed;');
                    away_2.className = "";
                    away_1.className = "";
                }
            }
        },
        error: function(data) {
            var distance = $("#walking-distance").html();
            var yesterday_distance = 0.00;
            var div_3 = document.getElementById('miles-3');
            var div_2 = document.getElementById('miles-2');
            var div_1 = document.getElementById('miles-1');

            if (Number(distance) == 0) {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);
                document.getElementById('miles-difference').appendChild(differences_span);

                div_3.setAttribute('style', 'border-right-style: dashed;');
                div_2.className = "";
                div_1.className = "";

            } else {
                var differences_text = document.createTextNode(distance);
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                var arrow_up = document.createElement('img');
                arrow_up.src = 'stylesheets/images/arrow_up.png';
                arrow_up.className = 'arrow';

                document.getElementById('miles-difference').appendChild(arrow_up);
                document.getElementById('miles-difference').appendChild(differences_span);

                div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                div_2.setAttribute('style', 'width: 100%');
                div_3.setAttribute('style', 'border-right-style: solid');
                div_1.className = "";
            }



            var active = $("#active-time").html();
            var yesterday_active = 0.00;
            var active_3 = document.getElementById('active-3');
            var active_2 = document.getElementById('active-2');
            var active_1 = document.getElementById('active-1');

            if (Number(active) == 0) {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);
                document.getElementById('active-difference').appendChild(differences_span);

                active_3.setAttribute('style', 'border-right-style: dashed;');
                active_2.className = "";
                active_1.className = "";

            } else {
                var differences_text = document.createTextNode(active);
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                var arrow_up = document.createElement('img');
                arrow_up.src = 'stylesheets/images/arrow_up.png';
                arrow_up.className = 'arrow';

                document.getElementById('active-difference').appendChild(arrow_up);
                document.getElementById('active-difference').appendChild(differences_span);

                active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                active_2.setAttribute('style', 'width: 100%');
                active_3.setAttribute('style', 'border-right-style: solid');
                active_1.className = "";
            }



            var away = $("#away-from-home").html();
            var yesterday_away = 0.00;
            var away_3 = document.getElementById('away-3');
            var away_2 = document.getElementById('away-2');
            var away_1 = document.getElementById('away-1');

            if (Number(away) == 0) {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);
                document.getElementById('away-difference').appendChild(differences_span);

                away_3.setAttribute('style', 'border-right-style: dashed;');
                away_2.className = "";
                away_1.className = "";

            } else {
                var differences_text = document.createTextNode(away);
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                var arrow_up = document.createElement('img');
                arrow_up.src = 'stylesheets/images/arrow_up.png';
                arrow_up.className = 'arrow';

                document.getElementById('away-difference').appendChild(arrow_up);
                document.getElementById('away-difference').appendChild(differences_span);

                away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                away_2.setAttribute('style', 'width: 100%');
                away_3.setAttribute('style', 'border-right-style: solid');
                away_1.className = "";
            }
        }
    });
}











