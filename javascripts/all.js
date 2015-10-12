// google.load("visualization", "1", {packages:["timeline", "map"]});

function drawDate(username, date, device, token){
    $.ajax({
        type: 'GET',
        url: dsu + "dataPoints/" + getDatapointId(username, date, device),
        headers: {
            "Authorization": "Bearer " + token
        },
        success : function(data, device) {
            var location_events = [];
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
                    return [state, start, end, latitude_sum / long_lat.length, longitude_sum / long_lat.length];
                }
            });
            rows.forEach(function(obj){
                if (typeof obj !== 'undefined') {
                    var time_differences = moment(obj[2]).diff(moment(obj[1]),'minutes') + 40;
                    if (time_differences >= 70) {
                        location_events.push({
                            title: 'location',
                            start: moment(obj[1]).format().substring(0, 19),
                            end: moment(obj[2]).format().substring(0, 19),
                            url: "https://maps.googleapis.com/maps/api/staticmap?center="+ obj[3] + "," + obj[4] + "&zoom=13&size=1000x" + time_differences + "&maptype=roadmap&markers=color:red%7Clabel:S%7C" + obj[3] + "," + obj[4] + "&markers=size:mid&key=AIzaSyC1GFrL26ugupKi80EQynafH6-uiLcgZDg"
                    })

                    }
                }
            });
            $('#calendar').fullCalendar('addEventSource', location_events);
        },
        error: function(data){
            console.log('Data did not have any locations.')
        }
    });
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
            showYesterdaySummary(username, yesterday_date, device, token);

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
            var distance = $("#walking-distance").data('value');
            var div_3 = document.getElementById('miles-3');
            var div_2 = document.getElementById('miles-2');
            var div_1 = document.getElementById('miles-1');
            div_3.className = "dashed_border miles-walked-color";

            if (distance == 'No Data') {
                div_3.setAttribute('style', 'border-right-style: dashed;');
                div_2.className = "";
                div_1.className = "";
            }else {
                if (isNaN(data.body["walking_distance_in_km"]) && distance !== 0) {
                    div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                    div_2.setAttribute('style', 'width: 100%');
                    div_3.setAttribute('style', 'border-right-style: solid;');
                    div_1.className = "";
                }else {
                    yesterday_distance = (data.body["walking_distance_in_km"]*0.621371192).toFixed(1);
                    var distance_difference = Number(distance) - Number(yesterday_distance);
                    var total_distance = Math.abs(distance_difference) + Number(distance);

                    var distance_percentage = Number(distance) / Number(total_distance);
                    var yesterday_distance_percentage = Number(yesterday_distance)/Number(total_distance);

                    if (distance_difference > 0) {
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


                        if (Number(distance_difference) == Number(distance)) {
                            div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                            div_2.setAttribute('style', 'width: 100%');
                            div_3.setAttribute('style', 'border-right-style: solid;');
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

                        if (Math.abs(distance_difference) == Number(yesterday_distance)) {
                            div_2.className = "";
                            div_3.setAttribute('style', 'border-right-style: dashed;');
                            div_1.className = "";

                        } else {
                            div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                            div_2.setAttribute('style', 'width:' + distance_percentage*100 + "%");
                            div_1.className = "";
                            div_3.setAttribute('style', 'border-right-style: dashed;');

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
                        } else {
                            div_3.setAttribute('style', 'border-right-style: dashed;');
                            div_2.className = "";
                            div_1.className = "";
                        }
                    }
                }
            }


            var yesterday_trek;
            var trek = $("#trek-mile").data('value');
            var trek_3 = document.getElementById('trek-3');
            var trek_2 = document.getElementById('trek-2');
            var trek_1 = document.getElementById('trek-1');
            trek_3.className = "dashed_border trek-mile-color";


             if (trek == 'No Data') {
                trek_3.setAttribute('style', 'border-right-style: dashed;');
                trek_2.className = "";
                trek_1.className = "";
            }else {
                if (isNaN(data.body["longest-trek-in-km"]) && trek !== 0) {
                    trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
                    trek_2.setAttribute('style', 'width: 100%');
                    trek_3.setAttribute('style', 'border-right-style: solid');
                    trek_1.className = "";
                }else {
                    yesterday_trek = (data.body["longest-trek-in-km"]*0.621371192).toFixed(1);
                    var trek_difference = Number(trek) - Number(yesterday_trek);
                    var total_trek = Math.abs(trek_difference) + Number(trek);

                    var trek_percentage = Number(trek) / Number(total_trek);
                    var yesterday_trek_percentage = Number(yesterday_trek)/Number(total_trek);


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


                        if (Number(trek_difference) == Number(trek)) {
                            trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
                            trek_2.setAttribute('style', 'width: 100%');
                            trek_3.setAttribute('style', 'border-right-style: solid');
                            trek_1.className = "";


                        } else {
                            trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
                            trek_2.setAttribute('style', 'width: 100%');

                            trek_1.className = ('solid_border dashed-right');
                            trek_1.setAttribute('style', 'width:' + yesterday_trek_percentage*100 + "%");

                            trek_3.setAttribute('style', 'border-right-style: solid');


                        }
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

                        if (Math.abs(trek_difference) == Number(yesterday_trek)) {
                            trek_2.className = "";
                            trek_3.setAttribute('style', 'border-right-style: dashed');
                            trek_1.className = "";

                        } else {
                            trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
                            trek_2.setAttribute('style', 'width:' + trek_percentage*100 + "%");
                            trek_1.className = "";
                            trek_3.setAttribute('style', 'border-right-style: dashed');

                        }
                    } else {
                        var differences_text = document.createTextNode("No Change!");
                        var differences_span = document.createElement('span');
                        differences_span.className = 'data-difference';
                        differences_span.appendChild(differences_text);

                        document.getElementById('trek-difference').appendChild(differences_span);
                        if (Number(trek) != 0) {
                            trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
                            trek_2.setAttribute('style', 'width: 100%');
                            trek_1.className = "";
                        } else {
                            trek_3.setAttribute('style', 'border-right-style: dashed;');
                            trek_2.className = "";
                            trek_1.className = "";
                        }
                    }

                }
            }

            var yesterday_active;
            var active = $("#active-time").data('value');
            console.log(active);
            var active_3 = document.getElementById('active-3');
            var active_2 = document.getElementById('active-2');
            var active_1 = document.getElementById('active-1');
            active_3.className = "dashed_border minutes-active-color";

            if (active === 'No Data') {
                active_2.className = "";
                active_3.setAttribute('style', 'border-right-style: dashed');
                active_1.className = "";
            }else {
                if ((isNaN(data.body["active_time_in_seconds"])) && (active !== 0)) {
                    active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                    active_2.setAttribute('style', 'width: 100%');
                    active_3.setAttribute('style', 'border-right-style: solid');
                    active_1.className = "";
                }else {
                    yesterday_active = (data.body["active_time_in_seconds"]/60).toFixed(0);
                    var active_difference = active - yesterday_active;
                    var total_active = Math.abs(active_difference) + Number(active);

                    var active_percentage = Number(active) / Number(total_active);
                    var yesterday_active_percentage = Number(yesterday_active)/ Number(total_active);

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

                        document.getElementById('active-difference').appendChild(differences_span);
                        if (Number(active) != 0) {
                            active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                            active_2.setAttribute('style', 'width: 100%');
                            active_1.className = "";

                        } else {
                            active_3.setAttribute('style', 'border-right-style: dashed;');
                            active_2.className = "";
                            active_1.className = "";
                        }
                    }

                }

            }


            var yesterday_away;
            var away = $("#away-from-home").data('value');
            var away_3 = document.getElementById('away-3');
            var away_2 = document.getElementById('away-2');
            var away_1 = document.getElementById('away-1');
            away_3.className = "dashed_border hours-out-of-house-color";
            if (away === 'No Data') {
                away_3.setAttribute('style', 'border-right-style: dashed;');
                away_2.className = "";
                away_1.className = "";
            }else {
                if ((isNaN(data.body["time_not_at_home_in_seconds"])) && (away !== 0)) {
                    away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                    away_2.setAttribute('style', 'width: 100%');
                    away_3.setAttribute('style', 'border-right-style: solid');
                    away_1.className = "";
                }else {
                    yesterday_away = (data.body["time_not_at_home_in_seconds"] /60).toFixed(0);
                    var away_difference = Number(away) - Number(yesterday_away);
                    var total_away = Math.abs(away_difference) + Number(away);

                    var away_percentage = Number(away) / Number(total_away);
                    var yesterday_away_percentage = Number(yesterday_away)/Number(total_away);

                    // var away_difference_percentage = Math.abs(away_difference) / Number(total_away);
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

                        } else {
                            away_3.setAttribute('style', 'border-right-style: dashed;');
                            away_2.className = "";
                            away_1.className = "";
                        }
                    }

                }

            }

        },
        error: function(data) {
            var distance = $("#walking-distance").data('value');
            var div_3 = document.getElementById('miles-3');
            var div_2 = document.getElementById('miles-2');
            var div_1 = document.getElementById('miles-1');
            div_3.className = "dashed_border miles-walked-color";

            if ((distance === 'No Data') || (distance == 0)) {
                div_3.setAttribute('style', 'border-right-style: dashed;');
                div_2.className = "";
                div_1.className = "";
            }else {
                div_2.className = 'solid_border miles-walked-color miles-walked-background-color';
                div_2.setAttribute('style', 'width: 100%');
                div_3.setAttribute('style', 'border-right-style: solid;');
                div_1.className = "";
            }

            var trek = $("#trek-mile").data('value');
            var trek_3 = document.getElementById('trek-3');
            var trek_2 = document.getElementById('trek-2');
            var trek_1 = document.getElementById('trek-1');
            trek_3.className = "dashed_border trek-mile-color";

            if ((trek == 'No Data') || (trek == 0)) {
                trek_3.setAttribute('style', 'border-right-style: dashed;');
                trek_2.className = "";
                trek_1.className = "";
            }else {
                trek_2.className = 'solid_border trek-mile-color trek-mile-background-color';
                trek_2.setAttribute('style', 'width: 100%');
                trek_3.setAttribute('style', 'border-right-style: solid;');
                trek_1.className = "";
            }


            var active = $("#active-time").data('value');
            var active_3 = document.getElementById('active-3');
            var active_2 = document.getElementById('active-2');
            var active_1 = document.getElementById('active-1');
            active_3.className = "dashed_border minutes-active-color";

            if ((active === 'No Data') || (active == 0)) {
                active_3.setAttribute('style', 'border-right-style: dashed;');
                active_2.className = "";
                active_1.className = "";
            }else {
                active_2.className = 'solid_border minutes-active-color minutes-active-background-color';
                active_2.setAttribute('style', 'width: 100%');
                active_3.setAttribute('style', 'border-right-style: solid;');
                active_1.className = "";
            }

            var away = $("#away-from-home").data('value');
            var away_3 = document.getElementById('away-3');
            var away_2 = document.getElementById('away-2');
            var away_1 = document.getElementById('away-1');
            away_3.className = "dashed_border hours-out-of-house-color";
            if ((away == 0) || (away == 'No Data')) {
                away_3.setAttribute('style', 'border-right-style: dashed;');
                away_2.className = "";
                away_1.className = "";
            }else {
                away_2.className = 'solid_border hours-out-of-house-color hours-out-background-color';
                away_2.setAttribute('style', 'width: 100%');
                away_3.setAttribute('style', 'border-right-style: solid;');
                away_1.className = "";
            }

        }
    });
}
;
var dsu = "https://ohmage-omh.smalldata.io/dsu/";

function getDatapointId(username, date, device){
    return  ["mobility-daily-segments", username, date, device].join("-");
}

function getSummaryDatapointId(username, date, device){
    return  ["mobility-daily-summary", username, date, device.toLowerCase()].join("-");
}

;
/*!
 * FullCalendar v2.3.2
 * Docs & License: http://fullcalendar.io/
 * (c) 2015 Adam Shaw
 */


(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define([ 'jquery', 'moment' ], factory);
  }
  else if (typeof exports === 'object') { // Node/CommonJS
    module.exports = factory(require('jquery'), require('moment'));
  }
  else {
    factory(jQuery, moment);
  }
})(function($, moment) {

;;

var fc = $.fullCalendar = { version: "2.3.2" };
var fcViews = fc.views = {};


$.fn.fullCalendar = function(options) {
  var args = Array.prototype.slice.call(arguments, 1); // for a possible method call
  var res = this; // what this function will return (this jQuery object by default)

  this.each(function(i, _element) { // loop each DOM element involved
    var element = $(_element);
    var calendar = element.data('fullCalendar'); // get the existing calendar object (if any)
    var singleRes; // the returned value of this single method call

    // a method call
    if (typeof options === 'string') {
      if (calendar && $.isFunction(calendar[options])) {
        singleRes = calendar[options].apply(calendar, args);
        if (!i) {
          res = singleRes; // record the first method call result
        }
        if (options === 'destroy') { // for the destroy method, must remove Calendar object data
          element.removeData('fullCalendar');
        }
      }
    }
    // a new calendar initialization
    else if (!calendar) { // don't initialize twice
      calendar = new Calendar(element, options);
      element.data('fullCalendar', calendar);
      calendar.render();
    }
  });

  return res;
};


var complexOptions = [ // names of options that are objects whose properties should be combined
  'header',
  'buttonText',
  'buttonIcons',
  'themeButtonIcons'
];


// Merges an array of option objects into a single object
function mergeOptions(optionObjs) {
  return mergeProps(optionObjs, complexOptions);
}


// Given options specified for the calendar's constructor, massages any legacy options into a non-legacy form.
// Converts View-Option-Hashes into the View-Specific-Options format.
function massageOverrides(input) {
  var overrides = { views: input.views || {} }; // the output. ensure a `views` hash
  var subObj;

  // iterate through all option override properties (except `views`)
  $.each(input, function(name, val) {
    if (name != 'views') {

      // could the value be a legacy View-Option-Hash?
      if (
        $.isPlainObject(val) &&
        !/(time|duration|interval)$/i.test(name) && // exclude duration options. might be given as objects
        $.inArray(name, complexOptions) == -1 // complex options aren't allowed to be View-Option-Hashes
      ) {
        subObj = null;

        // iterate through the properties of this possible View-Option-Hash value
        $.each(val, function(subName, subVal) {

          // is the property targeting a view?
          if (/^(month|week|day|default|basic(Week|Day)?|agenda(Week|Day)?)$/.test(subName)) {
            if (!overrides.views[subName]) { // ensure the view-target entry exists
              overrides.views[subName] = {};
            }
            overrides.views[subName][name] = subVal; // record the value in the `views` object
          }
          else { // a non-View-Option-Hash property
            if (!subObj) {
              subObj = {};
            }
            subObj[subName] = subVal; // accumulate these unrelated values for later
          }
        });

        if (subObj) { // non-View-Option-Hash properties? transfer them as-is
          overrides[name] = subObj;
        }
      }
      else {
        overrides[name] = val; // transfer normal options as-is
      }
    }
  });

  return overrides;
}

;;

// exports
fc.intersectionToSeg = intersectionToSeg;
fc.applyAll = applyAll;
fc.debounce = debounce;
fc.isInt = isInt;
fc.htmlEscape = htmlEscape;
fc.cssToStr = cssToStr;
fc.proxy = proxy;
fc.capitaliseFirstLetter = capitaliseFirstLetter;


/* FullCalendar-specific DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
// and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
function compensateScroll(rowEls, scrollbarWidths) {
  if (scrollbarWidths.left) {
    rowEls.css({
      'border-left-width': 1,
      'margin-left': scrollbarWidths.left - 1
    });
  }
  if (scrollbarWidths.right) {
    rowEls.css({
      'border-right-width': 1,
      'margin-right': scrollbarWidths.right - 1
    });
  }
}


// Undoes compensateScroll and restores all borders/margins
function uncompensateScroll(rowEls) {
  rowEls.css({
    'margin-left': '',
    'margin-right': '',
    'border-left-width': '',
    'border-right-width': ''
  });
}


// Make the mouse cursor express that an event is not allowed in the current area
function disableCursor() {
  $('body').addClass('fc-not-allowed');
}


// Returns the mouse cursor to its original look
function enableCursor() {
  $('body').removeClass('fc-not-allowed');
}


// Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
// By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
// any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and
// reduces the available height.
function distributeHeight(els, availableHeight, shouldRedistribute) {

  // *FLOORING NOTE*: we floor in certain places because zoom can give inaccurate floating-point dimensions,
  // and it is better to be shorter than taller, to avoid creating unnecessary scrollbars.

  var minOffset1 = Math.floor(availableHeight / els.length); // for non-last element
  var minOffset2 = Math.floor(availableHeight - minOffset1 * (els.length - 1)); // for last element *FLOORING NOTE*
  var flexEls = []; // elements that are allowed to expand. array of DOM nodes
  var flexOffsets = []; // amount of vertical space it takes up
  var flexHeights = []; // actual css height
  var usedHeight = 0;

  undistributeHeight(els); // give all elements their natural height

  // find elements that are below the recommended height (expandable).
  // important to query for heights in a single first pass (to avoid reflow oscillation).
  els.each(function(i, el) {
    var minOffset = i === els.length - 1 ? minOffset2 : minOffset1;
    var naturalOffset = $(el).outerHeight(true);

    if (naturalOffset < minOffset) {
      flexEls.push(el);
      flexOffsets.push(naturalOffset);
      flexHeights.push($(el).height());
    }
    else {
      // this element stretches past recommended height (non-expandable). mark the space as occupied.
      usedHeight += naturalOffset;
    }
  });

  // readjust the recommended height to only consider the height available to non-maxed-out rows.
  if (shouldRedistribute) {
    availableHeight -= usedHeight;
    minOffset1 = Math.floor(availableHeight / flexEls.length);
    minOffset2 = Math.floor(availableHeight - minOffset1 * (flexEls.length - 1)); // *FLOORING NOTE*
  }

  // assign heights to all expandable elements
  $(flexEls).each(function(i, el) {
    var minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1;
    var naturalOffset = flexOffsets[i];
    var naturalHeight = flexHeights[i];
    var newHeight = minOffset - (naturalOffset - naturalHeight); // subtract the margin/padding

    if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
      $(el).height(newHeight);
    }
  });
}


// Undoes distrubuteHeight, restoring all els to their natural height
function undistributeHeight(els) {
  els.height('');
}


// Given `els`, a jQuery set of <td> cells, find the cell with the largest natural width and set the widths of all the
// cells to be that width.
// PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
function matchCellWidths(els) {
  var maxInnerWidth = 0;

  els.find('> *').each(function(i, innerEl) {
    var innerWidth = $(innerEl).outerWidth();
    if (innerWidth > maxInnerWidth) {
      maxInnerWidth = innerWidth;
    }
  });

  maxInnerWidth++; // sometimes not accurate of width the text needs to stay on one line. insurance

  els.width(maxInnerWidth);

  return maxInnerWidth;
}


// Turns a container element into a scroller if its contents is taller than the allotted height.
// Returns true if the element is now a scroller, false otherwise.
// NOTE: this method is best because it takes weird zooming dimensions into account
function setPotentialScroller(containerEl, height) {
  containerEl.height(height).addClass('fc-scroller');

  // are scrollbars needed?
  if (containerEl[0].scrollHeight - 1 > containerEl[0].clientHeight) { // !!! -1 because IE is often off-by-one :(
    return true;
  }

  unsetScroller(containerEl); // undo
  return false;
}


// Takes an element that might have been a scroller, and turns it back into a normal element.
function unsetScroller(containerEl) {
  containerEl.height('').removeClass('fc-scroller');
}


/* General DOM Utilities
----------------------------------------------------------------------------------------------------------------------*/

fc.getClientRect = getClientRect;
fc.getContentRect = getContentRect;
fc.getScrollbarWidths = getScrollbarWidths;


// borrowed from https://github.com/jquery/jquery-ui/blob/1.11.0/ui/core.js#L51
function getScrollParent(el) {
  var position = el.css('position'),
    scrollParent = el.parents().filter(function() {
      var parent = $(this);
      return (/(auto|scroll)/).test(
        parent.css('overflow') + parent.css('overflow-y') + parent.css('overflow-x')
      );
    }).eq(0);

  return position === 'fixed' || !scrollParent.length ? $(el[0].ownerDocument || document) : scrollParent;
}


// Queries the outer bounding area of a jQuery element.
// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
function getOuterRect(el) {
  var offset = el.offset();

  return {
    left: offset.left,
    right: offset.left + el.outerWidth(),
    top: offset.top,
    bottom: offset.top + el.outerHeight()
  };
}


// Queries the area within the margin/border/scrollbars of a jQuery element. Does not go within the padding.
// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
// NOTE: should use clientLeft/clientTop, but very unreliable cross-browser.
function getClientRect(el) {
  var offset = el.offset();
  var scrollbarWidths = getScrollbarWidths(el);
  var left = offset.left + getCssFloat(el, 'border-left-width') + scrollbarWidths.left;
  var top = offset.top + getCssFloat(el, 'border-top-width') + scrollbarWidths.top;

  return {
    left: left,
    right: left + el[0].clientWidth, // clientWidth includes padding but NOT scrollbars
    top: top,
    bottom: top + el[0].clientHeight // clientHeight includes padding but NOT scrollbars
  };
}


// Queries the area within the margin/border/padding of a jQuery element. Assumed not to have scrollbars.
// Returns a rectangle with absolute coordinates: left, right (exclusive), top, bottom (exclusive).
function getContentRect(el) {
  var offset = el.offset(); // just outside of border, margin not included
  var left = offset.left + getCssFloat(el, 'border-left-width') + getCssFloat(el, 'padding-left');
  var top = offset.top + getCssFloat(el, 'border-top-width') + getCssFloat(el, 'padding-top');

  return {
    left: left,
    right: left + el.width(),
    top: top,
    bottom: top + el.height()
  };
}


// Returns the computed left/right/top/bottom scrollbar widths for the given jQuery element.
// NOTE: should use clientLeft/clientTop, but very unreliable cross-browser.
function getScrollbarWidths(el) {
  var leftRightWidth = el.innerWidth() - el[0].clientWidth; // the paddings cancel out, leaving the scrollbars
  var widths = {
    left: 0,
    right: 0,
    top: 0,
    bottom: el.innerHeight() - el[0].clientHeight // the paddings cancel out, leaving the bottom scrollbar
  };

  if (getIsLeftRtlScrollbars() && el.css('direction') == 'rtl') { // is the scrollbar on the left side?
    widths.left = leftRightWidth;
  }
  else {
    widths.right = leftRightWidth;
  }

  return widths;
}


// Logic for determining if, when the element is right-to-left, the scrollbar appears on the left side

var _isLeftRtlScrollbars = null;

function getIsLeftRtlScrollbars() { // responsible for caching the computation
  if (_isLeftRtlScrollbars === null) {
    _isLeftRtlScrollbars = computeIsLeftRtlScrollbars();
  }
  return _isLeftRtlScrollbars;
}

function computeIsLeftRtlScrollbars() { // creates an offscreen test element, then removes it
  var el = $('<div><div/></div>')
    .css({
      position: 'absolute',
      top: -1000,
      left: 0,
      border: 0,
      padding: 0,
      overflow: 'scroll',
      direction: 'rtl'
    })
    .appendTo('body');
  var innerEl = el.children();
  var res = innerEl.offset().left > el.offset().left; // is the inner div shifted to accommodate a left scrollbar?
  el.remove();
  return res;
}


// Retrieves a jQuery element's computed CSS value as a floating-point number.
// If the queried value is non-numeric (ex: IE can return "medium" for border width), will just return zero.
function getCssFloat(el, prop) {
  return parseFloat(el.css(prop)) || 0;
}


// Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
function isPrimaryMouseButton(ev) {
  return ev.which == 1 && !ev.ctrlKey;
}


/* Geometry
----------------------------------------------------------------------------------------------------------------------*/


// Returns a new rectangle that is the intersection of the two rectangles. If they don't intersect, returns false
function intersectRects(rect1, rect2) {
  var res = {
    left: Math.max(rect1.left, rect2.left),
    right: Math.min(rect1.right, rect2.right),
    top: Math.max(rect1.top, rect2.top),
    bottom: Math.min(rect1.bottom, rect2.bottom)
  };

  if (res.left < res.right && res.top < res.bottom) {
    return res;
  }
  return false;
}


// Returns a new point that will have been moved to reside within the given rectangle
function constrainPoint(point, rect) {
  return {
    left: Math.min(Math.max(point.left, rect.left), rect.right),
    top: Math.min(Math.max(point.top, rect.top), rect.bottom)
  };
}


// Returns a point that is the center of the given rectangle
function getRectCenter(rect) {
  return {
    left: (rect.left + rect.right) / 2,
    top: (rect.top + rect.bottom) / 2
  };
}


// Subtracts point2's coordinates from point1's coordinates, returning a delta
function diffPoints(point1, point2) {
  return {
    left: point1.left - point2.left,
    top: point1.top - point2.top
  };
}


/* FullCalendar-specific Misc Utilities
----------------------------------------------------------------------------------------------------------------------*/


// Creates a basic segment with the intersection of the two ranges. Returns undefined if no intersection.
// Expects all dates to be normalized to the same timezone beforehand.
// TODO: move to date section?
function intersectionToSeg(subjectRange, constraintRange) {
  var subjectStart = subjectRange.start;
  var subjectEnd = subjectRange.end;
  var constraintStart = constraintRange.start;
  var constraintEnd = constraintRange.end;
  var segStart, segEnd;
  var isStart, isEnd;

  if (subjectEnd > constraintStart && subjectStart < constraintEnd) { // in bounds at all?

    if (subjectStart >= constraintStart) {
      segStart = subjectStart.clone();
      isStart = true;
    }
    else {
      segStart = constraintStart.clone();
      isStart =  false;
    }

    if (subjectEnd <= constraintEnd) {
      segEnd = subjectEnd.clone();
      isEnd = true;
    }
    else {
      segEnd = constraintEnd.clone();
      isEnd = false;
    }

    return {
      start: segStart,
      end: segEnd,
      isStart: isStart,
      isEnd: isEnd
    };
  }
}


/* Date Utilities
----------------------------------------------------------------------------------------------------------------------*/

fc.computeIntervalUnit = computeIntervalUnit;
fc.durationHasTime = durationHasTime;

var dayIDs = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
var intervalUnits = [ 'year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond' ];


// Diffs the two moments into a Duration where full-days are recorded first, then the remaining time.
// Moments will have their timezones normalized.
function diffDayTime(a, b) {
  return moment.duration({
    days: a.clone().stripTime().diff(b.clone().stripTime(), 'days'),
    ms: a.time() - b.time() // time-of-day from day start. disregards timezone
  });
}


// Diffs the two moments via their start-of-day (regardless of timezone). Produces whole-day durations.
function diffDay(a, b) {
  return moment.duration({
    days: a.clone().stripTime().diff(b.clone().stripTime(), 'days')
  });
}


// Diffs two moments, producing a duration, made of a whole-unit-increment of the given unit. Uses rounding.
function diffByUnit(a, b, unit) {
  return moment.duration(
    Math.round(a.diff(b, unit, true)), // returnFloat=true
    unit
  );
}


// Computes the unit name of the largest whole-unit period of time.
// For example, 48 hours will be "days" whereas 49 hours will be "hours".
// Accepts start/end, a range object, or an original duration object.
function computeIntervalUnit(start, end) {
  var i, unit;
  var val;

  for (i = 0; i < intervalUnits.length; i++) {
    unit = intervalUnits[i];
    val = computeRangeAs(unit, start, end);

    if (val >= 1 && isInt(val)) {
      break;
    }
  }

  return unit; // will be "milliseconds" if nothing else matches
}


// Computes the number of units (like "hours") in the given range.
// Range can be a {start,end} object, separate start/end args, or a Duration.
// Results are based on Moment's .as() and .diff() methods, so results can depend on internal handling
// of month-diffing logic (which tends to vary from version to version).
function computeRangeAs(unit, start, end) {

  if (end != null) { // given start, end
    return end.diff(start, unit, true);
  }
  else if (moment.isDuration(start)) { // given duration
    return start.as(unit);
  }
  else { // given { start, end } range object
    return start.end.diff(start.start, unit, true);
  }
}


// Returns a boolean about whether the given duration has any time parts (hours/minutes/seconds/ms)
function durationHasTime(dur) {
  return Boolean(dur.hours() || dur.minutes() || dur.seconds() || dur.milliseconds());
}


function isNativeDate(input) {
  return  Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date;
}


// Returns a boolean about whether the given input is a time string, like "06:40:00" or "06:00"
function isTimeString(str) {
  return /^\d+\:\d+(?:\:\d+\.?(?:\d{3})?)?$/.test(str);
}


/* General Utilities
----------------------------------------------------------------------------------------------------------------------*/

var hasOwnPropMethod = {}.hasOwnProperty;


// Merges an array of objects into a single object.
// The second argument allows for an array of property names who's object values will be merged together.
function mergeProps(propObjs, complexProps) {
  var dest = {};
  var i, name;
  var complexObjs;
  var j, val;
  var props;

  if (complexProps) {
    for (i = 0; i < complexProps.length; i++) {
      name = complexProps[i];
      complexObjs = [];

      // collect the trailing object values, stopping when a non-object is discovered
      for (j = propObjs.length - 1; j >= 0; j--) {
        val = propObjs[j][name];

        if (typeof val === 'object') {
          complexObjs.unshift(val);
        }
        else if (val !== undefined) {
          dest[name] = val; // if there were no objects, this value will be used
          break;
        }
      }

      // if the trailing values were objects, use the merged value
      if (complexObjs.length) {
        dest[name] = mergeProps(complexObjs);
      }
    }
  }

  // copy values into the destination, going from last to first
  for (i = propObjs.length - 1; i >= 0; i--) {
    props = propObjs[i];

    for (name in props) {
      if (!(name in dest)) { // if already assigned by previous props or complex props, don't reassign
        dest[name] = props[name];
      }
    }
  }

  return dest;
}


// Create an object that has the given prototype. Just like Object.create
function createObject(proto) {
  var f = function() {};
  f.prototype = proto;
  return new f();
}


function copyOwnProps(src, dest) {
  for (var name in src) {
    if (hasOwnProp(src, name)) {
      dest[name] = src[name];
    }
  }
}


// Copies over certain methods with the same names as Object.prototype methods. Overcomes an IE<=8 bug:
// https://developer.mozilla.org/en-US/docs/ECMAScript_DontEnum_attribute#JScript_DontEnum_Bug
function copyNativeMethods(src, dest) {
  var names = [ 'constructor', 'toString', 'valueOf' ];
  var i, name;

  for (i = 0; i < names.length; i++) {
    name = names[i];

    if (src[name] !== Object.prototype[name]) {
      dest[name] = src[name];
    }
  }
}


function hasOwnProp(obj, name) {
  return hasOwnPropMethod.call(obj, name);
}


// Is the given value a non-object non-function value?
function isAtomic(val) {
  return /undefined|null|boolean|number|string/.test($.type(val));
}


function applyAll(functions, thisObj, args) {
  if ($.isFunction(functions)) {
    functions = [ functions ];
  }
  if (functions) {
    var i;
    var ret;
    for (i=0; i<functions.length; i++) {
      ret = functions[i].apply(thisObj, args) || ret;
    }
    return ret;
  }
}


function firstDefined() {
  for (var i=0; i<arguments.length; i++) {
    if (arguments[i] !== undefined) {
      return arguments[i];
    }
  }
}


function htmlEscape(s) {
  return (s + '').replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#039;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br />');
}


function stripHtmlEntities(text) {
  return text.replace(/&.*?;/g, '');
}


// Given a hash of CSS properties, returns a string of CSS.
// Uses property names as-is (no camel-case conversion). Will not make statements for null/undefined values.
function cssToStr(cssProps) {
  var statements = [];

  $.each(cssProps, function(name, val) {
    if (val != null) {
      statements.push(name + ':' + val);
    }
  });

  return statements.join(';');
}


function capitaliseFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function compareNumbers(a, b) { // for .sort()
  return a - b;
}


function isInt(n) {
  return n % 1 === 0;
}


// Returns a method bound to the given object context.
// Just like one of the jQuery.proxy signatures, but without the undesired behavior of treating the same method with
// different contexts as identical when binding/unbinding events.
function proxy(obj, methodName) {
  var method = obj[methodName];

  return function() {
    return method.apply(obj, arguments);
  };
}


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.
// https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
function debounce(func, wait) {
  var timeoutId;
  var args;
  var context;
  var timestamp; // of most recent call
  var later = function() {
    var last = +new Date() - timestamp;
    if (last < wait && last > 0) {
      timeoutId = setTimeout(later, wait - last);
    }
    else {
      timeoutId = null;
      func.apply(context, args);
      if (!timeoutId) {
        context = args = null;
      }
    }
  };

  return function() {
    context = this;
    args = arguments;
    timestamp = +new Date();
    if (!timeoutId) {
      timeoutId = setTimeout(later, wait);
    }
  };
}

;;

var ambigDateOfMonthRegex = /^\s*\d{4}-\d\d$/;
var ambigTimeOrZoneRegex =
  /^\s*\d{4}-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?)?$/;
var newMomentProto = moment.fn; // where we will attach our new methods
var oldMomentProto = $.extend({}, newMomentProto); // copy of original moment methods
var allowValueOptimization;
var setUTCValues; // function defined below
var setLocalValues; // function defined below


// Creating
// -------------------------------------------------------------------------------------------------

// Creates a new moment, similar to the vanilla moment(...) constructor, but with
// extra features (ambiguous time, enhanced formatting). When given an existing moment,
// it will function as a clone (and retain the zone of the moment). Anything else will
// result in a moment in the local zone.
fc.moment = function() {
  return makeMoment(arguments);
};

// Sames as fc.moment, but forces the resulting moment to be in the UTC timezone.
fc.moment.utc = function() {
  var mom = makeMoment(arguments, true);

  // Force it into UTC because makeMoment doesn't guarantee it
  // (if given a pre-existing moment for example)
  if (mom.hasTime()) { // don't give ambiguously-timed moments a UTC zone
    mom.utc();
  }

  return mom;
};

// Same as fc.moment, but when given an ISO8601 string, the timezone offset is preserved.
// ISO8601 strings with no timezone offset will become ambiguously zoned.
fc.moment.parseZone = function() {
  return makeMoment(arguments, true, true);
};

// Builds an enhanced moment from args. When given an existing moment, it clones. When given a
// native Date, or called with no arguments (the current time), the resulting moment will be local.
// Anything else needs to be "parsed" (a string or an array), and will be affected by:
//    parseAsUTC - if there is no zone information, should we parse the input in UTC?
//    parseZone - if there is zone information, should we force the zone of the moment?
function makeMoment(args, parseAsUTC, parseZone) {
  var input = args[0];
  var isSingleString = args.length == 1 && typeof input === 'string';
  var isAmbigTime;
  var isAmbigZone;
  var ambigMatch;
  var mom;

  if (moment.isMoment(input)) {
    mom = moment.apply(null, args); // clone it
    transferAmbigs(input, mom); // the ambig flags weren't transfered with the clone
  }
  else if (isNativeDate(input) || input === undefined) {
    mom = moment.apply(null, args); // will be local
  }
  else { // "parsing" is required
    isAmbigTime = false;
    isAmbigZone = false;

    if (isSingleString) {
      if (ambigDateOfMonthRegex.test(input)) {
        // accept strings like '2014-05', but convert to the first of the month
        input += '-01';
        args = [ input ]; // for when we pass it on to moment's constructor
        isAmbigTime = true;
        isAmbigZone = true;
      }
      else if ((ambigMatch = ambigTimeOrZoneRegex.exec(input))) {
        isAmbigTime = !ambigMatch[5]; // no time part?
        isAmbigZone = true;
      }
    }
    else if ($.isArray(input)) {
      // arrays have no timezone information, so assume ambiguous zone
      isAmbigZone = true;
    }
    // otherwise, probably a string with a format

    if (parseAsUTC || isAmbigTime) {
      mom = moment.utc.apply(moment, args);
    }
    else {
      mom = moment.apply(null, args);
    }

    if (isAmbigTime) {
      mom._ambigTime = true;
      mom._ambigZone = true; // ambiguous time always means ambiguous zone
    }
    else if (parseZone) { // let's record the inputted zone somehow
      if (isAmbigZone) {
        mom._ambigZone = true;
      }
      else if (isSingleString) {
        if (mom.utcOffset) {
          mom.utcOffset(input); // if not a valid zone, will assign UTC
        }
        else {
          mom.zone(input); // for moment-pre-2.9
        }
      }
    }
  }

  mom._fullCalendar = true; // flag for extended functionality

  return mom;
}


// A clone method that works with the flags related to our enhanced functionality.
// In the future, use moment.momentProperties
newMomentProto.clone = function() {
  var mom = oldMomentProto.clone.apply(this, arguments);

  // these flags weren't transfered with the clone
  transferAmbigs(this, mom);
  if (this._fullCalendar) {
    mom._fullCalendar = true;
  }

  return mom;
};


// Week Number
// -------------------------------------------------------------------------------------------------


// Returns the week number, considering the locale's custom week number calcuation
// `weeks` is an alias for `week`
newMomentProto.week = newMomentProto.weeks = function(input) {
  var weekCalc = (this._locale || this._lang) // works pre-moment-2.8
    ._fullCalendar_weekCalc;

  if (input == null && typeof weekCalc === 'function') { // custom function only works for getter
    return weekCalc(this);
  }
  else if (weekCalc === 'ISO') {
    return oldMomentProto.isoWeek.apply(this, arguments); // ISO getter/setter
  }

  return oldMomentProto.week.apply(this, arguments); // local getter/setter
};


// Time-of-day
// -------------------------------------------------------------------------------------------------

// GETTER
// Returns a Duration with the hours/minutes/seconds/ms values of the moment.
// If the moment has an ambiguous time, a duration of 00:00 will be returned.
//
// SETTER
// You can supply a Duration, a Moment, or a Duration-like argument.
// When setting the time, and the moment has an ambiguous time, it then becomes unambiguous.
newMomentProto.time = function(time) {

  // Fallback to the original method (if there is one) if this moment wasn't created via FullCalendar.
  // `time` is a generic enough method name where this precaution is necessary to avoid collisions w/ other plugins.
  if (!this._fullCalendar) {
    return oldMomentProto.time.apply(this, arguments);
  }

  if (time == null) { // getter
    return moment.duration({
      hours: this.hours(),
      minutes: this.minutes(),
      seconds: this.seconds(),
      milliseconds: this.milliseconds()
    });
  }
  else { // setter

    this._ambigTime = false; // mark that the moment now has a time

    if (!moment.isDuration(time) && !moment.isMoment(time)) {
      time = moment.duration(time);
    }

    // The day value should cause overflow (so 24 hours becomes 00:00:00 of next day).
    // Only for Duration times, not Moment times.
    var dayHours = 0;
    if (moment.isDuration(time)) {
      dayHours = Math.floor(time.asDays()) * 24;
    }

    // We need to set the individual fields.
    // Can't use startOf('day') then add duration. In case of DST at start of day.
    return this.hours(dayHours + time.hours())
      .minutes(time.minutes())
      .seconds(time.seconds())
      .milliseconds(time.milliseconds());
  }
};

// Converts the moment to UTC, stripping out its time-of-day and timezone offset,
// but preserving its YMD. A moment with a stripped time will display no time
// nor timezone offset when .format() is called.
newMomentProto.stripTime = function() {
  var a;

  if (!this._ambigTime) {

    // get the values before any conversion happens
    a = this.toArray(); // array of y/m/d/h/m/s/ms

    // TODO: use keepLocalTime in the future
    this.utc(); // set the internal UTC flag (will clear the ambig flags)
    setUTCValues(this, a.slice(0, 3)); // set the year/month/date. time will be zero

    // Mark the time as ambiguous. This needs to happen after the .utc() call, which might call .utcOffset(),
    // which clears all ambig flags. Same with setUTCValues with moment-timezone.
    this._ambigTime = true;
    this._ambigZone = true; // if ambiguous time, also ambiguous timezone offset
  }

  return this; // for chaining
};

// Returns if the moment has a non-ambiguous time (boolean)
newMomentProto.hasTime = function() {
  return !this._ambigTime;
};


// Timezone
// -------------------------------------------------------------------------------------------------

// Converts the moment to UTC, stripping out its timezone offset, but preserving its
// YMD and time-of-day. A moment with a stripped timezone offset will display no
// timezone offset when .format() is called.
// TODO: look into Moment's keepLocalTime functionality
newMomentProto.stripZone = function() {
  var a, wasAmbigTime;

  if (!this._ambigZone) {

    // get the values before any conversion happens
    a = this.toArray(); // array of y/m/d/h/m/s/ms
    wasAmbigTime = this._ambigTime;

    this.utc(); // set the internal UTC flag (might clear the ambig flags, depending on Moment internals)
    setUTCValues(this, a); // will set the year/month/date/hours/minutes/seconds/ms

    // the above call to .utc()/.utcOffset() unfortunately might clear the ambig flags, so restore
    this._ambigTime = wasAmbigTime || false;

    // Mark the zone as ambiguous. This needs to happen after the .utc() call, which might call .utcOffset(),
    // which clears the ambig flags. Same with setUTCValues with moment-timezone.
    this._ambigZone = true;
  }

  return this; // for chaining
};

// Returns of the moment has a non-ambiguous timezone offset (boolean)
newMomentProto.hasZone = function() {
  return !this._ambigZone;
};


// this method implicitly marks a zone
newMomentProto.local = function() {
  var a = this.toArray(); // year,month,date,hours,minutes,seconds,ms as an array
  var wasAmbigZone = this._ambigZone;

  oldMomentProto.local.apply(this, arguments);

  // ensure non-ambiguous
  // this probably already happened via local() -> utcOffset(), but don't rely on Moment's internals
  this._ambigTime = false;
  this._ambigZone = false;

  if (wasAmbigZone) {
    // If the moment was ambiguously zoned, the date fields were stored as UTC.
    // We want to preserve these, but in local time.
    // TODO: look into Moment's keepLocalTime functionality
    setLocalValues(this, a);
  }

  return this; // for chaining
};


// implicitly marks a zone
newMomentProto.utc = function() {
  oldMomentProto.utc.apply(this, arguments);

  // ensure non-ambiguous
  // this probably already happened via utc() -> utcOffset(), but don't rely on Moment's internals
  this._ambigTime = false;
  this._ambigZone = false;

  return this;
};


// methods for arbitrarily manipulating timezone offset.
// should clear time/zone ambiguity when called.
$.each([
  'zone', // only in moment-pre-2.9. deprecated afterwards
  'utcOffset'
], function(i, name) {
  if (oldMomentProto[name]) { // original method exists?

    // this method implicitly marks a zone (will probably get called upon .utc() and .local())
    newMomentProto[name] = function(tzo) {

      if (tzo != null) { // setter
        // these assignments needs to happen before the original zone method is called.
        // I forget why, something to do with a browser crash.
        this._ambigTime = false;
        this._ambigZone = false;
      }

      return oldMomentProto[name].apply(this, arguments);
    };
  }
});


// Formatting
// -------------------------------------------------------------------------------------------------

newMomentProto.format = function() {
  if (this._fullCalendar && arguments[0]) { // an enhanced moment? and a format string provided?
    return formatDate(this, arguments[0]); // our extended formatting
  }
  if (this._ambigTime) {
    return oldMomentFormat(this, 'YYYY-MM-DD');
  }
  if (this._ambigZone) {
    return oldMomentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
  }
  return oldMomentProto.format.apply(this, arguments);
};

newMomentProto.toISOString = function() {
  if (this._ambigTime) {
    return oldMomentFormat(this, 'YYYY-MM-DD');
  }
  if (this._ambigZone) {
    return oldMomentFormat(this, 'YYYY-MM-DD[T]HH:mm:ss');
  }
  return oldMomentProto.toISOString.apply(this, arguments);
};


// Querying
// -------------------------------------------------------------------------------------------------

// Is the moment within the specified range? `end` is exclusive.
// FYI, this method is not a standard Moment method, so always do our enhanced logic.
newMomentProto.isWithin = function(start, end) {
  var a = commonlyAmbiguate([ this, start, end ]);
  return a[0] >= a[1] && a[0] < a[2];
};

// When isSame is called with units, timezone ambiguity is normalized before the comparison happens.
// If no units specified, the two moments must be identically the same, with matching ambig flags.
newMomentProto.isSame = function(input, units) {
  var a;

  // only do custom logic if this is an enhanced moment
  if (!this._fullCalendar) {
    return oldMomentProto.isSame.apply(this, arguments);
  }

  if (units) {
    a = commonlyAmbiguate([ this, input ], true); // normalize timezones but don't erase times
    return oldMomentProto.isSame.call(a[0], a[1], units);
  }
  else {
    input = fc.moment.parseZone(input); // normalize input
    return oldMomentProto.isSame.call(this, input) &&
      Boolean(this._ambigTime) === Boolean(input._ambigTime) &&
      Boolean(this._ambigZone) === Boolean(input._ambigZone);
  }
};

// Make these query methods work with ambiguous moments
$.each([
  'isBefore',
  'isAfter'
], function(i, methodName) {
  newMomentProto[methodName] = function(input, units) {
    var a;

    // only do custom logic if this is an enhanced moment
    if (!this._fullCalendar) {
      return oldMomentProto[methodName].apply(this, arguments);
    }

    a = commonlyAmbiguate([ this, input ]);
    return oldMomentProto[methodName].call(a[0], a[1], units);
  };
});


// Misc Internals
// -------------------------------------------------------------------------------------------------

// given an array of moment-like inputs, return a parallel array w/ moments similarly ambiguated.
// for example, of one moment has ambig time, but not others, all moments will have their time stripped.
// set `preserveTime` to `true` to keep times, but only normalize zone ambiguity.
// returns the original moments if no modifications are necessary.
function commonlyAmbiguate(inputs, preserveTime) {
  var anyAmbigTime = false;
  var anyAmbigZone = false;
  var len = inputs.length;
  var moms = [];
  var i, mom;

  // parse inputs into real moments and query their ambig flags
  for (i = 0; i < len; i++) {
    mom = inputs[i];
    if (!moment.isMoment(mom)) {
      mom = fc.moment.parseZone(mom);
    }
    anyAmbigTime = anyAmbigTime || mom._ambigTime;
    anyAmbigZone = anyAmbigZone || mom._ambigZone;
    moms.push(mom);
  }

  // strip each moment down to lowest common ambiguity
  // use clones to avoid modifying the original moments
  for (i = 0; i < len; i++) {
    mom = moms[i];
    if (!preserveTime && anyAmbigTime && !mom._ambigTime) {
      moms[i] = mom.clone().stripTime();
    }
    else if (anyAmbigZone && !mom._ambigZone) {
      moms[i] = mom.clone().stripZone();
    }
  }

  return moms;
}

// Transfers all the flags related to ambiguous time/zone from the `src` moment to the `dest` moment
// TODO: look into moment.momentProperties for this.
function transferAmbigs(src, dest) {
  if (src._ambigTime) {
    dest._ambigTime = true;
  }
  else if (dest._ambigTime) {
    dest._ambigTime = false;
  }

  if (src._ambigZone) {
    dest._ambigZone = true;
  }
  else if (dest._ambigZone) {
    dest._ambigZone = false;
  }
}


// Sets the year/month/date/etc values of the moment from the given array.
// Inefficient because it calls each individual setter.
function setMomentValues(mom, a) {
  mom.year(a[0] || 0)
    .month(a[1] || 0)
    .date(a[2] || 0)
    .hours(a[3] || 0)
    .minutes(a[4] || 0)
    .seconds(a[5] || 0)
    .milliseconds(a[6] || 0);
}

// Can we set the moment's internal date directly?
allowValueOptimization = '_d' in moment() && 'updateOffset' in moment;

// Utility function. Accepts a moment and an array of the UTC year/month/date/etc values to set.
// Assumes the given moment is already in UTC mode.
setUTCValues = allowValueOptimization ? function(mom, a) {
  // simlate what moment's accessors do
  mom._d.setTime(Date.UTC.apply(Date, a));
  moment.updateOffset(mom, false); // keepTime=false
} : setMomentValues;

// Utility function. Accepts a moment and an array of the local year/month/date/etc values to set.
// Assumes the given moment is already in local mode.
setLocalValues = allowValueOptimization ? function(mom, a) {
  // simlate what moment's accessors do
  mom._d.setTime(+new Date( // FYI, there is now way to apply an array of args to a constructor
    a[0] || 0,
    a[1] || 0,
    a[2] || 0,
    a[3] || 0,
    a[4] || 0,
    a[5] || 0,
    a[6] || 0
  ));
  moment.updateOffset(mom, false); // keepTime=false
} : setMomentValues;

;;

// Single Date Formatting
// -------------------------------------------------------------------------------------------------


// call this if you want Moment's original format method to be used
function oldMomentFormat(mom, formatStr) {
  return oldMomentProto.format.call(mom, formatStr); // oldMomentProto defined in moment-ext.js
}


// Formats `date` with a Moment formatting string, but allow our non-zero areas and
// additional token.
function formatDate(date, formatStr) {
  return formatDateWithChunks(date, getFormatStringChunks(formatStr));
}


function formatDateWithChunks(date, chunks) {
  var s = '';
  var i;

  for (i=0; i<chunks.length; i++) {
    s += formatDateWithChunk(date, chunks[i]);
  }

  return s;
}


// addition formatting tokens we want recognized
var tokenOverrides = {
  t: function(date) { // "a" or "p"
    return oldMomentFormat(date, 'a').charAt(0);
  },
  T: function(date) { // "A" or "P"
    return oldMomentFormat(date, 'A').charAt(0);
  }
};


function formatDateWithChunk(date, chunk) {
  var token;
  var maybeStr;

  if (typeof chunk === 'string') { // a literal string
    return chunk;
  }
  else if ((token = chunk.token)) { // a token, like "YYYY"
    if (tokenOverrides[token]) {
      return tokenOverrides[token](date); // use our custom token
    }
    return oldMomentFormat(date, token);
  }
  else if (chunk.maybe) { // a grouping of other chunks that must be non-zero
    maybeStr = formatDateWithChunks(date, chunk.maybe);
    if (maybeStr.match(/[1-9]/)) {
      return maybeStr;
    }
  }

  return '';
}


// Date Range Formatting
// -------------------------------------------------------------------------------------------------
// TODO: make it work with timezone offset

// Using a formatting string meant for a single date, generate a range string, like
// "Sep 2 - 9 2013", that intelligently inserts a separator where the dates differ.
// If the dates are the same as far as the format string is concerned, just return a single
// rendering of one date, without any separator.
function formatRange(date1, date2, formatStr, separator, isRTL) {
  var localeData;

  date1 = fc.moment.parseZone(date1);
  date2 = fc.moment.parseZone(date2);

  localeData = (date1.localeData || date1.lang).call(date1); // works with moment-pre-2.8

  // Expand localized format strings, like "LL" -> "MMMM D YYYY"
  formatStr = localeData.longDateFormat(formatStr) || formatStr;
  // BTW, this is not important for `formatDate` because it is impossible to put custom tokens
  // or non-zero areas in Moment's localized format strings.

  separator = separator || ' - ';

  return formatRangeWithChunks(
    date1,
    date2,
    getFormatStringChunks(formatStr),
    separator,
    isRTL
  );
}
fc.formatRange = formatRange; // expose


function formatRangeWithChunks(date1, date2, chunks, separator, isRTL) {
  var chunkStr; // the rendering of the chunk
  var leftI;
  var leftStr = '';
  var rightI;
  var rightStr = '';
  var middleI;
  var middleStr1 = '';
  var middleStr2 = '';
  var middleStr = '';

  // Start at the leftmost side of the formatting string and continue until you hit a token
  // that is not the same between dates.
  for (leftI=0; leftI<chunks.length; leftI++) {
    chunkStr = formatSimilarChunk(date1, date2, chunks[leftI]);
    if (chunkStr === false) {
      break;
    }
    leftStr += chunkStr;
  }

  // Similarly, start at the rightmost side of the formatting string and move left
  for (rightI=chunks.length-1; rightI>leftI; rightI--) {
    chunkStr = formatSimilarChunk(date1, date2, chunks[rightI]);
    if (chunkStr === false) {
      break;
    }
    rightStr = chunkStr + rightStr;
  }

  // The area in the middle is different for both of the dates.
  // Collect them distinctly so we can jam them together later.
  for (middleI=leftI; middleI<=rightI; middleI++) {
    middleStr1 += formatDateWithChunk(date1, chunks[middleI]);
    middleStr2 += formatDateWithChunk(date2, chunks[middleI]);
  }

  if (middleStr1 || middleStr2) {
    if (isRTL) {
      middleStr = middleStr2 + separator + middleStr1;
    }
    else {
      middleStr = middleStr1 + separator + middleStr2;
    }
  }

  return leftStr + middleStr + rightStr;
}


var similarUnitMap = {
  Y: 'year',
  M: 'month',
  D: 'day', // day of month
  d: 'day', // day of week
  // prevents a separator between anything time-related...
  A: 'second', // AM/PM
  a: 'second', // am/pm
  T: 'second', // A/P
  t: 'second', // a/p
  H: 'second', // hour (24)
  h: 'second', // hour (12)
  m: 'second', // minute
  s: 'second' // second
};
// TODO: week maybe?


// Given a formatting chunk, and given that both dates are similar in the regard the
// formatting chunk is concerned, format date1 against `chunk`. Otherwise, return `false`.
function formatSimilarChunk(date1, date2, chunk) {
  var token;
  var unit;

  if (typeof chunk === 'string') { // a literal string
    return chunk;
  }
  else if ((token = chunk.token)) {
    unit = similarUnitMap[token.charAt(0)];
    // are the dates the same for this unit of measurement?
    if (unit && date1.isSame(date2, unit)) {
      return oldMomentFormat(date1, token); // would be the same if we used `date2`
      // BTW, don't support custom tokens
    }
  }

  return false; // the chunk is NOT the same for the two dates
  // BTW, don't support splitting on non-zero areas
}


// Chunking Utils
// -------------------------------------------------------------------------------------------------


var formatStringChunkCache = {};


function getFormatStringChunks(formatStr) {
  if (formatStr in formatStringChunkCache) {
    return formatStringChunkCache[formatStr];
  }
  return (formatStringChunkCache[formatStr] = chunkFormatString(formatStr));
}


// Break the formatting string into an array of chunks
function chunkFormatString(formatStr) {
  var chunks = [];
  var chunker = /\[([^\]]*)\]|\(([^\)]*)\)|(LTS|LT|(\w)\4*o?)|([^\w\[\(]+)/g; // TODO: more descrimination
  var match;

  while ((match = chunker.exec(formatStr))) {
    if (match[1]) { // a literal string inside [ ... ]
      chunks.push(match[1]);
    }
    else if (match[2]) { // non-zero formatting inside ( ... )
      chunks.push({ maybe: chunkFormatString(match[2]) });
    }
    else if (match[3]) { // a formatting token
      chunks.push({ token: match[3] });
    }
    else if (match[5]) { // an unenclosed literal string
      chunks.push(match[5]);
    }
  }

  return chunks;
}

;;

fc.Class = Class; // export

// class that all other classes will inherit from
function Class() { }

// called upon a class to create a subclass
Class.extend = function(members) {
  var superClass = this;
  var subClass;

  members = members || {};

  // ensure a constructor for the subclass, forwarding all arguments to the super-constructor if it doesn't exist
  if (hasOwnProp(members, 'constructor')) {
    subClass = members.constructor;
  }
  if (typeof subClass !== 'function') {
    subClass = members.constructor = function() {
      superClass.apply(this, arguments);
    };
  }

  // build the base prototype for the subclass, which is an new object chained to the superclass's prototype
  subClass.prototype = createObject(superClass.prototype);

  // copy each member variable/method onto the the subclass's prototype
  copyOwnProps(members, subClass.prototype);
  copyNativeMethods(members, subClass.prototype); // hack for IE8

  // copy over all class variables/methods to the subclass, such as `extend` and `mixin`
  copyOwnProps(superClass, subClass);

  return subClass;
};

// adds new member variables/methods to the class's prototype.
// can be called with another class, or a plain object hash containing new members.
Class.mixin = function(members) {
  copyOwnProps(members.prototype || members, this.prototype); // TODO: copyNativeMethods?
};
;;

/* A rectangular panel that is absolutely positioned over other content
------------------------------------------------------------------------------------------------------------------------
Options:
  - className (string)
  - content (HTML string or jQuery element set)
  - parentEl
  - top
  - left
  - right (the x coord of where the right edge should be. not a "CSS" right)
  - autoHide (boolean)
  - show (callback)
  - hide (callback)
*/

var Popover = Class.extend({

  isHidden: true,
  options: null,
  el: null, // the container element for the popover. generated by this object
  documentMousedownProxy: null, // document mousedown handler bound to `this`
  margin: 10, // the space required between the popover and the edges of the scroll container


  constructor: function(options) {
    this.options = options || {};
  },


  // Shows the popover on the specified position. Renders it if not already
  show: function() {
    if (this.isHidden) {
      if (!this.el) {
        this.render();
      }
      this.el.show();
      this.position();
      this.isHidden = false;
      this.trigger('show');
    }
  },


  // Hides the popover, through CSS, but does not remove it from the DOM
  hide: function() {
    if (!this.isHidden) {
      this.el.hide();
      this.isHidden = true;
      this.trigger('hide');
    }
  },


  // Creates `this.el` and renders content inside of it
  render: function() {
    var _this = this;
    var options = this.options;

    this.el = $('<div class="fc-popover"/>')
      .addClass(options.className || '')
      .css({
        // position initially to the top left to avoid creating scrollbars
        top: 0,
        left: 0
      })
      .append(options.content)
      .appendTo(options.parentEl);

    // when a click happens on anything inside with a 'fc-close' className, hide the popover
    this.el.on('click', '.fc-close', function() {
      _this.hide();
    });

    if (options.autoHide) {
      $(document).on('mousedown', this.documentMousedownProxy = proxy(this, 'documentMousedown'));
    }
  },


  // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
  documentMousedown: function(ev) {
    // only hide the popover if the click happened outside the popover
    if (this.el && !$(ev.target).closest(this.el).length) {
      this.hide();
    }
  },


  // Hides and unregisters any handlers
  removeElement: function() {
    this.hide();

    if (this.el) {
      this.el.remove();
      this.el = null;
    }

    $(document).off('mousedown', this.documentMousedownProxy);
  },


  // Positions the popover optimally, using the top/left/right options
  position: function() {
    var options = this.options;
    var origin = this.el.offsetParent().offset();
    var width = this.el.outerWidth();
    var height = this.el.outerHeight();
    var windowEl = $(window);
    var viewportEl = getScrollParent(this.el);
    var viewportTop;
    var viewportLeft;
    var viewportOffset;
    var top; // the "position" (not "offset") values for the popover
    var left; //

    // compute top and left
    top = options.top || 0;
    if (options.left !== undefined) {
      left = options.left;
    }
    else if (options.right !== undefined) {
      left = options.right - width; // derive the left value from the right value
    }
    else {
      left = 0;
    }

    if (viewportEl.is(window) || viewportEl.is(document)) { // normalize getScrollParent's result
      viewportEl = windowEl;
      viewportTop = 0; // the window is always at the top left
      viewportLeft = 0; // (and .offset() won't work if called here)
    }
    else {
      viewportOffset = viewportEl.offset();
      viewportTop = viewportOffset.top;
      viewportLeft = viewportOffset.left;
    }

    // if the window is scrolled, it causes the visible area to be further down
    viewportTop += windowEl.scrollTop();
    viewportLeft += windowEl.scrollLeft();

    // constrain to the view port. if constrained by two edges, give precedence to top/left
    if (options.viewportConstrain !== false) {
      top = Math.min(top, viewportTop + viewportEl.outerHeight() - height - this.margin);
      top = Math.max(top, viewportTop + this.margin);
      left = Math.min(left, viewportLeft + viewportEl.outerWidth() - width - this.margin);
      left = Math.max(left, viewportLeft + this.margin);
    }

    this.el.css({
      top: top - origin.top,
      left: left - origin.left
    });
  },


  // Triggers a callback. Calls a function in the option hash of the same name.
  // Arguments beyond the first `name` are forwarded on.
  // TODO: better code reuse for this. Repeat code
  trigger: function(name) {
    if (this.options[name]) {
      this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }

});

;;

/* A "coordinate map" converts pixel coordinates into an associated cell, which has an associated date
------------------------------------------------------------------------------------------------------------------------
Common interface:

  CoordMap.prototype = {
    build: function() {},
    getCell: function(x, y) {}
  };

*/

/* Coordinate map for a grid component
----------------------------------------------------------------------------------------------------------------------*/

var GridCoordMap = Class.extend({

  grid: null, // reference to the Grid
  rowCoords: null, // array of {top,bottom} objects
  colCoords: null, // array of {left,right} objects

  containerEl: null, // container element that all coordinates are constrained to. optionally assigned
  bounds: null,


  constructor: function(grid) {
    this.grid = grid;
  },


  // Queries the grid for the coordinates of all the cells
  build: function() {
    this.grid.build();
    this.rowCoords = this.grid.computeRowCoords();
    this.colCoords = this.grid.computeColCoords();
    this.computeBounds();
  },


  // Clears the coordinates data to free up memory
  clear: function() {
    this.grid.clear();
    this.rowCoords = null;
    this.colCoords = null;
  },


  // Given a coordinate of the document, gets the associated cell. If no cell is underneath, returns null
  getCell: function(x, y) {
    var rowCoords = this.rowCoords;
    var rowCnt = rowCoords.length;
    var colCoords = this.colCoords;
    var colCnt = colCoords.length;
    var hitRow = null;
    var hitCol = null;
    var i, coords;
    var cell;

    if (this.inBounds(x, y)) {

      for (i = 0; i < rowCnt; i++) {
        coords = rowCoords[i];
        if (y >= coords.top && y < coords.bottom) {
          hitRow = i;
          break;
        }
      }

      for (i = 0; i < colCnt; i++) {
        coords = colCoords[i];
        if (x >= coords.left && x < coords.right) {
          hitCol = i;
          break;
        }
      }

      if (hitRow !== null && hitCol !== null) {

        cell = this.grid.getCell(hitRow, hitCol); // expected to return a fresh object we can modify
        cell.grid = this.grid; // for CellDragListener's isCellsEqual. dragging between grids

        // make the coordinates available on the cell object
        $.extend(cell, rowCoords[hitRow], colCoords[hitCol]);

        return cell;
      }
    }

    return null;
  },


  // If there is a containerEl, compute the bounds into min/max values
  computeBounds: function() {
    this.bounds = this.containerEl ?
      getClientRect(this.containerEl) : // area within scrollbars
      null;
  },


  // Determines if the given coordinates are in bounds. If no `containerEl`, always true
  inBounds: function(x, y) {
    var bounds = this.bounds;

    if (bounds) {
      return x >= bounds.left && x < bounds.right && y >= bounds.top && y < bounds.bottom;
    }

    return true;
  }

});


/* Coordinate map that is a combination of multiple other coordinate maps
----------------------------------------------------------------------------------------------------------------------*/

var ComboCoordMap = Class.extend({

  coordMaps: null, // an array of CoordMaps


  constructor: function(coordMaps) {
    this.coordMaps = coordMaps;
  },


  // Builds all coordMaps
  build: function() {
    var coordMaps = this.coordMaps;
    var i;

    for (i = 0; i < coordMaps.length; i++) {
      coordMaps[i].build();
    }
  },


  // Queries all coordMaps for the cell underneath the given coordinates, returning the first result
  getCell: function(x, y) {
    var coordMaps = this.coordMaps;
    var cell = null;
    var i;

    for (i = 0; i < coordMaps.length && !cell; i++) {
      cell = coordMaps[i].getCell(x, y);
    }

    return cell;
  },


  // Clears all coordMaps
  clear: function() {
    var coordMaps = this.coordMaps;
    var i;

    for (i = 0; i < coordMaps.length; i++) {
      coordMaps[i].clear();
    }
  }

});

;;

/* Tracks a drag's mouse movement, firing various handlers
----------------------------------------------------------------------------------------------------------------------*/

var DragListener = fc.DragListener = Class.extend({

  options: null,

  isListening: false,
  isDragging: false,

  // coordinates of the initial mousedown
  originX: null,
  originY: null,

  // handler attached to the document, bound to the DragListener's `this`
  mousemoveProxy: null,
  mouseupProxy: null,

  // for IE8 bug-fighting behavior, for now
  subjectEl: null, // the element being draged. optional
  subjectHref: null,

  scrollEl: null,
  scrollBounds: null, // { top, bottom, left, right }
  scrollTopVel: null, // pixels per second
  scrollLeftVel: null, // pixels per second
  scrollIntervalId: null, // ID of setTimeout for scrolling animation loop
  scrollHandlerProxy: null, // this-scoped function for handling when scrollEl is scrolled

  scrollSensitivity: 30, // pixels from edge for scrolling to start
  scrollSpeed: 200, // pixels per second, at maximum speed
  scrollIntervalMs: 50, // millisecond wait between scroll increment


  constructor: function(options) {
    options = options || {};
    this.options = options;
    this.subjectEl = options.subjectEl;
  },


  // Call this when the user does a mousedown. Will probably lead to startListening
  mousedown: function(ev) {
    if (isPrimaryMouseButton(ev)) {

      ev.preventDefault(); // prevents native selection in most browsers

      this.startListening(ev);

      // start the drag immediately if there is no minimum distance for a drag start
      if (!this.options.distance) {
        this.startDrag(ev);
      }
    }
  },


  // Call this to start tracking mouse movements
  startListening: function(ev) {
    var scrollParent;

    if (!this.isListening) {

      // grab scroll container and attach handler
      if (ev && this.options.scroll) {
        scrollParent = getScrollParent($(ev.target));
        if (!scrollParent.is(window) && !scrollParent.is(document)) {
          this.scrollEl = scrollParent;

          // scope to `this`, and use `debounce` to make sure rapid calls don't happen
          this.scrollHandlerProxy = debounce(proxy(this, 'scrollHandler'), 100);
          this.scrollEl.on('scroll', this.scrollHandlerProxy);
        }
      }

      $(document)
        .on('mousemove', this.mousemoveProxy = proxy(this, 'mousemove'))
        .on('mouseup', this.mouseupProxy = proxy(this, 'mouseup'))
        .on('selectstart', this.preventDefault); // prevents native selection in IE<=8

      if (ev) {
        this.originX = ev.pageX;
        this.originY = ev.pageY;
      }
      else {
        // if no starting information was given, origin will be the topleft corner of the screen.
        // if so, dx/dy in the future will be the absolute coordinates.
        this.originX = 0;
        this.originY = 0;
      }

      this.isListening = true;
      this.listenStart(ev);
    }
  },


  // Called when drag listening has started (but a real drag has not necessarily began)
  listenStart: function(ev) {
    this.trigger('listenStart', ev);
  },


  // Called when the user moves the mouse
  mousemove: function(ev) {
    var dx = ev.pageX - this.originX;
    var dy = ev.pageY - this.originY;
    var minDistance;
    var distanceSq; // current distance from the origin, squared

    if (!this.isDragging) { // if not already dragging...
      // then start the drag if the minimum distance criteria is met
      minDistance = this.options.distance || 1;
      distanceSq = dx * dx + dy * dy;
      if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
        this.startDrag(ev);
      }
    }

    if (this.isDragging) {
      this.drag(dx, dy, ev); // report a drag, even if this mousemove initiated the drag
    }
  },


  // Call this to initiate a legitimate drag.
  // This function is called internally from this class, but can also be called explicitly from outside
  startDrag: function(ev) {

    if (!this.isListening) { // startDrag must have manually initiated
      this.startListening();
    }

    if (!this.isDragging) {
      this.isDragging = true;
      this.dragStart(ev);
    }
  },


  // Called when the actual drag has started (went beyond minDistance)
  dragStart: function(ev) {
    var subjectEl = this.subjectEl;

    this.trigger('dragStart', ev);

    // remove a mousedown'd <a>'s href so it is not visited (IE8 bug)
    if ((this.subjectHref = subjectEl ? subjectEl.attr('href') : null)) {
      subjectEl.removeAttr('href');
    }
  },


  // Called while the mouse is being moved and when we know a legitimate drag is taking place
  drag: function(dx, dy, ev) {
    this.trigger('drag', dx, dy, ev);
    this.updateScroll(ev); // will possibly cause scrolling
  },


  // Called when the user does a mouseup
  mouseup: function(ev) {
    this.stopListening(ev);
  },


  // Called when the drag is over. Will not cause listening to stop however.
  // A concluding 'cellOut' event will NOT be triggered.
  stopDrag: function(ev) {
    if (this.isDragging) {
      this.stopScrolling();
      this.dragStop(ev);
      this.isDragging = false;
    }
  },


  // Called when dragging has been stopped
  dragStop: function(ev) {
    var _this = this;

    this.trigger('dragStop', ev);

    // restore a mousedown'd <a>'s href (for IE8 bug)
    setTimeout(function() { // must be outside of the click's execution
      if (_this.subjectHref) {
        _this.subjectEl.attr('href', _this.subjectHref);
      }
    }, 0);
  },


  // Call this to stop listening to the user's mouse events
  stopListening: function(ev) {
    this.stopDrag(ev); // if there's a current drag, kill it

    if (this.isListening) {

      // remove the scroll handler if there is a scrollEl
      if (this.scrollEl) {
        this.scrollEl.off('scroll', this.scrollHandlerProxy);
        this.scrollHandlerProxy = null;
      }

      $(document)
        .off('mousemove', this.mousemoveProxy)
        .off('mouseup', this.mouseupProxy)
        .off('selectstart', this.preventDefault);

      this.mousemoveProxy = null;
      this.mouseupProxy = null;

      this.isListening = false;
      this.listenStop(ev);
    }
  },


  // Called when drag listening has stopped
  listenStop: function(ev) {
    this.trigger('listenStop', ev);
  },


  // Triggers a callback. Calls a function in the option hash of the same name.
  // Arguments beyond the first `name` are forwarded on.
  trigger: function(name) {
    if (this.options[name]) {
      this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
    }
  },


  // Stops a given mouse event from doing it's native browser action. In our case, text selection.
  preventDefault: function(ev) {
    ev.preventDefault();
  },


  /* Scrolling
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes and stores the bounding rectangle of scrollEl
  computeScrollBounds: function() {
    var el = this.scrollEl;

    this.scrollBounds = el ? getOuterRect(el) : null;
      // TODO: use getClientRect in future. but prevents auto scrolling when on top of scrollbars
  },


  // Called when the dragging is in progress and scrolling should be updated
  updateScroll: function(ev) {
    var sensitivity = this.scrollSensitivity;
    var bounds = this.scrollBounds;
    var topCloseness, bottomCloseness;
    var leftCloseness, rightCloseness;
    var topVel = 0;
    var leftVel = 0;

    if (bounds) { // only scroll if scrollEl exists

      // compute closeness to edges. valid range is from 0.0 - 1.0
      topCloseness = (sensitivity - (ev.pageY - bounds.top)) / sensitivity;
      bottomCloseness = (sensitivity - (bounds.bottom - ev.pageY)) / sensitivity;
      leftCloseness = (sensitivity - (ev.pageX - bounds.left)) / sensitivity;
      rightCloseness = (sensitivity - (bounds.right - ev.pageX)) / sensitivity;

      // translate vertical closeness into velocity.
      // mouse must be completely in bounds for velocity to happen.
      if (topCloseness >= 0 && topCloseness <= 1) {
        topVel = topCloseness * this.scrollSpeed * -1; // negative. for scrolling up
      }
      else if (bottomCloseness >= 0 && bottomCloseness <= 1) {
        topVel = bottomCloseness * this.scrollSpeed;
      }

      // translate horizontal closeness into velocity
      if (leftCloseness >= 0 && leftCloseness <= 1) {
        leftVel = leftCloseness * this.scrollSpeed * -1; // negative. for scrolling left
      }
      else if (rightCloseness >= 0 && rightCloseness <= 1) {
        leftVel = rightCloseness * this.scrollSpeed;
      }
    }

    this.setScrollVel(topVel, leftVel);
  },


  // Sets the speed-of-scrolling for the scrollEl
  setScrollVel: function(topVel, leftVel) {

    this.scrollTopVel = topVel;
    this.scrollLeftVel = leftVel;

    this.constrainScrollVel(); // massages into realistic values

    // if there is non-zero velocity, and an animation loop hasn't already started, then START
    if ((this.scrollTopVel || this.scrollLeftVel) && !this.scrollIntervalId) {
      this.scrollIntervalId = setInterval(
        proxy(this, 'scrollIntervalFunc'), // scope to `this`
        this.scrollIntervalMs
      );
    }
  },


  // Forces scrollTopVel and scrollLeftVel to be zero if scrolling has already gone all the way
  constrainScrollVel: function() {
    var el = this.scrollEl;

    if (this.scrollTopVel < 0) { // scrolling up?
      if (el.scrollTop() <= 0) { // already scrolled all the way up?
        this.scrollTopVel = 0;
      }
    }
    else if (this.scrollTopVel > 0) { // scrolling down?
      if (el.scrollTop() + el[0].clientHeight >= el[0].scrollHeight) { // already scrolled all the way down?
        this.scrollTopVel = 0;
      }
    }

    if (this.scrollLeftVel < 0) { // scrolling left?
      if (el.scrollLeft() <= 0) { // already scrolled all the left?
        this.scrollLeftVel = 0;
      }
    }
    else if (this.scrollLeftVel > 0) { // scrolling right?
      if (el.scrollLeft() + el[0].clientWidth >= el[0].scrollWidth) { // already scrolled all the way right?
        this.scrollLeftVel = 0;
      }
    }
  },


  // This function gets called during every iteration of the scrolling animation loop
  scrollIntervalFunc: function() {
    var el = this.scrollEl;
    var frac = this.scrollIntervalMs / 1000; // considering animation frequency, what the vel should be mult'd by

    // change the value of scrollEl's scroll
    if (this.scrollTopVel) {
      el.scrollTop(el.scrollTop() + this.scrollTopVel * frac);
    }
    if (this.scrollLeftVel) {
      el.scrollLeft(el.scrollLeft() + this.scrollLeftVel * frac);
    }

    this.constrainScrollVel(); // since the scroll values changed, recompute the velocities

    // if scrolled all the way, which causes the vels to be zero, stop the animation loop
    if (!this.scrollTopVel && !this.scrollLeftVel) {
      this.stopScrolling();
    }
  },


  // Kills any existing scrolling animation loop
  stopScrolling: function() {
    if (this.scrollIntervalId) {
      clearInterval(this.scrollIntervalId);
      this.scrollIntervalId = null;

      // when all done with scrolling, recompute positions since they probably changed
      this.scrollStop();
    }
  },


  // Get called when the scrollEl is scrolled (NOTE: this is delayed via debounce)
  scrollHandler: function() {
    // recompute all coordinates, but *only* if this is *not* part of our scrolling animation
    if (!this.scrollIntervalId) {
      this.scrollStop();
    }
  },


  // Called when scrolling has stopped, whether through auto scroll, or the user scrolling
  scrollStop: function() {
  }

});

;;

/* Tracks mouse movements over a CoordMap and raises events about which cell the mouse is over.
------------------------------------------------------------------------------------------------------------------------
options:
- subjectEl
- subjectCenter
*/

var CellDragListener = DragListener.extend({

  coordMap: null, // converts coordinates to date cells
  origCell: null, // the cell the mouse was over when listening started
  cell: null, // the cell the mouse is over
  coordAdjust: null, // delta that will be added to the mouse coordinates when computing collisions


  constructor: function(coordMap, options) {
    DragListener.prototype.constructor.call(this, options); // call the super-constructor

    this.coordMap = coordMap;
  },


  // Called when drag listening starts (but a real drag has not necessarily began).
  // ev might be undefined if dragging was started manually.
  listenStart: function(ev) {
    var subjectEl = this.subjectEl;
    var subjectRect;
    var origPoint;
    var point;

    DragListener.prototype.listenStart.apply(this, arguments); // call the super-method

    this.computeCoords();

    if (ev) {
      origPoint = { left: ev.pageX, top: ev.pageY };
      point = origPoint;

      // constrain the point to bounds of the element being dragged
      if (subjectEl) {
        subjectRect = getOuterRect(subjectEl); // used for centering as well
        point = constrainPoint(point, subjectRect);
      }

      this.origCell = this.getCell(point.left, point.top);

      // treat the center of the subject as the collision point?
      if (subjectEl && this.options.subjectCenter) {

        // only consider the area the subject overlaps the cell. best for large subjects
        if (this.origCell) {
          subjectRect = intersectRects(this.origCell, subjectRect) ||
            subjectRect; // in case there is no intersection
        }

        point = getRectCenter(subjectRect);
      }

      this.coordAdjust = diffPoints(point, origPoint); // point - origPoint
    }
    else {
      this.origCell = null;
      this.coordAdjust = null;
    }
  },


  // Recomputes the drag-critical positions of elements
  computeCoords: function() {
    this.coordMap.build();
    this.computeScrollBounds();
  },


  // Called when the actual drag has started
  dragStart: function(ev) {
    var cell;

    DragListener.prototype.dragStart.apply(this, arguments); // call the super-method

    cell = this.getCell(ev.pageX, ev.pageY); // might be different from this.origCell if the min-distance is large

    // report the initial cell the mouse is over
    // especially important if no min-distance and drag starts immediately
    if (cell) {
      this.cellOver(cell);
    }
  },


  // Called when the drag moves
  drag: function(dx, dy, ev) {
    var cell;

    DragListener.prototype.drag.apply(this, arguments); // call the super-method

    cell = this.getCell(ev.pageX, ev.pageY);

    if (!isCellsEqual(cell, this.cell)) { // a different cell than before?
      if (this.cell) {
        this.cellOut();
      }
      if (cell) {
        this.cellOver(cell);
      }
    }
  },


  // Called when dragging has been stopped
  dragStop: function() {
    this.cellDone();
    DragListener.prototype.dragStop.apply(this, arguments); // call the super-method
  },


  // Called when a the mouse has just moved over a new cell
  cellOver: function(cell) {
    this.cell = cell;
    this.trigger('cellOver', cell, isCellsEqual(cell, this.origCell), this.origCell);
  },


  // Called when the mouse has just moved out of a cell
  cellOut: function() {
    if (this.cell) {
      this.trigger('cellOut', this.cell);
      this.cellDone();
      this.cell = null;
    }
  },


  // Called after a cellOut. Also called before a dragStop
  cellDone: function() {
    if (this.cell) {
      this.trigger('cellDone', this.cell);
    }
  },


  // Called when drag listening has stopped
  listenStop: function() {
    DragListener.prototype.listenStop.apply(this, arguments); // call the super-method

    this.origCell = this.cell = null;
    this.coordMap.clear();
  },


  // Called when scrolling has stopped, whether through auto scroll, or the user scrolling
  scrollStop: function() {
    DragListener.prototype.scrollStop.apply(this, arguments); // call the super-method

    this.computeCoords(); // cells' absolute positions will be in new places. recompute
  },


  // Gets the cell underneath the coordinates for the given mouse event
  getCell: function(left, top) {

    if (this.coordAdjust) {
      left += this.coordAdjust.left;
      top += this.coordAdjust.top;
    }

    return this.coordMap.getCell(left, top);
  }

});


// Returns `true` if the cells are identically equal. `false` otherwise.
// They must have the same row, col, and be from the same grid.
// Two null values will be considered equal, as two "out of the grid" states are the same.
function isCellsEqual(cell1, cell2) {

  if (!cell1 && !cell2) {
    return true;
  }

  if (cell1 && cell2) {
    return cell1.grid === cell2.grid &&
      cell1.row === cell2.row &&
      cell1.col === cell2.col;
  }

  return false;
}

;;

/* Creates a clone of an element and lets it track the mouse as it moves
----------------------------------------------------------------------------------------------------------------------*/

var MouseFollower = Class.extend({

  options: null,

  sourceEl: null, // the element that will be cloned and made to look like it is dragging
  el: null, // the clone of `sourceEl` that will track the mouse
  parentEl: null, // the element that `el` (the clone) will be attached to

  // the initial position of el, relative to the offset parent. made to match the initial offset of sourceEl
  top0: null,
  left0: null,

  // the initial position of the mouse
  mouseY0: null,
  mouseX0: null,

  // the number of pixels the mouse has moved from its initial position
  topDelta: null,
  leftDelta: null,

  mousemoveProxy: null, // document mousemove handler, bound to the MouseFollower's `this`

  isFollowing: false,
  isHidden: false,
  isAnimating: false, // doing the revert animation?

  constructor: function(sourceEl, options) {
    this.options = options = options || {};
    this.sourceEl = sourceEl;
    this.parentEl = options.parentEl ? $(options.parentEl) : sourceEl.parent(); // default to sourceEl's parent
  },


  // Causes the element to start following the mouse
  start: function(ev) {
    if (!this.isFollowing) {
      this.isFollowing = true;

      this.mouseY0 = ev.pageY;
      this.mouseX0 = ev.pageX;
      this.topDelta = 0;
      this.leftDelta = 0;

      if (!this.isHidden) {
        this.updatePosition();
      }

      $(document).on('mousemove', this.mousemoveProxy = proxy(this, 'mousemove'));
    }
  },


  // Causes the element to stop following the mouse. If shouldRevert is true, will animate back to original position.
  // `callback` gets invoked when the animation is complete. If no animation, it is invoked immediately.
  stop: function(shouldRevert, callback) {
    var _this = this;
    var revertDuration = this.options.revertDuration;

    function complete() {
      this.isAnimating = false;
      _this.removeElement();

      this.top0 = this.left0 = null; // reset state for future updatePosition calls

      if (callback) {
        callback();
      }
    }

    if (this.isFollowing && !this.isAnimating) { // disallow more than one stop animation at a time
      this.isFollowing = false;

      $(document).off('mousemove', this.mousemoveProxy);

      if (shouldRevert && revertDuration && !this.isHidden) { // do a revert animation?
        this.isAnimating = true;
        this.el.animate({
          top: this.top0,
          left: this.left0
        }, {
          duration: revertDuration,
          complete: complete
        });
      }
      else {
        complete();
      }
    }
  },


  // Gets the tracking element. Create it if necessary
  getEl: function() {
    var el = this.el;

    if (!el) {
      this.sourceEl.width(); // hack to force IE8 to compute correct bounding box
      el = this.el = this.sourceEl.clone()
        .css({
          position: 'absolute',
          visibility: '', // in case original element was hidden (commonly through hideEvents())
          display: this.isHidden ? 'none' : '', // for when initially hidden
          margin: 0,
          right: 'auto', // erase and set width instead
          bottom: 'auto', // erase and set height instead
          width: this.sourceEl.width(), // explicit height in case there was a 'right' value
          height: this.sourceEl.height(), // explicit width in case there was a 'bottom' value
          opacity: this.options.opacity || '',
          zIndex: this.options.zIndex
        })
        .appendTo(this.parentEl);
    }

    return el;
  },


  // Removes the tracking element if it has already been created
  removeElement: function() {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  },


  // Update the CSS position of the tracking element
  updatePosition: function() {
    var sourceOffset;
    var origin;

    this.getEl(); // ensure this.el

    // make sure origin info was computed
    if (this.top0 === null) {
      this.sourceEl.width(); // hack to force IE8 to compute correct bounding box
      sourceOffset = this.sourceEl.offset();
      origin = this.el.offsetParent().offset();
      this.top0 = sourceOffset.top - origin.top;
      this.left0 = sourceOffset.left - origin.left;
    }

    this.el.css({
      top: this.top0 + this.topDelta,
      left: this.left0 + this.leftDelta
    });
  },


  // Gets called when the user moves the mouse
  mousemove: function(ev) {
    this.topDelta = ev.pageY - this.mouseY0;
    this.leftDelta = ev.pageX - this.mouseX0;

    if (!this.isHidden) {
      this.updatePosition();
    }
  },


  // Temporarily makes the tracking element invisible. Can be called before following starts
  hide: function() {
    if (!this.isHidden) {
      this.isHidden = true;
      if (this.el) {
        this.el.hide();
      }
    }
  },


  // Show the tracking element after it has been temporarily hidden
  show: function() {
    if (this.isHidden) {
      this.isHidden = false;
      this.updatePosition();
      this.getEl().show();
    }
  }

});

;;

/* A utility class for rendering <tr> rows.
----------------------------------------------------------------------------------------------------------------------*/
// It leverages methods of the subclass and the View to determine custom rendering behavior for each row "type"
// (such as highlight rows, day rows, helper rows, etc).

var RowRenderer = Class.extend({

  view: null, // a View object
  isRTL: null, // shortcut to the view's isRTL option
  cellHtml: '<td/>', // plain default HTML used for a cell when no other is available


  constructor: function(view) {
    this.view = view;
    this.isRTL = view.opt('isRTL');
  },


  // Renders the HTML for a row, leveraging custom cell-HTML-renderers based on the `rowType`.
  // Also applies the "intro" and "outro" cells, which are specified by the subclass and views.
  // `row` is an optional row number.
  rowHtml: function(rowType, row) {
    var renderCell = this.getHtmlRenderer('cell', rowType);
    var rowCellHtml = '';
    var col;
    var cell;

    row = row || 0;

    for (col = 0; col < this.colCnt; col++) {
      cell = this.getCell(row, col);
      rowCellHtml += renderCell(cell);
    }

    rowCellHtml = this.bookendCells(rowCellHtml, rowType, row); // apply intro and outro

    return '<tr>' + rowCellHtml + '</tr>';
  },


  // Applies the "intro" and "outro" HTML to the given cells.
  // Intro means the leftmost cell when the calendar is LTR and the rightmost cell when RTL. Vice-versa for outro.
  // `cells` can be an HTML string of <td>'s or a jQuery <tr> element
  // `row` is an optional row number.
  bookendCells: function(cells, rowType, row) {
    var intro = this.getHtmlRenderer('intro', rowType)(row || 0);
    var outro = this.getHtmlRenderer('outro', rowType)(row || 0);
    var prependHtml = this.isRTL ? outro : intro;
    var appendHtml = this.isRTL ? intro : outro;

    if (typeof cells === 'string') {
      return prependHtml + cells + appendHtml;
    }
    else { // a jQuery <tr> element
      return cells.prepend(prependHtml).append(appendHtml);
    }
  },


  // Returns an HTML-rendering function given a specific `rendererName` (like cell, intro, or outro) and a specific
  // `rowType` (like day, eventSkeleton, helperSkeleton), which is optional.
  // If a renderer for the specific rowType doesn't exist, it will fall back to a generic renderer.
  // We will query the View object first for any custom rendering functions, then the methods of the subclass.
  getHtmlRenderer: function(rendererName, rowType) {
    var view = this.view;
    var generalName; // like "cellHtml"
    var specificName; // like "dayCellHtml". based on rowType
    var provider; // either the View or the RowRenderer subclass, whichever provided the method
    var renderer;

    generalName = rendererName + 'Html';
    if (rowType) {
      specificName = rowType + capitaliseFirstLetter(rendererName) + 'Html';
    }

    if (specificName && (renderer = view[specificName])) {
      provider = view;
    }
    else if (specificName && (renderer = this[specificName])) {
      provider = this;
    }
    else if ((renderer = view[generalName])) {
      provider = view;
    }
    else if ((renderer = this[generalName])) {
      provider = this;
    }

    if (typeof renderer === 'function') {
      return function() {
        return renderer.apply(provider, arguments) || ''; // use correct `this` and always return a string
      };
    }

    // the rendered can be a plain string as well. if not specified, always an empty string.
    return function() {
      return renderer || '';
    };
  }

});

;;

/* An abstract class comprised of a "grid" of cells that each represent a specific datetime
----------------------------------------------------------------------------------------------------------------------*/

var Grid = fc.Grid = RowRenderer.extend({

  start: null, // the date of the first cell
  end: null, // the date after the last cell

  rowCnt: 0, // number of rows
  colCnt: 0, // number of cols

  el: null, // the containing element
  coordMap: null, // a GridCoordMap that converts pixel values to datetimes
  elsByFill: null, // a hash of jQuery element sets used for rendering each fill. Keyed by fill name.

  externalDragStartProxy: null, // binds the Grid's scope to externalDragStart (in DayGrid.events)

  // derived from options
  colHeadFormat: null, // TODO: move to another class. not applicable to all Grids
  eventTimeFormat: null,
  displayEventTime: null,
  displayEventEnd: null,

  // if all cells are the same length of time, the duration they all share. optional.
  // when defined, allows the computeCellRange shortcut, as well as improved resizing behavior.
  cellDuration: null,

  // if defined, holds the unit identified (ex: "year" or "month") that determines the level of granularity
  // of the date cells. if not defined, assumes to be day and time granularity.
  largeUnit: null,


  constructor: function() {
    RowRenderer.apply(this, arguments); // call the super-constructor

    this.coordMap = new GridCoordMap(this);
    this.elsByFill = {};
    this.externalDragStartProxy = proxy(this, 'externalDragStart');
  },


  /* Options
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the format string used for the text in column headers, if not explicitly defined by 'columnFormat'
  // TODO: move to another class. not applicable to all Grids
  computeColHeadFormat: function() {
    // subclasses must implement if they want to use headHtml()
  },


  // Generates the format string used for event time text, if not explicitly defined by 'timeFormat'
  computeEventTimeFormat: function() {
    return this.view.opt('smallTimeFormat');
  },


  // Determines whether events should have their end times displayed, if not explicitly defined by 'displayEventTime'.
  // Only applies to non-all-day events.
  computeDisplayEventTime: function() {
    return true;
  },


  // Determines whether events should have their end times displayed, if not explicitly defined by 'displayEventEnd'
  computeDisplayEventEnd: function() {
    return true;
  },


  /* Dates
  ------------------------------------------------------------------------------------------------------------------*/


  // Tells the grid about what period of time to display.
  // Any date-related cell system internal data should be generated.
  setRange: function(range) {
    this.start = range.start.clone();
    this.end = range.end.clone();

    this.rangeUpdated();
    this.processRangeOptions();
  },


  // Called when internal variables that rely on the range should be updated
  rangeUpdated: function() {
  },


  // Updates values that rely on options and also relate to range
  processRangeOptions: function() {
    var view = this.view;
    var displayEventTime;
    var displayEventEnd;

    // Populate option-derived settings. Look for override first, then compute if necessary.
    this.colHeadFormat = view.opt('columnFormat') || this.computeColHeadFormat();

    this.eventTimeFormat =
      view.opt('eventTimeFormat') ||
      view.opt('timeFormat') || // deprecated
      this.computeEventTimeFormat();

    displayEventTime = view.opt('displayEventTime');
    if (displayEventTime == null) {
      displayEventTime = this.computeDisplayEventTime(); // might be based off of range
    }

    displayEventEnd = view.opt('displayEventEnd');
    if (displayEventEnd == null) {
      displayEventEnd = this.computeDisplayEventEnd(); // might be based off of range
    }

    this.displayEventTime = displayEventTime;
    this.displayEventEnd = displayEventEnd;
  },


  // Called before the grid's coordinates will need to be queried for cells.
  // Any non-date-related cell system internal data should be built.
  build: function() {
  },


  // Called after the grid's coordinates are done being relied upon.
  // Any non-date-related cell system internal data should be cleared.
  clear: function() {
  },


  // Converts a range with an inclusive `start` and an exclusive `end` into an array of segment objects
  rangeToSegs: function(range) {
    // subclasses must implement
  },


  // Diffs the two dates, returning a duration, based on granularity of the grid
  diffDates: function(a, b) {
    if (this.largeUnit) {
      return diffByUnit(a, b, this.largeUnit);
    }
    else {
      return diffDayTime(a, b);
    }
  },


  /* Cells
  ------------------------------------------------------------------------------------------------------------------*/
  // NOTE: columns are ordered left-to-right


  // Gets an object containing row/col number, misc data, and range information about the cell.
  // Accepts row/col values, an object with row/col properties, or a single-number offset from the first cell.
  getCell: function(row, col) {
    var cell;

    if (col == null) {
      if (typeof row === 'number') { // a single-number offset
        col = row % this.colCnt;
        row = Math.floor(row / this.colCnt);
      }
      else { // an object with row/col properties
        col = row.col;
        row = row.row;
      }
    }

    cell = { row: row, col: col };

    $.extend(cell, this.getRowData(row), this.getColData(col));
    $.extend(cell, this.computeCellRange(cell));

    return cell;
  },


  // Given a cell object with index and misc data, generates a range object
  // If the grid is leveraging cellDuration, this doesn't need to be defined. Only computeCellDate does.
  // If being overridden, should return a range with reference-free date copies.
  computeCellRange: function(cell) {
    var date = this.computeCellDate(cell);

    return {
      start: date,
      end: date.clone().add(this.cellDuration)
    };
  },


  // Given a cell, returns its start date. Should return a reference-free date copy.
  computeCellDate: function(cell) {
    // subclasses can implement
  },


  // Retrieves misc data about the given row
  getRowData: function(row) {
    return {};
  },


  // Retrieves misc data baout the given column
  getColData: function(col) {
    return {};
  },


  // Retrieves the element representing the given row
  getRowEl: function(row) {
    // subclasses should implement if leveraging the default getCellDayEl() or computeRowCoords()
  },


  // Retrieves the element representing the given column
  getColEl: function(col) {
    // subclasses should implement if leveraging the default getCellDayEl() or computeColCoords()
  },


  // Given a cell object, returns the element that represents the cell's whole-day
  getCellDayEl: function(cell) {
    return this.getColEl(cell.col) || this.getRowEl(cell.row);
  },


  /* Cell Coordinates
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes the top/bottom coordinates of all rows.
  // By default, queries the dimensions of the element provided by getRowEl().
  computeRowCoords: function() {
    var items = [];
    var i, el;
    var top;

    for (i = 0; i < this.rowCnt; i++) {
      el = this.getRowEl(i);
      top = el.offset().top;
      items.push({
        top: top,
        bottom: top + el.outerHeight()
      });
    }

    return items;
  },


  // Computes the left/right coordinates of all rows.
  // By default, queries the dimensions of the element provided by getColEl(). Columns can be LTR or RTL.
  computeColCoords: function() {
    var items = [];
    var i, el;
    var left;

    for (i = 0; i < this.colCnt; i++) {
      el = this.getColEl(i);
      left = el.offset().left;
      items.push({
        left: left,
        right: left + el.outerWidth()
      });
    }

    return items;
  },


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Sets the container element that the grid should render inside of.
  // Does other DOM-related initializations.
  setElement: function(el) {
    var _this = this;

    this.el = el;

    // attach a handler to the grid's root element.
    // jQuery will take care of unregistering them when removeElement gets called.
    el.on('mousedown', function(ev) {
      if (
        !$(ev.target).is('.fc-event-container *, .fc-more') && // not an an event element, or "more.." link
        !$(ev.target).closest('.fc-popover').length // not on a popover (like the "more.." events one)
      ) {
        _this.dayMousedown(ev);
      }
    });

    // attach event-element-related handlers. in Grid.events
    // same garbage collection note as above.
    this.bindSegHandlers();

    this.bindGlobalHandlers();
  },


  // Removes the grid's container element from the DOM. Undoes any other DOM-related attachments.
  // DOES NOT remove any content beforehand (doesn't clear events or call unrenderDates), unlike View
  removeElement: function() {
    this.unbindGlobalHandlers();

    this.el.remove();

    // NOTE: we don't null-out this.el for the same reasons we don't do it within View::removeElement
  },


  // Renders the basic structure of grid view before any content is rendered
  renderSkeleton: function() {
    // subclasses should implement
  },


  // Renders the grid's date-related content (like cells that represent days/times).
  // Assumes setRange has already been called and the skeleton has already been rendered.
  renderDates: function() {
    // subclasses should implement
  },


  // Unrenders the grid's date-related content
  unrenderDates: function() {
    // subclasses should implement
  },


  /* Handlers
  ------------------------------------------------------------------------------------------------------------------*/


  // Binds DOM handlers to elements that reside outside the grid, such as the document
  bindGlobalHandlers: function() {
    $(document).on('dragstart sortstart', this.externalDragStartProxy); // jqui
  },


  // Unbinds DOM handlers from elements that reside outside the grid
  unbindGlobalHandlers: function() {
    $(document).off('dragstart sortstart', this.externalDragStartProxy); // jqui
  },


  // Process a mousedown on an element that represents a day. For day clicking and selecting.
  dayMousedown: function(ev) {
    var _this = this;
    var view = this.view;
    var isSelectable = view.opt('selectable');
    var dayClickCell; // null if invalid dayClick
    var selectionRange; // null if invalid selection

    // this listener tracks a mousedown on a day element, and a subsequent drag.
    // if the drag ends on the same day, it is a 'dayClick'.
    // if 'selectable' is enabled, this listener also detects selections.
    var dragListener = new CellDragListener(this.coordMap, {
      //distance: 5, // needs more work if we want dayClick to fire correctly
      scroll: view.opt('dragScroll'),
      dragStart: function() {
        view.unselect(); // since we could be rendering a new selection, we want to clear any old one
      },
      cellOver: function(cell, isOrig, origCell) {
        if (origCell) { // click needs to have started on a cell
          dayClickCell = isOrig ? cell : null; // single-cell selection is a day click
          if (isSelectable) {
            selectionRange = _this.computeSelection(origCell, cell);
            if (selectionRange) {
              _this.renderSelection(selectionRange);
            }
            else {
              disableCursor();
            }
          }
        }
      },
      cellOut: function(cell) {
        dayClickCell = null;
        selectionRange = null;
        _this.unrenderSelection();
        enableCursor();
      },
      listenStop: function(ev) {
        if (dayClickCell) {
          view.triggerDayClick(dayClickCell, _this.getCellDayEl(dayClickCell), ev);
        }
        if (selectionRange) {
          // the selection will already have been rendered. just report it
          view.reportSelection(selectionRange, ev);
        }
        enableCursor();
      }
    });

    dragListener.mousedown(ev); // start listening, which will eventually initiate a dragStart
  },


  /* Event Helper
  ------------------------------------------------------------------------------------------------------------------*/
  // TODO: should probably move this to Grid.events, like we did event dragging / resizing


  // Renders a mock event over the given range
  renderRangeHelper: function(range, sourceSeg) {
    var fakeEvent = this.fabricateHelperEvent(range, sourceSeg);

    this.renderHelper(fakeEvent, sourceSeg); // do the actual rendering
  },


  // Builds a fake event given a date range it should cover, and a segment is should be inspired from.
  // The range's end can be null, in which case the mock event that is rendered will have a null end time.
  // `sourceSeg` is the internal segment object involved in the drag. If null, something external is dragging.
  fabricateHelperEvent: function(range, sourceSeg) {
    var fakeEvent = sourceSeg ? createObject(sourceSeg.event) : {}; // mask the original event object if possible

    fakeEvent.start = range.start.clone();
    fakeEvent.end = range.end ? range.end.clone() : null;
    fakeEvent.allDay = null; // force it to be freshly computed by normalizeEventRange
    this.view.calendar.normalizeEventRange(fakeEvent);

    // this extra className will be useful for differentiating real events from mock events in CSS
    fakeEvent.className = (fakeEvent.className || []).concat('fc-helper');

    // if something external is being dragged in, don't render a resizer
    if (!sourceSeg) {
      fakeEvent.editable = false;
    }

    return fakeEvent;
  },


  // Renders a mock event
  renderHelper: function(event, sourceSeg) {
    // subclasses must implement
  },


  // Unrenders a mock event
  unrenderHelper: function() {
    // subclasses must implement
  },


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a selection. Will highlight by default but can be overridden by subclasses.
  renderSelection: function(range) {
    this.renderHighlight(this.selectionRangeToSegs(range));
  },


  // Unrenders any visual indications of a selection. Will unrender a highlight by default.
  unrenderSelection: function() {
    this.unrenderHighlight();
  },


  // Given the first and last cells of a selection, returns a range object.
  // Will return something falsy if the selection is invalid (when outside of selectionConstraint for example).
  // Subclasses can override and provide additional data in the range object. Will be passed to renderSelection().
  computeSelection: function(firstCell, lastCell) {
    var dates = [
      firstCell.start,
      firstCell.end,
      lastCell.start,
      lastCell.end
    ];
    var range;

    dates.sort(compareNumbers); // sorts chronologically. works with Moments

    range = {
      start: dates[0].clone(),
      end: dates[3].clone()
    };

    if (!this.view.calendar.isSelectionRangeAllowed(range)) {
      return null;
    }

    return range;
  },


  selectionRangeToSegs: function(range) {
    return this.rangeToSegs(range);
  },


  /* Highlight
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders an emphasis on the given date range. Given an array of segments.
  renderHighlight: function(segs) {
    this.renderFill('highlight', segs);
  },


  // Unrenders the emphasis on a date range
  unrenderHighlight: function() {
    this.unrenderFill('highlight');
  },


  // Generates an array of classNames for rendering the highlight. Used by the fill system.
  highlightSegClasses: function() {
    return [ 'fc-highlight' ];
  },


  /* Fill System (highlight, background events, business hours)
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a set of rectangles over the given segments of time.
  // MUST RETURN a subset of segs, the segs that were actually rendered.
  // Responsible for populating this.elsByFill. TODO: better API for expressing this requirement
  renderFill: function(type, segs) {
    // subclasses must implement
  },


  // Unrenders a specific type of fill that is currently rendered on the grid
  unrenderFill: function(type) {
    var el = this.elsByFill[type];

    if (el) {
      el.remove();
      delete this.elsByFill[type];
    }
  },


  // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
  // Only returns segments that successfully rendered.
  // To be harnessed by renderFill (implemented by subclasses).
  // Analagous to renderFgSegEls.
  renderFillSegEls: function(type, segs) {
    var _this = this;
    var segElMethod = this[type + 'SegEl'];
    var html = '';
    var renderedSegs = [];
    var i;

    if (segs.length) {

      // build a large concatenation of segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.fillSegHtml(type, segs[i]);
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment.
      $(html).each(function(i, node) {
        var seg = segs[i];
        var el = $(node);

        // allow custom filter methods per-type
        if (segElMethod) {
          el = segElMethod.call(_this, seg, el);
        }

        if (el) { // custom filters did not cancel the render
          el = $(el); // allow custom filter to return raw DOM node

          // correct element type? (would be bad if a non-TD were inserted into a table for example)
          if (el.is(_this.fillSegTag)) {
            seg.el = el;
            renderedSegs.push(seg);
          }
        }
      });
    }

    return renderedSegs;
  },


  fillSegTag: 'div', // subclasses can override


  // Builds the HTML needed for one fill segment. Generic enought o work with different types.
  fillSegHtml: function(type, seg) {

    // custom hooks per-type
    var classesMethod = this[type + 'SegClasses'];
    var cssMethod = this[type + 'SegCss'];

    var classes = classesMethod ? classesMethod.call(this, seg) : [];
    var css = cssToStr(cssMethod ? cssMethod.call(this, seg) : {});

    return '<' + this.fillSegTag +
      (classes.length ? ' class="' + classes.join(' ') + '"' : '') +
      (css ? ' style="' + css + '"' : '') +
      ' />';
  },


  /* Generic rendering utilities for subclasses
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a day-of-week header row.
  // TODO: move to another class. not applicable to all Grids
  headHtml: function() {
    return '' +
      '<div class="fc-row ' + this.view.widgetHeaderClass + '">' +
        '<table>' +
          '<thead>' +
            this.rowHtml('head') + // leverages RowRenderer
          '</thead>' +
        '</table>' +
      '</div>';
  },


  // Used by the `headHtml` method, via RowRenderer, for rendering the HTML of a day-of-week header cell
  // TODO: move to another class. not applicable to all Grids
  headCellHtml: function(cell) {
    var view = this.view;
    var date = cell.start;

    return '' +
      '<th class="fc-day-header ' + view.widgetHeaderClass + ' fc-' + dayIDs[date.day()] + '">' +
        htmlEscape(date.format(this.colHeadFormat)) +
      '</th>';
  },


  // Renders the HTML for a single-day background cell
  bgCellHtml: function(cell) {
    var view = this.view;
    var date = cell.start;
    var classes = this.getDayClasses(date);

    classes.unshift('fc-day', view.widgetContentClass);

    return '<td class="' + classes.join(' ') + '"' +
      ' data-date="' + date.format('YYYY-MM-DD') + '"' + // if date has a time, won't format it
      '></td>';
  },


  // Computes HTML classNames for a single-day cell
  getDayClasses: function(date) {
    var view = this.view;
    var today = view.calendar.getNow().stripTime();
    var classes = [ 'fc-' + dayIDs[date.day()] ];

    if (
      view.intervalDuration.as('months') == 1 &&
      date.month() != view.intervalStart.month()
    ) {
      classes.push('fc-other-month');
    }

    if (date.isSame(today, 'day')) {
      classes.push(
        'fc-today',
        view.highlightStateClass
      );
    }
    else if (date < today) {
      classes.push('fc-past');
    }
    else {
      classes.push('fc-future');
    }

    return classes;
  }

});

;;

/* Event-rendering and event-interaction methods for the abstract Grid class
----------------------------------------------------------------------------------------------------------------------*/

Grid.mixin({

  mousedOverSeg: null, // the segment object the user's mouse is over. null if over nothing
  isDraggingSeg: false, // is a segment being dragged? boolean
  isResizingSeg: false, // is a segment being resized? boolean
  isDraggingExternal: false, // jqui-dragging an external element? boolean
  segs: null, // the event segments currently rendered in the grid


  // Renders the given events onto the grid
  renderEvents: function(events) {
    var segs = this.eventsToSegs(events);
    var bgSegs = [];
    var fgSegs = [];
    var i, seg;

    for (i = 0; i < segs.length; i++) {
      seg = segs[i];

      if (isBgEvent(seg.event)) {
        bgSegs.push(seg);
      }
      else {
        fgSegs.push(seg);
      }
    }

    // Render each different type of segment.
    // Each function may return a subset of the segs, segs that were actually rendered.
    bgSegs = this.renderBgSegs(bgSegs) || bgSegs;
    fgSegs = this.renderFgSegs(fgSegs) || fgSegs;

    this.segs = bgSegs.concat(fgSegs);
  },


  // Unrenders all events currently rendered on the grid
  unrenderEvents: function() {
    this.triggerSegMouseout(); // trigger an eventMouseout if user's mouse is over an event

    this.unrenderFgSegs();
    this.unrenderBgSegs();

    this.segs = null;
  },


  // Retrieves all rendered segment objects currently rendered on the grid
  getEventSegs: function() {
    return this.segs || [];
  },


  /* Foreground Segment Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders foreground event segments onto the grid. May return a subset of segs that were rendered.
  renderFgSegs: function(segs) {
    // subclasses must implement
  },


  // Unrenders all currently rendered foreground segments
  unrenderFgSegs: function() {
    // subclasses must implement
  },


  // Renders and assigns an `el` property for each foreground event segment.
  // Only returns segments that successfully rendered.
  // A utility that subclasses may use.
  renderFgSegEls: function(segs, disableResizing) {
    var view = this.view;
    var html = '';
    var renderedSegs = [];
    var i;

    if (segs.length) { // don't build an empty html string

      // build a large concatenation of event segment HTML
      for (i = 0; i < segs.length; i++) {
        html += this.fgSegHtml(segs[i], disableResizing);
      }

      // Grab individual elements from the combined HTML string. Use each as the default rendering.
      // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
      $(html).each(function(i, node) {
        var seg = segs[i];
        var el = view.resolveEventEl(seg.event, $(node));

        if (el) {
          el.data('fc-seg', seg); // used by handlers
          seg.el = el;
          renderedSegs.push(seg);
        }
      });
    }

    return renderedSegs;
  },


  // Generates the HTML for the default rendering of a foreground event segment. Used by renderFgSegEls()
  fgSegHtml: function(seg, disableResizing) {
    // subclasses should implement
  },


  /* Background Segment Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders the given background event segments onto the grid.
  // Returns a subset of the segs that were actually rendered.
  renderBgSegs: function(segs) {
    return this.renderFill('bgEvent', segs);
  },


  // Unrenders all the currently rendered background event segments
  unrenderBgSegs: function() {
    this.unrenderFill('bgEvent');
  },


  // Renders a background event element, given the default rendering. Called by the fill system.
  bgEventSegEl: function(seg, el) {
    return this.view.resolveEventEl(seg.event, el); // will filter through eventRender
  },


  // Generates an array of classNames to be used for the default rendering of a background event.
  // Called by the fill system.
  bgEventSegClasses: function(seg) {
    var event = seg.event;
    var source = event.source || {};

    return [ 'fc-bgevent' ].concat(
      event.className,
      source.className || []
    );
  },


  // Generates a semicolon-separated CSS string to be used for the default rendering of a background event.
  // Called by the fill system.
  // TODO: consolidate with getEventSkinCss?
  bgEventSegCss: function(seg) {
    var view = this.view;
    var event = seg.event;
    var source = event.source || {};

    return {
      'background-color':
        event.backgroundColor ||
        event.color ||
        source.backgroundColor ||
        source.color ||
        view.opt('eventBackgroundColor') ||
        view.opt('eventColor')
    };
  },


  // Generates an array of classNames to be used for the rendering business hours overlay. Called by the fill system.
  businessHoursSegClasses: function(seg) {
    return [ 'fc-nonbusiness', 'fc-bgevent' ];
  },


  /* Handlers
  ------------------------------------------------------------------------------------------------------------------*/


  // Attaches event-element-related handlers to the container element and leverage bubbling
  bindSegHandlers: function() {
    var _this = this;
    var view = this.view;

    $.each(
      {
        mouseenter: function(seg, ev) {
          _this.triggerSegMouseover(seg, ev);
        },
        mouseleave: function(seg, ev) {
          _this.triggerSegMouseout(seg, ev);
        },
        click: function(seg, ev) {
          return view.trigger('eventClick', this, seg.event, ev); // can return `false` to cancel
        },
        mousedown: function(seg, ev) {
          if ($(ev.target).is('.fc-resizer') && view.isEventResizable(seg.event)) {
            _this.segResizeMousedown(seg, ev, $(ev.target).is('.fc-start-resizer'));
          }
          else if (view.isEventDraggable(seg.event)) {
            _this.segDragMousedown(seg, ev);
          }
        }
      },
      function(name, func) {
        // attach the handler to the container element and only listen for real event elements via bubbling
        _this.el.on(name, '.fc-event-container > *', function(ev) {
          var seg = $(this).data('fc-seg'); // grab segment data. put there by View::renderEvents

          // only call the handlers if there is not a drag/resize in progress
          if (seg && !_this.isDraggingSeg && !_this.isResizingSeg) {
            return func.call(this, seg, ev); // `this` will be the event element
          }
        });
      }
    );
  },


  // Updates internal state and triggers handlers for when an event element is moused over
  triggerSegMouseover: function(seg, ev) {
    if (!this.mousedOverSeg) {
      this.mousedOverSeg = seg;
      this.view.trigger('eventMouseover', seg.el[0], seg.event, ev);
    }
  },


  // Updates internal state and triggers handlers for when an event element is moused out.
  // Can be given no arguments, in which case it will mouseout the segment that was previously moused over.
  triggerSegMouseout: function(seg, ev) {
    ev = ev || {}; // if given no args, make a mock mouse event

    if (this.mousedOverSeg) {
      seg = seg || this.mousedOverSeg; // if given no args, use the currently moused-over segment
      this.mousedOverSeg = null;
      this.view.trigger('eventMouseout', seg.el[0], seg.event, ev);
    }
  },


  /* Event Dragging
  ------------------------------------------------------------------------------------------------------------------*/


  // Called when the user does a mousedown on an event, which might lead to dragging.
  // Generic enough to work with any type of Grid.
  segDragMousedown: function(seg, ev) {
    var _this = this;
    var view = this.view;
    var calendar = view.calendar;
    var el = seg.el;
    var event = seg.event;
    var dropLocation;

    // A clone of the original element that will move with the mouse
    var mouseFollower = new MouseFollower(seg.el, {
      parentEl: view.el,
      opacity: view.opt('dragOpacity'),
      revertDuration: view.opt('dragRevertDuration'),
      zIndex: 2 // one above the .fc-view
    });

    // Tracks mouse movement over the *view's* coordinate map. Allows dragging and dropping between subcomponents
    // of the view.
    var dragListener = new CellDragListener(view.coordMap, {
      distance: 5,
      scroll: view.opt('dragScroll'),
      subjectEl: el,
      subjectCenter: true,
      listenStart: function(ev) {
        mouseFollower.hide(); // don't show until we know this is a real drag
        mouseFollower.start(ev);
      },
      dragStart: function(ev) {
        _this.triggerSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
        _this.segDragStart(seg, ev);
        view.hideEvent(event); // hide all event segments. our mouseFollower will take over
      },
      cellOver: function(cell, isOrig, origCell) {

        // starting cell could be forced (DayGrid.limit)
        if (seg.cell) {
          origCell = seg.cell;
        }

        dropLocation = _this.computeEventDrop(origCell, cell, event);

        if (dropLocation && !calendar.isEventRangeAllowed(dropLocation, event)) {
          disableCursor();
          dropLocation = null;
        }

        // if a valid drop location, have the subclass render a visual indication
        if (dropLocation && view.renderDrag(dropLocation, seg)) {
          mouseFollower.hide(); // if the subclass is already using a mock event "helper", hide our own
        }
        else {
          mouseFollower.show(); // otherwise, have the helper follow the mouse (no snapping)
        }

        if (isOrig) {
          dropLocation = null; // needs to have moved cells to be a valid drop
        }
      },
      cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
        view.unrenderDrag(); // unrender whatever was done in renderDrag
        mouseFollower.show(); // show in case we are moving out of all cells
        dropLocation = null;
      },
      cellDone: function() { // Called after a cellOut OR before a dragStop
        enableCursor();
      },
      dragStop: function(ev) {
        // do revert animation if hasn't changed. calls a callback when finished (whether animation or not)
        mouseFollower.stop(!dropLocation, function() {
          view.unrenderDrag();
          view.showEvent(event);
          _this.segDragStop(seg, ev);

          if (dropLocation) {
            view.reportEventDrop(event, dropLocation, this.largeUnit, el, ev);
          }
        });
      },
      listenStop: function() {
        mouseFollower.stop(); // put in listenStop in case there was a mousedown but the drag never started
      }
    });

    dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
  },


  // Called before event segment dragging starts
  segDragStart: function(seg, ev) {
    this.isDraggingSeg = true;
    this.view.trigger('eventDragStart', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
  },


  // Called after event segment dragging stops
  segDragStop: function(seg, ev) {
    this.isDraggingSeg = false;
    this.view.trigger('eventDragStop', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
  },


  // Given the cell an event drag began, and the cell event was dropped, calculates the new start/end/allDay
  // values for the event. Subclasses may override and set additional properties to be used by renderDrag.
  // A falsy returned value indicates an invalid drop.
  computeEventDrop: function(startCell, endCell, event) {
    var calendar = this.view.calendar;
    var dragStart = startCell.start;
    var dragEnd = endCell.start;
    var delta;
    var dropLocation;

    if (dragStart.hasTime() === dragEnd.hasTime()) {
      delta = this.diffDates(dragEnd, dragStart);

      // if an all-day event was in a timed area and it was dragged to a different time,
      // guarantee an end and adjust start/end to have times
      if (event.allDay && durationHasTime(delta)) {
        dropLocation = {
          start: event.start.clone(),
          end: calendar.getEventEnd(event), // will be an ambig day
          allDay: false // for normalizeEventRangeTimes
        };
        calendar.normalizeEventRangeTimes(dropLocation);
      }
      // othewise, work off existing values
      else {
        dropLocation = {
          start: event.start.clone(),
          end: event.end ? event.end.clone() : null,
          allDay: event.allDay // keep it the same
        };
      }

      dropLocation.start.add(delta);
      if (dropLocation.end) {
        dropLocation.end.add(delta);
      }
    }
    else {
      // if switching from day <-> timed, start should be reset to the dropped date, and the end cleared
      dropLocation = {
        start: dragEnd.clone(),
        end: null, // end should be cleared
        allDay: !dragEnd.hasTime()
      };
    }

    return dropLocation;
  },


  // Utility for apply dragOpacity to a jQuery set
  applyDragOpacity: function(els) {
    var opacity = this.view.opt('dragOpacity');

    if (opacity != null) {
      els.each(function(i, node) {
        // Don't use jQuery (will set an IE filter), do it the old fashioned way.
        // In IE8, a helper element will disappears if there's a filter.
        node.style.opacity = opacity;
      });
    }
  },


  /* External Element Dragging
  ------------------------------------------------------------------------------------------------------------------*/


  // Called when a jQuery UI drag is initiated anywhere in the DOM
  externalDragStart: function(ev, ui) {
    var view = this.view;
    var el;
    var accept;

    if (view.opt('droppable')) { // only listen if this setting is on
      el = $((ui ? ui.item : null) || ev.target);

      // Test that the dragged element passes the dropAccept selector or filter function.
      // FYI, the default is "*" (matches all)
      accept = view.opt('dropAccept');
      if ($.isFunction(accept) ? accept.call(el[0], el) : el.is(accept)) {
        if (!this.isDraggingExternal) { // prevent double-listening if fired twice
          this.listenToExternalDrag(el, ev, ui);
        }
      }
    }
  },


  // Called when a jQuery UI drag starts and it needs to be monitored for cell dropping
  listenToExternalDrag: function(el, ev, ui) {
    var _this = this;
    var meta = getDraggedElMeta(el); // extra data about event drop, including possible event to create
    var dragListener;
    var dropLocation; // a null value signals an unsuccessful drag

    // listener that tracks mouse movement over date-associated pixel regions
    dragListener = new CellDragListener(this.coordMap, {
      listenStart: function() {
        _this.isDraggingExternal = true;
      },
      cellOver: function(cell) {
        dropLocation = _this.computeExternalDrop(cell, meta);
        if (dropLocation) {
          _this.renderDrag(dropLocation); // called without a seg parameter
        }
        else { // invalid drop cell
          disableCursor();
        }
      },
      cellOut: function() {
        dropLocation = null; // signal unsuccessful
        _this.unrenderDrag();
        enableCursor();
      },
      dragStop: function() {
        _this.unrenderDrag();
        enableCursor();

        if (dropLocation) { // element was dropped on a valid date/time cell
          _this.view.reportExternalDrop(meta, dropLocation, el, ev, ui);
        }
      },
      listenStop: function() {
        _this.isDraggingExternal = false;
      }
    });

    dragListener.startDrag(ev); // start listening immediately
  },


  // Given a cell to be dropped upon, and misc data associated with the jqui drag (guaranteed to be a plain object),
  // returns start/end dates for the event that would result from the hypothetical drop. end might be null.
  // Returning a null value signals an invalid drop cell.
  computeExternalDrop: function(cell, meta) {
    var dropLocation = {
      start: cell.start.clone(),
      end: null
    };

    // if dropped on an all-day cell, and element's metadata specified a time, set it
    if (meta.startTime && !dropLocation.start.hasTime()) {
      dropLocation.start.time(meta.startTime);
    }

    if (meta.duration) {
      dropLocation.end = dropLocation.start.clone().add(meta.duration);
    }

    if (!this.view.calendar.isExternalDropRangeAllowed(dropLocation, meta.eventProps)) {
      return null;
    }

    return dropLocation;
  },



  /* Drag Rendering (for both events and an external elements)
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of an event or external element being dragged.
  // `dropLocation` contains hypothetical start/end/allDay values the event would have if dropped. end can be null.
  // `seg` is the internal segment object that is being dragged. If dragging an external element, `seg` is null.
  // A truthy returned value indicates this method has rendered a helper element.
  renderDrag: function(dropLocation, seg) {
    // subclasses must implement
  },


  // Unrenders a visual indication of an event or external element being dragged
  unrenderDrag: function() {
    // subclasses must implement
  },


  /* Resizing
  ------------------------------------------------------------------------------------------------------------------*/


  // Called when the user does a mousedown on an event's resizer, which might lead to resizing.
  // Generic enough to work with any type of Grid.
  segResizeMousedown: function(seg, ev, isStart) {
    var _this = this;
    var view = this.view;
    var calendar = view.calendar;
    var el = seg.el;
    var event = seg.event;
    var eventEnd = calendar.getEventEnd(event);
    var dragListener;
    var resizeLocation; // falsy if invalid resize

    // Tracks mouse movement over the *grid's* coordinate map
    dragListener = new CellDragListener(this.coordMap, {
      distance: 5,
      scroll: view.opt('dragScroll'),
      subjectEl: el,
      dragStart: function(ev) {
        _this.triggerSegMouseout(seg, ev); // ensure a mouseout on the manipulated event has been reported
        _this.segResizeStart(seg, ev);
      },
      cellOver: function(cell, isOrig, origCell) {
        resizeLocation = isStart ?
          _this.computeEventStartResize(origCell, cell, event) :
          _this.computeEventEndResize(origCell, cell, event);

        if (resizeLocation) {
          if (!calendar.isEventRangeAllowed(resizeLocation, event)) {
            disableCursor();
            resizeLocation = null;
          }
          // no change? (TODO: how does this work with timezones?)
          else if (resizeLocation.start.isSame(event.start) && resizeLocation.end.isSame(eventEnd)) {
            resizeLocation = null;
          }
        }

        if (resizeLocation) {
          view.hideEvent(event);
          _this.renderEventResize(resizeLocation, seg);
        }
      },
      cellOut: function() { // called before mouse moves to a different cell OR moved out of all cells
        resizeLocation = null;
      },
      cellDone: function() { // resets the rendering to show the original event
        _this.unrenderEventResize();
        view.showEvent(event);
        enableCursor();
      },
      dragStop: function(ev) {
        _this.segResizeStop(seg, ev);

        if (resizeLocation) { // valid date to resize to?
          view.reportEventResize(event, resizeLocation, this.largeUnit, el, ev);
        }
      }
    });

    dragListener.mousedown(ev); // start listening, which will eventually lead to a dragStart
  },


  // Called before event segment resizing starts
  segResizeStart: function(seg, ev) {
    this.isResizingSeg = true;
    this.view.trigger('eventResizeStart', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
  },


  // Called after event segment resizing stops
  segResizeStop: function(seg, ev) {
    this.isResizingSeg = false;
    this.view.trigger('eventResizeStop', seg.el[0], seg.event, ev, {}); // last argument is jqui dummy
  },


  // Returns new date-information for an event segment being resized from its start
  computeEventStartResize: function(startCell, endCell, event) {
    return this.computeEventResize('start', startCell, endCell, event);
  },


  // Returns new date-information for an event segment being resized from its end
  computeEventEndResize: function(startCell, endCell, event) {
    return this.computeEventResize('end', startCell, endCell, event);
  },


  // Returns new date-information for an event segment being resized from its start OR end
  // `type` is either 'start' or 'end'
  computeEventResize: function(type, startCell, endCell, event) {
    var calendar = this.view.calendar;
    var delta = this.diffDates(endCell[type], startCell[type]);
    var range;
    var defaultDuration;

    // build original values to work from, guaranteeing a start and end
    range = {
      start: event.start.clone(),
      end: calendar.getEventEnd(event),
      allDay: event.allDay
    };

    // if an all-day event was in a timed area and was resized to a time, adjust start/end to have times
    if (range.allDay && durationHasTime(delta)) {
      range.allDay = false;
      calendar.normalizeEventRangeTimes(range);
    }

    range[type].add(delta); // apply delta to start or end

    // if the event was compressed too small, find a new reasonable duration for it
    if (!range.start.isBefore(range.end)) {

      defaultDuration = event.allDay ?
        calendar.defaultAllDayEventDuration :
        calendar.defaultTimedEventDuration;

      // between the cell's duration and the event's default duration, use the smaller of the two.
      // example: if year-length slots, and compressed to one slot, we don't want the event to be a year long
      if (this.cellDuration && this.cellDuration < defaultDuration) {
        defaultDuration = this.cellDuration;
      }

      if (type == 'start') { // resizing the start?
        range.start = range.end.clone().subtract(defaultDuration);
      }
      else { // resizing the end?
        range.end = range.start.clone().add(defaultDuration);
      }
    }

    return range;
  },


  // Renders a visual indication of an event being resized.
  // `range` has the updated dates of the event. `seg` is the original segment object involved in the drag.
  renderEventResize: function(range, seg) {
    // subclasses must implement
  },


  // Unrenders a visual indication of an event being resized.
  unrenderEventResize: function() {
    // subclasses must implement
  },


  /* Rendering Utils
  ------------------------------------------------------------------------------------------------------------------*/


  // Compute the text that should be displayed on an event's element.
  // `range` can be the Event object itself, or something range-like, with at least a `start`.
  // If event times are disabled, or the event has no time, will return a blank string.
  // If not specified, formatStr will default to the eventTimeFormat setting,
  // and displayEnd will default to the displayEventEnd setting.
  getEventTimeText: function(range, formatStr, displayEnd) {

    if (formatStr == null) {
      formatStr = this.eventTimeFormat;
    }

    if (displayEnd == null) {
      displayEnd = this.displayEventEnd;
    }

    if (this.displayEventTime && range.start.hasTime()) {
      if (displayEnd && range.end) {
        return this.view.formatRange(range, formatStr);
      }
      else {
        return range.start.format(formatStr);
      }
    }

    return '';
  },


  // Generic utility for generating the HTML classNames for an event segment's element
  getSegClasses: function(seg, isDraggable, isResizable) {
    var event = seg.event;
    var classes = [
      'fc-event',
      seg.isStart ? 'fc-start' : 'fc-not-start',
      seg.isEnd ? 'fc-end' : 'fc-not-end'
    ].concat(
      event.className,
      event.source ? event.source.className : []
    );

    if (isDraggable) {
      classes.push('fc-draggable');
    }
    if (isResizable) {
      classes.push('fc-resizable');
    }

    return classes;
  },


  // Utility for generating event skin-related CSS properties
  getEventSkinCss: function(event) {
    var view = this.view;
    var source = event.source || {};
    var eventColor = event.color;
    var sourceColor = source.color;
    var optionColor = view.opt('eventColor');

    return {
      'background-color':
        event.backgroundColor ||
        eventColor ||
        source.backgroundColor ||
        sourceColor ||
        view.opt('eventBackgroundColor') ||
        optionColor,
      'border-color':
        event.borderColor ||
        eventColor ||
        source.borderColor ||
        sourceColor ||
        view.opt('eventBorderColor') ||
        optionColor,
      color:
        event.textColor ||
        source.textColor ||
        view.opt('eventTextColor')
    };
  },


  /* Converting events -> ranges -> segs
  ------------------------------------------------------------------------------------------------------------------*/


  // Converts an array of event objects into an array of event segment objects.
  // A custom `rangeToSegsFunc` may be given for arbitrarily slicing up events.
  // Doesn't guarantee an order for the resulting array.
  eventsToSegs: function(events, rangeToSegsFunc) {
    var eventRanges = this.eventsToRanges(events);
    var segs = [];
    var i;

    for (i = 0; i < eventRanges.length; i++) {
      segs.push.apply(
        segs,
        this.eventRangeToSegs(eventRanges[i], rangeToSegsFunc)
      );
    }

    return segs;
  },


  // Converts an array of events into an array of "range" objects.
  // A "range" object is a plain object with start/end properties denoting the time it covers. Also an event property.
  // For "normal" events, this will be identical to the event's start/end, but for "inverse-background" events,
  // will create an array of ranges that span the time *not* covered by the given event.
  // Doesn't guarantee an order for the resulting array.
  eventsToRanges: function(events) {
    var _this = this;
    var eventsById = groupEventsById(events);
    var ranges = [];

    // group by ID so that related inverse-background events can be rendered together
    $.each(eventsById, function(id, eventGroup) {
      if (eventGroup.length) {
        ranges.push.apply(
          ranges,
          isInverseBgEvent(eventGroup[0]) ?
            _this.eventsToInverseRanges(eventGroup) :
            _this.eventsToNormalRanges(eventGroup)
        );
      }
    });

    return ranges;
  },


  // Converts an array of "normal" events (not inverted rendering) into a parallel array of ranges
  eventsToNormalRanges: function(events) {
    var calendar = this.view.calendar;
    var ranges = [];
    var i, event;
    var eventStart, eventEnd;

    for (i = 0; i < events.length; i++) {
      event = events[i];

      // make copies and normalize by stripping timezone
      eventStart = event.start.clone().stripZone();
      eventEnd = calendar.getEventEnd(event).stripZone();

      ranges.push({
        event: event,
        start: eventStart,
        end: eventEnd,
        eventStartMS: +eventStart,
        eventDurationMS: eventEnd - eventStart
      });
    }

    return ranges;
  },


  // Converts an array of events, with inverse-background rendering, into an array of range objects.
  // The range objects will cover all the time NOT covered by the events.
  eventsToInverseRanges: function(events) {
    var view = this.view;
    var viewStart = view.start.clone().stripZone(); // normalize timezone
    var viewEnd = view.end.clone().stripZone(); // normalize timezone
    var normalRanges = this.eventsToNormalRanges(events); // will give us normalized dates we can use w/o copies
    var inverseRanges = [];
    var event0 = events[0]; // assign this to each range's `.event`
    var start = viewStart; // the end of the previous range. the start of the new range
    var i, normalRange;

    // ranges need to be in order. required for our date-walking algorithm
    normalRanges.sort(compareNormalRanges);

    for (i = 0; i < normalRanges.length; i++) {
      normalRange = normalRanges[i];

      // add the span of time before the event (if there is any)
      if (normalRange.start > start) { // compare millisecond time (skip any ambig logic)
        inverseRanges.push({
          event: event0,
          start: start,
          end: normalRange.start
        });
      }

      start = normalRange.end;
    }

    // add the span of time after the last event (if there is any)
    if (start < viewEnd) { // compare millisecond time (skip any ambig logic)
      inverseRanges.push({
        event: event0,
        start: start,
        end: viewEnd
      });
    }

    return inverseRanges;
  },


  // Slices the given event range into one or more segment objects.
  // A `rangeToSegsFunc` custom slicing function can be given.
  eventRangeToSegs: function(eventRange, rangeToSegsFunc) {
    var segs;
    var i, seg;

    eventRange = this.view.calendar.ensureVisibleEventRange(eventRange);

    if (rangeToSegsFunc) {
      segs = rangeToSegsFunc(eventRange);
    }
    else {
      segs = this.rangeToSegs(eventRange); // defined by the subclass
    }

    for (i = 0; i < segs.length; i++) {
      seg = segs[i];
      seg.event = eventRange.event;
      seg.eventStartMS = eventRange.eventStartMS;
      seg.eventDurationMS = eventRange.eventDurationMS;
    }

    return segs;
  }

});


/* Utilities
----------------------------------------------------------------------------------------------------------------------*/


function isBgEvent(event) { // returns true if background OR inverse-background
  var rendering = getEventRendering(event);
  return rendering === 'background' || rendering === 'inverse-background';
}


function isInverseBgEvent(event) {
  return getEventRendering(event) === 'inverse-background';
}


function getEventRendering(event) {
  return firstDefined((event.source || {}).rendering, event.rendering);
}


function groupEventsById(events) {
  var eventsById = {};
  var i, event;

  for (i = 0; i < events.length; i++) {
    event = events[i];
    (eventsById[event._id] || (eventsById[event._id] = [])).push(event);
  }

  return eventsById;
}


// A cmp function for determining which non-inverted "ranges" (see above) happen earlier
function compareNormalRanges(range1, range2) {
  return range1.eventStartMS - range2.eventStartMS; // earlier ranges go first
}


// A cmp function for determining which segments should take visual priority
// DOES NOT WORK ON INVERTED BACKGROUND EVENTS because they have no eventStartMS/eventDurationMS
function compareSegs(seg1, seg2) {
  return seg1.eventStartMS - seg2.eventStartMS || // earlier events go first
    seg2.eventDurationMS - seg1.eventDurationMS || // tie? longer events go first
    seg2.event.allDay - seg1.event.allDay || // tie? put all-day events first (booleans cast to 0/1)
    (seg1.event.title || '').localeCompare(seg2.event.title); // tie? alphabetically by title
}

fc.compareSegs = compareSegs; // export


/* External-Dragging-Element Data
----------------------------------------------------------------------------------------------------------------------*/

// Require all HTML5 data-* attributes used by FullCalendar to have this prefix.
// A value of '' will query attributes like data-event. A value of 'fc' will query attributes like data-fc-event.
fc.dataAttrPrefix = '';

// Given a jQuery element that might represent a dragged FullCalendar event, returns an intermediate data structure
// to be used for Event Object creation.
// A defined `.eventProps`, even when empty, indicates that an event should be created.
function getDraggedElMeta(el) {
  var prefix = fc.dataAttrPrefix;
  var eventProps; // properties for creating the event, not related to date/time
  var startTime; // a Duration
  var duration;
  var stick;

  if (prefix) { prefix += '-'; }
  eventProps = el.data(prefix + 'event') || null;

  if (eventProps) {
    if (typeof eventProps === 'object') {
      eventProps = $.extend({}, eventProps); // make a copy
    }
    else { // something like 1 or true. still signal event creation
      eventProps = {};
    }

    // pluck special-cased date/time properties
    startTime = eventProps.start;
    if (startTime == null) { startTime = eventProps.time; } // accept 'time' as well
    duration = eventProps.duration;
    stick = eventProps.stick;
    delete eventProps.start;
    delete eventProps.time;
    delete eventProps.duration;
    delete eventProps.stick;
  }

  // fallback to standalone attribute values for each of the date/time properties
  if (startTime == null) { startTime = el.data(prefix + 'start'); }
  if (startTime == null) { startTime = el.data(prefix + 'time'); } // accept 'time' as well
  if (duration == null) { duration = el.data(prefix + 'duration'); }
  if (stick == null) { stick = el.data(prefix + 'stick'); }

  // massage into correct data types
  startTime = startTime != null ? moment.duration(startTime) : null;
  duration = duration != null ? moment.duration(duration) : null;
  stick = Boolean(stick);

  return { eventProps: eventProps, startTime: startTime, duration: duration, stick: stick };
}


;;

/* A component that renders a grid of whole-days that runs horizontally. There can be multiple rows, one per week.
----------------------------------------------------------------------------------------------------------------------*/

var DayGrid = Grid.extend({

  numbersVisible: false, // should render a row for day/week numbers? set by outside view. TODO: make internal
  bottomCoordPadding: 0, // hack for extending the hit area for the last row of the coordinate grid
  breakOnWeeks: null, // should create a new row for each week? set by outside view

  cellDates: null, // flat chronological array of each cell's dates
  dayToCellOffsets: null, // maps days offsets from grid's start date, to cell offsets

  rowEls: null, // set of fake row elements
  dayEls: null, // set of whole-day elements comprising the row's background
  helperEls: null, // set of cell skeleton elements for rendering the mock event "helper"


  constructor: function() {
    Grid.apply(this, arguments);

    this.cellDuration = moment.duration(1, 'day'); // for Grid system
  },


  // Renders the rows and columns into the component's `this.el`, which should already be assigned.
  // isRigid determins whether the individual rows should ignore the contents and be a constant height.
  // Relies on the view's colCnt and rowCnt. In the future, this component should probably be self-sufficient.
  renderDates: function(isRigid) {
    var view = this.view;
    var rowCnt = this.rowCnt;
    var colCnt = this.colCnt;
    var cellCnt = rowCnt * colCnt;
    var html = '';
    var row;
    var i, cell;

    for (row = 0; row < rowCnt; row++) {
      html += this.dayRowHtml(row, isRigid);
    }
    this.el.html(html);

    this.rowEls = this.el.find('.fc-row');
    this.dayEls = this.el.find('.fc-day');

    // trigger dayRender with each cell's element
    for (i = 0; i < cellCnt; i++) {
      cell = this.getCell(i);
      view.trigger('dayRender', null, cell.start, this.dayEls.eq(i));
    }
  },


  unrenderDates: function() {
    this.removeSegPopover();
  },


  renderBusinessHours: function() {
    var events = this.view.calendar.getBusinessHoursEvents(true); // wholeDay=true
    var segs = this.eventsToSegs(events);

    this.renderFill('businessHours', segs, 'bgevent');
  },


  // Generates the HTML for a single row. `row` is the row number.
  dayRowHtml: function(row, isRigid) {
    var view = this.view;
    var classes = [ 'fc-row', 'fc-week', view.widgetContentClass ];

    if (isRigid) {
      classes.push('fc-rigid');
    }

    return '' +
      '<div class="' + classes.join(' ') + '">' +
        '<div class="fc-bg">' +
          '<table>' +
            this.rowHtml('day', row) + // leverages RowRenderer. calls dayCellHtml()
          '</table>' +
        '</div>' +
        '<div class="fc-content-skeleton">' +
          '<table>' +
            (this.numbersVisible ?
              '<thead>' +
                this.rowHtml('number', row) + // leverages RowRenderer. View will define render method
              '</thead>' :
              ''
              ) +
          '</table>' +
        '</div>' +
      '</div>';
  },


  // Renders the HTML for a whole-day cell. Will eventually end up in the day-row's background.
  // We go through a 'day' row type instead of just doing a 'bg' row type so that the View can do custom rendering
  // specifically for whole-day rows, whereas a 'bg' might also be used for other purposes (TimeGrid bg for example).
  dayCellHtml: function(cell) {
    return this.bgCellHtml(cell);
  },


  /* Options
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes a default column header formatting string if `colFormat` is not explicitly defined
  computeColHeadFormat: function() {
    if (this.rowCnt > 1) { // more than one week row. day numbers will be in each cell
      return 'ddd'; // "Sat"
    }
    else if (this.colCnt > 1) { // multiple days, so full single date string WON'T be in title text
      return this.view.opt('dayOfMonthFormat'); // "Sat 12/10"
    }
    else { // single day, so full single date string will probably be in title text
      return 'dddd'; // "Saturday"
    }
  },


  // Computes a default event time formatting string if `timeFormat` is not explicitly defined
  computeEventTimeFormat: function() {
    return this.view.opt('extraSmallTimeFormat'); // like "6p" or "6:30p"
  },


  // Computes a default `displayEventEnd` value if one is not expliclty defined
  computeDisplayEventEnd: function() {
    return this.colCnt == 1; // we'll likely have space if there's only one day
  },


  /* Cell System
  ------------------------------------------------------------------------------------------------------------------*/


  rangeUpdated: function() {
    var cellDates;
    var firstDay;
    var rowCnt;
    var colCnt;

    this.updateCellDates(); // populates cellDates and dayToCellOffsets
    cellDates = this.cellDates;

    if (this.breakOnWeeks) {
      // count columns until the day-of-week repeats
      firstDay = cellDates[0].day();
      for (colCnt = 1; colCnt < cellDates.length; colCnt++) {
        if (cellDates[colCnt].day() == firstDay) {
          break;
        }
      }
      rowCnt = Math.ceil(cellDates.length / colCnt);
    }
    else {
      rowCnt = 1;
      colCnt = cellDates.length;
    }

    this.rowCnt = rowCnt;
    this.colCnt = colCnt;
  },


  // Populates cellDates and dayToCellOffsets
  updateCellDates: function() {
    var view = this.view;
    var date = this.start.clone();
    var dates = [];
    var offset = -1;
    var offsets = [];

    while (date.isBefore(this.end)) { // loop each day from start to end
      if (view.isHiddenDay(date)) {
        offsets.push(offset + 0.5); // mark that it's between offsets
      }
      else {
        offset++;
        offsets.push(offset);
        dates.push(date.clone());
      }
      date.add(1, 'days');
    }

    this.cellDates = dates;
    this.dayToCellOffsets = offsets;
  },


  // Given a cell object, generates its start date. Returns a reference-free copy.
  computeCellDate: function(cell) {
    var colCnt = this.colCnt;
    var index = cell.row * colCnt + (this.isRTL ? colCnt - cell.col - 1 : cell.col);

    return this.cellDates[index].clone();
  },


  // Retrieves the element representing the given row
  getRowEl: function(row) {
    return this.rowEls.eq(row);
  },


  // Retrieves the element representing the given column
  getColEl: function(col) {
    return this.dayEls.eq(col);
  },


  // Gets the whole-day element associated with the cell
  getCellDayEl: function(cell) {
    return this.dayEls.eq(cell.row * this.colCnt + cell.col);
  },


  // Overrides Grid's method for when row coordinates are computed
  computeRowCoords: function() {
    var rowCoords = Grid.prototype.computeRowCoords.call(this); // call the super-method

    // hack for extending last row (used by AgendaView)
    rowCoords[rowCoords.length - 1].bottom += this.bottomCoordPadding;

    return rowCoords;
  },


  /* Dates
  ------------------------------------------------------------------------------------------------------------------*/


  // Slices up a date range by row into an array of segments
  rangeToSegs: function(range) {
    var isRTL = this.isRTL;
    var rowCnt = this.rowCnt;
    var colCnt = this.colCnt;
    var segs = [];
    var first, last; // inclusive cell-offset range for given range
    var row;
    var rowFirst, rowLast; // inclusive cell-offset range for current row
    var isStart, isEnd;
    var segFirst, segLast; // inclusive cell-offset range for segment
    var seg;

    range = this.view.computeDayRange(range); // make whole-day range, considering nextDayThreshold
    first = this.dateToCellOffset(range.start);
    last = this.dateToCellOffset(range.end.subtract(1, 'days')); // offset of inclusive end date

    for (row = 0; row < rowCnt; row++) {
      rowFirst = row * colCnt;
      rowLast = rowFirst + colCnt - 1;

      // intersect segment's offset range with the row's
      segFirst = Math.max(rowFirst, first);
      segLast = Math.min(rowLast, last);

      // deal with in-between indices
      segFirst = Math.ceil(segFirst); // in-between starts round to next cell
      segLast = Math.floor(segLast); // in-between ends round to prev cell

      if (segFirst <= segLast) { // was there any intersection with the current row?

        // must be matching integers to be the segment's start/end
        isStart = segFirst === first;
        isEnd = segLast === last;

        // translate offsets to be relative to start-of-row
        segFirst -= rowFirst;
        segLast -= rowFirst;

        seg = { row: row, isStart: isStart, isEnd: isEnd };
        if (isRTL) {
          seg.leftCol = colCnt - segLast - 1;
          seg.rightCol = colCnt - segFirst - 1;
        }
        else {
          seg.leftCol = segFirst;
          seg.rightCol = segLast;
        }
        segs.push(seg);
      }
    }

    return segs;
  },


  // Given a date, returns its chronolocial cell-offset from the first cell of the grid.
  // If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
  // If before the first offset, returns a negative number.
  // If after the last offset, returns an offset past the last cell offset.
  // Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
  dateToCellOffset: function(date) {
    var offsets = this.dayToCellOffsets;
    var day = date.diff(this.start, 'days');

    if (day < 0) {
      return offsets[0] - 1;
    }
    else if (day >= offsets.length) {
      return offsets[offsets.length - 1] + 1;
    }
    else {
      return offsets[day];
    }
  },


  /* Event Drag Visualization
  ------------------------------------------------------------------------------------------------------------------*/
  // TODO: move to DayGrid.event, similar to what we did with Grid's drag methods


  // Renders a visual indication of an event or external element being dragged.
  // The dropLocation's end can be null. seg can be null. See Grid::renderDrag for more info.
  renderDrag: function(dropLocation, seg) {

    // always render a highlight underneath
    this.renderHighlight(this.eventRangeToSegs(dropLocation));

    // if a segment from the same calendar but another component is being dragged, render a helper event
    if (seg && !seg.el.closest(this.el).length) {

      this.renderRangeHelper(dropLocation, seg);
      this.applyDragOpacity(this.helperEls);

      return true; // a helper has been rendered
    }
  },


  // Unrenders any visual indication of a hovering event
  unrenderDrag: function() {
    this.unrenderHighlight();
    this.unrenderHelper();
  },


  /* Event Resize Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of an event being resized
  renderEventResize: function(range, seg) {
    this.renderHighlight(this.eventRangeToSegs(range));
    this.renderRangeHelper(range, seg);
  },


  // Unrenders a visual indication of an event being resized
  unrenderEventResize: function() {
    this.unrenderHighlight();
    this.unrenderHelper();
  },


  /* Event Helper
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a mock "helper" event. `sourceSeg` is the associated internal segment object. It can be null.
  renderHelper: function(event, sourceSeg) {
    var helperNodes = [];
    var segs = this.eventsToSegs([ event ]);
    var rowStructs;

    segs = this.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
    rowStructs = this.renderSegRows(segs);

    // inject each new event skeleton into each associated row
    this.rowEls.each(function(row, rowNode) {
      var rowEl = $(rowNode); // the .fc-row
      var skeletonEl = $('<div class="fc-helper-skeleton"><table/></div>'); // will be absolutely positioned
      var skeletonTop;

      // If there is an original segment, match the top position. Otherwise, put it at the row's top level
      if (sourceSeg && sourceSeg.row === row) {
        skeletonTop = sourceSeg.el.position().top;
      }
      else {
        skeletonTop = rowEl.find('.fc-content-skeleton tbody').position().top;
      }

      skeletonEl.css('top', skeletonTop)
        .find('table')
          .append(rowStructs[row].tbodyEl);

      rowEl.append(skeletonEl);
      helperNodes.push(skeletonEl[0]);
    });

    this.helperEls = $(helperNodes); // array -> jQuery set
  },


  // Unrenders any visual indication of a mock helper event
  unrenderHelper: function() {
    if (this.helperEls) {
      this.helperEls.remove();
      this.helperEls = null;
    }
  },


  /* Fill System (highlight, background events, business hours)
  ------------------------------------------------------------------------------------------------------------------*/


  fillSegTag: 'td', // override the default tag name


  // Renders a set of rectangles over the given segments of days.
  // Only returns segments that successfully rendered.
  renderFill: function(type, segs, className) {
    var nodes = [];
    var i, seg;
    var skeletonEl;

    segs = this.renderFillSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs

    for (i = 0; i < segs.length; i++) {
      seg = segs[i];
      skeletonEl = this.renderFillRow(type, seg, className);
      this.rowEls.eq(seg.row).append(skeletonEl);
      nodes.push(skeletonEl[0]);
    }

    this.elsByFill[type] = $(nodes);

    return segs;
  },


  // Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
  renderFillRow: function(type, seg, className) {
    var colCnt = this.colCnt;
    var startCol = seg.leftCol;
    var endCol = seg.rightCol + 1;
    var skeletonEl;
    var trEl;

    className = className || type.toLowerCase();

    skeletonEl = $(
      '<div class="fc-' + className + '-skeleton">' +
        '<table><tr/></table>' +
      '</div>'
    );
    trEl = skeletonEl.find('tr');

    if (startCol > 0) {
      trEl.append('<td colspan="' + startCol + '"/>');
    }

    trEl.append(
      seg.el.attr('colspan', endCol - startCol)
    );

    if (endCol < colCnt) {
      trEl.append('<td colspan="' + (colCnt - endCol) + '"/>');
    }

    this.bookendCells(trEl, type);

    return skeletonEl;
  }

});

;;

/* Event-rendering methods for the DayGrid class
----------------------------------------------------------------------------------------------------------------------*/

DayGrid.mixin({

  rowStructs: null, // an array of objects, each holding information about a row's foreground event-rendering


  // Unrenders all events currently rendered on the grid
  unrenderEvents: function() {
    this.removeSegPopover(); // removes the "more.." events popover
    Grid.prototype.unrenderEvents.apply(this, arguments); // calls the super-method
  },


  // Retrieves all rendered segment objects currently rendered on the grid
  getEventSegs: function() {
    return Grid.prototype.getEventSegs.call(this) // get the segments from the super-method
      .concat(this.popoverSegs || []); // append the segments from the "more..." popover
  },


  // Renders the given background event segments onto the grid
  renderBgSegs: function(segs) {

    // don't render timed background events
    var allDaySegs = $.grep(segs, function(seg) {
      return seg.event.allDay;
    });

    return Grid.prototype.renderBgSegs.call(this, allDaySegs); // call the super-method
  },


  // Renders the given foreground event segments onto the grid
  renderFgSegs: function(segs) {
    var rowStructs;

    // render an `.el` on each seg
    // returns a subset of the segs. segs that were actually rendered
    segs = this.renderFgSegEls(segs);

    rowStructs = this.rowStructs = this.renderSegRows(segs);

    // append to each row's content skeleton
    this.rowEls.each(function(i, rowNode) {
      $(rowNode).find('.fc-content-skeleton > table').append(
        rowStructs[i].tbodyEl
      );
    });

    return segs; // return only the segs that were actually rendered
  },


  // Unrenders all currently rendered foreground event segments
  unrenderFgSegs: function() {
    var rowStructs = this.rowStructs || [];
    var rowStruct;

    while ((rowStruct = rowStructs.pop())) {
      rowStruct.tbodyEl.remove();
    }

    this.rowStructs = null;
  },


  // Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
  // Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
  // PRECONDITION: each segment shoud already have a rendered and assigned `.el`
  renderSegRows: function(segs) {
    var rowStructs = [];
    var segRows;
    var row;

    segRows = this.groupSegRows(segs); // group into nested arrays

    // iterate each row of segment groupings
    for (row = 0; row < segRows.length; row++) {
      rowStructs.push(
        this.renderSegRow(row, segRows[row])
      );
    }

    return rowStructs;
  },


  // Builds the HTML to be used for the default element for an individual segment
  fgSegHtml: function(seg, disableResizing) {
    var view = this.view;
    var event = seg.event;
    var isDraggable = view.isEventDraggable(event);
    var isResizableFromStart = !disableResizing && event.allDay &&
      seg.isStart && view.isEventResizableFromStart(event);
    var isResizableFromEnd = !disableResizing && event.allDay &&
      seg.isEnd && view.isEventResizableFromEnd(event);
    var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd);
    var skinCss = cssToStr(this.getEventSkinCss(event));
    var timeHtml = '';
    var timeText;
    var titleHtml;

    classes.unshift('fc-day-grid-event', 'fc-h-event');

    // Only display a timed events time if it is the starting segment
    if (seg.isStart) {
      timeText = this.getEventTimeText(event);
      if (timeText) {
        timeHtml = '<span class="fc-time">' + htmlEscape(timeText) + '</span>';
      }
    }

    titleHtml =
      '<span class="fc-title">' +
        (htmlEscape(event.title || '') || '&nbsp;') + // we always want one line of height
      '</span>';

    return '<a class="' + classes.join(' ') + '"' +
        (event.url ?
          ' href="' + htmlEscape(event.url) + '"' :
          ''
          ) +
        (skinCss ?
          ' style="' + skinCss + '"' :
          ''
          ) +
      '>' +
        '<div class="fc-content">' +
          (this.isRTL ?
            titleHtml + ' ' + timeHtml : // put a natural space in between
            timeHtml + ' ' + titleHtml   //
            ) +
        '</div>' +
        (isResizableFromStart ?
          '<div class="fc-resizer fc-start-resizer" />' :
          ''
          ) +
        (isResizableFromEnd ?
          '<div class="fc-resizer fc-end-resizer" />' :
          ''
          ) +
      '</a>';
  },


  // Given a row # and an array of segments all in the same row, render a <tbody> element, a skeleton that contains
  // the segments. Returns object with a bunch of internal data about how the render was calculated.
  // NOTE: modifies rowSegs
  renderSegRow: function(row, rowSegs) {
    var colCnt = this.colCnt;
    var segLevels = this.buildSegLevels(rowSegs); // group into sub-arrays of levels
    var levelCnt = Math.max(1, segLevels.length); // ensure at least one level
    var tbody = $('<tbody/>');
    var segMatrix = []; // lookup for which segments are rendered into which level+col cells
    var cellMatrix = []; // lookup for all <td> elements of the level+col matrix
    var loneCellMatrix = []; // lookup for <td> elements that only take up a single column
    var i, levelSegs;
    var col;
    var tr;
    var j, seg;
    var td;

    // populates empty cells from the current column (`col`) to `endCol`
    function emptyCellsUntil(endCol) {
      while (col < endCol) {
        // try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
        td = (loneCellMatrix[i - 1] || [])[col];
        if (td) {
          td.attr(
            'rowspan',
            parseInt(td.attr('rowspan') || 1, 10) + 1
          );
        }
        else {
          td = $('<td/>');
          tr.append(td);
        }
        cellMatrix[i][col] = td;
        loneCellMatrix[i][col] = td;
        col++;
      }
    }

    for (i = 0; i < levelCnt; i++) { // iterate through all levels
      levelSegs = segLevels[i];
      col = 0;
      tr = $('<tr/>');

      segMatrix.push([]);
      cellMatrix.push([]);
      loneCellMatrix.push([]);

      // levelCnt might be 1 even though there are no actual levels. protect against this.
      // this single empty row is useful for styling.
      if (levelSegs) {
        for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
          seg = levelSegs[j];

          emptyCellsUntil(seg.leftCol);

          // create a container that occupies or more columns. append the event element.
          td = $('<td class="fc-event-container"/>').append(seg.el);
          if (seg.leftCol != seg.rightCol) {
            td.attr('colspan', seg.rightCol - seg.leftCol + 1);
          }
          else { // a single-column segment
            loneCellMatrix[i][col] = td;
          }

          while (col <= seg.rightCol) {
            cellMatrix[i][col] = td;
            segMatrix[i][col] = seg;
            col++;
          }

          tr.append(td);
        }
      }

      emptyCellsUntil(colCnt); // finish off the row
      this.bookendCells(tr, 'eventSkeleton');
      tbody.append(tr);
    }

    return { // a "rowStruct"
      row: row, // the row number
      tbodyEl: tbody,
      cellMatrix: cellMatrix,
      segMatrix: segMatrix,
      segLevels: segLevels,
      segs: rowSegs
    };
  },


  // Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
  // NOTE: modifies segs
  buildSegLevels: function(segs) {
    var levels = [];
    var i, seg;
    var j;

    // Give preference to elements with certain criteria, so they have
    // a chance to be closer to the top.
    segs.sort(compareSegs);

    for (i = 0; i < segs.length; i++) {
      seg = segs[i];

      // loop through levels, starting with the topmost, until the segment doesn't collide with other segments
      for (j = 0; j < levels.length; j++) {
        if (!isDaySegCollision(seg, levels[j])) {
          break;
        }
      }
      // `j` now holds the desired subrow index
      seg.level = j;

      // create new level array if needed and append segment
      (levels[j] || (levels[j] = [])).push(seg);
    }

    // order segments left-to-right. very important if calendar is RTL
    for (j = 0; j < levels.length; j++) {
      levels[j].sort(compareDaySegCols);
    }

    return levels;
  },


  // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
  groupSegRows: function(segs) {
    var segRows = [];
    var i;

    for (i = 0; i < this.rowCnt; i++) {
      segRows.push([]);
    }

    for (i = 0; i < segs.length; i++) {
      segRows[segs[i].row].push(segs[i]);
    }

    return segRows;
  }

});


// Computes whether two segments' columns collide. They are assumed to be in the same row.
function isDaySegCollision(seg, otherSegs) {
  var i, otherSeg;

  for (i = 0; i < otherSegs.length; i++) {
    otherSeg = otherSegs[i];

    if (
      otherSeg.leftCol <= seg.rightCol &&
      otherSeg.rightCol >= seg.leftCol
    ) {
      return true;
    }
  }

  return false;
}


// A cmp function for determining the leftmost event
function compareDaySegCols(a, b) {
  return a.leftCol - b.leftCol;
}

;;

/* Methods relate to limiting the number events for a given day on a DayGrid
----------------------------------------------------------------------------------------------------------------------*/
// NOTE: all the segs being passed around in here are foreground segs

DayGrid.mixin({

  segPopover: null, // the Popover that holds events that can't fit in a cell. null when not visible
  popoverSegs: null, // an array of segment objects that the segPopover holds. null when not visible


  removeSegPopover: function() {
    if (this.segPopover) {
      this.segPopover.hide(); // in handler, will call segPopover's removeElement
    }
  },


  // Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
  // `levelLimit` can be false (don't limit), a number, or true (should be computed).
  limitRows: function(levelLimit) {
    var rowStructs = this.rowStructs || [];
    var row; // row #
    var rowLevelLimit;

    for (row = 0; row < rowStructs.length; row++) {
      this.unlimitRow(row);

      if (!levelLimit) {
        rowLevelLimit = false;
      }
      else if (typeof levelLimit === 'number') {
        rowLevelLimit = levelLimit;
      }
      else {
        rowLevelLimit = this.computeRowLevelLimit(row);
      }

      if (rowLevelLimit !== false) {
        this.limitRow(row, rowLevelLimit);
      }
    }
  },


  // Computes the number of levels a row will accomodate without going outside its bounds.
  // Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
  // `row` is the row number.
  computeRowLevelLimit: function(row) {
    var rowEl = this.rowEls.eq(row); // the containing "fake" row div
    var rowHeight = rowEl.height(); // TODO: cache somehow?
    var trEls = this.rowStructs[row].tbodyEl.children();
    var i, trEl;
    var trHeight;

    function iterInnerHeights(i, childNode) {
      trHeight = Math.max(trHeight, $(childNode).outerHeight());
    }

    // Reveal one level <tr> at a time and stop when we find one out of bounds
    for (i = 0; i < trEls.length; i++) {
      trEl = trEls.eq(i).removeClass('fc-limited'); // reset to original state (reveal)

      // with rowspans>1 and IE8, trEl.outerHeight() would return the height of the largest cell,
      // so instead, find the tallest inner content element.
      trHeight = 0;
      trEl.find('> td > :first-child').each(iterInnerHeights);

      if (trEl.position().top + trHeight > rowHeight) {
        return i;
      }
    }

    return false; // should not limit at all
  },


  // Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
  // `row` is the row number.
  // `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
  limitRow: function(row, levelLimit) {
    var _this = this;
    var rowStruct = this.rowStructs[row];
    var moreNodes = []; // array of "more" <a> links and <td> DOM nodes
    var col = 0; // col #, left-to-right (not chronologically)
    var cell;
    var levelSegs; // array of segment objects in the last allowable level, ordered left-to-right
    var cellMatrix; // a matrix (by level, then column) of all <td> jQuery elements in the row
    var limitedNodes; // array of temporarily hidden level <tr> and segment <td> DOM nodes
    var i, seg;
    var segsBelow; // array of segment objects below `seg` in the current `col`
    var totalSegsBelow; // total number of segments below `seg` in any of the columns `seg` occupies
    var colSegsBelow; // array of segment arrays, below seg, one for each column (offset from segs's first column)
    var td, rowspan;
    var segMoreNodes; // array of "more" <td> cells that will stand-in for the current seg's cell
    var j;
    var moreTd, moreWrap, moreLink;

    // Iterates through empty level cells and places "more" links inside if need be
    function emptyCellsUntil(endCol) { // goes from current `col` to `endCol`
      while (col < endCol) {
        cell = _this.getCell(row, col);
        segsBelow = _this.getCellSegs(cell, levelLimit);
        if (segsBelow.length) {
          td = cellMatrix[levelLimit - 1][col];
          moreLink = _this.renderMoreLink(cell, segsBelow);
          moreWrap = $('<div/>').append(moreLink);
          td.append(moreWrap);
          moreNodes.push(moreWrap[0]);
        }
        col++;
      }
    }

    if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
      levelSegs = rowStruct.segLevels[levelLimit - 1];
      cellMatrix = rowStruct.cellMatrix;

      limitedNodes = rowStruct.tbodyEl.children().slice(levelLimit) // get level <tr> elements past the limit
        .addClass('fc-limited').get(); // hide elements and get a simple DOM-nodes array

      // iterate though segments in the last allowable level
      for (i = 0; i < levelSegs.length; i++) {
        seg = levelSegs[i];
        emptyCellsUntil(seg.leftCol); // process empty cells before the segment

        // determine *all* segments below `seg` that occupy the same columns
        colSegsBelow = [];
        totalSegsBelow = 0;
        while (col <= seg.rightCol) {
          cell = this.getCell(row, col);
          segsBelow = this.getCellSegs(cell, levelLimit);
          colSegsBelow.push(segsBelow);
          totalSegsBelow += segsBelow.length;
          col++;
        }

        if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
          td = cellMatrix[levelLimit - 1][seg.leftCol]; // the segment's parent cell
          rowspan = td.attr('rowspan') || 1;
          segMoreNodes = [];

          // make a replacement <td> for each column the segment occupies. will be one for each colspan
          for (j = 0; j < colSegsBelow.length; j++) {
            moreTd = $('<td class="fc-more-cell"/>').attr('rowspan', rowspan);
            segsBelow = colSegsBelow[j];
            cell = this.getCell(row, seg.leftCol + j);
            moreLink = this.renderMoreLink(cell, [ seg ].concat(segsBelow)); // count seg as hidden too
            moreWrap = $('<div/>').append(moreLink);
            moreTd.append(moreWrap);
            segMoreNodes.push(moreTd[0]);
            moreNodes.push(moreTd[0]);
          }

          td.addClass('fc-limited').after($(segMoreNodes)); // hide original <td> and inject replacements
          limitedNodes.push(td[0]);
        }
      }

      emptyCellsUntil(this.colCnt); // finish off the level
      rowStruct.moreEls = $(moreNodes); // for easy undoing later
      rowStruct.limitedEls = $(limitedNodes); // for easy undoing later
    }
  },


  // Reveals all levels and removes all "more"-related elements for a grid's row.
  // `row` is a row number.
  unlimitRow: function(row) {
    var rowStruct = this.rowStructs[row];

    if (rowStruct.moreEls) {
      rowStruct.moreEls.remove();
      rowStruct.moreEls = null;
    }

    if (rowStruct.limitedEls) {
      rowStruct.limitedEls.removeClass('fc-limited');
      rowStruct.limitedEls = null;
    }
  },


  // Renders an <a> element that represents hidden event element for a cell.
  // Responsible for attaching click handler as well.
  renderMoreLink: function(cell, hiddenSegs) {
    var _this = this;
    var view = this.view;

    return $('<a class="fc-more"/>')
      .text(
        this.getMoreLinkText(hiddenSegs.length)
      )
      .on('click', function(ev) {
        var clickOption = view.opt('eventLimitClick');
        var date = cell.start;
        var moreEl = $(this);
        var dayEl = _this.getCellDayEl(cell);
        var allSegs = _this.getCellSegs(cell);

        // rescope the segments to be within the cell's date
        var reslicedAllSegs = _this.resliceDaySegs(allSegs, date);
        var reslicedHiddenSegs = _this.resliceDaySegs(hiddenSegs, date);

        if (typeof clickOption === 'function') {
          // the returned value can be an atomic option
          clickOption = view.trigger('eventLimitClick', null, {
            date: date,
            dayEl: dayEl,
            moreEl: moreEl,
            segs: reslicedAllSegs,
            hiddenSegs: reslicedHiddenSegs
          }, ev);
        }

        if (clickOption === 'popover') {
          _this.showSegPopover(cell, moreEl, reslicedAllSegs);
        }
        else if (typeof clickOption === 'string') { // a view name
          view.calendar.zoomTo(date, clickOption);
        }
      });
  },


  // Reveals the popover that displays all events within a cell
  showSegPopover: function(cell, moreLink, segs) {
    var _this = this;
    var view = this.view;
    var moreWrap = moreLink.parent(); // the <div> wrapper around the <a>
    var topEl; // the element we want to match the top coordinate of
    var options;

    if (this.rowCnt == 1) {
      topEl = view.el; // will cause the popover to cover any sort of header
    }
    else {
      topEl = this.rowEls.eq(cell.row); // will align with top of row
    }

    options = {
      className: 'fc-more-popover',
      content: this.renderSegPopoverContent(cell, segs),
      parentEl: this.el,
      top: topEl.offset().top,
      autoHide: true, // when the user clicks elsewhere, hide the popover
      viewportConstrain: view.opt('popoverViewportConstrain'),
      hide: function() {
        // kill everything when the popover is hidden
        _this.segPopover.removeElement();
        _this.segPopover = null;
        _this.popoverSegs = null;
      }
    };

    // Determine horizontal coordinate.
    // We use the moreWrap instead of the <td> to avoid border confusion.
    if (this.isRTL) {
      options.right = moreWrap.offset().left + moreWrap.outerWidth() + 1; // +1 to be over cell border
    }
    else {
      options.left = moreWrap.offset().left - 1; // -1 to be over cell border
    }

    this.segPopover = new Popover(options);
    this.segPopover.show();
  },


  // Builds the inner DOM contents of the segment popover
  renderSegPopoverContent: function(cell, segs) {
    var view = this.view;
    var isTheme = view.opt('theme');
    var title = cell.start.format(view.opt('dayPopoverFormat'));
    var content = $(
      '<div class="fc-header ' + view.widgetHeaderClass + '">' +
        '<span class="fc-close ' +
          (isTheme ? 'ui-icon ui-icon-closethick' : 'fc-icon fc-icon-x') +
        '"></span>' +
        '<span class="fc-title">' +
          htmlEscape(title) +
        '</span>' +
        '<div class="fc-clear"/>' +
      '</div>' +
      '<div class="fc-body ' + view.widgetContentClass + '">' +
        '<div class="fc-event-container"></div>' +
      '</div>'
    );
    var segContainer = content.find('.fc-event-container');
    var i;

    // render each seg's `el` and only return the visible segs
    segs = this.renderFgSegEls(segs, true); // disableResizing=true
    this.popoverSegs = segs;

    for (i = 0; i < segs.length; i++) {

      // because segments in the popover are not part of a grid coordinate system, provide a hint to any
      // grids that want to do drag-n-drop about which cell it came from
      segs[i].cell = cell;

      segContainer.append(segs[i].el);
    }

    return content;
  },


  // Given the events within an array of segment objects, reslice them to be in a single day
  resliceDaySegs: function(segs, dayDate) {

    // build an array of the original events
    var events = $.map(segs, function(seg) {
      return seg.event;
    });

    var dayStart = dayDate.clone().stripTime();
    var dayEnd = dayStart.clone().add(1, 'days');
    var dayRange = { start: dayStart, end: dayEnd };

    // slice the events with a custom slicing function
    segs = this.eventsToSegs(
      events,
      function(range) {
        var seg = intersectionToSeg(range, dayRange); // undefind if no intersection
        return seg ? [ seg ] : []; // must return an array of segments
      }
    );

    // force an order because eventsToSegs doesn't guarantee one
    segs.sort(compareSegs);

    return segs;
  },


  // Generates the text that should be inside a "more" link, given the number of events it represents
  getMoreLinkText: function(num) {
    var opt = this.view.opt('eventLimitText');

    if (typeof opt === 'function') {
      return opt(num);
    }
    else {
      return '+' + num + ' ' + opt;
    }
  },


  // Returns segments within a given cell.
  // If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
  getCellSegs: function(cell, startLevel) {
    var segMatrix = this.rowStructs[cell.row].segMatrix;
    var level = startLevel || 0;
    var segs = [];
    var seg;

    while (level < segMatrix.length) {
      seg = segMatrix[level][cell.col];
      if (seg) {
        segs.push(seg);
      }
      level++;
    }

    return segs;
  }

});

;;

/* A component that renders one or more columns of vertical time slots
----------------------------------------------------------------------------------------------------------------------*/

var TimeGrid = Grid.extend({

  slotDuration: null, // duration of a "slot", a distinct time segment on given day, visualized by lines
  snapDuration: null, // granularity of time for dragging and selecting
  minTime: null, // Duration object that denotes the first visible time of any given day
  maxTime: null, // Duration object that denotes the exclusive visible end time of any given day
  colDates: null, // whole-day dates for each column. left to right
  axisFormat: null, // formatting string for times running along vertical axis

  dayEls: null, // cells elements in the day-row background
  slatEls: null, // elements running horizontally across all columns

  slatTops: null, // an array of top positions, relative to the container. last item holds bottom of last slot

  helperEl: null, // cell skeleton element for rendering the mock event "helper"

  businessHourSegs: null,


  constructor: function() {
    Grid.apply(this, arguments); // call the super-constructor
    this.processOptions();
  },


  // Renders the time grid into `this.el`, which should already be assigned.
  // Relies on the view's colCnt. In the future, this component should probably be self-sufficient.
  renderDates: function() {
    this.el.html(this.renderHtml());
    this.dayEls = this.el.find('.fc-day');
    this.slatEls = this.el.find('.fc-slats tr');
  },


  renderBusinessHours: function() {
    var events = this.view.calendar.getBusinessHoursEvents();
    this.businessHourSegs = this.renderFill('businessHours', this.eventsToSegs(events), 'bgevent');
  },


  // Renders the basic HTML skeleton for the grid
  renderHtml: function() {
    return '' +
      '<div class="fc-bg">' +
        '<table>' +
          this.rowHtml('slotBg') + // leverages RowRenderer, which will call slotBgCellHtml
        '</table>' +
      '</div>' +
      '<div class="fc-slats">' +
        '<table>' +
          this.slatRowHtml() +
        '</table>' +
      '</div>';
  },


  // Renders the HTML for a vertical background cell behind the slots.
  // This method is distinct from 'bg' because we wanted a new `rowType` so the View could customize the rendering.
  slotBgCellHtml: function(cell) {
    return this.bgCellHtml(cell);
  },


  // Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
  slatRowHtml: function() {
    var view = this.view;
    var isRTL = this.isRTL;
    var html = '';
    var slotNormal = this.slotDuration.asMinutes() % 15 === 0;
    var slotTime = moment.duration(+this.minTime); // wish there was .clone() for durations
    var slotDate; // will be on the view's first day, but we only care about its time
    var minutes;
    var axisHtml;

    // Calculate the time for each slot
    while (slotTime < this.maxTime) {
      slotDate = this.start.clone().time(slotTime); // will be in UTC but that's good. to avoid DST issues
      minutes = slotDate.minutes();

      axisHtml =
        '<td class="fc-axis fc-time ' + view.widgetContentClass + '" ' + view.axisStyleAttr() + '>' +
          ((!slotNormal || !minutes) ? // if irregular slot duration, or on the hour, then display the time
            '<span>' + // for matchCellWidths
              htmlEscape(slotDate.format(this.axisFormat)) +
            '</span>' :
            ''
            ) +
        '</td>';

      html +=
        '<tr ' + (!minutes ? '' : 'class="fc-minor"') + '>' +
          (!isRTL ? axisHtml : '') +
          '<td class="' + view.widgetContentClass + '"/>' +
          (isRTL ? axisHtml : '') +
        "</tr>";

      slotTime.add(this.slotDuration);
    }

    return html;
  },


  /* Options
  ------------------------------------------------------------------------------------------------------------------*/


  // Parses various options into properties of this object
  processOptions: function() {
    var view = this.view;
    var slotDuration = view.opt('slotDuration');
    var snapDuration = view.opt('snapDuration');

    slotDuration = moment.duration(slotDuration);
    snapDuration = snapDuration ? moment.duration(snapDuration) : slotDuration;

    this.slotDuration = slotDuration;
    this.snapDuration = snapDuration;
    this.cellDuration = snapDuration; // for Grid system

    this.minTime = moment.duration(view.opt('minTime'));
    this.maxTime = moment.duration(view.opt('maxTime'));

    this.axisFormat = view.opt('axisFormat') || view.opt('smallTimeFormat');
  },


  // Computes a default column header formatting string if `colFormat` is not explicitly defined
  computeColHeadFormat: function() {
    if (this.colCnt > 1) { // multiple days, so full single date string WON'T be in title text
      return this.view.opt('dayOfMonthFormat'); // "Sat 12/10"
    }
    else { // single day, so full single date string will probably be in title text
      return 'dddd'; // "Saturday"
    }
  },


  // Computes a default event time formatting string if `timeFormat` is not explicitly defined
  computeEventTimeFormat: function() {
    return this.view.opt('noMeridiemTimeFormat'); // like "6:30" (no AM/PM)
  },


  // Computes a default `displayEventEnd` value if one is not expliclty defined
  computeDisplayEventEnd: function() {
    return true;
  },


  /* Cell System
  ------------------------------------------------------------------------------------------------------------------*/


  rangeUpdated: function() {
    var view = this.view;
    var colDates = [];
    var date;

    date = this.start.clone();
    while (date.isBefore(this.end)) {
      colDates.push(date.clone());
      date.add(1, 'day');
      date = view.skipHiddenDays(date);
    }

    if (this.isRTL) {
      colDates.reverse();
    }

    this.colDates = colDates;
    this.colCnt = colDates.length;
    this.rowCnt = Math.ceil((this.maxTime - this.minTime) / this.snapDuration); // # of vertical snaps
  },


  // Given a cell object, generates its start date. Returns a reference-free copy.
  computeCellDate: function(cell) {
    var date = this.colDates[cell.col];
    var time = this.computeSnapTime(cell.row);

    date = this.view.calendar.rezoneDate(date); // give it a 00:00 time
    date.time(time);

    return date;
  },


  // Retrieves the element representing the given column
  getColEl: function(col) {
    return this.dayEls.eq(col);
  },


  /* Dates
  ------------------------------------------------------------------------------------------------------------------*/


  // Given a row number of the grid, representing a "snap", returns a time (Duration) from its start-of-day
  computeSnapTime: function(row) {
    return moment.duration(this.minTime + this.snapDuration * row);
  },


  // Slices up a date range by column into an array of segments
  rangeToSegs: function(range) {
    var colCnt = this.colCnt;
    var segs = [];
    var seg;
    var col;
    var colDate;
    var colRange;

    // normalize :(
    range = {
      start: range.start.clone().stripZone(),
      end: range.end.clone().stripZone()
    };

    for (col = 0; col < colCnt; col++) {
      colDate = this.colDates[col]; // will be ambig time/timezone
      colRange = {
        start: colDate.clone().time(this.minTime),
        end: colDate.clone().time(this.maxTime)
      };
      seg = intersectionToSeg(range, colRange); // both will be ambig timezone
      if (seg) {
        seg.col = col;
        segs.push(seg);
      }
    }

    return segs;
  },


  /* Coordinates
  ------------------------------------------------------------------------------------------------------------------*/


  updateSize: function(isResize) { // NOT a standard Grid method
    this.computeSlatTops();

    if (isResize) {
      this.updateSegVerticals();
    }
  },


  // Computes the top/bottom coordinates of each "snap" rows
  computeRowCoords: function() {
    var originTop = this.el.offset().top;
    var items = [];
    var i;
    var item;

    for (i = 0; i < this.rowCnt; i++) {
      item = {
        top: originTop + this.computeTimeTop(this.computeSnapTime(i))
      };
      if (i > 0) {
        items[i - 1].bottom = item.top;
      }
      items.push(item);
    }
    item.bottom = item.top + this.computeTimeTop(this.computeSnapTime(i));

    return items;
  },


  // Computes the top coordinate, relative to the bounds of the grid, of the given date.
  // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
  computeDateTop: function(date, startOfDayDate) {
    return this.computeTimeTop(
      moment.duration(
        date.clone().stripZone() - startOfDayDate.clone().stripTime()
      )
    );
  },


  // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
  computeTimeTop: function(time) {
    var slatCoverage = (time - this.minTime) / this.slotDuration; // floating-point value of # of slots covered
    var slatIndex;
    var slatRemainder;
    var slatTop;
    var slatBottom;

    // constrain. because minTime/maxTime might be customized
    slatCoverage = Math.max(0, slatCoverage);
    slatCoverage = Math.min(this.slatEls.length, slatCoverage);

    slatIndex = Math.floor(slatCoverage); // an integer index of the furthest whole slot
    slatRemainder = slatCoverage - slatIndex;
    slatTop = this.slatTops[slatIndex]; // the top position of the furthest whole slot

    if (slatRemainder) { // time spans part-way into the slot
      slatBottom = this.slatTops[slatIndex + 1];
      return slatTop + (slatBottom - slatTop) * slatRemainder; // part-way between slots
    }
    else {
      return slatTop;
    }
  },


  // Queries each `slatEl` for its position relative to the grid's container and stores it in `slatTops`.
  // Includes the the bottom of the last slat as the last item in the array.
  computeSlatTops: function() {
    var tops = [];
    var top;

    this.slatEls.each(function(i, node) {
      top = $(node).position().top;
      tops.push(top);
    });

    tops.push(top + this.slatEls.last().outerHeight()); // bottom of the last slat

    this.slatTops = tops;
  },


  /* Event Drag Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of an event being dragged over the specified date(s).
  // dropLocation's end might be null, as well as `seg`. See Grid::renderDrag for more info.
  // A returned value of `true` signals that a mock "helper" event has been rendered.
  renderDrag: function(dropLocation, seg) {

    if (seg) { // if there is event information for this drag, render a helper event
      this.renderRangeHelper(dropLocation, seg);
      this.applyDragOpacity(this.helperEl);

      return true; // signal that a helper has been rendered
    }
    else {
      // otherwise, just render a highlight
      this.renderHighlight(this.eventRangeToSegs(dropLocation));
    }
  },


  // Unrenders any visual indication of an event being dragged
  unrenderDrag: function() {
    this.unrenderHelper();
    this.unrenderHighlight();
  },


  /* Event Resize Visualization
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of an event being resized
  renderEventResize: function(range, seg) {
    this.renderRangeHelper(range, seg);
  },


  // Unrenders any visual indication of an event being resized
  unrenderEventResize: function() {
    this.unrenderHelper();
  },


  /* Event Helper
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a mock "helper" event. `sourceSeg` is the original segment object and might be null (an external drag)
  renderHelper: function(event, sourceSeg) {
    var segs = this.eventsToSegs([ event ]);
    var tableEl;
    var i, seg;
    var sourceEl;

    segs = this.renderFgSegEls(segs); // assigns each seg's el and returns a subset of segs that were rendered
    tableEl = this.renderSegTable(segs);

    // Try to make the segment that is in the same row as sourceSeg look the same
    for (i = 0; i < segs.length; i++) {
      seg = segs[i];
      if (sourceSeg && sourceSeg.col === seg.col) {
        sourceEl = sourceSeg.el;
        seg.el.css({
          left: sourceEl.css('left'),
          right: sourceEl.css('right'),
          'margin-left': sourceEl.css('margin-left'),
          'margin-right': sourceEl.css('margin-right')
        });
      }
    }

    this.helperEl = $('<div class="fc-helper-skeleton"/>')
      .append(tableEl)
        .appendTo(this.el);
  },


  // Unrenders any mock helper event
  unrenderHelper: function() {
    if (this.helperEl) {
      this.helperEl.remove();
      this.helperEl = null;
    }
  },


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
  renderSelection: function(range) {
    if (this.view.opt('selectHelper')) { // this setting signals that a mock helper event should be rendered
      this.renderRangeHelper(range);
    }
    else {
      this.renderHighlight(this.selectionRangeToSegs(range));
    }
  },


  // Unrenders any visual indication of a selection
  unrenderSelection: function() {
    this.unrenderHelper();
    this.unrenderHighlight();
  },


  /* Fill System (highlight, background events, business hours)
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a set of rectangles over the given time segments.
  // Only returns segments that successfully rendered.
  renderFill: function(type, segs, className) {
    var segCols;
    var skeletonEl;
    var trEl;
    var col, colSegs;
    var tdEl;
    var containerEl;
    var dayDate;
    var i, seg;

    if (segs.length) {

      segs = this.renderFillSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs
      segCols = this.groupSegCols(segs); // group into sub-arrays, and assigns 'col' to each seg

      className = className || type.toLowerCase();
      skeletonEl = $(
        '<div class="fc-' + className + '-skeleton">' +
          '<table><tr/></table>' +
        '</div>'
      );
      trEl = skeletonEl.find('tr');

      for (col = 0; col < segCols.length; col++) {
        colSegs = segCols[col];
        tdEl = $('<td/>').appendTo(trEl);

        if (colSegs.length) {
          containerEl = $('<div class="fc-' + className + '-container"/>').appendTo(tdEl);
          dayDate = this.colDates[col];

          for (i = 0; i < colSegs.length; i++) {
            seg = colSegs[i];
            containerEl.append(
              seg.el.css({
                top: this.computeDateTop(seg.start, dayDate),
                bottom: -this.computeDateTop(seg.end, dayDate) // the y position of the bottom edge
              })
            );
          }
        }
      }

      this.bookendCells(trEl, type);

      this.el.append(skeletonEl);
      this.elsByFill[type] = skeletonEl;
    }

    return segs;
  }

});

;;

/* Event-rendering methods for the TimeGrid class
----------------------------------------------------------------------------------------------------------------------*/

TimeGrid.mixin({

  eventSkeletonEl: null, // has cells with event-containers, which contain absolutely positioned event elements


  // Renders the given foreground event segments onto the grid
  renderFgSegs: function(segs) {
    segs = this.renderFgSegEls(segs); // returns a subset of the segs. segs that were actually rendered

    this.el.append(
      this.eventSkeletonEl = $('<div class="fc-content-skeleton"/>')
        .append(this.renderSegTable(segs))
    );

    return segs; // return only the segs that were actually rendered
  },


  // Unrenders all currently rendered foreground event segments
  unrenderFgSegs: function(segs) {
    if (this.eventSkeletonEl) {
      this.eventSkeletonEl.remove();
      this.eventSkeletonEl = null;
    }
  },


  // Renders and returns the <table> portion of the event-skeleton.
  // Returns an object with properties 'tbodyEl' and 'segs'.
  renderSegTable: function(segs) {
    var tableEl = $('<table><tr/></table>');
    var trEl = tableEl.find('tr');
    var segCols;
    var i, seg;
    var col, colSegs;
    var containerEl;

    segCols = this.groupSegCols(segs); // group into sub-arrays, and assigns 'col' to each seg

    this.computeSegVerticals(segs); // compute and assign top/bottom

    for (col = 0; col < segCols.length; col++) { // iterate each column grouping
      colSegs = segCols[col];
      placeSlotSegs(colSegs); // compute horizontal coordinates, z-index's, and reorder the array

      containerEl = $('<div class="fc-event-container"/>');

      // assign positioning CSS and insert into container
      for (i = 0; i < colSegs.length; i++) {
        seg = colSegs[i];
        seg.el.css(this.generateSegPositionCss(seg));

        // if the height is short, add a className for alternate styling
        if (seg.bottom - seg.top < 30) {
          seg.el.addClass('fc-short');
        }

        containerEl.append(seg.el);
      }

      trEl.append($('<td/>').append(containerEl));
    }

    this.bookendCells(trEl, 'eventSkeleton');

    return tableEl;
  },


  // Refreshes the CSS top/bottom coordinates for each segment element. Probably after a window resize/zoom.
  // Repositions business hours segs too, so not just for events. Maybe shouldn't be here.
  updateSegVerticals: function() {
    var allSegs = (this.segs || []).concat(this.businessHourSegs || []);
    var i;

    this.computeSegVerticals(allSegs);

    for (i = 0; i < allSegs.length; i++) {
      allSegs[i].el.css(
        this.generateSegVerticalCss(allSegs[i])
      );
    }
  },


  // For each segment in an array, computes and assigns its top and bottom properties
  computeSegVerticals: function(segs) {
    var i, seg;

    for (i = 0; i < segs.length; i++) {
      seg = segs[i];
      seg.top = this.computeDateTop(seg.start, seg.start);
      seg.bottom = this.computeDateTop(seg.end, seg.start);
    }
  },


  // Renders the HTML for a single event segment's default rendering
  fgSegHtml: function(seg, disableResizing) {
    var view = this.view;
    var event = seg.event;
    var isDraggable = view.isEventDraggable(event);
    var isResizableFromStart = !disableResizing && seg.isStart && view.isEventResizableFromStart(event);
    var isResizableFromEnd = !disableResizing && seg.isEnd && view.isEventResizableFromEnd(event);
    var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd);
    var skinCss = cssToStr(this.getEventSkinCss(event));
    var timeText;
    var fullTimeText; // more verbose time text. for the print stylesheet
    var startTimeText; // just the start time text

    classes.unshift('fc-time-grid-event', 'fc-v-event');

    if (view.isMultiDayEvent(event)) { // if the event appears to span more than one day...
      // Don't display time text on segments that run entirely through a day.
      // That would appear as midnight-midnight and would look dumb.
      // Otherwise, display the time text for the *segment's* times (like 6pm-midnight or midnight-10am)
      if (seg.isStart || seg.isEnd) {
        timeText = this.getEventTimeText(seg);
        fullTimeText = this.getEventTimeText(seg, 'LT');
        startTimeText = this.getEventTimeText(seg, null, false); // displayEnd=false
      }
    } else {
      // Display the normal time text for the *event's* times
      timeText = this.getEventTimeText(event);
      fullTimeText = this.getEventTimeText(event, 'LT');
      startTimeText = this.getEventTimeText(event, null, false); // displayEnd=false
    }

    return '<a class="' + classes.join(' ') + '"' +
      (event.url ?
        ' href="' + htmlEscape(event.url) + '"' :
        ''
        ) +
      (skinCss ?
        ' style="' + skinCss + '"' :
        ''
        ) +
      '>' +
        '<div class="fc-content">' +
          (timeText ?
            '<div class="fc-time"' +
            ' data-start="' + htmlEscape(startTimeText) + '"' +
            ' data-full="' + htmlEscape(fullTimeText) + '"' +
            '>' +
              '<span>' + htmlEscape(timeText) + '</span>' +
            '</div>' :
            ''
            ) +
          (event.title ?
            '<div class="fc-title">' +
              htmlEscape(event.title) +
            '</div>' :
            ''
            ) +
        '</div>' +
        '<div class="fc-bg"/>' +
        /* TODO: write CSS for this
        (isResizableFromStart ?
          '<div class="fc-resizer fc-start-resizer" />' :
          ''
          ) +
        */
        (isResizableFromEnd ?
          '<div class="fc-resizer fc-end-resizer" />' :
          ''
          ) +
      '</a>';
  },


  // Generates an object with CSS properties/values that should be applied to an event segment element.
  // Contains important positioning-related properties that should be applied to any event element, customized or not.
  generateSegPositionCss: function(seg) {
    var shouldOverlap = this.view.opt('slotEventOverlap');
    var backwardCoord = seg.backwardCoord; // the left side if LTR. the right side if RTL. floating-point
    var forwardCoord = seg.forwardCoord; // the right side if LTR. the left side if RTL. floating-point
    var props = this.generateSegVerticalCss(seg); // get top/bottom first
    var left; // amount of space from left edge, a fraction of the total width
    var right; // amount of space from right edge, a fraction of the total width

    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2);
    }

    if (this.isRTL) {
      left = 1 - forwardCoord;
      right = backwardCoord;
    }
    else {
      left = backwardCoord;
      right = 1 - forwardCoord;
    }

    props.zIndex = seg.level + 1; // convert from 0-base to 1-based
    props.left = left * 100 + '%';
    props.right = right * 100 + '%';

    if (shouldOverlap && seg.forwardPressure) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props[this.isRTL ? 'marginLeft' : 'marginRight'] = 10 * 2; // 10 is a guesstimate of the icon's width
    }

    return props;
  },


  // Generates an object with CSS properties for the top/bottom coordinates of a segment element
  generateSegVerticalCss: function(seg) {
    return {
      top: seg.top,
      bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
    };
  },


  // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's col
  groupSegCols: function(segs) {
    var segCols = [];
    var i;

    for (i = 0; i < this.colCnt; i++) {
      segCols.push([]);
    }

    for (i = 0; i < segs.length; i++) {
      segCols[segs[i].col].push(segs[i]);
    }

    return segCols;
  }

});


// Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
// NOTE: Also reorders the given array by date!
function placeSlotSegs(segs) {
  var levels;
  var level0;
  var i;

  segs.sort(compareSegs); // order by date
  levels = buildSlotSegLevels(segs);
  computeForwardSlotSegs(levels);

  if ((level0 = levels[0])) {

    for (i = 0; i < level0.length; i++) {
      computeSlotSegPressures(level0[i]);
    }

    for (i = 0; i < level0.length; i++) {
      computeSlotSegCoords(level0[i], 0, 0);
    }
  }
}


// Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
// left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
function buildSlotSegLevels(segs) {
  var levels = [];
  var i, seg;
  var j;

  for (i=0; i<segs.length; i++) {
    seg = segs[i];

    // go through all the levels and stop on the first level where there are no collisions
    for (j=0; j<levels.length; j++) {
      if (!computeSlotSegCollisions(seg, levels[j]).length) {
        break;
      }
    }

    seg.level = j;

    (levels[j] || (levels[j] = [])).push(seg);
  }

  return levels;
}


// For every segment, figure out the other segments that are in subsequent
// levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
function computeForwardSlotSegs(levels) {
  var i, level;
  var j, seg;
  var k;

  for (i=0; i<levels.length; i++) {
    level = levels[i];

    for (j=0; j<level.length; j++) {
      seg = level[j];

      seg.forwardSegs = [];
      for (k=i+1; k<levels.length; k++) {
        computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
      }
    }
  }
}


// Figure out which path forward (via seg.forwardSegs) results in the longest path until
// the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
function computeSlotSegPressures(seg) {
  var forwardSegs = seg.forwardSegs;
  var forwardPressure = 0;
  var i, forwardSeg;

  if (seg.forwardPressure === undefined) { // not already computed

    for (i=0; i<forwardSegs.length; i++) {
      forwardSeg = forwardSegs[i];

      // figure out the child's maximum forward path
      computeSlotSegPressures(forwardSeg);

      // either use the existing maximum, or use the child's forward pressure
      // plus one (for the forwardSeg itself)
      forwardPressure = Math.max(
        forwardPressure,
        1 + forwardSeg.forwardPressure
      );
    }

    seg.forwardPressure = forwardPressure;
  }
}


// Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
// from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
// seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
//
// The segment might be part of a "series", which means consecutive segments with the same pressure
// who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
// segments behind this one in the current series, and `seriesBackwardCoord` is the starting
// coordinate of the first segment in the series.
function computeSlotSegCoords(seg, seriesBackwardPressure, seriesBackwardCoord) {
  var forwardSegs = seg.forwardSegs;
  var i;

  if (seg.forwardCoord === undefined) { // not already computed

    if (!forwardSegs.length) {

      // if there are no forward segments, this segment should butt up against the edge
      seg.forwardCoord = 1;
    }
    else {

      // sort highest pressure first
      forwardSegs.sort(compareForwardSlotSegs);

      // this segment's forwardCoord will be calculated from the backwardCoord of the
      // highest-pressure forward segment.
      computeSlotSegCoords(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
      seg.forwardCoord = forwardSegs[0].backwardCoord;
    }

    // calculate the backwardCoord from the forwardCoord. consider the series
    seg.backwardCoord = seg.forwardCoord -
      (seg.forwardCoord - seriesBackwardCoord) / // available width for series
      (seriesBackwardPressure + 1); // # of segments in the series

    // use this segment's coordinates to computed the coordinates of the less-pressurized
    // forward segments
    for (i=0; i<forwardSegs.length; i++) {
      computeSlotSegCoords(forwardSegs[i], 0, seg.forwardCoord);
    }
  }
}


// Find all the segments in `otherSegs` that vertically collide with `seg`.
// Append into an optionally-supplied `results` array and return.
function computeSlotSegCollisions(seg, otherSegs, results) {
  results = results || [];

  for (var i=0; i<otherSegs.length; i++) {
    if (isSlotSegCollision(seg, otherSegs[i])) {
      results.push(otherSegs[i]);
    }
  }

  return results;
}


// Do these segments occupy the same vertical space?
function isSlotSegCollision(seg1, seg2) {
  return seg1.bottom > seg2.top && seg1.top < seg2.bottom;
}


// A cmp function for determining which forward segment to rely on more when computing coordinates.
function compareForwardSlotSegs(seg1, seg2) {
  // put higher-pressure first
  return seg2.forwardPressure - seg1.forwardPressure ||
    // put segments that are closer to initial edge first (and favor ones with no coords yet)
    (seg1.backwardCoord || 0) - (seg2.backwardCoord || 0) ||
    // do normal sorting...
    compareSegs(seg1, seg2);
}

;;

/* An abstract class from which other views inherit from
----------------------------------------------------------------------------------------------------------------------*/

var View = fc.View = Class.extend({

  type: null, // subclass' view name (string)
  name: null, // deprecated. use `type` instead
  title: null, // the text that will be displayed in the header's title

  calendar: null, // owner Calendar object
  options: null, // hash containing all options. already merged with view-specific-options
  coordMap: null, // a CoordMap object for converting pixel regions to dates
  el: null, // the view's containing element. set by Calendar

  displaying: null, // a promise representing the state of rendering. null if no render requested
  isSkeletonRendered: false,
  isEventsRendered: false,

  // range the view is actually displaying (moments)
  start: null,
  end: null, // exclusive

  // range the view is formally responsible for (moments)
  // may be different from start/end. for example, a month view might have 1st-31st, excluding padded dates
  intervalStart: null,
  intervalEnd: null, // exclusive
  intervalDuration: null,
  intervalUnit: null, // name of largest unit being displayed, like "month" or "week"

  isRTL: false,
  isSelected: false, // boolean whether a range of time is user-selected or not

  // subclasses can optionally use a scroll container
  scrollerEl: null, // the element that will most likely scroll when content is too tall
  scrollTop: null, // cached vertical scroll value

  // classNames styled by jqui themes
  widgetHeaderClass: null,
  widgetContentClass: null,
  highlightStateClass: null,

  // for date utils, computed from options
  nextDayThreshold: null,
  isHiddenDayHash: null,

  // document handlers, bound to `this` object
  documentMousedownProxy: null, // TODO: doesn't work with touch


  constructor: function(calendar, type, options, intervalDuration) {

    this.calendar = calendar;
    this.type = this.name = type; // .name is deprecated
    this.options = options;
    this.intervalDuration = intervalDuration || moment.duration(1, 'day');

    this.nextDayThreshold = moment.duration(this.opt('nextDayThreshold'));
    this.initThemingProps();
    this.initHiddenDays();
    this.isRTL = this.opt('isRTL');

    this.documentMousedownProxy = proxy(this, 'documentMousedown');

    this.initialize();
  },


  // A good place for subclasses to initialize member variables
  initialize: function() {
    // subclasses can implement
  },


  // Retrieves an option with the given name
  opt: function(name) {
    return this.options[name];
  },


  // Triggers handlers that are view-related. Modifies args before passing to calendar.
  trigger: function(name, thisObj) { // arguments beyond thisObj are passed along
    var calendar = this.calendar;

    return calendar.trigger.apply(
      calendar,
      [name, thisObj || this].concat(
        Array.prototype.slice.call(arguments, 2), // arguments beyond thisObj
        [ this ] // always make the last argument a reference to the view. TODO: deprecate
      )
    );
  },


  /* Dates
  ------------------------------------------------------------------------------------------------------------------*/


  // Updates all internal dates to center around the given current date
  setDate: function(date) {
    this.setRange(this.computeRange(date));
  },


  // Updates all internal dates for displaying the given range.
  // Expects all values to be normalized (like what computeRange does).
  setRange: function(range) {
    $.extend(this, range);
    this.updateTitle();
  },


  // Given a single current date, produce information about what range to display.
  // Subclasses can override. Must return all properties.
  computeRange: function(date) {
    var intervalUnit = computeIntervalUnit(this.intervalDuration);
    var intervalStart = date.clone().startOf(intervalUnit);
    var intervalEnd = intervalStart.clone().add(this.intervalDuration);
    var start, end;

    // normalize the range's time-ambiguity
    if (/year|month|week|day/.test(intervalUnit)) { // whole-days?
      intervalStart.stripTime();
      intervalEnd.stripTime();
    }
    else { // needs to have a time?
      if (!intervalStart.hasTime()) {
        intervalStart = this.calendar.rezoneDate(intervalStart); // convert to current timezone, with 00:00
      }
      if (!intervalEnd.hasTime()) {
        intervalEnd = this.calendar.rezoneDate(intervalEnd); // convert to current timezone, with 00:00
      }
    }

    start = intervalStart.clone();
    start = this.skipHiddenDays(start);
    end = intervalEnd.clone();
    end = this.skipHiddenDays(end, -1, true); // exclusively move backwards

    return {
      intervalUnit: intervalUnit,
      intervalStart: intervalStart,
      intervalEnd: intervalEnd,
      start: start,
      end: end
    };
  },


  // Computes the new date when the user hits the prev button, given the current date
  computePrevDate: function(date) {
    return this.massageCurrentDate(
      date.clone().startOf(this.intervalUnit).subtract(this.intervalDuration), -1
    );
  },


  // Computes the new date when the user hits the next button, given the current date
  computeNextDate: function(date) {
    return this.massageCurrentDate(
      date.clone().startOf(this.intervalUnit).add(this.intervalDuration)
    );
  },


  // Given an arbitrarily calculated current date of the calendar, returns a date that is ensured to be completely
  // visible. `direction` is optional and indicates which direction the current date was being
  // incremented or decremented (1 or -1).
  massageCurrentDate: function(date, direction) {
    if (this.intervalDuration.as('days') <= 1) { // if the view displays a single day or smaller
      if (this.isHiddenDay(date)) {
        date = this.skipHiddenDays(date, direction);
        date.startOf('day');
      }
    }

    return date;
  },


  /* Title and Date Formatting
  ------------------------------------------------------------------------------------------------------------------*/


  // Sets the view's title property to the most updated computed value
  updateTitle: function() {
    this.title = this.computeTitle();
  },


  // Computes what the title at the top of the calendar should be for this view
  computeTitle: function() {
    return this.formatRange(
      { start: this.intervalStart, end: this.intervalEnd },
      this.opt('titleFormat') || this.computeTitleFormat(),
      this.opt('titleRangeSeparator')
    );
  },


  // Generates the format string that should be used to generate the title for the current date range.
  // Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
  computeTitleFormat: function() {
    if (this.intervalUnit == 'year') {
      return 'YYYY';
    }
    else if (this.intervalUnit == 'month') {
      return this.opt('monthYearFormat'); // like "September 2014"
    }
    else if (this.intervalDuration.as('days') > 1) {
      return 'll'; // multi-day range. shorter, like "Sep 9 - 10 2014"
    }
    else {
      return 'LL'; // one day. longer, like "September 9 2014"
    }
  },


  // Utility for formatting a range. Accepts a range object, formatting string, and optional separator.
  // Displays all-day ranges naturally, with an inclusive end. Takes the current isRTL into account.
  formatRange: function(range, formatStr, separator) {
    var end = range.end;

    if (!end.hasTime()) { // all-day?
      end = end.clone().subtract(1); // convert to inclusive. last ms of previous day
    }

    return formatRange(range.start, end, formatStr, separator, this.opt('isRTL'));
  },


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Sets the container element that the view should render inside of.
  // Does other DOM-related initializations.
  setElement: function(el) {
    this.el = el;
    this.bindGlobalHandlers();
  },


  // Removes the view's container element from the DOM, clearing any content beforehand.
  // Undoes any other DOM-related attachments.
  removeElement: function() {
    this.clear(); // clears all content

    // clean up the skeleton
    if (this.isSkeletonRendered) {
      this.unrenderSkeleton();
      this.isSkeletonRendered = false;
    }

    this.unbindGlobalHandlers();

    this.el.remove();

    // NOTE: don't null-out this.el in case the View was destroyed within an API callback.
    // We don't null-out the View's other jQuery element references upon destroy,
    //  so we shouldn't kill this.el either.
  },


  // Does everything necessary to display the view centered around the given date.
  // Does every type of rendering EXCEPT rendering events.
  // Is asychronous and returns a promise.
  display: function(date) {
    var _this = this;
    var scrollState = null;

    if (this.displaying) {
      scrollState = this.queryScroll();
    }

    return this.clear().then(function() { // clear the content first (async)
      return (
        _this.displaying =
          $.when(_this.displayView(date)) // displayView might return a promise
            .then(function() {
              _this.forceScroll(_this.computeInitialScroll(scrollState));
              _this.triggerRender();
            })
      );
    });
  },


  // Does everything necessary to clear the content of the view.
  // Clears dates and events. Does not clear the skeleton.
  // Is asychronous and returns a promise.
  clear: function() {
    var _this = this;
    var displaying = this.displaying;

    if (displaying) { // previously displayed, or in the process of being displayed?
      return displaying.then(function() { // wait for the display to finish
        _this.displaying = null;
        _this.clearEvents();
        return _this.clearView(); // might return a promise. chain it
      });
    }
    else {
      return $.when(); // an immediately-resolved promise
    }
  },


  // Displays the view's non-event content, such as date-related content or anything required by events.
  // Renders the view's non-content skeleton if necessary.
  // Can be asynchronous and return a promise.
  displayView: function(date) {
    if (!this.isSkeletonRendered) {
      this.renderSkeleton();
      this.isSkeletonRendered = true;
    }
    this.setDate(date);
    if (this.render) {
      this.render(); // TODO: deprecate
    }
    this.renderDates();
    this.updateSize();
    this.renderBusinessHours(); // might need coordinates, so should go after updateSize()
  },


  // Unrenders the view content that was rendered in displayView.
  // Can be asynchronous and return a promise.
  clearView: function() {
    this.unselect();
    this.triggerUnrender();
    this.unrenderBusinessHours();
    this.unrenderDates();
    if (this.destroy) {
      this.destroy(); // TODO: deprecate
    }
  },


  // Renders the basic structure of the view before any content is rendered
  renderSkeleton: function() {
    // subclasses should implement
  },


  // Unrenders the basic structure of the view
  unrenderSkeleton: function() {
    // subclasses should implement
  },


  // Renders the view's date-related content (like cells that represent days/times).
  // Assumes setRange has already been called and the skeleton has already been rendered.
  renderDates: function() {
    // subclasses should implement
  },


  // Unrenders the view's date-related content
  unrenderDates: function() {
    // subclasses should override
  },


  // Renders business-hours onto the view. Assumes updateSize has already been called.
  renderBusinessHours: function() {
    // subclasses should implement
  },


  // Unrenders previously-rendered business-hours
  unrenderBusinessHours: function() {
    // subclasses should implement
  },


  // Signals that the view's content has been rendered
  triggerRender: function() {
    this.trigger('viewRender', this, this, this.el);
  },


  // Signals that the view's content is about to be unrendered
  triggerUnrender: function() {
    this.trigger('viewDestroy', this, this, this.el);
  },


  // Binds DOM handlers to elements that reside outside the view container, such as the document
  bindGlobalHandlers: function() {
    $(document).on('mousedown', this.documentMousedownProxy);
  },


  // Unbinds DOM handlers from elements that reside outside the view container
  unbindGlobalHandlers: function() {
    $(document).off('mousedown', this.documentMousedownProxy);
  },


  // Initializes internal variables related to theming
  initThemingProps: function() {
    var tm = this.opt('theme') ? 'ui' : 'fc';

    this.widgetHeaderClass = tm + '-widget-header';
    this.widgetContentClass = tm + '-widget-content';
    this.highlightStateClass = tm + '-state-highlight';
  },


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  // Refreshes anything dependant upon sizing of the container element of the grid
  updateSize: function(isResize) {
    var scrollState;

    if (isResize) {
      scrollState = this.queryScroll();
    }

    this.updateHeight(isResize);
    this.updateWidth(isResize);

    if (isResize) {
      this.setScroll(scrollState);
    }
  },


  // Refreshes the horizontal dimensions of the calendar
  updateWidth: function(isResize) {
    // subclasses should implement
  },


  // Refreshes the vertical dimensions of the calendar
  updateHeight: function(isResize) {
    var calendar = this.calendar; // we poll the calendar for height information

    this.setHeight(
      calendar.getSuggestedViewHeight(),
      calendar.isHeightAuto()
    );
  },


  // Updates the vertical dimensions of the calendar to the specified height.
  // if `isAuto` is set to true, height becomes merely a suggestion and the view should use its "natural" height.
  setHeight: function(height, isAuto) {
    // subclasses should implement
  },


  /* Scroller
  ------------------------------------------------------------------------------------------------------------------*/


  // Given the total height of the view, return the number of pixels that should be used for the scroller.
  // Utility for subclasses.
  computeScrollerHeight: function(totalHeight) {
    var scrollerEl = this.scrollerEl;
    var both;
    var otherHeight; // cumulative height of everything that is not the scrollerEl in the view (header+borders)

    both = this.el.add(scrollerEl);

    // fuckin IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
    both.css({
      position: 'relative', // cause a reflow, which will force fresh dimension recalculation
      left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
    });
    otherHeight = this.el.outerHeight() - scrollerEl.height(); // grab the dimensions
    both.css({ position: '', left: '' }); // undo hack

    return totalHeight - otherHeight;
  },


  // Computes the initial pre-configured scroll state prior to allowing the user to change it.
  // Given the scroll state from the previous rendering. If first time rendering, given null.
  computeInitialScroll: function(previousScrollState) {
    return 0;
  },


  // Retrieves the view's current natural scroll state. Can return an arbitrary format.
  queryScroll: function() {
    if (this.scrollerEl) {
      return this.scrollerEl.scrollTop(); // operates on scrollerEl by default
    }
  },


  // Sets the view's scroll state. Will accept the same format computeInitialScroll and queryScroll produce.
  setScroll: function(scrollState) {
    if (this.scrollerEl) {
      return this.scrollerEl.scrollTop(scrollState); // operates on scrollerEl by default
    }
  },


  // Sets the scroll state, making sure to overcome any predefined scroll value the browser has in mind
  forceScroll: function(scrollState) {
    var _this = this;

    this.setScroll(scrollState);
    setTimeout(function() {
      _this.setScroll(scrollState);
    }, 0);
  },


  /* Event Elements / Segments
  ------------------------------------------------------------------------------------------------------------------*/


  // Does everything necessary to display the given events onto the current view
  displayEvents: function(events) {
    var scrollState = this.queryScroll();

    this.clearEvents();
    this.renderEvents(events);
    this.isEventsRendered = true;
    this.setScroll(scrollState);
    this.triggerEventRender();
  },


  // Does everything necessary to clear the view's currently-rendered events
  clearEvents: function() {
    if (this.isEventsRendered) {
      this.triggerEventUnrender();
      if (this.destroyEvents) {
        this.destroyEvents(); // TODO: deprecate
      }
      this.unrenderEvents();
      this.isEventsRendered = false;
    }
  },


  // Renders the events onto the view.
  renderEvents: function(events) {
    // subclasses should implement
  },


  // Removes event elements from the view.
  unrenderEvents: function() {
    // subclasses should implement
  },


  // Signals that all events have been rendered
  triggerEventRender: function() {
    this.renderedEventSegEach(function(seg) {
      this.trigger('eventAfterRender', seg.event, seg.event, seg.el);
    });
    this.trigger('eventAfterAllRender');
  },


  // Signals that all event elements are about to be removed
  triggerEventUnrender: function() {
    this.renderedEventSegEach(function(seg) {
      this.trigger('eventDestroy', seg.event, seg.event, seg.el);
    });
  },


  // Given an event and the default element used for rendering, returns the element that should actually be used.
  // Basically runs events and elements through the eventRender hook.
  resolveEventEl: function(event, el) {
    var custom = this.trigger('eventRender', event, event, el);

    if (custom === false) { // means don't render at all
      el = null;
    }
    else if (custom && custom !== true) {
      el = $(custom);
    }

    return el;
  },


  // Hides all rendered event segments linked to the given event
  showEvent: function(event) {
    this.renderedEventSegEach(function(seg) {
      seg.el.css('visibility', '');
    }, event);
  },


  // Shows all rendered event segments linked to the given event
  hideEvent: function(event) {
    this.renderedEventSegEach(function(seg) {
      seg.el.css('visibility', 'hidden');
    }, event);
  },


  // Iterates through event segments that have been rendered (have an el). Goes through all by default.
  // If the optional `event` argument is specified, only iterates through segments linked to that event.
  // The `this` value of the callback function will be the view.
  renderedEventSegEach: function(func, event) {
    var segs = this.getEventSegs();
    var i;

    for (i = 0; i < segs.length; i++) {
      if (!event || segs[i].event._id === event._id) {
        if (segs[i].el) {
          func.call(this, segs[i]);
        }
      }
    }
  },


  // Retrieves all the rendered segment objects for the view
  getEventSegs: function() {
    // subclasses must implement
    return [];
  },


  /* Event Drag-n-Drop
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes if the given event is allowed to be dragged by the user
  isEventDraggable: function(event) {
    var source = event.source || {};

    return firstDefined(
      event.startEditable,
      source.startEditable,
      this.opt('eventStartEditable'),
      event.editable,
      source.editable,
      this.opt('editable')
    );
  },


  // Must be called when an event in the view is dropped onto new location.
  // `dropLocation` is an object that contains the new start/end/allDay values for the event.
  reportEventDrop: function(event, dropLocation, largeUnit, el, ev) {
    var calendar = this.calendar;
    var mutateResult = calendar.mutateEvent(event, dropLocation, largeUnit);
    var undoFunc = function() {
      mutateResult.undo();
      calendar.reportEventChange();
    };

    this.triggerEventDrop(event, mutateResult.dateDelta, undoFunc, el, ev);
    calendar.reportEventChange(); // will rerender events
  },


  // Triggers event-drop handlers that have subscribed via the API
  triggerEventDrop: function(event, dateDelta, undoFunc, el, ev) {
    this.trigger('eventDrop', el[0], event, dateDelta, undoFunc, ev, {}); // {} = jqui dummy
  },


  /* External Element Drag-n-Drop
  ------------------------------------------------------------------------------------------------------------------*/


  // Must be called when an external element, via jQuery UI, has been dropped onto the calendar.
  // `meta` is the parsed data that has been embedded into the dragging event.
  // `dropLocation` is an object that contains the new start/end/allDay values for the event.
  reportExternalDrop: function(meta, dropLocation, el, ev, ui) {
    var eventProps = meta.eventProps;
    var eventInput;
    var event;

    // Try to build an event object and render it. TODO: decouple the two
    if (eventProps) {
      eventInput = $.extend({}, eventProps, dropLocation);
      event = this.calendar.renderEvent(eventInput, meta.stick)[0]; // renderEvent returns an array
    }

    this.triggerExternalDrop(event, dropLocation, el, ev, ui);
  },


  // Triggers external-drop handlers that have subscribed via the API
  triggerExternalDrop: function(event, dropLocation, el, ev, ui) {

    // trigger 'drop' regardless of whether element represents an event
    this.trigger('drop', el[0], dropLocation.start, ev, ui);

    if (event) {
      this.trigger('eventReceive', null, event); // signal an external event landed
    }
  },


  /* Drag-n-Drop Rendering (for both events and external elements)
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a event or external-element drag over the given drop zone.
  // If an external-element, seg will be `null`
  renderDrag: function(dropLocation, seg) {
    // subclasses must implement
  },


  // Unrenders a visual indication of an event or external-element being dragged.
  unrenderDrag: function() {
    // subclasses must implement
  },


  /* Event Resizing
  ------------------------------------------------------------------------------------------------------------------*/


  // Computes if the given event is allowed to be resized from its starting edge
  isEventResizableFromStart: function(event) {
    return this.opt('eventResizableFromStart') && this.isEventResizable(event);
  },


  // Computes if the given event is allowed to be resized from its ending edge
  isEventResizableFromEnd: function(event) {
    return this.isEventResizable(event);
  },


  // Computes if the given event is allowed to be resized by the user at all
  isEventResizable: function(event) {
    var source = event.source || {};

    return firstDefined(
      event.durationEditable,
      source.durationEditable,
      this.opt('eventDurationEditable'),
      event.editable,
      source.editable,
      this.opt('editable')
    );
  },


  // Must be called when an event in the view has been resized to a new length
  reportEventResize: function(event, resizeLocation, largeUnit, el, ev) {
    var calendar = this.calendar;
    var mutateResult = calendar.mutateEvent(event, resizeLocation, largeUnit);
    var undoFunc = function() {
      mutateResult.undo();
      calendar.reportEventChange();
    };

    this.triggerEventResize(event, mutateResult.durationDelta, undoFunc, el, ev);
    calendar.reportEventChange(); // will rerender events
  },


  // Triggers event-resize handlers that have subscribed via the API
  triggerEventResize: function(event, durationDelta, undoFunc, el, ev) {
    this.trigger('eventResize', el[0], event, durationDelta, undoFunc, ev, {}); // {} = jqui dummy
  },


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Selects a date range on the view. `start` and `end` are both Moments.
  // `ev` is the native mouse event that begin the interaction.
  select: function(range, ev) {
    this.unselect(ev);
    this.renderSelection(range);
    this.reportSelection(range, ev);
  },


  // Renders a visual indication of the selection
  renderSelection: function(range) {
    // subclasses should implement
  },


  // Called when a new selection is made. Updates internal state and triggers handlers.
  reportSelection: function(range, ev) {
    this.isSelected = true;
    this.triggerSelect(range, ev);
  },


  // Triggers handlers to 'select'
  triggerSelect: function(range, ev) {
    this.trigger('select', null, range.start, range.end, ev);
  },


  // Undoes a selection. updates in the internal state and triggers handlers.
  // `ev` is the native mouse event that began the interaction.
  unselect: function(ev) {
    if (this.isSelected) {
      this.isSelected = false;
      if (this.destroySelection) {
        this.destroySelection(); // TODO: deprecate
      }
      this.unrenderSelection();
      this.trigger('unselect', null, ev);
    }
  },


  // Unrenders a visual indication of selection
  unrenderSelection: function() {
    // subclasses should implement
  },


  // Handler for unselecting when the user clicks something and the 'unselectAuto' setting is on
  documentMousedown: function(ev) {
    var ignore;

    // is there a selection, and has the user made a proper left click?
    if (this.isSelected && this.opt('unselectAuto') && isPrimaryMouseButton(ev)) {

      // only unselect if the clicked element is not identical to or inside of an 'unselectCancel' element
      ignore = this.opt('unselectCancel');
      if (!ignore || !$(ev.target).closest(ignore).length) {
        this.unselect(ev);
      }
    }
  },


  /* Day Click
  ------------------------------------------------------------------------------------------------------------------*/


  // Triggers handlers to 'dayClick'
  triggerDayClick: function(cell, dayEl, ev) {
    this.trigger('dayClick', dayEl, cell.start, ev);
  },


  /* Date Utils
  ------------------------------------------------------------------------------------------------------------------*/


  // Initializes internal variables related to calculating hidden days-of-week
  initHiddenDays: function() {
    var hiddenDays = this.opt('hiddenDays') || []; // array of day-of-week indices that are hidden
    var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
    var dayCnt = 0;
    var i;

    if (this.opt('weekends') === false) {
      hiddenDays.push(0, 6); // 0=sunday, 6=saturday
    }

    for (i = 0; i < 7; i++) {
      if (
        !(isHiddenDayHash[i] = $.inArray(i, hiddenDays) !== -1)
      ) {
        dayCnt++;
      }
    }

    if (!dayCnt) {
      throw 'invalid hiddenDays'; // all days were hidden? bad.
    }

    this.isHiddenDayHash = isHiddenDayHash;
  },


  // Is the current day hidden?
  // `day` is a day-of-week index (0-6), or a Moment
  isHiddenDay: function(day) {
    if (moment.isMoment(day)) {
      day = day.day();
    }
    return this.isHiddenDayHash[day];
  },


  // Incrementing the current day until it is no longer a hidden day, returning a copy.
  // If the initial value of `date` is not a hidden day, don't do anything.
  // Pass `isExclusive` as `true` if you are dealing with an end date.
  // `inc` defaults to `1` (increment one day forward each time)
  skipHiddenDays: function(date, inc, isExclusive) {
    var out = date.clone();
    inc = inc || 1;
    while (
      this.isHiddenDayHash[(out.day() + (isExclusive ? inc : 0) + 7) % 7]
    ) {
      out.add(inc, 'days');
    }
    return out;
  },


  // Returns the date range of the full days the given range visually appears to occupy.
  // Returns a new range object.
  computeDayRange: function(range) {
    var startDay = range.start.clone().stripTime(); // the beginning of the day the range starts
    var end = range.end;
    var endDay = null;
    var endTimeMS;

    if (end) {
      endDay = end.clone().stripTime(); // the beginning of the day the range exclusively ends
      endTimeMS = +end.time(); // # of milliseconds into `endDay`

      // If the end time is actually inclusively part of the next day and is equal to or
      // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
      // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
      if (endTimeMS && endTimeMS >= this.nextDayThreshold) {
        endDay.add(1, 'days');
      }
    }

    // If no end was specified, or if it is within `startDay` but not past nextDayThreshold,
    // assign the default duration of one day.
    if (!end || endDay <= startDay) {
      endDay = startDay.clone().add(1, 'days');
    }

    return { start: startDay, end: endDay };
  },


  // Does the given event visually appear to occupy more than one day?
  isMultiDayEvent: function(event) {
    var range = this.computeDayRange(event); // event is range-ish

    return range.end.diff(range.start, 'days') > 1;
  }

});

;;

var Calendar = fc.Calendar = Class.extend({

  dirDefaults: null, // option defaults related to LTR or RTL
  langDefaults: null, // option defaults related to current locale
  overrides: null, // option overrides given to the fullCalendar constructor
  options: null, // all defaults combined with overrides
  viewSpecCache: null, // cache of view definitions
  view: null, // current View object
  header: null,
  loadingLevel: 0, // number of simultaneous loading tasks


  // a lot of this class' OOP logic is scoped within this constructor function,
  // but in the future, write individual methods on the prototype.
  constructor: Calendar_constructor,


  // Subclasses can override this for initialization logic after the constructor has been called
  initialize: function() {
  },


  // Initializes `this.options` and other important options-related objects
  initOptions: function(overrides) {
    var lang, langDefaults;
    var isRTL, dirDefaults;

    // converts legacy options into non-legacy ones.
    // in the future, when this is removed, don't use `overrides` reference. make a copy.
    overrides = massageOverrides(overrides);

    lang = overrides.lang;
    langDefaults = langOptionHash[lang];
    if (!langDefaults) {
      lang = Calendar.defaults.lang;
      langDefaults = langOptionHash[lang] || {};
    }

    isRTL = firstDefined(
      overrides.isRTL,
      langDefaults.isRTL,
      Calendar.defaults.isRTL
    );
    dirDefaults = isRTL ? Calendar.rtlDefaults : {};

    this.dirDefaults = dirDefaults;
    this.langDefaults = langDefaults;
    this.overrides = overrides;
    this.options = mergeOptions([ // merge defaults and overrides. lowest to highest precedence
      Calendar.defaults, // global defaults
      dirDefaults,
      langDefaults,
      overrides
    ]);
    populateInstanceComputableOptions(this.options);

    this.viewSpecCache = {}; // somewhat unrelated
  },


  // Gets information about how to create a view. Will use a cache.
  getViewSpec: function(viewType) {
    var cache = this.viewSpecCache;

    return cache[viewType] || (cache[viewType] = this.buildViewSpec(viewType));
  },


  // Given a duration singular unit, like "week" or "day", finds a matching view spec.
  // Preference is given to views that have corresponding buttons.
  getUnitViewSpec: function(unit) {
    var viewTypes;
    var i;
    var spec;

    if ($.inArray(unit, intervalUnits) != -1) {

      // put views that have buttons first. there will be duplicates, but oh well
      viewTypes = this.header.getViewsWithButtons();
      $.each(fc.views, function(viewType) { // all views
        viewTypes.push(viewType);
      });

      for (i = 0; i < viewTypes.length; i++) {
        spec = this.getViewSpec(viewTypes[i]);
        if (spec) {
          if (spec.singleUnit == unit) {
            return spec;
          }
        }
      }
    }
  },


  // Builds an object with information on how to create a given view
  buildViewSpec: function(requestedViewType) {
    var viewOverrides = this.overrides.views || {};
    var specChain = []; // for the view. lowest to highest priority
    var defaultsChain = []; // for the view. lowest to highest priority
    var overridesChain = []; // for the view. lowest to highest priority
    var viewType = requestedViewType;
    var spec; // for the view
    var overrides; // for the view
    var duration;
    var unit;

    // iterate from the specific view definition to a more general one until we hit an actual View class
    while (viewType) {
      spec = fcViews[viewType];
      overrides = viewOverrides[viewType];
      viewType = null; // clear. might repopulate for another iteration

      if (typeof spec === 'function') { // TODO: deprecate
        spec = { 'class': spec };
      }

      if (spec) {
        specChain.unshift(spec);
        defaultsChain.unshift(spec.defaults || {});
        duration = duration || spec.duration;
        viewType = viewType || spec.type;
      }

      if (overrides) {
        overridesChain.unshift(overrides); // view-specific option hashes have options at zero-level
        duration = duration || overrides.duration;
        viewType = viewType || overrides.type;
      }
    }

    spec = mergeProps(specChain);
    spec.type = requestedViewType;
    if (!spec['class']) {
      return false;
    }

    if (duration) {
      duration = moment.duration(duration);
      if (duration.valueOf()) { // valid?
        spec.duration = duration;
        unit = computeIntervalUnit(duration);

        // view is a single-unit duration, like "week" or "day"
        // incorporate options for this. lowest priority
        if (duration.as(unit) === 1) {
          spec.singleUnit = unit;
          overridesChain.unshift(viewOverrides[unit] || {});
        }
      }
    }

    spec.defaults = mergeOptions(defaultsChain);
    spec.overrides = mergeOptions(overridesChain);

    this.buildViewSpecOptions(spec);
    this.buildViewSpecButtonText(spec, requestedViewType);

    return spec;
  },


  // Builds and assigns a view spec's options object from its already-assigned defaults and overrides
  buildViewSpecOptions: function(spec) {
    spec.options = mergeOptions([ // lowest to highest priority
      Calendar.defaults, // global defaults
      spec.defaults, // view's defaults (from ViewSubclass.defaults)
      this.dirDefaults,
      this.langDefaults, // locale and dir take precedence over view's defaults!
      this.overrides, // calendar's overrides (options given to constructor)
      spec.overrides // view's overrides (view-specific options)
    ]);
    populateInstanceComputableOptions(spec.options);
  },


  // Computes and assigns a view spec's buttonText-related options
  buildViewSpecButtonText: function(spec, requestedViewType) {

    // given an options object with a possible `buttonText` hash, lookup the buttonText for the
    // requested view, falling back to a generic unit entry like "week" or "day"
    function queryButtonText(options) {
      var buttonText = options.buttonText || {};
      return buttonText[requestedViewType] ||
        (spec.singleUnit ? buttonText[spec.singleUnit] : null);
    }

    // highest to lowest priority
    spec.buttonTextOverride =
      queryButtonText(this.overrides) || // constructor-specified buttonText lookup hash takes precedence
      spec.overrides.buttonText; // `buttonText` for view-specific options is a string

    // highest to lowest priority. mirrors buildViewSpecOptions
    spec.buttonTextDefault =
      queryButtonText(this.langDefaults) ||
      queryButtonText(this.dirDefaults) ||
      spec.defaults.buttonText || // a single string. from ViewSubclass.defaults
      queryButtonText(Calendar.defaults) ||
      (spec.duration ? this.humanizeDuration(spec.duration) : null) || // like "3 days"
      requestedViewType; // fall back to given view name
  },


  // Given a view name for a custom view or a standard view, creates a ready-to-go View object
  instantiateView: function(viewType) {
    var spec = this.getViewSpec(viewType);

    return new spec['class'](this, viewType, spec.options, spec.duration);
  },


  // Returns a boolean about whether the view is okay to instantiate at some point
  isValidViewType: function(viewType) {
    return Boolean(this.getViewSpec(viewType));
  },


  // Should be called when any type of async data fetching begins
  pushLoading: function() {
    if (!(this.loadingLevel++)) {
      this.trigger('loading', null, true, this.view);
    }
  },


  // Should be called when any type of async data fetching completes
  popLoading: function() {
    if (!(--this.loadingLevel)) {
      this.trigger('loading', null, false, this.view);
    }
  },


  // Given arguments to the select method in the API, returns a range
  buildSelectRange: function(start, end) {

    start = this.moment(start);
    if (end) {
      end = this.moment(end);
    }
    else if (start.hasTime()) {
      end = start.clone().add(this.defaultTimedEventDuration);
    }
    else {
      end = start.clone().add(this.defaultAllDayEventDuration);
    }

    return { start: start, end: end };
  }

});


function Calendar_constructor(element, overrides) {
  var t = this;


  t.initOptions(overrides || {});
  var options = this.options;


  // Exports
  // -----------------------------------------------------------------------------------

  t.render = render;
  t.destroy = destroy;
  t.refetchEvents = refetchEvents;
  t.reportEvents = reportEvents;
  t.reportEventChange = reportEventChange;
  t.rerenderEvents = renderEvents; // `renderEvents` serves as a rerender. an API method
  t.changeView = renderView; // `renderView` will switch to another view
  t.select = select;
  t.unselect = unselect;
  t.prev = prev;
  t.next = next;
  t.prevYear = prevYear;
  t.nextYear = nextYear;
  t.today = today;
  t.gotoDate = gotoDate;
  t.incrementDate = incrementDate;
  t.zoomTo = zoomTo;
  t.getDate = getDate;
  t.getCalendar = getCalendar;
  t.getView = getView;
  t.option = option;
  t.trigger = trigger;



  // Language-data Internals
  // -----------------------------------------------------------------------------------
  // Apply overrides to the current language's data


  var localeData = createObject( // make a cheap copy
    getMomentLocaleData(options.lang) // will fall back to en
  );

  if (options.monthNames) {
    localeData._months = options.monthNames;
  }
  if (options.monthNamesShort) {
    localeData._monthsShort = options.monthNamesShort;
  }
  if (options.dayNames) {
    localeData._weekdays = options.dayNames;
  }
  if (options.dayNamesShort) {
    localeData._weekdaysShort = options.dayNamesShort;
  }
  if (options.firstDay != null) {
    var _week = createObject(localeData._week); // _week: { dow: # }
    _week.dow = options.firstDay;
    localeData._week = _week;
  }

  // assign a normalized value, to be used by our .week() moment extension
  localeData._fullCalendar_weekCalc = (function(weekCalc) {
    if (typeof weekCalc === 'function') {
      return weekCalc;
    }
    else if (weekCalc === 'local') {
      return weekCalc;
    }
    else if (weekCalc === 'iso' || weekCalc === 'ISO') {
      return 'ISO';
    }
  })(options.weekNumberCalculation);



  // Calendar-specific Date Utilities
  // -----------------------------------------------------------------------------------


  t.defaultAllDayEventDuration = moment.duration(options.defaultAllDayEventDuration);
  t.defaultTimedEventDuration = moment.duration(options.defaultTimedEventDuration);


  // Builds a moment using the settings of the current calendar: timezone and language.
  // Accepts anything the vanilla moment() constructor accepts.
  t.moment = function() {
    var mom;

    if (options.timezone === 'local') {
      mom = fc.moment.apply(null, arguments);

      // Force the moment to be local, because fc.moment doesn't guarantee it.
      if (mom.hasTime()) { // don't give ambiguously-timed moments a local zone
        mom.local();
      }
    }
    else if (options.timezone === 'UTC') {
      mom = fc.moment.utc.apply(null, arguments); // process as UTC
    }
    else {
      mom = fc.moment.parseZone.apply(null, arguments); // let the input decide the zone
    }

    if ('_locale' in mom) { // moment 2.8 and above
      mom._locale = localeData;
    }
    else { // pre-moment-2.8
      mom._lang = localeData;
    }

    return mom;
  };


  // Returns a boolean about whether or not the calendar knows how to calculate
  // the timezone offset of arbitrary dates in the current timezone.
  t.getIsAmbigTimezone = function() {
    return options.timezone !== 'local' && options.timezone !== 'UTC';
  };


  // Returns a copy of the given date in the current timezone of it is ambiguously zoned.
  // This will also give the date an unambiguous time.
  t.rezoneDate = function(date) {
    return t.moment(date.toArray());
  };


  // Returns a moment for the current date, as defined by the client's computer,
  // or overridden by the `now` option.
  t.getNow = function() {
    var now = options.now;
    if (typeof now === 'function') {
      now = now();
    }
    return t.moment(now);
  };


  // Get an event's normalized end date. If not present, calculate it from the defaults.
  t.getEventEnd = function(event) {
    if (event.end) {
      return event.end.clone();
    }
    else {
      return t.getDefaultEventEnd(event.allDay, event.start);
    }
  };


  // Given an event's allDay status and start date, return swhat its fallback end date should be.
  t.getDefaultEventEnd = function(allDay, start) { // TODO: rename to computeDefaultEventEnd
    var end = start.clone();

    if (allDay) {
      end.stripTime().add(t.defaultAllDayEventDuration);
    }
    else {
      end.add(t.defaultTimedEventDuration);
    }

    if (t.getIsAmbigTimezone()) {
      end.stripZone(); // we don't know what the tzo should be
    }

    return end;
  };


  // Produces a human-readable string for the given duration.
  // Side-effect: changes the locale of the given duration.
  t.humanizeDuration = function(duration) {
    return (duration.locale || duration.lang).call(duration, options.lang) // works moment-pre-2.8
      .humanize();
  };



  // Imports
  // -----------------------------------------------------------------------------------


  EventManager.call(t, options);
  var isFetchNeeded = t.isFetchNeeded;
  var fetchEvents = t.fetchEvents;



  // Locals
  // -----------------------------------------------------------------------------------


  var _element = element[0];
  var header;
  var headerElement;
  var content;
  var tm; // for making theme classes
  var currentView; // NOTE: keep this in sync with this.view
  var viewsByType = {}; // holds all instantiated view instances, current or not
  var suggestedViewHeight;
  var windowResizeProxy; // wraps the windowResize function
  var ignoreWindowResize = 0;
  var date;
  var events = [];



  // Main Rendering
  // -----------------------------------------------------------------------------------


  if (options.defaultDate != null) {
    date = t.moment(options.defaultDate);
  }
  else {
    date = t.getNow();
  }


  function render() {
    if (!content) {
      initialRender();
    }
    else if (elementVisible()) {
      // mainly for the public API
      calcSize();
      renderView();
    }
  }


  function initialRender() {
    tm = options.theme ? 'ui' : 'fc';
    element.addClass('fc');

    if (options.isRTL) {
      element.addClass('fc-rtl');
    }
    else {
      element.addClass('fc-ltr');
    }

    if (options.theme) {
      element.addClass('ui-widget');
    }
    else {
      element.addClass('fc-unthemed');
    }

    content = $("<div class='fc-view-container'/>").prependTo(element);

    header = t.header = new Header(t, options);
    headerElement = header.render();
    if (headerElement) {
      element.prepend(headerElement);
    }

    renderView(options.defaultView);

    if (options.handleWindowResize) {
      windowResizeProxy = debounce(windowResize, options.windowResizeDelay); // prevents rapid calls
      $(window).resize(windowResizeProxy);
    }
  }


  function destroy() {

    if (currentView) {
      currentView.removeElement();

      // NOTE: don't null-out currentView/t.view in case API methods are called after destroy.
      // It is still the "current" view, just not rendered.
    }

    header.removeElement();
    content.remove();
    element.removeClass('fc fc-ltr fc-rtl fc-unthemed ui-widget');

    if (windowResizeProxy) {
      $(window).unbind('resize', windowResizeProxy);
    }
  }


  function elementVisible() {
    return element.is(':visible');
  }



  // View Rendering
  // -----------------------------------------------------------------------------------


  // Renders a view because of a date change, view-type change, or for the first time.
  // If not given a viewType, keep the current view but render different dates.
  function renderView(viewType) {
    ignoreWindowResize++;

    // if viewType is changing, remove the old view's rendering
    if (currentView && viewType && currentView.type !== viewType) {
      header.deactivateButton(currentView.type);
      freezeContentHeight(); // prevent a scroll jump when view element is removed
      currentView.removeElement();
      currentView = t.view = null;
    }

    // if viewType changed, or the view was never created, create a fresh view
    if (!currentView && viewType) {
      currentView = t.view =
        viewsByType[viewType] ||
        (viewsByType[viewType] = t.instantiateView(viewType));

      currentView.setElement(
        $("<div class='fc-view fc-" + viewType + "-view' />").appendTo(content)
      );
      header.activateButton(viewType);
    }

    if (currentView) {

      // in case the view should render a period of time that is completely hidden
      date = currentView.massageCurrentDate(date);

      // render or rerender the view
      if (
        !currentView.displaying ||
        !date.isWithin(currentView.intervalStart, currentView.intervalEnd) // implicit date window change
      ) {
        if (elementVisible()) {

          freezeContentHeight();
          currentView.display(date);
          unfreezeContentHeight(); // immediately unfreeze regardless of whether display is async

          // need to do this after View::render, so dates are calculated
          updateHeaderTitle();
          updateTodayButton();

          getAndRenderEvents();
        }
      }
    }

    unfreezeContentHeight(); // undo any lone freezeContentHeight calls
    ignoreWindowResize--;
  }



  // Resizing
  // -----------------------------------------------------------------------------------


  t.getSuggestedViewHeight = function() {
    if (suggestedViewHeight === undefined) {
      calcSize();
    }
    return suggestedViewHeight;
  };


  t.isHeightAuto = function() {
    return options.contentHeight === 'auto' || options.height === 'auto';
  };


  function updateSize(shouldRecalc) {
    if (elementVisible()) {

      if (shouldRecalc) {
        _calcSize();
      }

      ignoreWindowResize++;
      currentView.updateSize(true); // isResize=true. will poll getSuggestedViewHeight() and isHeightAuto()
      ignoreWindowResize--;

      return true; // signal success
    }
  }


  function calcSize() {
    if (elementVisible()) {
      _calcSize();
    }
  }


  function _calcSize() { // assumes elementVisible
    if (typeof options.contentHeight === 'number') { // exists and not 'auto'
      suggestedViewHeight = options.contentHeight;
    }
    else if (typeof options.height === 'number') { // exists and not 'auto'
      suggestedViewHeight = options.height - (headerElement ? headerElement.outerHeight(true) : 0);
    }
    else {
      suggestedViewHeight = Math.round(content.width() / Math.max(options.aspectRatio, .5));
    }
  }


  function windowResize(ev) {
    if (
      !ignoreWindowResize &&
      ev.target === window && // so we don't process jqui "resize" events that have bubbled up
      currentView.start // view has already been rendered
    ) {
      if (updateSize(true)) {
        currentView.trigger('windowResize', _element);
      }
    }
  }



  /* Event Fetching/Rendering
  -----------------------------------------------------------------------------*/
  // TODO: going forward, most of this stuff should be directly handled by the view


  function refetchEvents() { // can be called as an API method
    destroyEvents(); // so that events are cleared before user starts waiting for AJAX
    fetchAndRenderEvents();
  }


  function renderEvents() { // destroys old events if previously rendered
    if (elementVisible()) {
      freezeContentHeight();
      currentView.displayEvents(events);
      unfreezeContentHeight();
    }
  }


  function destroyEvents() {
    freezeContentHeight();
    currentView.clearEvents();
    unfreezeContentHeight();
  }


  function getAndRenderEvents() {
    if (!options.lazyFetching || isFetchNeeded(currentView.start, currentView.end)) {
      fetchAndRenderEvents();
    }
    else {
      renderEvents();
    }
  }


  function fetchAndRenderEvents() {
    fetchEvents(currentView.start, currentView.end);
      // ... will call reportEvents
      // ... which will call renderEvents
  }


  // called when event data arrives
  function reportEvents(_events) {
    events = _events;
    renderEvents();
  }


  // called when a single event's data has been changed
  function reportEventChange() {
    renderEvents();
  }



  /* Header Updating
  -----------------------------------------------------------------------------*/


  function updateHeaderTitle() {
    header.updateTitle(currentView.title);
  }


  function updateTodayButton() {
    var now = t.getNow();
    if (now.isWithin(currentView.intervalStart, currentView.intervalEnd)) {
      header.disableButton('today');
    }
    else {
      header.enableButton('today');
    }
  }



  /* Selection
  -----------------------------------------------------------------------------*/


  function select(start, end) {
    currentView.select(
      t.buildSelectRange.apply(t, arguments)
    );
  }


  function unselect() { // safe to be called before renderView
    if (currentView) {
      currentView.unselect();
    }
  }



  /* Date
  -----------------------------------------------------------------------------*/


  function prev() {
    date = currentView.computePrevDate(date);
    renderView();
  }


  function next() {
    date = currentView.computeNextDate(date);
    renderView();
  }


  function prevYear() {
    date.add(-1, 'years');
    renderView();
  }


  function nextYear() {
    date.add(1, 'years');
    renderView();
  }


  function today() {
    date = t.getNow();
    renderView();
  }


  function gotoDate(dateInput) {
    date = t.moment(dateInput);
    renderView();
  }


  function incrementDate(delta) {
    date.add(moment.duration(delta));
    renderView();
  }


  // Forces navigation to a view for the given date.
  // `viewType` can be a specific view name or a generic one like "week" or "day".
  function zoomTo(newDate, viewType) {
    var spec;

    viewType = viewType || 'day'; // day is default zoom
    spec = t.getViewSpec(viewType) || t.getUnitViewSpec(viewType);

    date = newDate;
    renderView(spec ? spec.type : null);
  }


  function getDate() {
    return date.clone();
  }



  /* Height "Freezing"
  -----------------------------------------------------------------------------*/
  // TODO: move this into the view


  function freezeContentHeight() {
    content.css({
      width: '100%',
      height: content.height(),
      overflow: 'hidden'
    });
  }


  function unfreezeContentHeight() {
    content.css({
      width: '',
      height: '',
      overflow: ''
    });
  }



  /* Misc
  -----------------------------------------------------------------------------*/


  function getCalendar() {
    return t;
  }


  function getView() {
    return currentView;
  }


  function option(name, value) {
    if (value === undefined) {
      return options[name];
    }
    if (name == 'height' || name == 'contentHeight' || name == 'aspectRatio') {
      options[name] = value;
      updateSize(true); // true = allow recalculation of height
    }
  }


  function trigger(name, thisObj) {
    if (options[name]) {
      return options[name].apply(
        thisObj || _element,
        Array.prototype.slice.call(arguments, 2)
      );
    }
  }

  t.initialize();
}

;;

Calendar.defaults = {

  titleRangeSeparator: ' \u2014 ', // emphasized dash
  monthYearFormat: 'MMMM YYYY', // required for en. other languages rely on datepicker computable option

  defaultTimedEventDuration: '02:00:00',
  defaultAllDayEventDuration: { days: 1 },
  forceEventDuration: false,
  nextDayThreshold: '09:00:00', // 9am

  // display
  defaultView: 'month',
  aspectRatio: 1.35,
  header: {
    left: 'title',
    center: '',
    right: 'today prev,next'
  },
  weekends: true,
  weekNumbers: false,

  weekNumberTitle: 'W',
  weekNumberCalculation: 'local',

  //editable: false,

  scrollTime: '06:00:00',

  // event ajax
  lazyFetching: true,
  startParam: 'start',
  endParam: 'end',
  timezoneParam: 'timezone',

  timezone: false,

  //allDayDefault: undefined,

  // locale
  isRTL: false,
  buttonText: {
    prev: "prev",
    next: "next",
    prevYear: "prev year",
    nextYear: "next year",
    year: 'year', // TODO: locale files need to specify this
    today: 'today',
    month: 'month',
    week: 'week',
    day: 'day'
  },

  buttonIcons: {
    prev: 'left-single-arrow',
    next: 'right-single-arrow',
    prevYear: 'left-double-arrow',
    nextYear: 'right-double-arrow'
  },

  // jquery-ui theming
  theme: false,
  themeButtonIcons: {
    prev: 'circle-triangle-w',
    next: 'circle-triangle-e',
    prevYear: 'seek-prev',
    nextYear: 'seek-next'
  },

  //eventResizableFromStart: false,
  dragOpacity: .75,
  dragRevertDuration: 500,
  dragScroll: true,

  //selectable: false,
  unselectAuto: true,

  dropAccept: '*',

  eventLimit: false,
  eventLimitText: 'more',
  eventLimitClick: 'popover',
  dayPopoverFormat: 'LL',

  handleWindowResize: true,
  windowResizeDelay: 200 // milliseconds before an updateSize happens

};


Calendar.englishDefaults = { // used by lang.js
  dayPopoverFormat: 'dddd, MMMM D'
};


Calendar.rtlDefaults = { // right-to-left defaults
  header: { // TODO: smarter solution (first/center/last ?)
    left: 'next,prev today',
    center: '',
    right: 'title'
  },
  buttonIcons: {
    prev: 'right-single-arrow',
    next: 'left-single-arrow',
    prevYear: 'right-double-arrow',
    nextYear: 'left-double-arrow'
  },
  themeButtonIcons: {
    prev: 'circle-triangle-e',
    next: 'circle-triangle-w',
    nextYear: 'seek-prev',
    prevYear: 'seek-next'
  }
};

;;

var langOptionHash = fc.langs = {}; // initialize and expose


// TODO: document the structure and ordering of a FullCalendar lang file
// TODO: rename everything "lang" to "locale", like what the moment project did


// Initialize jQuery UI datepicker translations while using some of the translations
// Will set this as the default language for datepicker.
fc.datepickerLang = function(langCode, dpLangCode, dpOptions) {

  // get the FullCalendar internal option hash for this language. create if necessary
  var fcOptions = langOptionHash[langCode] || (langOptionHash[langCode] = {});

  // transfer some simple options from datepicker to fc
  fcOptions.isRTL = dpOptions.isRTL;
  fcOptions.weekNumberTitle = dpOptions.weekHeader;

  // compute some more complex options from datepicker
  $.each(dpComputableOptions, function(name, func) {
    fcOptions[name] = func(dpOptions);
  });

  // is jQuery UI Datepicker is on the page?
  if ($.datepicker) {

    // Register the language data.
    // FullCalendar and MomentJS use language codes like "pt-br" but Datepicker
    // does it like "pt-BR" or if it doesn't have the language, maybe just "pt".
    // Make an alias so the language can be referenced either way.
    $.datepicker.regional[dpLangCode] =
      $.datepicker.regional[langCode] = // alias
        dpOptions;

    // Alias 'en' to the default language data. Do this every time.
    $.datepicker.regional.en = $.datepicker.regional[''];

    // Set as Datepicker's global defaults.
    $.datepicker.setDefaults(dpOptions);
  }
};


// Sets FullCalendar-specific translations. Will set the language as the global default.
fc.lang = function(langCode, newFcOptions) {
  var fcOptions;
  var momOptions;

  // get the FullCalendar internal option hash for this language. create if necessary
  fcOptions = langOptionHash[langCode] || (langOptionHash[langCode] = {});

  // provided new options for this language? merge them in
  if (newFcOptions) {
    fcOptions = langOptionHash[langCode] = mergeOptions([ fcOptions, newFcOptions ]);
  }

  // compute language options that weren't defined.
  // always do this. newFcOptions can be undefined when initializing from i18n file,
  // so no way to tell if this is an initialization or a default-setting.
  momOptions = getMomentLocaleData(langCode); // will fall back to en
  $.each(momComputableOptions, function(name, func) {
    if (fcOptions[name] == null) {
      fcOptions[name] = func(momOptions, fcOptions);
    }
  });

  // set it as the default language for FullCalendar
  Calendar.defaults.lang = langCode;
};


// NOTE: can't guarantee any of these computations will run because not every language has datepicker
// configs, so make sure there are English fallbacks for these in the defaults file.
var dpComputableOptions = {

  buttonText: function(dpOptions) {
    return {
      // the translations sometimes wrongly contain HTML entities
      prev: stripHtmlEntities(dpOptions.prevText),
      next: stripHtmlEntities(dpOptions.nextText),
      today: stripHtmlEntities(dpOptions.currentText)
    };
  },

  // Produces format strings like "MMMM YYYY" -> "September 2014"
  monthYearFormat: function(dpOptions) {
    return dpOptions.showMonthAfterYear ?
      'YYYY[' + dpOptions.yearSuffix + '] MMMM' :
      'MMMM YYYY[' + dpOptions.yearSuffix + ']';
  }

};

var momComputableOptions = {

  // Produces format strings like "ddd M/D" -> "Fri 9/15"
  dayOfMonthFormat: function(momOptions, fcOptions) {
    var format = momOptions.longDateFormat('l'); // for the format like "M/D/YYYY"

    // strip the year off the edge, as well as other misc non-whitespace chars
    format = format.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g, '');

    if (fcOptions.isRTL) {
      format += ' ddd'; // for RTL, add day-of-week to end
    }
    else {
      format = 'ddd ' + format; // for LTR, add day-of-week to beginning
    }
    return format;
  },

  // Produces format strings like "h:mma" -> "6:00pm"
  mediumTimeFormat: function(momOptions) { // can't be called `timeFormat` because collides with option
    return momOptions.longDateFormat('LT')
      .replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
  },

  // Produces format strings like "h(:mm)a" -> "6pm" / "6:30pm"
  smallTimeFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(':mm', '(:mm)')
      .replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
      .replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
  },

  // Produces format strings like "h(:mm)t" -> "6p" / "6:30p"
  extraSmallTimeFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(':mm', '(:mm)')
      .replace(/(\Wmm)$/, '($1)') // like above, but for foreign langs
      .replace(/\s*a$/i, 't'); // convert to AM/PM/am/pm to lowercase one-letter. remove any spaces beforehand
  },

  // Produces format strings like "ha" / "H" -> "6pm" / "18"
  hourFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(':mm', '')
      .replace(/(\Wmm)$/, '') // like above, but for foreign langs
      .replace(/\s*a$/i, 'a'); // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
  },

  // Produces format strings like "h:mm" -> "6:30" (with no AM/PM)
  noMeridiemTimeFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(/\s*a$/i, ''); // remove trailing AM/PM
  }

};


// options that should be computed off live calendar options (considers override options)
var instanceComputableOptions = { // TODO: best place for this? related to lang?

  // Produces format strings for results like "Mo 16"
  smallDayDateFormat: function(options) {
    return options.isRTL ?
      'D dd' :
      'dd D';
  },

  // Produces format strings for results like "Wk 5"
  weekFormat: function(options) {
    return options.isRTL ?
      'w[ ' + options.weekNumberTitle + ']' :
      '[' + options.weekNumberTitle + ' ]w';
  },

  // Produces format strings for results like "Wk5"
  smallWeekFormat: function(options) {
    return options.isRTL ?
      'w[' + options.weekNumberTitle + ']' :
      '[' + options.weekNumberTitle + ']w';
  }

};

function populateInstanceComputableOptions(options) {
  $.each(instanceComputableOptions, function(name, func) {
    if (options[name] == null) {
      options[name] = func(options);
    }
  });
}


// Returns moment's internal locale data. If doesn't exist, returns English.
// Works with moment-pre-2.8
function getMomentLocaleData(langCode) {
  var func = moment.localeData || moment.langData;
  return func.call(moment, langCode) ||
    func.call(moment, 'en'); // the newer localData could return null, so fall back to en
}


// Initialize English by forcing computation of moment-derived options.
// Also, sets it as the default.
fc.lang('en', Calendar.englishDefaults);

;;

/* Top toolbar area with buttons and title
----------------------------------------------------------------------------------------------------------------------*/
// TODO: rename all header-related things to "toolbar"

function Header(calendar, options) {
  var t = this;

  // exports
  t.render = render;
  t.removeElement = removeElement;
  t.updateTitle = updateTitle;
  t.activateButton = activateButton;
  t.deactivateButton = deactivateButton;
  t.disableButton = disableButton;
  t.enableButton = enableButton;
  t.getViewsWithButtons = getViewsWithButtons;

  // locals
  var el = $();
  var viewsWithButtons = [];
  var tm;


  function render() {
    var sections = options.header;

    tm = options.theme ? 'ui' : 'fc';

    if (sections) {
      el = $("<div class='fc-toolbar'/>")
        .append(renderSection('left'))
        .append(renderSection('right'))
        .append(renderSection('center'))
        .append('<div class="fc-clear"/>');

      return el;
    }
  }


  function removeElement() {
    el.remove();
    el = $();
  }


  function renderSection(position) {
    var sectionEl = $('<div class="fc-' + position + '"/>');
    var buttonStr = options.header[position];

    if (buttonStr) {
      $.each(buttonStr.split(' '), function(i) {
        var groupChildren = $();
        var isOnlyButtons = true;
        var groupEl;

        $.each(this.split(','), function(j, buttonName) {
          var viewSpec;
          var buttonClick;
          var overrideText; // text explicitly set by calendar's constructor options. overcomes icons
          var defaultText;
          var themeIcon;
          var normalIcon;
          var innerHtml;
          var classes;
          var button;

          if (buttonName == 'title') {
            groupChildren = groupChildren.add($('<h2>&nbsp;</h2>')); // we always want it to take up height
            isOnlyButtons = false;
          }
          else {
            viewSpec = calendar.getViewSpec(buttonName);

            if (viewSpec) {
              buttonClick = function() {
                calendar.changeView(buttonName);
              };
              viewsWithButtons.push(buttonName);
              overrideText = viewSpec.buttonTextOverride;
              defaultText = viewSpec.buttonTextDefault;
            }
            else if (calendar[buttonName]) { // a calendar method
              buttonClick = function() {
                calendar[buttonName]();
              };
              overrideText = (calendar.overrides.buttonText || {})[buttonName];
              defaultText = options.buttonText[buttonName]; // everything else is considered default
            }

            if (buttonClick) {

              themeIcon = options.themeButtonIcons[buttonName];
              normalIcon = options.buttonIcons[buttonName];

              if (overrideText) {
                innerHtml = htmlEscape(overrideText);
              }
              else if (themeIcon && options.theme) {
                innerHtml = "<span class='ui-icon ui-icon-" + themeIcon + "'></span>";
              }
              else if (normalIcon && !options.theme) {
                innerHtml = "<span class='fc-icon fc-icon-" + normalIcon + "'></span>";
              }
              else {
                innerHtml = htmlEscape(defaultText);
              }

              classes = [
                'fc-' + buttonName + '-button',
                tm + '-button',
                tm + '-state-default'
              ];

              button = $( // type="button" so that it doesn't submit a form
                '<button type="button" class="' + classes.join(' ') + '">' +
                  innerHtml +
                '</button>'
                )
                .click(function() {
                  // don't process clicks for disabled buttons
                  if (!button.hasClass(tm + '-state-disabled')) {

                    buttonClick();

                    // after the click action, if the button becomes the "active" tab, or disabled,
                    // it should never have a hover class, so remove it now.
                    if (
                      button.hasClass(tm + '-state-active') ||
                      button.hasClass(tm + '-state-disabled')
                    ) {
                      button.removeClass(tm + '-state-hover');
                    }
                  }
                })
                .mousedown(function() {
                  // the *down* effect (mouse pressed in).
                  // only on buttons that are not the "active" tab, or disabled
                  button
                    .not('.' + tm + '-state-active')
                    .not('.' + tm + '-state-disabled')
                    .addClass(tm + '-state-down');
                })
                .mouseup(function() {
                  // undo the *down* effect
                  button.removeClass(tm + '-state-down');
                })
                .hover(
                  function() {
                    // the *hover* effect.
                    // only on buttons that are not the "active" tab, or disabled
                    button
                      .not('.' + tm + '-state-active')
                      .not('.' + tm + '-state-disabled')
                      .addClass(tm + '-state-hover');
                  },
                  function() {
                    // undo the *hover* effect
                    button
                      .removeClass(tm + '-state-hover')
                      .removeClass(tm + '-state-down'); // if mouseleave happens before mouseup
                  }
                );

              groupChildren = groupChildren.add(button);
            }
          }
        });

        if (isOnlyButtons) {
          groupChildren
            .first().addClass(tm + '-corner-left').end()
            .last().addClass(tm + '-corner-right').end();
        }

        if (groupChildren.length > 1) {
          groupEl = $('<div/>');
          if (isOnlyButtons) {
            groupEl.addClass('fc-button-group');
          }
          groupEl.append(groupChildren);
          sectionEl.append(groupEl);
        }
        else {
          sectionEl.append(groupChildren); // 1 or 0 children
        }
      });
    }

    return sectionEl;
  }


  function updateTitle(text) {
    el.find('h2').text(text);
  }


  function activateButton(buttonName) {
    el.find('.fc-' + buttonName + '-button')
      .addClass(tm + '-state-active');
  }


  function deactivateButton(buttonName) {
    el.find('.fc-' + buttonName + '-button')
      .removeClass(tm + '-state-active');
  }


  function disableButton(buttonName) {
    el.find('.fc-' + buttonName + '-button')
      .attr('disabled', 'disabled')
      .addClass(tm + '-state-disabled');
  }


  function enableButton(buttonName) {
    el.find('.fc-' + buttonName + '-button')
      .removeAttr('disabled')
      .removeClass(tm + '-state-disabled');
  }


  function getViewsWithButtons() {
    return viewsWithButtons;
  }

}

;;

fc.sourceNormalizers = [];
fc.sourceFetchers = [];

var ajaxDefaults = {
  dataType: 'json',
  cache: false
};

var eventGUID = 1;


function EventManager(options) { // assumed to be a calendar
  var t = this;


  // exports
  t.isFetchNeeded = isFetchNeeded;
  t.fetchEvents = fetchEvents;
  t.addEventSource = addEventSource;
  t.removeEventSource = removeEventSource;
  t.updateEvent = updateEvent;
  t.renderEvent = renderEvent;
  t.removeEvents = removeEvents;
  t.clientEvents = clientEvents;
  t.mutateEvent = mutateEvent;
  t.normalizeEventRange = normalizeEventRange;
  t.normalizeEventRangeTimes = normalizeEventRangeTimes;
  t.ensureVisibleEventRange = ensureVisibleEventRange;


  // imports
  var reportEvents = t.reportEvents;


  // locals
  var stickySource = { events: [] };
  var sources = [ stickySource ];
  var rangeStart, rangeEnd;
  var currentFetchID = 0;
  var pendingSourceCnt = 0;
  var cache = []; // holds events that have already been expanded


  $.each(
    (options.events ? [ options.events ] : []).concat(options.eventSources || []),
    function(i, sourceInput) {
      var source = buildEventSource(sourceInput);
      if (source) {
        sources.push(source);
      }
    }
  );



  /* Fetching
  -----------------------------------------------------------------------------*/


  function isFetchNeeded(start, end) {
    return !rangeStart || // nothing has been fetched yet?
      // or, a part of the new range is outside of the old range? (after normalizing)
      start.clone().stripZone() < rangeStart.clone().stripZone() ||
      end.clone().stripZone() > rangeEnd.clone().stripZone();
  }


  function fetchEvents(start, end) {
    rangeStart = start;
    rangeEnd = end;
    cache = [];
    var fetchID = ++currentFetchID;
    var len = sources.length;
    pendingSourceCnt = len;
    for (var i=0; i<len; i++) {
      fetchEventSource(sources[i], fetchID);
    }
  }


  function fetchEventSource(source, fetchID) {
    _fetchEventSource(source, function(eventInputs) {
      var isArraySource = $.isArray(source.events);
      var i, eventInput;
      var abstractEvent;

      if (fetchID == currentFetchID) {

        if (eventInputs) {
          for (i = 0; i < eventInputs.length; i++) {
            eventInput = eventInputs[i];

            if (isArraySource) { // array sources have already been convert to Event Objects
              abstractEvent = eventInput;
            }
            else {
              abstractEvent = buildEventFromInput(eventInput, source);
            }

            if (abstractEvent) { // not false (an invalid event)
              cache.push.apply(
                cache,
                expandEvent(abstractEvent) // add individual expanded events to the cache
              );
            }
          }
        }

        pendingSourceCnt--;
        if (!pendingSourceCnt) {
          reportEvents(cache);
        }
      }
    });
  }


  function _fetchEventSource(source, callback) {
    var i;
    var fetchers = fc.sourceFetchers;
    var res;

    for (i=0; i<fetchers.length; i++) {
      res = fetchers[i].call(
        t, // this, the Calendar object
        source,
        rangeStart.clone(),
        rangeEnd.clone(),
        options.timezone,
        callback
      );

      if (res === true) {
        // the fetcher is in charge. made its own async request
        return;
      }
      else if (typeof res == 'object') {
        // the fetcher returned a new source. process it
        _fetchEventSource(res, callback);
        return;
      }
    }

    var events = source.events;
    if (events) {
      if ($.isFunction(events)) {
        t.pushLoading();
        events.call(
          t, // this, the Calendar object
          rangeStart.clone(),
          rangeEnd.clone(),
          options.timezone,
          function(events) {
            callback(events);
            t.popLoading();
          }
        );
      }
      else if ($.isArray(events)) {
        callback(events);
      }
      else {
        callback();
      }
    }else{
      var url = source.url;
      if (url) {
        var success = source.success;
        var error = source.error;
        var complete = source.complete;

        // retrieve any outbound GET/POST $.ajax data from the options
        var customData;
        if ($.isFunction(source.data)) {
          // supplied as a function that returns a key/value object
          customData = source.data();
        }
        else {
          // supplied as a straight key/value object
          customData = source.data;
        }

        // use a copy of the custom data so we can modify the parameters
        // and not affect the passed-in object.
        var data = $.extend({}, customData || {});

        var startParam = firstDefined(source.startParam, options.startParam);
        var endParam = firstDefined(source.endParam, options.endParam);
        var timezoneParam = firstDefined(source.timezoneParam, options.timezoneParam);

        if (startParam) {
          data[startParam] = rangeStart.format();
        }
        if (endParam) {
          data[endParam] = rangeEnd.format();
        }
        if (options.timezone && options.timezone != 'local') {
          data[timezoneParam] = options.timezone;
        }

        t.pushLoading();
        $.ajax($.extend({}, ajaxDefaults, source, {
          data: data,
          success: function(events) {
            events = events || [];
            var res = applyAll(success, this, arguments);
            if ($.isArray(res)) {
              events = res;
            }
            callback(events);
          },
          error: function() {
            applyAll(error, this, arguments);
            callback();
          },
          complete: function() {
            applyAll(complete, this, arguments);
            t.popLoading();
          }
        }));
      }else{
        callback();
      }
    }
  }



  /* Sources
  -----------------------------------------------------------------------------*/


  function addEventSource(sourceInput) {
    var source = buildEventSource(sourceInput);
    if (source) {
      sources.push(source);
      pendingSourceCnt++;
      fetchEventSource(source, currentFetchID); // will eventually call reportEvents
    }
  }


  function buildEventSource(sourceInput) { // will return undefined if invalid source
    var normalizers = fc.sourceNormalizers;
    var source;
    var i;

    if ($.isFunction(sourceInput) || $.isArray(sourceInput)) {
      source = { events: sourceInput };
    }
    else if (typeof sourceInput === 'string') {
      source = { url: sourceInput };
    }
    else if (typeof sourceInput === 'object') {
      source = $.extend({}, sourceInput); // shallow copy
    }

    if (source) {

      // TODO: repeat code, same code for event classNames
      if (source.className) {
        if (typeof source.className === 'string') {
          source.className = source.className.split(/\s+/);
        }
        // otherwise, assumed to be an array
      }
      else {
        source.className = [];
      }

      // for array sources, we convert to standard Event Objects up front
      if ($.isArray(source.events)) {
        source.origArray = source.events; // for removeEventSource
        source.events = $.map(source.events, function(eventInput) {
          return buildEventFromInput(eventInput, source);
        });
      }

      for (i=0; i<normalizers.length; i++) {
        normalizers[i].call(t, source);
      }

      return source;
    }
  }


  function removeEventSource(source) {
    sources = $.grep(sources, function(src) {
      return !isSourcesEqual(src, source);
    });
    // remove all client events from that source
    cache = $.grep(cache, function(e) {
      return !isSourcesEqual(e.source, source);
    });
    reportEvents(cache);
  }


  function isSourcesEqual(source1, source2) {
    return source1 && source2 && getSourcePrimitive(source1) == getSourcePrimitive(source2);
  }


  function getSourcePrimitive(source) {
    return (
      (typeof source === 'object') ? // a normalized event source?
        (source.origArray || source.googleCalendarId || source.url || source.events) : // get the primitive
        null
    ) ||
    source; // the given argument *is* the primitive
  }



  /* Manipulation
  -----------------------------------------------------------------------------*/


  // Only ever called from the externally-facing API
  function updateEvent(event) {

    // massage start/end values, even if date string values
    event.start = t.moment(event.start);
    if (event.end) {
      event.end = t.moment(event.end);
    }
    else {
      event.end = null;
    }

    mutateEvent(event, getMiscEventProps(event)); // will handle start/end/allDay normalization
    reportEvents(cache); // reports event modifications (so we can redraw)
  }


  // Returns a hash of misc event properties that should be copied over to related events.
  function getMiscEventProps(event) {
    var props = {};

    $.each(event, function(name, val) {
      if (isMiscEventPropName(name)) {
        if (val !== undefined && isAtomic(val)) { // a defined non-object
          props[name] = val;
        }
      }
    });

    return props;
  }

  // non-date-related, non-id-related, non-secret
  function isMiscEventPropName(name) {
    return !/^_|^(id|allDay|start|end)$/.test(name);
  }


  // returns the expanded events that were created
  function renderEvent(eventInput, stick) {
    var abstractEvent = buildEventFromInput(eventInput);
    var events;
    var i, event;

    if (abstractEvent) { // not false (a valid input)
      events = expandEvent(abstractEvent);

      for (i = 0; i < events.length; i++) {
        event = events[i];

        if (!event.source) {
          if (stick) {
            stickySource.events.push(event);
            event.source = stickySource;
          }
          cache.push(event);
        }
      }

      reportEvents(cache);

      return events;
    }

    return [];
  }


  function removeEvents(filter) {
    var eventID;
    var i;

    if (filter == null) { // null or undefined. remove all events
      filter = function() { return true; }; // will always match
    }
    else if (!$.isFunction(filter)) { // an event ID
      eventID = filter + '';
      filter = function(event) {
        return event._id == eventID;
      };
    }

    // Purge event(s) from our local cache
    cache = $.grep(cache, filter, true); // inverse=true

    // Remove events from array sources.
    // This works because they have been converted to official Event Objects up front.
    // (and as a result, event._id has been calculated).
    for (i=0; i<sources.length; i++) {
      if ($.isArray(sources[i].events)) {
        sources[i].events = $.grep(sources[i].events, filter, true);
      }
    }

    reportEvents(cache);
  }


  function clientEvents(filter) {
    if ($.isFunction(filter)) {
      return $.grep(cache, filter);
    }
    else if (filter != null) { // not null, not undefined. an event ID
      filter += '';
      return $.grep(cache, function(e) {
        return e._id == filter;
      });
    }
    return cache; // else, return all
  }



  /* Event Normalization
  -----------------------------------------------------------------------------*/


  // Given a raw object with key/value properties, returns an "abstract" Event object.
  // An "abstract" event is an event that, if recurring, will not have been expanded yet.
  // Will return `false` when input is invalid.
  // `source` is optional
  function buildEventFromInput(input, source) {
    var out = {};
    var start, end;
    var allDay;

    if (options.eventDataTransform) {
      input = options.eventDataTransform(input);
    }
    if (source && source.eventDataTransform) {
      input = source.eventDataTransform(input);
    }

    // Copy all properties over to the resulting object.
    // The special-case properties will be copied over afterwards.
    $.extend(out, input);

    if (source) {
      out.source = source;
    }

    out._id = input._id || (input.id === undefined ? '_fc' + eventGUID++ : input.id + '');

    if (input.className) {
      if (typeof input.className == 'string') {
        out.className = input.className.split(/\s+/);
      }
      else { // assumed to be an array
        out.className = input.className;
      }
    }
    else {
      out.className = [];
    }

    start = input.start || input.date; // "date" is an alias for "start"
    end = input.end;

    // parse as a time (Duration) if applicable
    if (isTimeString(start)) {
      start = moment.duration(start);
    }
    if (isTimeString(end)) {
      end = moment.duration(end);
    }

    if (input.dow || moment.isDuration(start) || moment.isDuration(end)) {

      // the event is "abstract" (recurring) so don't calculate exact start/end dates just yet
      out.start = start ? moment.duration(start) : null; // will be a Duration or null
      out.end = end ? moment.duration(end) : null; // will be a Duration or null
      out._recurring = true; // our internal marker
    }
    else {

      if (start) {
        start = t.moment(start);
        if (!start.isValid()) {
          return false;
        }
      }

      if (end) {
        end = t.moment(end);
        if (!end.isValid()) {
          end = null; // let defaults take over
        }
      }

      allDay = input.allDay;
      if (allDay === undefined) { // still undefined? fallback to default
        allDay = firstDefined(
          source ? source.allDayDefault : undefined,
          options.allDayDefault
        );
        // still undefined? normalizeEventRange will calculate it
      }

      assignDatesToEvent(start, end, allDay, out);
    }

    return out;
  }


  // Normalizes and assigns the given dates to the given partially-formed event object.
  // NOTE: mutates the given start/end moments. does not make a copy.
  function assignDatesToEvent(start, end, allDay, event) {
    event.start = start;
    event.end = end;
    event.allDay = allDay;
    normalizeEventRange(event);
    backupEventDates(event);
  }


  // Ensures proper values for allDay/start/end. Accepts an Event object, or a plain object with event-ish properties.
  // NOTE: Will modify the given object.
  function normalizeEventRange(props) {

    normalizeEventRangeTimes(props);

    if (props.end && !props.end.isAfter(props.start)) {
      props.end = null;
    }

    if (!props.end) {
      if (options.forceEventDuration) {
        props.end = t.getDefaultEventEnd(props.allDay, props.start);
      }
      else {
        props.end = null;
      }
    }
  }


  // Ensures the allDay property exists and the timeliness of the start/end dates are consistent
  function normalizeEventRangeTimes(range) {
    if (range.allDay == null) {
      range.allDay = !(range.start.hasTime() || (range.end && range.end.hasTime()));
    }

    if (range.allDay) {
      range.start.stripTime();
      if (range.end) {
        // TODO: consider nextDayThreshold here? If so, will require a lot of testing and adjustment
        range.end.stripTime();
      }
    }
    else {
      if (!range.start.hasTime()) {
        range.start = t.rezoneDate(range.start); // will assign a 00:00 time
      }
      if (range.end && !range.end.hasTime()) {
        range.end = t.rezoneDate(range.end); // will assign a 00:00 time
      }
    }
  }


  // If `range` is a proper range with a start and end, returns the original object.
  // If missing an end, computes a new range with an end, computing it as if it were an event.
  // TODO: make this a part of the event -> eventRange system
  function ensureVisibleEventRange(range) {
    var allDay;

    if (!range.end) {

      allDay = range.allDay; // range might be more event-ish than we think
      if (allDay == null) {
        allDay = !range.start.hasTime();
      }

      range = $.extend({}, range); // make a copy, copying over other misc properties
      range.end = t.getDefaultEventEnd(allDay, range.start);
    }
    return range;
  }


  // If the given event is a recurring event, break it down into an array of individual instances.
  // If not a recurring event, return an array with the single original event.
  // If given a falsy input (probably because of a failed buildEventFromInput call), returns an empty array.
  // HACK: can override the recurring window by providing custom rangeStart/rangeEnd (for businessHours).
  function expandEvent(abstractEvent, _rangeStart, _rangeEnd) {
    var events = [];
    var dowHash;
    var dow;
    var i;
    var date;
    var startTime, endTime;
    var start, end;
    var event;

    _rangeStart = _rangeStart || rangeStart;
    _rangeEnd = _rangeEnd || rangeEnd;

    if (abstractEvent) {
      if (abstractEvent._recurring) {

        // make a boolean hash as to whether the event occurs on each day-of-week
        if ((dow = abstractEvent.dow)) {
          dowHash = {};
          for (i = 0; i < dow.length; i++) {
            dowHash[dow[i]] = true;
          }
        }

        // iterate through every day in the current range
        date = _rangeStart.clone().stripTime(); // holds the date of the current day
        while (date.isBefore(_rangeEnd)) {

          if (!dowHash || dowHash[date.day()]) { // if everyday, or this particular day-of-week

            startTime = abstractEvent.start; // the stored start and end properties are times (Durations)
            endTime = abstractEvent.end; // "
            start = date.clone();
            end = null;

            if (startTime) {
              start = start.time(startTime);
            }
            if (endTime) {
              end = date.clone().time(endTime);
            }

            event = $.extend({}, abstractEvent); // make a copy of the original
            assignDatesToEvent(
              start, end,
              !startTime && !endTime, // allDay?
              event
            );
            events.push(event);
          }

          date.add(1, 'days');
        }
      }
      else {
        events.push(abstractEvent); // return the original event. will be a one-item array
      }
    }

    return events;
  }



  /* Event Modification Math
  -----------------------------------------------------------------------------------------*/


  // Modifies an event and all related events by applying the given properties.
  // Special date-diffing logic is used for manipulation of dates.
  // If `props` does not contain start/end dates, the updated values are assumed to be the event's current start/end.
  // All date comparisons are done against the event's pristine _start and _end dates.
  // Returns an object with delta information and a function to undo all operations.
  // For making computations in a granularity greater than day/time, specify largeUnit.
  // NOTE: The given `newProps` might be mutated for normalization purposes.
  function mutateEvent(event, newProps, largeUnit) {
    var miscProps = {};
    var oldProps;
    var clearEnd;
    var startDelta;
    var endDelta;
    var durationDelta;
    var undoFunc;

    // diffs the dates in the appropriate way, returning a duration
    function diffDates(date1, date0) { // date1 - date0
      if (largeUnit) {
        return diffByUnit(date1, date0, largeUnit);
      }
      else if (newProps.allDay) {
        return diffDay(date1, date0);
      }
      else {
        return diffDayTime(date1, date0);
      }
    }

    newProps = newProps || {};

    // normalize new date-related properties
    if (!newProps.start) {
      newProps.start = event.start.clone();
    }
    if (newProps.end === undefined) {
      newProps.end = event.end ? event.end.clone() : null;
    }
    if (newProps.allDay == null) { // is null or undefined?
      newProps.allDay = event.allDay;
    }
    normalizeEventRange(newProps);

    // create normalized versions of the original props to compare against
    // need a real end value, for diffing
    oldProps = {
      start: event._start.clone(),
      end: event._end ? event._end.clone() : t.getDefaultEventEnd(event._allDay, event._start),
      allDay: newProps.allDay // normalize the dates in the same regard as the new properties
    };
    normalizeEventRange(oldProps);

    // need to clear the end date if explicitly changed to null
    clearEnd = event._end !== null && newProps.end === null;

    // compute the delta for moving the start date
    startDelta = diffDates(newProps.start, oldProps.start);

    // compute the delta for moving the end date
    if (newProps.end) {
      endDelta = diffDates(newProps.end, oldProps.end);
      durationDelta = endDelta.subtract(startDelta);
    }
    else {
      durationDelta = null;
    }

    // gather all non-date-related properties
    $.each(newProps, function(name, val) {
      if (isMiscEventPropName(name)) {
        if (val !== undefined) {
          miscProps[name] = val;
        }
      }
    });

    // apply the operations to the event and all related events
    undoFunc = mutateEvents(
      clientEvents(event._id), // get events with this ID
      clearEnd,
      newProps.allDay,
      startDelta,
      durationDelta,
      miscProps
    );

    return {
      dateDelta: startDelta,
      durationDelta: durationDelta,
      undo: undoFunc
    };
  }


  // Modifies an array of events in the following ways (operations are in order):
  // - clear the event's `end`
  // - convert the event to allDay
  // - add `dateDelta` to the start and end
  // - add `durationDelta` to the event's duration
  // - assign `miscProps` to the event
  //
  // Returns a function that can be called to undo all the operations.
  //
  // TODO: don't use so many closures. possible memory issues when lots of events with same ID.
  //
  function mutateEvents(events, clearEnd, allDay, dateDelta, durationDelta, miscProps) {
    var isAmbigTimezone = t.getIsAmbigTimezone();
    var undoFunctions = [];

    // normalize zero-length deltas to be null
    if (dateDelta && !dateDelta.valueOf()) { dateDelta = null; }
    if (durationDelta && !durationDelta.valueOf()) { durationDelta = null; }

    $.each(events, function(i, event) {
      var oldProps;
      var newProps;

      // build an object holding all the old values, both date-related and misc.
      // for the undo function.
      oldProps = {
        start: event.start.clone(),
        end: event.end ? event.end.clone() : null,
        allDay: event.allDay
      };
      $.each(miscProps, function(name) {
        oldProps[name] = event[name];
      });

      // new date-related properties. work off the original date snapshot.
      // ok to use references because they will be thrown away when backupEventDates is called.
      newProps = {
        start: event._start,
        end: event._end,
        allDay: allDay // normalize the dates in the same regard as the new properties
      };
      normalizeEventRange(newProps); // massages start/end/allDay

      // strip or ensure the end date
      if (clearEnd) {
        newProps.end = null;
      }
      else if (durationDelta && !newProps.end) { // the duration translation requires an end date
        newProps.end = t.getDefaultEventEnd(newProps.allDay, newProps.start);
      }

      if (dateDelta) {
        newProps.start.add(dateDelta);
        if (newProps.end) {
          newProps.end.add(dateDelta);
        }
      }

      if (durationDelta) {
        newProps.end.add(durationDelta); // end already ensured above
      }

      // if the dates have changed, and we know it is impossible to recompute the
      // timezone offsets, strip the zone.
      if (
        isAmbigTimezone &&
        !newProps.allDay &&
        (dateDelta || durationDelta)
      ) {
        newProps.start.stripZone();
        if (newProps.end) {
          newProps.end.stripZone();
        }
      }

      $.extend(event, miscProps, newProps); // copy over misc props, then date-related props
      backupEventDates(event); // regenerate internal _start/_end/_allDay

      undoFunctions.push(function() {
        $.extend(event, oldProps);
        backupEventDates(event); // regenerate internal _start/_end/_allDay
      });
    });

    return function() {
      for (var i = 0; i < undoFunctions.length; i++) {
        undoFunctions[i]();
      }
    };
  }


  /* Business Hours
  -----------------------------------------------------------------------------------------*/

  t.getBusinessHoursEvents = getBusinessHoursEvents;


  // Returns an array of events as to when the business hours occur in the given view.
  // Abuse of our event system :(
  function getBusinessHoursEvents(wholeDay) {
    var optionVal = options.businessHours;
    var defaultVal = {
      className: 'fc-nonbusiness',
      start: '09:00',
      end: '17:00',
      dow: [ 1, 2, 3, 4, 5 ], // monday - friday
      rendering: 'inverse-background'
    };
    var view = t.getView();
    var eventInput;

    if (optionVal) { // `true` (which means "use the defaults") or an override object
      eventInput = $.extend(
        {}, // copy to a new object in either case
        defaultVal,
        typeof optionVal === 'object' ? optionVal : {} // override the defaults
      );
    }

    if (eventInput) {

      // if a whole-day series is requested, clear the start/end times
      if (wholeDay) {
        eventInput.start = null;
        eventInput.end = null;
      }

      return expandEvent(
        buildEventFromInput(eventInput),
        view.start,
        view.end
      );
    }

    return [];
  }


  /* Overlapping / Constraining
  -----------------------------------------------------------------------------------------*/

  t.isEventRangeAllowed = isEventRangeAllowed;
  t.isSelectionRangeAllowed = isSelectionRangeAllowed;
  t.isExternalDropRangeAllowed = isExternalDropRangeAllowed;


  function isEventRangeAllowed(range, event) {
    var source = event.source || {};
    var constraint = firstDefined(
      event.constraint,
      source.constraint,
      options.eventConstraint
    );
    var overlap = firstDefined(
      event.overlap,
      source.overlap,
      options.eventOverlap
    );

    range = ensureVisibleEventRange(range); // ensure a proper range with an end for isRangeAllowed

    return isRangeAllowed(range, constraint, overlap, event);
  }


  function isSelectionRangeAllowed(range) {
    return isRangeAllowed(range, options.selectConstraint, options.selectOverlap);
  }


  // when `eventProps` is defined, consider this an event.
  // `eventProps` can contain misc non-date-related info about the event.
  function isExternalDropRangeAllowed(range, eventProps) {
    var eventInput;
    var event;

    // note: very similar logic is in View's reportExternalDrop
    if (eventProps) {
      eventInput = $.extend({}, eventProps, range);
      event = expandEvent(buildEventFromInput(eventInput))[0];
    }

    if (event) {
      return isEventRangeAllowed(range, event);
    }
    else { // treat it as a selection

      range = ensureVisibleEventRange(range); // ensure a proper range with an end for isSelectionRangeAllowed

      return isSelectionRangeAllowed(range);
    }
  }


  // Returns true if the given range (caused by an event drop/resize or a selection) is allowed to exist
  // according to the constraint/overlap settings.
  // `event` is not required if checking a selection.
  function isRangeAllowed(range, constraint, overlap, event) {
    var constraintEvents;
    var anyContainment;
    var peerEvents;
    var i, peerEvent;
    var peerOverlap;

    // normalize. fyi, we're normalizing in too many places :(
    range = $.extend({}, range); // copy all properties in case there are misc non-date properties
    range.start = range.start.clone().stripZone();
    range.end = range.end.clone().stripZone();

    // the range must be fully contained by at least one of produced constraint events
    if (constraint != null) {

      // not treated as an event! intermediate data structure
      // TODO: use ranges in the future
      constraintEvents = constraintToEvents(constraint);

      anyContainment = false;
      for (i = 0; i < constraintEvents.length; i++) {
        if (eventContainsRange(constraintEvents[i], range)) {
          anyContainment = true;
          break;
        }
      }

      if (!anyContainment) {
        return false;
      }
    }

    peerEvents = t.getPeerEvents(event, range);

    for (i = 0; i < peerEvents.length; i++)  {
      peerEvent = peerEvents[i];

      // there needs to be an actual intersection before disallowing anything
      if (eventIntersectsRange(peerEvent, range)) {

        // evaluate overlap for the given range and short-circuit if necessary
        if (overlap === false) {
          return false;
        }
        // if the event's overlap is a test function, pass the peer event in question as the first param
        else if (typeof overlap === 'function' && !overlap(peerEvent, event)) {
          return false;
        }

        // if we are computing if the given range is allowable for an event, consider the other event's
        // EventObject-specific or Source-specific `overlap` property
        if (event) {
          peerOverlap = firstDefined(
            peerEvent.overlap,
            (peerEvent.source || {}).overlap
            // we already considered the global `eventOverlap`
          );
          if (peerOverlap === false) {
            return false;
          }
          // if the peer event's overlap is a test function, pass the subject event as the first param
          if (typeof peerOverlap === 'function' && !peerOverlap(event, peerEvent)) {
            return false;
          }
        }
      }
    }

    return true;
  }


  // Given an event input from the API, produces an array of event objects. Possible event inputs:
  // 'businessHours'
  // An event ID (number or string)
  // An object with specific start/end dates or a recurring event (like what businessHours accepts)
  function constraintToEvents(constraintInput) {

    if (constraintInput === 'businessHours') {
      return getBusinessHoursEvents();
    }

    if (typeof constraintInput === 'object') {
      return expandEvent(buildEventFromInput(constraintInput));
    }

    return clientEvents(constraintInput); // probably an ID
  }


  // Does the event's date range fully contain the given range?
  // start/end already assumed to have stripped zones :(
  function eventContainsRange(event, range) {
    var eventStart = event.start.clone().stripZone();
    var eventEnd = t.getEventEnd(event).stripZone();

    return range.start >= eventStart && range.end <= eventEnd;
  }


  // Does the event's date range intersect with the given range?
  // start/end already assumed to have stripped zones :(
  function eventIntersectsRange(event, range) {
    var eventStart = event.start.clone().stripZone();
    var eventEnd = t.getEventEnd(event).stripZone();

    return range.start < eventEnd && range.end > eventStart;
  }


  t.getEventCache = function() {
    return cache;
  };

}


// Returns a list of events that the given event should be compared against when being considered for a move to
// the specified range. Attached to the Calendar's prototype because EventManager is a mixin for a Calendar.
Calendar.prototype.getPeerEvents = function(event, range) {
  var cache = this.getEventCache();
  var peerEvents = [];
  var i, otherEvent;

  for (i = 0; i < cache.length; i++) {
    otherEvent = cache[i];
    if (
      !event ||
      event._id !== otherEvent._id // don't compare the event to itself or other related [repeating] events
    ) {
      peerEvents.push(otherEvent);
    }
  }

  return peerEvents;
};


// updates the "backup" properties, which are preserved in order to compute diffs later on.
function backupEventDates(event) {
  event._allDay = event.allDay;
  event._start = event.start.clone();
  event._end = event.end ? event.end.clone() : null;
}

;;

/* An abstract class for the "basic" views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a DayGrid subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.

var BasicView = View.extend({

  dayGrid: null, // the main subcomponent that does most of the heavy lifting

  dayNumbersVisible: false, // display day numbers on each day cell?
  weekNumbersVisible: false, // display week numbers along the side?

  weekNumberWidth: null, // width of all the week-number cells running down the side

  headRowEl: null, // the fake row element of the day-of-week header


  initialize: function() {
    this.dayGrid = new DayGrid(this);
    this.coordMap = this.dayGrid.coordMap; // the view's date-to-cell mapping is identical to the subcomponent's
  },


  // Sets the display range and computes all necessary dates
  setRange: function(range) {
    View.prototype.setRange.call(this, range); // call the super-method

    this.dayGrid.breakOnWeeks = /year|month|week/.test(this.intervalUnit); // do before setRange
    this.dayGrid.setRange(range);
  },


  // Compute the value to feed into setRange. Overrides superclass.
  computeRange: function(date) {
    var range = View.prototype.computeRange.call(this, date); // get value from the super-method

    // year and month views should be aligned with weeks. this is already done for week
    if (/year|month/.test(range.intervalUnit)) {
      range.start.startOf('week');
      range.start = this.skipHiddenDays(range.start);

      // make end-of-week if not already
      if (range.end.weekday()) {
        range.end.add(1, 'week').startOf('week');
        range.end = this.skipHiddenDays(range.end, -1, true); // exclusively move backwards
      }
    }

    return range;
  },


  // Renders the view into `this.el`, which should already be assigned
  renderDates: function() {

    this.dayNumbersVisible = this.dayGrid.rowCnt > 1; // TODO: make grid responsible
    this.weekNumbersVisible = this.opt('weekNumbers');
    this.dayGrid.numbersVisible = this.dayNumbersVisible || this.weekNumbersVisible;

    this.el.addClass('fc-basic-view').html(this.renderHtml());

    this.headRowEl = this.el.find('thead .fc-row');

    this.scrollerEl = this.el.find('.fc-day-grid-container');
    this.dayGrid.coordMap.containerEl = this.scrollerEl; // constrain clicks/etc to the dimensions of the scroller

    this.dayGrid.setElement(this.el.find('.fc-day-grid'));
    this.dayGrid.renderDates(this.hasRigidRows());
  },


  // Unrenders the content of the view. Since we haven't separated skeleton rendering from date rendering,
  // always completely kill the dayGrid's rendering.
  unrenderDates: function() {
    this.dayGrid.unrenderDates();
    this.dayGrid.removeElement();
  },


  renderBusinessHours: function() {
    this.dayGrid.renderBusinessHours();
  },


  // Builds the HTML skeleton for the view.
  // The day-grid component will render inside of a container defined by this HTML.
  renderHtml: function() {
    return '' +
      '<table>' +
        '<thead class="fc-head">' +
          '<tr>' +
            '<td class="' + this.widgetHeaderClass + '">' +
              this.dayGrid.headHtml() + // render the day-of-week headers
            '</td>' +
          '</tr>' +
        '</thead>' +
        '<tbody class="fc-body">' +
          '<tr>' +
            '<td class="' + this.widgetContentClass + '">' +
              '<div class="fc-day-grid-container">' +
                '<div class="fc-day-grid"/>' +
              '</div>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>';
  },


  // Generates the HTML that will go before the day-of week header cells.
  // Queried by the DayGrid subcomponent when generating rows. Ordering depends on isRTL.
  headIntroHtml: function() {
    if (this.weekNumbersVisible) {
      return '' +
        '<th class="fc-week-number ' + this.widgetHeaderClass + '" ' + this.weekNumberStyleAttr() + '>' +
          '<span>' + // needed for matchCellWidths
            htmlEscape(this.opt('weekNumberTitle')) +
          '</span>' +
        '</th>';
    }
  },


  // Generates the HTML that will go before content-skeleton cells that display the day/week numbers.
  // Queried by the DayGrid subcomponent. Ordering depends on isRTL.
  numberIntroHtml: function(row) {
    if (this.weekNumbersVisible) {
      return '' +
        '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '>' +
          '<span>' + // needed for matchCellWidths
            this.dayGrid.getCell(row, 0).start.format('w') +
          '</span>' +
        '</td>';
    }
  },


  // Generates the HTML that goes before the day bg cells for each day-row.
  // Queried by the DayGrid subcomponent. Ordering depends on isRTL.
  dayIntroHtml: function() {
    if (this.weekNumbersVisible) {
      return '<td class="fc-week-number ' + this.widgetContentClass + '" ' +
        this.weekNumberStyleAttr() + '></td>';
    }
  },


  // Generates the HTML that goes before every other type of row generated by DayGrid. Ordering depends on isRTL.
  // Affects helper-skeleton and highlight-skeleton rows.
  introHtml: function() {
    if (this.weekNumbersVisible) {
      return '<td class="fc-week-number" ' + this.weekNumberStyleAttr() + '></td>';
    }
  },


  // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
  // The number row will only exist if either day numbers or week numbers are turned on.
  numberCellHtml: function(cell) {
    var date = cell.start;
    var classes;

    if (!this.dayNumbersVisible) { // if there are week numbers but not day numbers
      return '<td/>'; //  will create an empty space above events :(
    }

    classes = this.dayGrid.getDayClasses(date);
    classes.unshift('fc-day-number');

    return '' +
      '<td class="' + classes.join(' ') + '" data-date="' + date.format() + '">' +
        date.date() +
      '</td>';
  },


  // Generates an HTML attribute string for setting the width of the week number column, if it is known
  weekNumberStyleAttr: function() {
    if (this.weekNumberWidth !== null) {
      return 'style="width:' + this.weekNumberWidth + 'px"';
    }
    return '';
  },


  // Determines whether each row should have a constant height
  hasRigidRows: function() {
    var eventLimit = this.opt('eventLimit');
    return eventLimit && typeof eventLimit !== 'number';
  },


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  // Refreshes the horizontal dimensions of the view
  updateWidth: function() {
    if (this.weekNumbersVisible) {
      // Make sure all week number cells running down the side have the same width.
      // Record the width for cells created later.
      this.weekNumberWidth = matchCellWidths(
        this.el.find('.fc-week-number')
      );
    }
  },


  // Adjusts the vertical dimensions of the view to the specified values
  setHeight: function(totalHeight, isAuto) {
    var eventLimit = this.opt('eventLimit');
    var scrollerHeight;

    // reset all heights to be natural
    unsetScroller(this.scrollerEl);
    uncompensateScroll(this.headRowEl);

    this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed

    // is the event limit a constant level number?
    if (eventLimit && typeof eventLimit === 'number') {
      this.dayGrid.limitRows(eventLimit); // limit the levels first so the height can redistribute after
    }

    scrollerHeight = this.computeScrollerHeight(totalHeight);
    this.setGridHeight(scrollerHeight, isAuto);

    // is the event limit dynamically calculated?
    if (eventLimit && typeof eventLimit !== 'number') {
      this.dayGrid.limitRows(eventLimit); // limit the levels after the grid's row heights have been set
    }

    if (!isAuto && setPotentialScroller(this.scrollerEl, scrollerHeight)) { // using scrollbars?

      compensateScroll(this.headRowEl, getScrollbarWidths(this.scrollerEl));

      // doing the scrollbar compensation might have created text overflow which created more height. redo
      scrollerHeight = this.computeScrollerHeight(totalHeight);
      this.scrollerEl.height(scrollerHeight);
    }
  },


  // Sets the height of just the DayGrid component in this view
  setGridHeight: function(height, isAuto) {
    if (isAuto) {
      undistributeHeight(this.dayGrid.rowEls); // let the rows be their natural height with no expanding
    }
    else {
      distributeHeight(this.dayGrid.rowEls, height, true); // true = compensate for height-hogging rows
    }
  },


  /* Events
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders the given events onto the view and populates the segments array
  renderEvents: function(events) {
    this.dayGrid.renderEvents(events);

    this.updateHeight(); // must compensate for events that overflow the row
  },


  // Retrieves all segment objects that are rendered in the view
  getEventSegs: function() {
    return this.dayGrid.getEventSegs();
  },


  // Unrenders all event elements and clears internal segment data
  unrenderEvents: function() {
    this.dayGrid.unrenderEvents();

    // we DON'T need to call updateHeight() because:
    // A) a renderEvents() call always happens after this, which will eventually call updateHeight()
    // B) in IE8, this causes a flash whenever events are rerendered
  },


  /* Dragging (for both events and external elements)
  ------------------------------------------------------------------------------------------------------------------*/


  // A returned value of `true` signals that a mock "helper" event has been rendered.
  renderDrag: function(dropLocation, seg) {
    return this.dayGrid.renderDrag(dropLocation, seg);
  },


  unrenderDrag: function() {
    this.dayGrid.unrenderDrag();
  },


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a selection
  renderSelection: function(range) {
    this.dayGrid.renderSelection(range);
  },


  // Unrenders a visual indications of a selection
  unrenderSelection: function() {
    this.dayGrid.unrenderSelection();
  }

});

;;

/* A month view with day cells running in rows (one-per-week) and columns
----------------------------------------------------------------------------------------------------------------------*/

var MonthView = BasicView.extend({

  // Produces information about what range to display
  computeRange: function(date) {
    var range = BasicView.prototype.computeRange.call(this, date); // get value from super-method
    var rowCnt;

    // ensure 6 weeks
    if (this.isFixedWeeks()) {
      rowCnt = Math.ceil(range.end.diff(range.start, 'weeks', true)); // could be partial weeks due to hiddenDays
      range.end.add(6 - rowCnt, 'weeks');
    }

    return range;
  },


  // Overrides the default BasicView behavior to have special multi-week auto-height logic
  setGridHeight: function(height, isAuto) {

    isAuto = isAuto || this.opt('weekMode') === 'variable'; // LEGACY: weekMode is deprecated

    // if auto, make the height of each row the height that it would be if there were 6 weeks
    if (isAuto) {
      height *= this.rowCnt / 6;
    }

    distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
  },


  isFixedWeeks: function() {
    var weekMode = this.opt('weekMode'); // LEGACY: weekMode is deprecated
    if (weekMode) {
      return weekMode === 'fixed'; // if any other type of weekMode, assume NOT fixed
    }

    return this.opt('fixedWeekCount');
  }

});

;;

fcViews.basic = {
  'class': BasicView
};

fcViews.basicDay = {
  type: 'basic',
  duration: { days: 1 }
};

fcViews.basicWeek = {
  type: 'basic',
  duration: { weeks: 1 }
};

fcViews.month = {
  'class': MonthView,
  duration: { months: 1 }, // important for prev/next
  defaults: {
    fixedWeekCount: true
  }
};
;;

/* An abstract class for all agenda-related views. Displays one more columns with time slots running vertically.
----------------------------------------------------------------------------------------------------------------------*/
// Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
// Responsible for managing width/height.

var AgendaView = View.extend({

  timeGrid: null, // the main time-grid subcomponent of this view
  dayGrid: null, // the "all-day" subcomponent. if all-day is turned off, this will be null

  axisWidth: null, // the width of the time axis running down the side

  noScrollRowEls: null, // set of fake row elements that must compensate when scrollerEl has scrollbars

  // when the time-grid isn't tall enough to occupy the given height, we render an <hr> underneath
  bottomRuleEl: null,
  bottomRuleHeight: null,


  initialize: function() {
    this.timeGrid = new TimeGrid(this);

    if (this.opt('allDaySlot')) { // should we display the "all-day" area?
      this.dayGrid = new DayGrid(this); // the all-day subcomponent of this view

      // the coordinate grid will be a combination of both subcomponents' grids
      this.coordMap = new ComboCoordMap([
        this.dayGrid.coordMap,
        this.timeGrid.coordMap
      ]);
    }
    else {
      this.coordMap = this.timeGrid.coordMap;
    }
  },


  /* Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Sets the display range and computes all necessary dates
  setRange: function(range) {
    View.prototype.setRange.call(this, range); // call the super-method

    this.timeGrid.setRange(range);
    if (this.dayGrid) {
      this.dayGrid.setRange(range);
    }
  },


  // Renders the view into `this.el`, which has already been assigned
  renderDates: function() {

    this.el.addClass('fc-agenda-view').html(this.renderHtml());

    // the element that wraps the time-grid that will probably scroll
    this.scrollerEl = this.el.find('.fc-time-grid-container');
    this.timeGrid.coordMap.containerEl = this.scrollerEl; // don't accept clicks/etc outside of this

    this.timeGrid.setElement(this.el.find('.fc-time-grid'));
    this.timeGrid.renderDates();

    // the <hr> that sometimes displays under the time-grid
    this.bottomRuleEl = $('<hr class="fc-divider ' + this.widgetHeaderClass + '"/>')
      .appendTo(this.timeGrid.el); // inject it into the time-grid

    if (this.dayGrid) {
      this.dayGrid.setElement(this.el.find('.fc-day-grid'));
      this.dayGrid.renderDates();

      // have the day-grid extend it's coordinate area over the <hr> dividing the two grids
      this.dayGrid.bottomCoordPadding = this.dayGrid.el.next('hr').outerHeight();
    }

    this.noScrollRowEls = this.el.find('.fc-row:not(.fc-scroller *)'); // fake rows not within the scroller
  },


  // Unrenders the content of the view. Since we haven't separated skeleton rendering from date rendering,
  // always completely kill each grid's rendering.
  unrenderDates: function() {
    this.timeGrid.unrenderDates();
    this.timeGrid.removeElement();

    if (this.dayGrid) {
      this.dayGrid.unrenderDates();
      this.dayGrid.removeElement();
    }
  },


  renderBusinessHours: function() {
    this.timeGrid.renderBusinessHours();

    if (this.dayGrid) {
      this.dayGrid.renderBusinessHours();
    }
  },


  // Builds the HTML skeleton for the view.
  // The day-grid and time-grid components will render inside containers defined by this HTML.
  renderHtml: function() {
    return '' +
      '<table>' +
        '<thead class="fc-head">' +
          '<tr>' +
            '<td class="' + this.widgetHeaderClass + '">' +
              this.timeGrid.headHtml() + // render the day-of-week headers
            '</td>' +
          '</tr>' +
        '</thead>' +
        '<tbody class="fc-body">' +
          '<tr>' +
            '<td class="' + this.widgetContentClass + '">' +
              (this.dayGrid ?
                '<div class="fc-day-grid"/>' +
                '<hr class="fc-divider ' + this.widgetHeaderClass + '"/>' :
                ''
                ) +
              '<div class="fc-time-grid-container">' +
                '<div class="fc-time-grid"/>' +
              '</div>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>';
  },


  // Generates the HTML that will go before the day-of week header cells.
  // Queried by the TimeGrid subcomponent when generating rows. Ordering depends on isRTL.
  headIntroHtml: function() {
    var date;
    var weekText;

    if (this.opt('weekNumbers')) {
      date = this.timeGrid.getCell(0).start;
      weekText = date.format(this.opt('smallWeekFormat'));

      return '' +
        '<th class="fc-axis fc-week-number ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + '>' +
          '<span>' + // needed for matchCellWidths
            htmlEscape(weekText) +
          '</span>' +
        '</th>';
    }
    else {
      return '<th class="fc-axis ' + this.widgetHeaderClass + '" ' + this.axisStyleAttr() + '></th>';
    }
  },


  // Generates the HTML that goes before the all-day cells.
  // Queried by the DayGrid subcomponent when generating rows. Ordering depends on isRTL.
  dayIntroHtml: function() {
    return '' +
      '<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + '>' +
        '<span>' + // needed for matchCellWidths
          (this.opt('allDayHtml') || htmlEscape(this.opt('allDayText'))) +
        '</span>' +
      '</td>';
  },


  // Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
  slotBgIntroHtml: function() {
    return '<td class="fc-axis ' + this.widgetContentClass + '" ' + this.axisStyleAttr() + '></td>';
  },


  // Generates the HTML that goes before all other types of cells.
  // Affects content-skeleton, helper-skeleton, highlight-skeleton for both the time-grid and day-grid.
  // Queried by the TimeGrid and DayGrid subcomponents when generating rows. Ordering depends on isRTL.
  introHtml: function() {
    return '<td class="fc-axis" ' + this.axisStyleAttr() + '></td>';
  },


  // Generates an HTML attribute string for setting the width of the axis, if it is known
  axisStyleAttr: function() {
    if (this.axisWidth !== null) {
       return 'style="width:' + this.axisWidth + 'px"';
    }
    return '';
  },


  /* Dimensions
  ------------------------------------------------------------------------------------------------------------------*/


  updateSize: function(isResize) {
    this.timeGrid.updateSize(isResize);

    View.prototype.updateSize.call(this, isResize); // call the super-method
  },


  // Refreshes the horizontal dimensions of the view
  updateWidth: function() {
    // make all axis cells line up, and record the width so newly created axis cells will have it
    this.axisWidth = matchCellWidths(this.el.find('.fc-axis'));
  },


  // Adjusts the vertical dimensions of the view to the specified values
  setHeight: function(totalHeight, isAuto) {
    var eventLimit;
    var scrollerHeight;

    if (this.bottomRuleHeight === null) {
      // calculate the height of the rule the very first time
      this.bottomRuleHeight = this.bottomRuleEl.outerHeight();
    }
    this.bottomRuleEl.hide(); // .show() will be called later if this <hr> is necessary

    // reset all dimensions back to the original state
    this.scrollerEl.css('overflow', '');
    unsetScroller(this.scrollerEl);
    uncompensateScroll(this.noScrollRowEls);

    // limit number of events in the all-day area
    if (this.dayGrid) {
      this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed

      eventLimit = this.opt('eventLimit');
      if (eventLimit && typeof eventLimit !== 'number') {
        eventLimit = AGENDA_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
      }
      if (eventLimit) {
        this.dayGrid.limitRows(eventLimit);
      }
    }

    if (!isAuto) { // should we force dimensions of the scroll container, or let the contents be natural height?

      scrollerHeight = this.computeScrollerHeight(totalHeight);
      if (setPotentialScroller(this.scrollerEl, scrollerHeight)) { // using scrollbars?

        // make the all-day and header rows lines up
        compensateScroll(this.noScrollRowEls, getScrollbarWidths(this.scrollerEl));

        // the scrollbar compensation might have changed text flow, which might affect height, so recalculate
        // and reapply the desired height to the scroller.
        scrollerHeight = this.computeScrollerHeight(totalHeight);
        this.scrollerEl.height(scrollerHeight);
      }
      else { // no scrollbars
        // still, force a height and display the bottom rule (marks the end of day)
        this.scrollerEl.height(scrollerHeight).css('overflow', 'hidden'); // in case <hr> goes outside
        this.bottomRuleEl.show();
      }
    }
  },


  // Computes the initial pre-configured scroll state prior to allowing the user to change it
  computeInitialScroll: function() {
    var scrollTime = moment.duration(this.opt('scrollTime'));
    var top = this.timeGrid.computeTimeTop(scrollTime);

    // zoom can give weird floating-point values. rather scroll a little bit further
    top = Math.ceil(top);

    if (top) {
      top++; // to overcome top border that slots beyond the first have. looks better
    }

    return top;
  },


  /* Events
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders events onto the view and populates the View's segment array
  renderEvents: function(events) {
    var dayEvents = [];
    var timedEvents = [];
    var daySegs = [];
    var timedSegs;
    var i;

    // separate the events into all-day and timed
    for (i = 0; i < events.length; i++) {
      if (events[i].allDay) {
        dayEvents.push(events[i]);
      }
      else {
        timedEvents.push(events[i]);
      }
    }

    // render the events in the subcomponents
    timedSegs = this.timeGrid.renderEvents(timedEvents);
    if (this.dayGrid) {
      daySegs = this.dayGrid.renderEvents(dayEvents);
    }

    // the all-day area is flexible and might have a lot of events, so shift the height
    this.updateHeight();
  },


  // Retrieves all segment objects that are rendered in the view
  getEventSegs: function() {
    return this.timeGrid.getEventSegs().concat(
      this.dayGrid ? this.dayGrid.getEventSegs() : []
    );
  },


  // Unrenders all event elements and clears internal segment data
  unrenderEvents: function() {

    // unrender the events in the subcomponents
    this.timeGrid.unrenderEvents();
    if (this.dayGrid) {
      this.dayGrid.unrenderEvents();
    }

    // we DON'T need to call updateHeight() because:
    // A) a renderEvents() call always happens after this, which will eventually call updateHeight()
    // B) in IE8, this causes a flash whenever events are rerendered
  },


  /* Dragging (for events and external elements)
  ------------------------------------------------------------------------------------------------------------------*/


  // A returned value of `true` signals that a mock "helper" event has been rendered.
  renderDrag: function(dropLocation, seg) {
    if (dropLocation.start.hasTime()) {
      return this.timeGrid.renderDrag(dropLocation, seg);
    }
    else if (this.dayGrid) {
      return this.dayGrid.renderDrag(dropLocation, seg);
    }
  },


  unrenderDrag: function() {
    this.timeGrid.unrenderDrag();
    if (this.dayGrid) {
      this.dayGrid.unrenderDrag();
    }
  },


  /* Selection
  ------------------------------------------------------------------------------------------------------------------*/


  // Renders a visual indication of a selection
  renderSelection: function(range) {
    if (range.start.hasTime() || range.end.hasTime()) {
      this.timeGrid.renderSelection(range);
    }
    else if (this.dayGrid) {
      this.dayGrid.renderSelection(range);
    }
  },


  // Unrenders a visual indications of a selection
  unrenderSelection: function() {
    this.timeGrid.unrenderSelection();
    if (this.dayGrid) {
      this.dayGrid.unrenderSelection();
    }
  }

});

;;

var AGENDA_ALL_DAY_EVENT_LIMIT = 5;

fcViews.agenda = {
  'class': AgendaView,
  defaults: {
    allDaySlot: true,
    allDayText: 'all-day',
    slotDuration: '00:30:00',
    minTime: '00:00:00',
    maxTime: '24:00:00',
    slotEventOverlap: true // a bad name. confused with overlap/constraint system
  }
};

fcViews.agendaDay = {
  type: 'agenda',
  duration: { days: 1 }
};

fcViews.agendaWeek = {
  type: 'agenda',
  duration: { weeks: 1 }
};
;;

return fc; // export for Node/CommonJS
});
/*! jQuery v2.1.4 | (c) 2005, 2015 jQuery Foundation, Inc. | jquery.org/license */

!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l=a.document,m="2.1.4",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return n.each(this,a,b)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){return!n.isArray(a)&&a-parseFloat(a)+1>=0},isPlainObject:function(a){return"object"!==n.type(a)||a.nodeType||n.isWindow(a)?!1:a.constructor&&!j.call(a.constructor.prototype,"isPrototypeOf")?!1:!0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=l.createElement("script"),b.text=a,l.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=s(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:g.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=s(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(e=d.call(arguments,2),f=function(){return a.apply(b||this,e.concat(d.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:k}),n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function s(a){var b="length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ha(),z=ha(),A=ha(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N=M.replace("w","w#"),O="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+N+"))|)"+L+"*\\]",P=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+O+")*)|.*)\\)|)",Q=new RegExp(L+"+","g"),R=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),S=new RegExp("^"+L+"*,"+L+"*"),T=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),U=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),V=new RegExp(P),W=new RegExp("^"+N+"$"),X={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M.replace("w","w*")+")"),ATTR:new RegExp("^"+O),PSEUDO:new RegExp("^"+P),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,aa=/[+~]/,ba=/'|\\/g,ca=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),da=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},ea=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(fa){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function ga(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],k=b.nodeType,"string"!=typeof a||!a||1!==k&&9!==k&&11!==k)return d;if(!e&&p){if(11!==k&&(f=_.exec(a)))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return H.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName)return H.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=1!==k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(ba,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+ra(o[l]);w=aa.test(a)&&pa(b.parentNode)||b,x=o.join(",")}if(x)try{return H.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function ha(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ia(a){return a[u]=!0,a}function ja(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ka(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function la(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function na(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function oa(a){return ia(function(b){return b=+b,ia(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function pa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=ga.support={},f=ga.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=ga.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=g.documentElement,e=g.defaultView,e&&e!==e.top&&(e.addEventListener?e.addEventListener("unload",ea,!1):e.attachEvent&&e.attachEvent("onunload",ea)),p=!f(g),c.attributes=ja(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ja(function(a){return a.appendChild(g.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(g.getElementsByClassName),c.getById=ja(function(a){return o.appendChild(a).id=u,!g.getElementsByName||!g.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ca,da);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(g.querySelectorAll))&&(ja(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\f]' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ja(function(a){var b=g.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ja(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",P)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===g||a.ownerDocument===v&&t(v,a)?-1:b===g||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,h=[a],i=[b];if(!e||!f)return a===g?-1:b===g?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return la(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?la(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},g):n},ga.matches=function(a,b){return ga(a,null,null,b)},ga.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return ga(b,n,null,[a]).length>0},ga.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},ga.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},ga.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},ga.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=ga.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=ga.selectors={cacheLength:50,createPseudo:ia,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ca,da),a[3]=(a[3]||a[4]||a[5]||"").replace(ca,da),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||ga.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&ga.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ca,da).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=ga.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(Q," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||ga.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ia(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ia(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?ia(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ia(function(a){return function(b){return ga(a,b).length>0}}),contains:ia(function(a){return a=a.replace(ca,da),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ia(function(a){return W.test(a||"")||ga.error("unsupported lang: "+a),a=a.replace(ca,da).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:oa(function(){return[0]}),last:oa(function(a,b){return[b-1]}),eq:oa(function(a,b,c){return[0>c?c+b:c]}),even:oa(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:oa(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:oa(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:oa(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=ma(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=na(b);function qa(){}qa.prototype=d.filters=d.pseudos,d.setFilters=new qa,g=ga.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?ga.error(a):z(a,i).slice(0)};function ra(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function sa(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function ta(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ua(a,b,c){for(var d=0,e=b.length;e>d;d++)ga(a,b[d],c);return c}function va(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function wa(a,b,c,d,e,f){return d&&!d[u]&&(d=wa(d)),e&&!e[u]&&(e=wa(e,f)),ia(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ua(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:va(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=va(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=va(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function xa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=sa(function(a){return a===b},h,!0),l=sa(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[sa(ta(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return wa(i>1&&ta(m),i>1&&ra(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&xa(a.slice(i,e)),f>e&&xa(a=a.slice(e)),f>e&&ra(a))}m.push(c)}return ta(m)}function ya(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=F.call(i));s=va(s)}H.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&ga.uniqueSort(i)}return k&&(w=v,j=t),r};return c?ia(f):f}return h=ga.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=xa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,ya(e,d)),f.selector=a}return f},i=ga.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ca,da),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ca,da),aa.test(j[0].type)&&pa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&ra(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,aa.test(a)&&pa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ja(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ja(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ka("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ja(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ka("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ja(function(a){return null==a.getAttribute("disabled")})||ka(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),ga}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=n.expr.match.needsContext,v=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,w=/^.[^:#\[\.,]*$/;function x(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(w.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return g.call(b,a)>=0!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(x(this,a||[],!1))},not:function(a){return this.pushStack(x(this,a||[],!0))},is:function(a){return!!x(this,"string"==typeof a&&u.test(a)?n(a):a||[],!1).length}});var y,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=n.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||y).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:l,!0)),v.test(c[1])&&n.isPlainObject(b))for(c in b)n.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}return d=l.getElementById(c[2]),d&&d.parentNode&&(this.length=1,this[0]=d),this.context=l,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?"undefined"!=typeof y.ready?y.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};A.prototype=n.fn,y=n(l);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};n.extend({dir:function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=u.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.unique(f):f)},index:function(a){return a?"string"==typeof a?g.call(n(a),this[0]):g.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.unique(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return n.dir(a,"parentNode")},parentsUntil:function(a,b,c){return n.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return n.dir(a,"nextSibling")},prevAll:function(a){return n.dir(a,"previousSibling")},nextUntil:function(a,b,c){return n.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return n.dir(a,"previousSibling",c)},siblings:function(a){return n.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return n.sibling(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(C[a]||n.unique(e),B.test(a)&&e.reverse()),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return n.each(a.match(E)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):n.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(b=a.memory&&l,c=!0,g=e||0,e=0,f=h.length,d=!0;h&&f>g;g++)if(h[g].apply(l[0],l[1])===!1&&a.stopOnFalse){b=!1;break}d=!1,h&&(i?i.length&&j(i.shift()):b?h=[]:k.disable())},k={add:function(){if(h){var c=h.length;!function g(b){n.each(b,function(b,c){var d=n.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&g(c)})}(arguments),d?f=h.length:b&&(e=c,j(b))}return this},remove:function(){return h&&n.each(arguments,function(a,b){var c;while((c=n.inArray(b,h,c))>-1)h.splice(c,1),d&&(f>=c&&f--,g>=c&&g--)}),this},has:function(a){return a?n.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],f=0,this},disable:function(){return h=i=b=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,b||k.disable(),this},locked:function(){return!i},fireWith:function(a,b){return!h||c&&!i||(b=b||[],b=[a,b.slice?b.slice():b],d?i.push(b):j(b)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!c}};return k},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&n.isFunction(a.promise)?e:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(H.resolveWith(l,[n]),n.fn.triggerHandler&&(n(l).triggerHandler("ready"),n(l).off("ready"))))}});function I(){l.removeEventListener("DOMContentLoaded",I,!1),a.removeEventListener("load",I,!1),n.ready()}n.ready.promise=function(b){return H||(H=n.Deferred(),"complete"===l.readyState?setTimeout(n.ready):(l.addEventListener("DOMContentLoaded",I,!1),a.addEventListener("load",I,!1))),H.promise(b)},n.ready.promise();var J=n.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)n.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f};n.acceptData=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function K(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=n.expando+K.uid++}K.uid=1,K.accepts=n.acceptData,K.prototype={key:function(a){if(!K.accepts(a))return 0;var b={},c=a[this.expando];if(!c){c=K.uid++;try{b[this.expando]={value:c},Object.defineProperties(a,b)}catch(d){b[this.expando]=c,n.extend(a,b)}}return this.cache[c]||(this.cache[c]={}),c},set:function(a,b,c){var d,e=this.key(a),f=this.cache[e];if("string"==typeof b)f[b]=c;else if(n.isEmptyObject(f))n.extend(this.cache[e],b);else for(d in b)f[d]=b[d];return f},get:function(a,b){var c=this.cache[this.key(a)];return void 0===b?c:c[b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=this.key(a),g=this.cache[f];if(void 0===b)this.cache[f]={};else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in g?d=[b,e]:(d=e,d=d in g?[d]:d.match(E)||[])),c=d.length;while(c--)delete g[d[c]]}},hasData:function(a){return!n.isEmptyObject(this.cache[a[this.expando]]||{})},discard:function(a){a[this.expando]&&delete this.cache[a[this.expando]]}};var L=new K,M=new K,N=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,O=/([A-Z])/g;function P(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(O,"-$1").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:N.test(c)?n.parseJSON(c):c}catch(e){}M.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return M.hasData(a)||L.hasData(a)},data:function(a,b,c){
return M.access(a,b,c)},removeData:function(a,b){M.remove(a,b)},_data:function(a,b,c){return L.access(a,b,c)},_removeData:function(a,b){L.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=M.get(f),1===f.nodeType&&!L.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),P(f,d,e[d])));L.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){M.set(this,a)}):J(this,function(b){var c,d=n.camelCase(a);if(f&&void 0===b){if(c=M.get(f,a),void 0!==c)return c;if(c=M.get(f,d),void 0!==c)return c;if(c=P(f,d,void 0),void 0!==c)return c}else this.each(function(){var c=M.get(this,d);M.set(this,d,b),-1!==a.indexOf("-")&&void 0!==c&&M.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){M.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=L.get(a,b),c&&(!d||n.isArray(c)?d=L.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return L.get(a,c)||L.access(a,c,{empty:n.Callbacks("once memory").add(function(){L.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=L.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var Q=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,R=["Top","Right","Bottom","Left"],S=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)},T=/^(?:checkbox|radio)$/i;!function(){var a=l.createDocumentFragment(),b=a.appendChild(l.createElement("div")),c=l.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var U="undefined";k.focusinBubbles="onfocusin"in a;var V=/^key/,W=/^(?:mouse|pointer|contextmenu)|click/,X=/^(?:focusinfocus|focusoutblur)$/,Y=/^([^.]*)(?:\.(.+)|)$/;function Z(){return!0}function $(){return!1}function _(){try{return l.activeElement}catch(a){}}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return typeof n!==U&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(E)||[""],j=b.length;while(j--)h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g,!1)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=L.hasData(a)&&L.get(a);if(r&&(i=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=Y.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&(delete r.handle,L.remove(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,m,o,p=[d||l],q=j.call(b,"type")?b.type:b,r=j.call(b,"namespace")?b.namespace.split("."):[];if(g=h=d=d||l,3!==d.nodeType&&8!==d.nodeType&&!X.test(q+n.event.triggered)&&(q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),k=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=r.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},e||!o.trigger||o.trigger.apply(d,c)!==!1)){if(!e&&!o.noBubble&&!n.isWindow(d)){for(i=o.delegateType||q,X.test(i+q)||(g=g.parentNode);g;g=g.parentNode)p.push(g),h=g;h===(d.ownerDocument||l)&&p.push(h.defaultView||h.parentWindow||a)}f=0;while((g=p[f++])&&!b.isPropagationStopped())b.type=f>1?i:o.bindType||q,m=(L.get(g,"events")||{})[b.type]&&L.get(g,"handle"),m&&m.apply(g,c),m=k&&g[k],m&&m.apply&&n.acceptData(g)&&(b.result=m.apply(g,c),b.result===!1&&b.preventDefault());return b.type=q,e||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!n.acceptData(d)||k&&n.isFunction(d[q])&&!n.isWindow(d)&&(h=d[k],h&&(d[k]=null),n.event.triggered=q,d[q](),n.event.triggered=void 0,h&&(d[k]=h)),b.result}},dispatch:function(a){a=n.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(L.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(g.namespace))&&(a.handleObj=g,a.data=g.data,e=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==e&&(a.result=e)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!==this;i=i.parentNode||this)if(i.disabled!==!0||"click"!==a.type){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>=0:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||l,d=c.documentElement,e=c.body,a.pageX=b.clientX+(d&&d.scrollLeft||e&&e.scrollLeft||0)-(d&&d.clientLeft||e&&e.clientLeft||0),a.pageY=b.clientY+(d&&d.scrollTop||e&&e.scrollTop||0)-(d&&d.clientTop||e&&e.clientTop||0)),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=W.test(e)?this.mouseHooks:V.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new n.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=l),3===a.target.nodeType&&(a.target=a.target.parentNode),g.filter?g.filter(a,f):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==_()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===_()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=n.extend(new n.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?n.event.trigger(e,null,b):n.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?Z:$):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={isDefaultPrevented:$,isPropagationStopped:$,isImmediatePropagationStopped:$,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=Z,a&&a.preventDefault&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=Z,a&&a.stopPropagation&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=Z,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!n.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.focusinBubbles||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a),!0)};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=L.access(d,b);e||d.addEventListener(a,c,!0),L.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=L.access(d,b)-1;e?L.access(d,b,e):(d.removeEventListener(a,c,!0),L.remove(d,b))}}}),n.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(g in a)this.on(g,b,c,a[g],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=$;else if(!d)return this;return 1===e&&(f=d,d=function(a){return n().off(a),f.apply(this,arguments)},d.guid=f.guid||(f.guid=n.guid++)),this.each(function(){n.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=$),this.each(function(){n.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}});var aa=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,ba=/<([\w:]+)/,ca=/<|&#?\w+;/,da=/<(?:script|style|link)/i,ea=/checked\s*(?:[^=]|=\s*.checked.)/i,fa=/^$|\/(?:java|ecma)script/i,ga=/^true\/(.*)/,ha=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,ia={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};ia.optgroup=ia.option,ia.tbody=ia.tfoot=ia.colgroup=ia.caption=ia.thead,ia.th=ia.td;function ja(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function ka(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function la(a){var b=ga.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function ma(a,b){for(var c=0,d=a.length;d>c;c++)L.set(a[c],"globalEval",!b||L.get(b[c],"globalEval"))}function na(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(L.hasData(a)&&(f=L.access(a),g=L.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}M.hasData(a)&&(h=M.access(a),i=n.extend({},h),M.set(b,i))}}function oa(a,b){var c=a.getElementsByTagName?a.getElementsByTagName(b||"*"):a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function pa(a,b){var c=b.nodeName.toLowerCase();"input"===c&&T.test(a.type)?b.checked=a.checked:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}n.extend({clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=oa(h),f=oa(a),d=0,e=f.length;e>d;d++)pa(f[d],g[d]);if(b)if(c)for(f=f||oa(a),g=g||oa(h),d=0,e=f.length;e>d;d++)na(f[d],g[d]);else na(a,h);return g=oa(h,"script"),g.length>0&&ma(g,!i&&oa(a,"script")),h},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k=b.createDocumentFragment(),l=[],m=0,o=a.length;o>m;m++)if(e=a[m],e||0===e)if("object"===n.type(e))n.merge(l,e.nodeType?[e]:e);else if(ca.test(e)){f=f||k.appendChild(b.createElement("div")),g=(ba.exec(e)||["",""])[1].toLowerCase(),h=ia[g]||ia._default,f.innerHTML=h[1]+e.replace(aa,"<$1></$2>")+h[2],j=h[0];while(j--)f=f.lastChild;n.merge(l,f.childNodes),f=k.firstChild,f.textContent=""}else l.push(b.createTextNode(e));k.textContent="",m=0;while(e=l[m++])if((!d||-1===n.inArray(e,d))&&(i=n.contains(e.ownerDocument,e),f=oa(k.appendChild(e),"script"),i&&ma(f),c)){j=0;while(e=f[j++])fa.test(e.type||"")&&c.push(e)}return k},cleanData:function(a){for(var b,c,d,e,f=n.event.special,g=0;void 0!==(c=a[g]);g++){if(n.acceptData(c)&&(e=c[L.expando],e&&(b=L.cache[e]))){if(b.events)for(d in b.events)f[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);L.cache[e]&&delete L.cache[e]}delete M.cache[c[M.expando]]}}}),n.fn.extend({text:function(a){return J(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=a)})},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=ja(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=ja(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?n.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||n.cleanData(oa(c)),c.parentNode&&(b&&n.contains(c.ownerDocument,c)&&ma(oa(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(oa(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return J(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!da.test(a)&&!ia[(ba.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(aa,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(oa(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,n.cleanData(oa(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,m=this,o=l-1,p=a[0],q=n.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&ea.test(p))return this.each(function(c){var d=m.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(c=n.buildFragment(a,this[0].ownerDocument,!1,this),d=c.firstChild,1===c.childNodes.length&&(c=d),d)){for(f=n.map(oa(c,"script"),ka),g=f.length;l>j;j++)h=c,j!==o&&(h=n.clone(h,!0,!0),g&&n.merge(f,oa(h,"script"))),b.call(this[j],h,j);if(g)for(i=f[f.length-1].ownerDocument,n.map(f,la),j=0;g>j;j++)h=f[j],fa.test(h.type||"")&&!L.access(h,"globalEval")&&n.contains(i,h)&&(h.src?n._evalUrl&&n._evalUrl(h.src):n.globalEval(h.textContent.replace(ha,"")))}return this}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),g=e.length-1,h=0;g>=h;h++)c=h===g?this:this.clone(!0),n(e[h])[b](c),f.apply(d,c.get());return this.pushStack(d)}});var qa,ra={};function sa(b,c){var d,e=n(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:n.css(e[0],"display");return e.detach(),f}function ta(a){var b=l,c=ra[a];return c||(c=sa(a,b),"none"!==c&&c||(qa=(qa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=qa[0].contentDocument,b.write(),b.close(),c=sa(a,b),qa.detach()),ra[a]=c),c}var ua=/^margin/,va=new RegExp("^("+Q+")(?!px)[a-z%]+$","i"),wa=function(b){return b.ownerDocument.defaultView.opener?b.ownerDocument.defaultView.getComputedStyle(b,null):a.getComputedStyle(b,null)};function xa(a,b,c){var d,e,f,g,h=a.style;return c=c||wa(a),c&&(g=c.getPropertyValue(b)||c[b]),c&&(""!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),va.test(g)&&ua.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0!==g?g+"":g}function ya(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d=l.documentElement,e=l.createElement("div"),f=l.createElement("div");if(f.style){f.style.backgroundClip="content-box",f.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===f.style.backgroundClip,e.style.cssText="border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute",e.appendChild(f);function g(){f.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",f.innerHTML="",d.appendChild(e);var g=a.getComputedStyle(f,null);b="1%"!==g.top,c="4px"===g.width,d.removeChild(e)}a.getComputedStyle&&n.extend(k,{pixelPosition:function(){return g(),b},boxSizingReliable:function(){return null==c&&g(),c},reliableMarginRight:function(){var b,c=f.appendChild(l.createElement("div"));return c.style.cssText=f.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",f.style.width="1px",d.appendChild(e),b=!parseFloat(a.getComputedStyle(c,null).marginRight),d.removeChild(e),f.removeChild(c),b}})}}(),n.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var za=/^(none|table(?!-c[ea]).+)/,Aa=new RegExp("^("+Q+")(.*)$","i"),Ba=new RegExp("^([+-])=("+Q+")","i"),Ca={position:"absolute",visibility:"hidden",display:"block"},Da={letterSpacing:"0",fontWeight:"400"},Ea=["Webkit","O","Moz","ms"];function Fa(a,b){if(b in a)return b;var c=b[0].toUpperCase()+b.slice(1),d=b,e=Ea.length;while(e--)if(b=Ea[e]+c,b in a)return b;return d}function Ga(a,b,c){var d=Aa.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Ha(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+R[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+R[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+R[f]+"Width",!0,e))):(g+=n.css(a,"padding"+R[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+R[f]+"Width",!0,e)));return g}function Ia(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=wa(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=xa(a,b,f),(0>e||null==e)&&(e=a.style[b]),va.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Ha(a,b,c||(g?"border":"content"),d,f)+"px"}function Ja(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=L.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&S(d)&&(f[g]=L.access(d,"olddisplay",ta(d.nodeName)))):(e=S(d),"none"===c&&e||L.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=xa(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Fa(i,h)),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=Ba.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(n.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||n.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Fa(a.style,h)),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=xa(a,b,d)),"normal"===e&&b in Da&&(e=Da[b]),""===c||c?(f=parseFloat(e),c===!0||n.isNumeric(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?za.test(n.css(a,"display"))&&0===a.offsetWidth?n.swap(a,Ca,function(){return Ia(a,b,d)}):Ia(a,b,d):void 0},set:function(a,c,d){var e=d&&wa(a);return Ga(a,c,d?Ha(a,b,d,"border-box"===n.css(a,"boxSizing",!1,e),e):0)}}}),n.cssHooks.marginRight=ya(k.reliableMarginRight,function(a,b){return b?n.swap(a,{display:"inline-block"},xa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+R[d]+b]=f[d]||f[d-2]||f[0];return e}},ua.test(a)||(n.cssHooks[a+b].set=Ga)}),n.fn.extend({css:function(a,b){return J(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=wa(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Ja(this,!0)},hide:function(){return Ja(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){S(this)?n(this).show():n(this).hide()})}});function Ka(a,b,c,d,e){return new Ka.prototype.init(a,b,c,d,e)}n.Tween=Ka,Ka.prototype={constructor:Ka,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ka.propHooks[this.prop];return a&&a.get?a.get(this):Ka.propHooks._default.get(this)},run:function(a){var b,c=Ka.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ka.propHooks._default.set(this),this}},Ka.prototype.init.prototype=Ka.prototype,Ka.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[n.cssProps[a.prop]]||n.cssHooks[a.prop])?n.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Ka.propHooks.scrollTop=Ka.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},n.fx=Ka.prototype.init,n.fx.step={};var La,Ma,Na=/^(?:toggle|show|hide)$/,Oa=new RegExp("^(?:([+-])=|)("+Q+")([a-z%]*)$","i"),Pa=/queueHooks$/,Qa=[Va],Ra={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=Oa.exec(b),f=e&&e[3]||(n.cssNumber[a]?"":"px"),g=(n.cssNumber[a]||"px"!==f&&+d)&&Oa.exec(n.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,n.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function Sa(){return setTimeout(function(){La=void 0}),La=n.now()}function Ta(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=R[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ua(a,b,c){for(var d,e=(Ra[b]||[]).concat(Ra["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Va(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&S(a),q=L.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?L.get(a,"olddisplay")||ta(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Na.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?ta(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=L.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;L.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ua(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function Wa(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function Xa(a,b,c){var d,e,f=0,g=Qa.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=La||Sa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:La||Sa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(Wa(k,j.opts.specialEasing);g>f;f++)if(d=Qa[f].call(j,a,k,j.opts))return d;return n.map(k,Ua,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(Xa,{tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],Ra[c]=Ra[c]||[],Ra[c].unshift(b)},prefilter:function(a,b){b?Qa.unshift(a):Qa.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(S).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=Xa(this,n.extend({},a),f);(e||L.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=L.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Pa.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=L.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Ta(b,!0),a,d,e)}}),n.each({slideDown:Ta("show"),slideUp:Ta("hide"),slideToggle:Ta("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(La=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),La=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ma||(Ma=setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){clearInterval(Ma),Ma=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(a,b){return a=n.fx?n.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a=l.createElement("input"),b=l.createElement("select"),c=b.appendChild(l.createElement("option"));a.type="checkbox",k.checkOn=""!==a.value,k.optSelected=c.selected,b.disabled=!0,k.optDisabled=!c.disabled,a=l.createElement("input"),a.value="t",a.type="radio",k.radioValue="t"===a.value}();var Ya,Za,$a=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return J(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===U?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),d=n.attrHooks[b]||(n.expr.match.bool.test(b)?Za:Ya)),
void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=n.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void n.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),Za={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=$a[b]||n.find.attr;$a[b]=function(a,b,d){var e,f;return d||(f=$a[b],$a[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,$a[b]=f),e}});var _a=/^(?:input|select|textarea|button)$/i;n.fn.extend({prop:function(a,b){return J(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!n.isXMLDoc(a),f&&(b=n.propFix[b]||b,e=n.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){return a.hasAttribute("tabindex")||_a.test(a.nodeName)||a.href?a.tabIndex:-1}}}}),k.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var ab=/[\t\r\n\f]/g;n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h="string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ab," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=n.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0===arguments.length||"string"==typeof a&&a,i=0,j=this.length;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,this.className))});if(h)for(b=(a||"").match(E)||[];j>i;i++)if(c=this[i],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(ab," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?n.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(n.isFunction(a)?function(c){n(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=n(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===U||"boolean"===c)&&(this.className&&L.set(this,"__className__",this.className),this.className=this.className||a===!1?"":L.get(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ab," ").indexOf(b)>=0)return!0;return!1}});var bb=/\r/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(bb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(d.value,f)>=0)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>=0:void 0}},k.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var cb=n.now(),db=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(a){var b,c;if(!a||"string"!=typeof a)return null;try{c=new DOMParser,b=c.parseFromString(a,"text/xml")}catch(d){b=void 0}return(!b||b.getElementsByTagName("parsererror").length)&&n.error("Invalid XML: "+a),b};var eb=/#.*$/,fb=/([?&])_=[^&]*/,gb=/^(.*?):[ \t]*([^\r\n]*)$/gm,hb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,ib=/^(?:GET|HEAD)$/,jb=/^\/\//,kb=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,lb={},mb={},nb="*/".concat("*"),ob=a.location.href,pb=kb.exec(ob.toLowerCase())||[];function qb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function rb(a,b,c,d){var e={},f=a===mb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function sb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function tb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function ub(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:ob,type:"GET",isLocal:hb.test(pb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":nb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?sb(sb(a,n.ajaxSettings),b):sb(n.ajaxSettings,a)},ajaxPrefilter:qb(lb),ajaxTransport:qb(mb),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=n.ajaxSetup({},b),l=k.context||k,m=k.context&&(l.nodeType||l.jquery)?n(l):n.event,o=n.Deferred(),p=n.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!f){f={};while(b=gb.exec(e))f[b[1].toLowerCase()]=b[2]}b=f[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?e:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return c&&c.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||ob)+"").replace(eb,"").replace(jb,pb[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=n.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(h=kb.exec(k.url.toLowerCase()),k.crossDomain=!(!h||h[1]===pb[1]&&h[2]===pb[2]&&(h[3]||("http:"===h[1]?"80":"443"))===(pb[3]||("http:"===pb[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=n.param(k.data,k.traditional)),rb(lb,k,b,v),2===t)return v;i=n.event&&k.global,i&&0===n.active++&&n.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!ib.test(k.type),d=k.url,k.hasContent||(k.data&&(d=k.url+=(db.test(d)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=fb.test(d)?d.replace(fb,"$1_="+cb++):d+(db.test(d)?"&":"?")+"_="+cb++)),k.ifModified&&(n.lastModified[d]&&v.setRequestHeader("If-Modified-Since",n.lastModified[d]),n.etag[d]&&v.setRequestHeader("If-None-Match",n.etag[d])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+nb+"; q=0.01":""):k.accepts["*"]);for(j in k.headers)v.setRequestHeader(j,k.headers[j]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(j in{success:1,error:1,complete:1})v[j](k[j]);if(c=rb(mb,k,b,v)){v.readyState=1,i&&m.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,c.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,f,h){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),c=void 0,e=h||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,f&&(u=tb(k,v,f)),u=ub(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(n.lastModified[d]=w),w=v.getResponseHeader("etag"),w&&(n.etag[d]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,i&&m.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),i&&(m.trigger("ajaxComplete",[v,k]),--n.active||n.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return this.each(n.isFunction(a)?function(b){n(this).wrapInner(a.call(this,b))}:function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0},n.expr.filters.visible=function(a){return!n.expr.filters.hidden(a)};var vb=/%20/g,wb=/\[\]$/,xb=/\r?\n/g,yb=/^(?:submit|button|image|reset|file)$/i,zb=/^(?:input|select|textarea|keygen)/i;function Ab(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||wb.test(a)?d(a,e):Ab(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Ab(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Ab(c,a[c],b,e);return d.join("&").replace(vb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&zb.test(this.nodeName)&&!yb.test(a)&&(this.checked||!T.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(xb,"\r\n")}}):{name:b.name,value:c.replace(xb,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new XMLHttpRequest}catch(a){}};var Bb=0,Cb={},Db={0:200,1223:204},Eb=n.ajaxSettings.xhr();a.attachEvent&&a.attachEvent("onunload",function(){for(var a in Cb)Cb[a]()}),k.cors=!!Eb&&"withCredentials"in Eb,k.ajax=Eb=!!Eb,n.ajaxTransport(function(a){var b;return k.cors||Eb&&!a.crossDomain?{send:function(c,d){var e,f=a.xhr(),g=++Bb;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)f.setRequestHeader(e,c[e]);b=function(a){return function(){b&&(delete Cb[g],b=f.onload=f.onerror=null,"abort"===a?f.abort():"error"===a?d(f.status,f.statusText):d(Db[f.status]||f.status,f.statusText,"string"==typeof f.responseText?{text:f.responseText}:void 0,f.getAllResponseHeaders()))}},f.onload=b(),f.onerror=b("error"),b=Cb[g]=b("abort");try{f.send(a.hasContent&&a.data||null)}catch(h){if(b)throw h}},abort:function(){b&&b()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(d,e){b=n("<script>").prop({async:!0,charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&e("error"===a.type?404:200,a.type)}),l.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Fb=[],Gb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Fb.pop()||n.expando+"_"+cb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Gb.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Gb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Gb,"$1"+e):b.jsonp!==!1&&(b.url+=(db.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Fb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||l;var d=v.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=n.buildFragment([a],b,e),e&&e.length&&n(e).remove(),n.merge([],d.childNodes))};var Hb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Hb)return Hb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e,dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,f||[a.responseText,b,a])}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};var Ib=a.document.documentElement;function Jb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(typeof d.getBoundingClientRect!==U&&(e=d.getBoundingClientRect()),c=Jb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||Ib;while(a&&!n.nodeName(a,"html")&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ib})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(b,c){var d="pageYOffset"===c;n.fn[b]=function(e){return J(this,function(b,e,f){var g=Jb(b);return void 0===f?g?g[c]:b[e]:void(g?g.scrollTo(d?a.pageXOffset:f,d?f:a.pageYOffset):b[e]=f)},b,e,arguments.length,null)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=ya(k.pixelPosition,function(a,c){return c?(c=xa(a,b),va.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return J(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.size=function(){return this.length},n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Kb=a.jQuery,Lb=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Lb),b&&a.jQuery===n&&(a.jQuery=Kb),n},typeof b===U&&(a.jQuery=a.$=n),n});
//# sourceMappingURL=jquery.min.map
;
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return Hc.apply(null,arguments)}function b(a){Hc=a}function c(a){return"[object Array]"===Object.prototype.toString.call(a)}function d(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function e(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function f(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function g(a,b){for(var c in b)f(b,c)&&(a[c]=b[c]);return f(b,"toString")&&(a.toString=b.toString),f(b,"valueOf")&&(a.valueOf=b.valueOf),a}function h(a,b,c,d){return Ca(a,b,c,d,!0).utc()}function i(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function j(a){return null==a._pf&&(a._pf=i()),a._pf}function k(a){if(null==a._isValid){var b=j(a);a._isValid=!(isNaN(a._d.getTime())||!(b.overflow<0)||b.empty||b.invalidMonth||b.invalidWeekday||b.nullInput||b.invalidFormat||b.userInvalidated),a._strict&&(a._isValid=a._isValid&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour)}return a._isValid}function l(a){var b=h(NaN);return null!=a?g(j(b),a):j(b).userInvalidated=!0,b}function m(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=j(b)),"undefined"!=typeof b._locale&&(a._locale=b._locale),Jc.length>0)for(c in Jc)d=Jc[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function n(b){m(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),Kc===!1&&(Kc=!0,a.updateOffset(this),Kc=!1)}function o(a){return a instanceof n||null!=a&&null!=a._isAMomentObject}function p(a){return 0>a?Math.ceil(a):Math.floor(a)}function q(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=p(b)),c}function r(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&q(a[d])!==q(b[d]))&&g++;return g+f}function s(){}function t(a){return a?a.toLowerCase().replace("_","-"):a}function u(a){for(var b,c,d,e,f=0;f<a.length;){for(e=t(a[f]).split("-"),b=e.length,c=t(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=v(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&r(e,c,!0)>=b-1)break;b--}f++}return null}function v(a){var b=null;if(!Lc[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=Ic._abbr,require("./locale/"+a),w(b)}catch(c){}return Lc[a]}function w(a,b){var c;return a&&(c="undefined"==typeof b?y(a):x(a,b),c&&(Ic=c)),Ic._abbr}function x(a,b){return null!==b?(b.abbr=a,Lc[a]=Lc[a]||new s,Lc[a].set(b),w(a),Lc[a]):(delete Lc[a],null)}function y(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return Ic;if(!c(a)){if(b=v(a))return b;a=[a]}return u(a)}function z(a,b){var c=a.toLowerCase();Mc[c]=Mc[c+"s"]=Mc[b]=a}function A(a){return"string"==typeof a?Mc[a]||Mc[a.toLowerCase()]:void 0}function B(a){var b,c,d={};for(c in a)f(a,c)&&(b=A(c),b&&(d[b]=a[c]));return d}function C(b,c){return function(d){return null!=d?(E(this,b,d),a.updateOffset(this,c),this):D(this,b)}}function D(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function E(a,b,c){return a._d["set"+(a._isUTC?"UTC":"")+b](c)}function F(a,b){var c;if("object"==typeof a)for(c in a)this.set(c,a[c]);else if(a=A(a),"function"==typeof this[a])return this[a](b);return this}function G(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}function H(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Qc[a]=e),b&&(Qc[b[0]]=function(){return G(e.apply(this,arguments),b[1],b[2])}),c&&(Qc[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function I(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function J(a){var b,c,d=a.match(Nc);for(b=0,c=d.length;c>b;b++)Qc[d[b]]?d[b]=Qc[d[b]]:d[b]=I(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function K(a,b){return a.isValid()?(b=L(b,a.localeData()),Pc[b]=Pc[b]||J(b),Pc[b](a)):a.localeData().invalidDate()}function L(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Oc.lastIndex=0;d>=0&&Oc.test(a);)a=a.replace(Oc,c),Oc.lastIndex=0,d-=1;return a}function M(a){return"function"==typeof a&&"[object Function]"===Object.prototype.toString.call(a)}function N(a,b,c){dd[a]=M(b)?b:function(a){return a&&c?c:b}}function O(a,b){return f(dd,a)?dd[a](b._strict,b._locale):new RegExp(P(a))}function P(a){return a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Q(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),"number"==typeof b&&(d=function(a,c){c[b]=q(a)}),c=0;c<a.length;c++)ed[a[c]]=d}function R(a,b){Q(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function S(a,b,c){null!=b&&f(ed,a)&&ed[a](b,c._a,c,a)}function T(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function U(a){return this._months[a.month()]}function V(a){return this._monthsShort[a.month()]}function W(a,b,c){var d,e,f;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){if(e=h([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}function X(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),T(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function Y(b){return null!=b?(X(this,b),a.updateOffset(this,!0),this):D(this,"Month")}function Z(){return T(this.year(),this.month())}function $(a){var b,c=a._a;return c&&-2===j(a).overflow&&(b=c[gd]<0||c[gd]>11?gd:c[hd]<1||c[hd]>T(c[fd],c[gd])?hd:c[id]<0||c[id]>24||24===c[id]&&(0!==c[jd]||0!==c[kd]||0!==c[ld])?id:c[jd]<0||c[jd]>59?jd:c[kd]<0||c[kd]>59?kd:c[ld]<0||c[ld]>999?ld:-1,j(a)._overflowDayOfYear&&(fd>b||b>hd)&&(b=hd),j(a).overflow=b),a}function _(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function aa(a,b){var c=!0;return g(function(){return c&&(_(a+"\n"+(new Error).stack),c=!1),b.apply(this,arguments)},b)}function ba(a,b){od[a]||(_(b),od[a]=!0)}function ca(a){var b,c,d=a._i,e=pd.exec(d);if(e){for(j(a).iso=!0,b=0,c=qd.length;c>b;b++)if(qd[b][1].exec(d)){a._f=qd[b][0];break}for(b=0,c=rd.length;c>b;b++)if(rd[b][1].exec(d)){a._f+=(e[6]||" ")+rd[b][0];break}d.match(ad)&&(a._f+="Z"),va(a)}else a._isValid=!1}function da(b){var c=sd.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(ca(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}function ea(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function fa(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function ga(a){return ha(a)?366:365}function ha(a){return a%4===0&&a%100!==0||a%400===0}function ia(){return ha(this.year())}function ja(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=Da(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function ka(a){return ja(a,this._week.dow,this._week.doy).week}function la(){return this._week.dow}function ma(){return this._week.doy}function na(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function oa(a){var b=ja(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}function pa(a,b,c,d,e){var f,g=6+e-d,h=fa(a,0,1+g),i=h.getUTCDay();return e>i&&(i+=7),c=null!=c?1*c:e,f=1+g+7*(b-1)-i+c,{year:f>0?a:a-1,dayOfYear:f>0?f:ga(a-1)+f}}function qa(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function ra(a,b,c){return null!=a?a:null!=b?b:c}function sa(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function ta(a){var b,c,d,e,f=[];if(!a._d){for(d=sa(a),a._w&&null==a._a[hd]&&null==a._a[gd]&&ua(a),a._dayOfYear&&(e=ra(a._a[fd],d[fd]),a._dayOfYear>ga(e)&&(j(a)._overflowDayOfYear=!0),c=fa(e,0,a._dayOfYear),a._a[gd]=c.getUTCMonth(),a._a[hd]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=f[b]=d[b];for(;7>b;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];24===a._a[id]&&0===a._a[jd]&&0===a._a[kd]&&0===a._a[ld]&&(a._nextDay=!0,a._a[id]=0),a._d=(a._useUTC?fa:ea).apply(null,f),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[id]=24)}}function ua(a){var b,c,d,e,f,g,h;b=a._w,null!=b.GG||null!=b.W||null!=b.E?(f=1,g=4,c=ra(b.GG,a._a[fd],ja(Da(),1,4).year),d=ra(b.W,1),e=ra(b.E,1)):(f=a._locale._week.dow,g=a._locale._week.doy,c=ra(b.gg,a._a[fd],ja(Da(),f,g).year),d=ra(b.w,1),null!=b.d?(e=b.d,f>e&&++d):e=null!=b.e?b.e+f:f),h=pa(c,d,e,g,f),a._a[fd]=h.year,a._dayOfYear=h.dayOfYear}function va(b){if(b._f===a.ISO_8601)return void ca(b);b._a=[],j(b).empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,k=0;for(e=L(b._f,b._locale).match(Nc)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(O(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&j(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),k+=d.length),Qc[f]?(d?j(b).empty=!1:j(b).unusedTokens.push(f),S(f,d,b)):b._strict&&!d&&j(b).unusedTokens.push(f);j(b).charsLeftOver=i-k,h.length>0&&j(b).unusedInput.push(h),j(b).bigHour===!0&&b._a[id]<=12&&b._a[id]>0&&(j(b).bigHour=void 0),b._a[id]=wa(b._locale,b._a[id],b._meridiem),ta(b),$(b)}function wa(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}function xa(a){var b,c,d,e,f;if(0===a._f.length)return j(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=m({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],va(b),k(b)&&(f+=j(b).charsLeftOver,f+=10*j(b).unusedTokens.length,j(b).score=f,(null==d||d>f)&&(d=f,c=b));g(a,c||b)}function ya(a){if(!a._d){var b=B(a._i);a._a=[b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],ta(a)}}function za(a){var b=new n($(Aa(a)));return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function Aa(a){var b=a._i,e=a._f;return a._locale=a._locale||y(a._l),null===b||void 0===e&&""===b?l({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),o(b)?new n($(b)):(c(e)?xa(a):e?va(a):d(b)?a._d=b:Ba(a),a))}function Ba(b){var f=b._i;void 0===f?b._d=new Date:d(f)?b._d=new Date(+f):"string"==typeof f?da(b):c(f)?(b._a=e(f.slice(0),function(a){return parseInt(a,10)}),ta(b)):"object"==typeof f?ya(b):"number"==typeof f?b._d=new Date(f):a.createFromInputFallback(b)}function Ca(a,b,c,d,e){var f={};return"boolean"==typeof c&&(d=c,c=void 0),f._isAMomentObject=!0,f._useUTC=f._isUTC=e,f._l=c,f._i=a,f._f=b,f._strict=d,za(f)}function Da(a,b,c,d){return Ca(a,b,c,d,!1)}function Ea(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return Da();for(d=b[0],e=1;e<b.length;++e)(!b[e].isValid()||b[e][a](d))&&(d=b[e]);return d}function Fa(){var a=[].slice.call(arguments,0);return Ea("isBefore",a)}function Ga(){var a=[].slice.call(arguments,0);return Ea("isAfter",a)}function Ha(a){var b=B(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=y(),this._bubble()}function Ia(a){return a instanceof Ha}function Ja(a,b){H(a,0,0,function(){var a=this.utcOffset(),c="+";return 0>a&&(a=-a,c="-"),c+G(~~(a/60),2)+b+G(~~a%60,2)})}function Ka(a){var b=(a||"").match(ad)||[],c=b[b.length-1]||[],d=(c+"").match(xd)||["-",0,0],e=+(60*d[1])+q(d[2]);return"+"===d[0]?e:-e}function La(b,c){var e,f;return c._isUTC?(e=c.clone(),f=(o(b)||d(b)?+b:+Da(b))-+e,e._d.setTime(+e._d+f),a.updateOffset(e,!1),e):Da(b).local()}function Ma(a){return 15*-Math.round(a._d.getTimezoneOffset()/15)}function Na(b,c){var d,e=this._offset||0;return null!=b?("string"==typeof b&&(b=Ka(b)),Math.abs(b)<16&&(b=60*b),!this._isUTC&&c&&(d=Ma(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?bb(this,Ya(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?e:Ma(this)}function Oa(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Pa(a){return this.utcOffset(0,a)}function Qa(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Ma(this),"m")),this}function Ra(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(Ka(this._i)),this}function Sa(a){return a=a?Da(a).utcOffset():0,(this.utcOffset()-a)%60===0}function Ta(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Ua(){if("undefined"!=typeof this._isDSTShifted)return this._isDSTShifted;var a={};if(m(a,this),a=Aa(a),a._a){var b=a._isUTC?h(a._a):Da(a._a);this._isDSTShifted=this.isValid()&&r(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Va(){return!this._isUTC}function Wa(){return this._isUTC}function Xa(){return this._isUTC&&0===this._offset}function Ya(a,b){var c,d,e,g=a,h=null;return Ia(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(g={},b?g[b]=a:g.milliseconds=a):(h=yd.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:q(h[hd])*c,h:q(h[id])*c,m:q(h[jd])*c,s:q(h[kd])*c,ms:q(h[ld])*c}):(h=zd.exec(a))?(c="-"===h[1]?-1:1,g={y:Za(h[2],c),M:Za(h[3],c),d:Za(h[4],c),h:Za(h[5],c),m:Za(h[6],c),s:Za(h[7],c),w:Za(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=_a(Da(g.from),Da(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new Ha(g),Ia(a)&&f(a,"_locale")&&(d._locale=a._locale),d}function Za(a,b){var c=a&&parseFloat(a.replace(",","."));return(isNaN(c)?0:c)*b}function $a(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function _a(a,b){var c;return b=La(b,a),a.isBefore(b)?c=$a(a,b):(c=$a(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function ab(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(ba(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Ya(c,d),bb(this,e,a),this}}function bb(b,c,d,e){var f=c._milliseconds,g=c._days,h=c._months;e=null==e?!0:e,f&&b._d.setTime(+b._d+f*d),g&&E(b,"Date",D(b,"Date")+g*d),h&&X(b,D(b,"Month")+h*d),e&&a.updateOffset(b,g||h)}function cb(a,b){var c=a||Da(),d=La(c,this).startOf("day"),e=this.diff(d,"days",!0),f=-6>e?"sameElse":-1>e?"lastWeek":0>e?"lastDay":1>e?"sameDay":2>e?"nextDay":7>e?"nextWeek":"sameElse";return this.format(b&&b[f]||this.localeData().calendar(f,this,Da(c)))}function db(){return new n(this)}function eb(a,b){var c;return b=A("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+this>+a):(c=o(a)?+a:+Da(a),c<+this.clone().startOf(b))}function fb(a,b){var c;return b=A("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+a>+this):(c=o(a)?+a:+Da(a),+this.clone().endOf(b)<c)}function gb(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)}function hb(a,b){var c;return b=A(b||"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+this===+a):(c=+Da(a),+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b))}function ib(a,b,c){var d,e,f=La(a,this),g=6e4*(f.utcOffset()-this.utcOffset());return b=A(b),"year"===b||"month"===b||"quarter"===b?(e=jb(this,f),"quarter"===b?e/=3:"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:p(e)}function jb(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)}function kb(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function lb(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?"function"==typeof Date.prototype.toISOString?this.toDate().toISOString():K(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):K(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function mb(b){var c=K(this,b||a.defaultFormat);return this.localeData().postformat(c)}function nb(a,b){return this.isValid()?Ya({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ob(a){return this.from(Da(),a)}function pb(a,b){return this.isValid()?Ya({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function qb(a){return this.to(Da(),a)}function rb(a){var b;return void 0===a?this._locale._abbr:(b=y(a),null!=b&&(this._locale=b),this)}function sb(){return this._locale}function tb(a){switch(a=A(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function ub(a){return a=A(a),void 0===a||"millisecond"===a?this:this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")}function vb(){return+this._d-6e4*(this._offset||0)}function wb(){return Math.floor(+this/1e3)}function xb(){return this._offset?new Date(+this):this._d}function yb(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function zb(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function Ab(){return k(this)}function Bb(){return g({},j(this))}function Cb(){return j(this).overflow}function Db(a,b){H(0,[a,a.length],0,b)}function Eb(a,b,c){return ja(Da([a,11,31+b-c]),b,c).week}function Fb(a){var b=ja(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")}function Gb(a){var b=ja(this,1,4).year;return null==a?b:this.add(a-b,"y")}function Hb(){return Eb(this.year(),1,4)}function Ib(){var a=this.localeData()._week;return Eb(this.year(),a.dow,a.doy)}function Jb(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}function Kb(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Lb(a){return this._weekdays[a.day()]}function Mb(a){return this._weekdaysShort[a.day()]}function Nb(a){return this._weekdaysMin[a.day()]}function Ob(a){var b,c,d;for(this._weekdaysParse=this._weekdaysParse||[],b=0;7>b;b++)if(this._weekdaysParse[b]||(c=Da([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b}function Pb(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Kb(a,this.localeData()),this.add(a-b,"d")):b}function Qb(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Rb(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)}function Sb(a,b){H(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}function Tb(a,b){return b._meridiemParse}function Ub(a){return"p"===(a+"").toLowerCase().charAt(0)}function Vb(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Wb(a,b){b[ld]=q(1e3*("0."+a))}function Xb(){return this._isUTC?"UTC":""}function Yb(){return this._isUTC?"Coordinated Universal Time":""}function Zb(a){return Da(1e3*a)}function $b(){return Da.apply(null,arguments).parseZone()}function _b(a,b,c){var d=this._calendar[a];return"function"==typeof d?d.call(b,c):d}function ac(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function bc(){return this._invalidDate}function cc(a){return this._ordinal.replace("%d",a)}function dc(a){return a}function ec(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)}function fc(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)}function gc(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function hc(a,b,c,d){var e=y(),f=h().set(d,b);return e[c](f,a)}function ic(a,b,c,d,e){if("number"==typeof a&&(b=a,a=void 0),a=a||"",null!=b)return hc(a,b,c,e);var f,g=[];for(f=0;d>f;f++)g[f]=hc(a,f,c,e);return g}function jc(a,b){return ic(a,b,"months",12,"month")}function kc(a,b){return ic(a,b,"monthsShort",12,"month")}function lc(a,b){return ic(a,b,"weekdays",7,"day")}function mc(a,b){return ic(a,b,"weekdaysShort",7,"day")}function nc(a,b){return ic(a,b,"weekdaysMin",7,"day")}function oc(){var a=this._data;return this._milliseconds=Wd(this._milliseconds),this._days=Wd(this._days),this._months=Wd(this._months),a.milliseconds=Wd(a.milliseconds),a.seconds=Wd(a.seconds),a.minutes=Wd(a.minutes),a.hours=Wd(a.hours),a.months=Wd(a.months),a.years=Wd(a.years),this}function pc(a,b,c,d){var e=Ya(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}function qc(a,b){return pc(this,a,b,1)}function rc(a,b){return pc(this,a,b,-1)}function sc(a){return 0>a?Math.floor(a):Math.ceil(a)}function tc(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;return f>=0&&g>=0&&h>=0||0>=f&&0>=g&&0>=h||(f+=864e5*sc(vc(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=p(f/1e3),i.seconds=a%60,b=p(a/60),i.minutes=b%60,c=p(b/60),i.hours=c%24,g+=p(c/24),e=p(uc(g)),h+=e,g-=sc(vc(e)),d=p(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function uc(a){return 4800*a/146097}function vc(a){return 146097*a/4800}function wc(a){var b,c,d=this._milliseconds;if(a=A(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+uc(b),"month"===a?c:c/12;switch(b=this._days+Math.round(vc(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}function xc(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*q(this._months/12)}function yc(a){return function(){return this.as(a)}}function zc(a){return a=A(a),this[a+"s"]()}function Ac(a){return function(){return this._data[a]}}function Bc(){return p(this.days()/7)}function Cc(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function Dc(a,b,c){var d=Ya(a).abs(),e=ke(d.as("s")),f=ke(d.as("m")),g=ke(d.as("h")),h=ke(d.as("d")),i=ke(d.as("M")),j=ke(d.as("y")),k=e<le.s&&["s",e]||1===f&&["m"]||f<le.m&&["mm",f]||1===g&&["h"]||g<le.h&&["hh",g]||1===h&&["d"]||h<le.d&&["dd",h]||1===i&&["M"]||i<le.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,Cc.apply(null,k)}function Ec(a,b){return void 0===le[a]?!1:void 0===b?le[a]:(le[a]=b,!0)}function Fc(a){var b=this.localeData(),c=Dc(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function Gc(){var a,b,c,d=me(this._milliseconds)/1e3,e=me(this._days),f=me(this._months);a=p(d/60),b=p(a/60),d%=60,a%=60,c=p(f/12),f%=12;var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(0>m?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var Hc,Ic,Jc=a.momentProperties=[],Kc=!1,Lc={},Mc={},Nc=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Oc=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Pc={},Qc={},Rc=/\d/,Sc=/\d\d/,Tc=/\d{3}/,Uc=/\d{4}/,Vc=/[+-]?\d{6}/,Wc=/\d\d?/,Xc=/\d{1,3}/,Yc=/\d{1,4}/,Zc=/[+-]?\d{1,6}/,$c=/\d+/,_c=/[+-]?\d+/,ad=/Z|[+-]\d\d:?\d\d/gi,bd=/[+-]?\d+(\.\d{1,3})?/,cd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,dd={},ed={},fd=0,gd=1,hd=2,id=3,jd=4,kd=5,ld=6;H("M",["MM",2],"Mo",function(){return this.month()+1}),H("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),H("MMMM",0,0,function(a){return this.localeData().months(this,a)}),z("month","M"),N("M",Wc),N("MM",Wc,Sc),N("MMM",cd),N("MMMM",cd),Q(["M","MM"],function(a,b){b[gd]=q(a)-1}),Q(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);null!=e?b[gd]=e:j(c).invalidMonth=a});var md="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),nd="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),od={};a.suppressDeprecationWarnings=!1;var pd=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,qd=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],rd=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],sd=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=aa("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),H(0,["YY",2],0,function(){return this.year()%100}),H(0,["YYYY",4],0,"year"),H(0,["YYYYY",5],0,"year"),H(0,["YYYYYY",6,!0],0,"year"),z("year","y"),N("Y",_c),N("YY",Wc,Sc),N("YYYY",Yc,Uc),N("YYYYY",Zc,Vc),N("YYYYYY",Zc,Vc),Q(["YYYYY","YYYYYY"],fd),Q("YYYY",function(b,c){c[fd]=2===b.length?a.parseTwoDigitYear(b):q(b)}),Q("YY",function(b,c){c[fd]=a.parseTwoDigitYear(b)}),a.parseTwoDigitYear=function(a){return q(a)+(q(a)>68?1900:2e3)};var td=C("FullYear",!1);H("w",["ww",2],"wo","week"),H("W",["WW",2],"Wo","isoWeek"),z("week","w"),z("isoWeek","W"),N("w",Wc),N("ww",Wc,Sc),N("W",Wc),N("WW",Wc,Sc),R(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=q(a)});var ud={dow:0,doy:6};H("DDD",["DDDD",3],"DDDo","dayOfYear"),z("dayOfYear","DDD"),N("DDD",Xc),N("DDDD",Tc),Q(["DDD","DDDD"],function(a,b,c){c._dayOfYear=q(a)}),a.ISO_8601=function(){};var vd=aa("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(){var a=Da.apply(null,arguments);return this>a?this:a}),wd=aa("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(){var a=Da.apply(null,arguments);return a>this?this:a});Ja("Z",":"),Ja("ZZ",""),N("Z",ad),N("ZZ",ad),Q(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Ka(a)});var xd=/([\+\-]|\d\d)/gi;a.updateOffset=function(){};var yd=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,zd=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;Ya.fn=Ha.prototype;var Ad=ab(1,"add"),Bd=ab(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ";var Cd=aa("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});H(0,["gg",2],0,function(){return this.weekYear()%100}),H(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Db("gggg","weekYear"),Db("ggggg","weekYear"),Db("GGGG","isoWeekYear"),Db("GGGGG","isoWeekYear"),z("weekYear","gg"),z("isoWeekYear","GG"),N("G",_c),N("g",_c),N("GG",Wc,Sc),N("gg",Wc,Sc),N("GGGG",Yc,Uc),N("gggg",Yc,Uc),N("GGGGG",Zc,Vc),N("ggggg",Zc,Vc),R(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=q(a)}),R(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),H("Q",0,0,"quarter"),z("quarter","Q"),N("Q",Rc),Q("Q",function(a,b){b[gd]=3*(q(a)-1)}),H("D",["DD",2],"Do","date"),z("date","D"),N("D",Wc),N("DD",Wc,Sc),N("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),Q(["D","DD"],hd),Q("Do",function(a,b){b[hd]=q(a.match(Wc)[0],10)});var Dd=C("Date",!0);H("d",0,"do","day"),H("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),H("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),H("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),H("e",0,0,"weekday"),H("E",0,0,"isoWeekday"),z("day","d"),z("weekday","e"),z("isoWeekday","E"),N("d",Wc),N("e",Wc),N("E",Wc),N("dd",cd),N("ddd",cd),N("dddd",cd),R(["dd","ddd","dddd"],function(a,b,c){var d=c._locale.weekdaysParse(a);null!=d?b.d=d:j(c).invalidWeekday=a}),R(["d","e","E"],function(a,b,c,d){b[d]=q(a)});var Ed="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Fd="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Gd="Su_Mo_Tu_We_Th_Fr_Sa".split("_");H("H",["HH",2],0,"hour"),H("h",["hh",2],0,function(){return this.hours()%12||12}),Sb("a",!0),Sb("A",!1),z("hour","h"),N("a",Tb),N("A",Tb),N("H",Wc),N("h",Wc),N("HH",Wc,Sc),N("hh",Wc,Sc),Q(["H","HH"],id),Q(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),Q(["h","hh"],function(a,b,c){b[id]=q(a),j(c).bigHour=!0});var Hd=/[ap]\.?m?\.?/i,Id=C("Hours",!0);H("m",["mm",2],0,"minute"),z("minute","m"),N("m",Wc),N("mm",Wc,Sc),Q(["m","mm"],jd);var Jd=C("Minutes",!1);H("s",["ss",2],0,"second"),z("second","s"),N("s",Wc),N("ss",Wc,Sc),Q(["s","ss"],kd);var Kd=C("Seconds",!1);H("S",0,0,function(){return~~(this.millisecond()/100)}),H(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),H(0,["SSS",3],0,"millisecond"),H(0,["SSSS",4],0,function(){return 10*this.millisecond()}),H(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),H(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),H(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),H(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),H(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),z("millisecond","ms"),N("S",Xc,Rc),N("SS",Xc,Sc),N("SSS",Xc,Tc);var Ld;for(Ld="SSSS";Ld.length<=9;Ld+="S")N(Ld,$c);for(Ld="S";Ld.length<=9;Ld+="S")Q(Ld,Wb);var Md=C("Milliseconds",!1);H("z",0,0,"zoneAbbr"),H("zz",0,0,"zoneName");var Nd=n.prototype;Nd.add=Ad,Nd.calendar=cb,Nd.clone=db,Nd.diff=ib,Nd.endOf=ub,Nd.format=mb,Nd.from=nb,Nd.fromNow=ob,Nd.to=pb,Nd.toNow=qb,Nd.get=F,Nd.invalidAt=Cb,Nd.isAfter=eb,Nd.isBefore=fb,Nd.isBetween=gb,Nd.isSame=hb,Nd.isValid=Ab,Nd.lang=Cd,Nd.locale=rb,Nd.localeData=sb,Nd.max=wd,Nd.min=vd,Nd.parsingFlags=Bb,Nd.set=F,Nd.startOf=tb,Nd.subtract=Bd,Nd.toArray=yb,Nd.toObject=zb,Nd.toDate=xb,Nd.toISOString=lb,Nd.toJSON=lb,Nd.toString=kb,Nd.unix=wb,Nd.valueOf=vb,Nd.year=td,Nd.isLeapYear=ia,Nd.weekYear=Fb,Nd.isoWeekYear=Gb,Nd.quarter=Nd.quarters=Jb,Nd.month=Y,Nd.daysInMonth=Z,Nd.week=Nd.weeks=na,Nd.isoWeek=Nd.isoWeeks=oa,Nd.weeksInYear=Ib,Nd.isoWeeksInYear=Hb,Nd.date=Dd,Nd.day=Nd.days=Pb,Nd.weekday=Qb,Nd.isoWeekday=Rb,Nd.dayOfYear=qa,Nd.hour=Nd.hours=Id,Nd.minute=Nd.minutes=Jd,Nd.second=Nd.seconds=Kd,
Nd.millisecond=Nd.milliseconds=Md,Nd.utcOffset=Na,Nd.utc=Pa,Nd.local=Qa,Nd.parseZone=Ra,Nd.hasAlignedHourOffset=Sa,Nd.isDST=Ta,Nd.isDSTShifted=Ua,Nd.isLocal=Va,Nd.isUtcOffset=Wa,Nd.isUtc=Xa,Nd.isUTC=Xa,Nd.zoneAbbr=Xb,Nd.zoneName=Yb,Nd.dates=aa("dates accessor is deprecated. Use date instead.",Dd),Nd.months=aa("months accessor is deprecated. Use month instead",Y),Nd.years=aa("years accessor is deprecated. Use year instead",td),Nd.zone=aa("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",Oa);var Od=Nd,Pd={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Qd={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},Rd="Invalid date",Sd="%d",Td=/\d{1,2}/,Ud={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Vd=s.prototype;Vd._calendar=Pd,Vd.calendar=_b,Vd._longDateFormat=Qd,Vd.longDateFormat=ac,Vd._invalidDate=Rd,Vd.invalidDate=bc,Vd._ordinal=Sd,Vd.ordinal=cc,Vd._ordinalParse=Td,Vd.preparse=dc,Vd.postformat=dc,Vd._relativeTime=Ud,Vd.relativeTime=ec,Vd.pastFuture=fc,Vd.set=gc,Vd.months=U,Vd._months=md,Vd.monthsShort=V,Vd._monthsShort=nd,Vd.monthsParse=W,Vd.week=ka,Vd._week=ud,Vd.firstDayOfYear=ma,Vd.firstDayOfWeek=la,Vd.weekdays=Lb,Vd._weekdays=Ed,Vd.weekdaysMin=Nb,Vd._weekdaysMin=Gd,Vd.weekdaysShort=Mb,Vd._weekdaysShort=Fd,Vd.weekdaysParse=Ob,Vd.isPM=Ub,Vd._meridiemParse=Hd,Vd.meridiem=Vb,w("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===q(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),a.lang=aa("moment.lang is deprecated. Use moment.locale instead.",w),a.langData=aa("moment.langData is deprecated. Use moment.localeData instead.",y);var Wd=Math.abs,Xd=yc("ms"),Yd=yc("s"),Zd=yc("m"),$d=yc("h"),_d=yc("d"),ae=yc("w"),be=yc("M"),ce=yc("y"),de=Ac("milliseconds"),ee=Ac("seconds"),fe=Ac("minutes"),ge=Ac("hours"),he=Ac("days"),ie=Ac("months"),je=Ac("years"),ke=Math.round,le={s:45,m:45,h:22,d:26,M:11},me=Math.abs,ne=Ha.prototype;ne.abs=oc,ne.add=qc,ne.subtract=rc,ne.as=wc,ne.asMilliseconds=Xd,ne.asSeconds=Yd,ne.asMinutes=Zd,ne.asHours=$d,ne.asDays=_d,ne.asWeeks=ae,ne.asMonths=be,ne.asYears=ce,ne.valueOf=xc,ne._bubble=tc,ne.get=zc,ne.milliseconds=de,ne.seconds=ee,ne.minutes=fe,ne.hours=ge,ne.days=he,ne.weeks=Bc,ne.months=ie,ne.years=je,ne.humanize=Fc,ne.toISOString=Gc,ne.toString=Gc,ne.toJSON=Gc,ne.locale=rb,ne.localeData=sb,ne.toIsoString=aa("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Gc),ne.lang=Cd,H("X",0,0,"unix"),H("x",0,0,"valueOf"),N("x",_c),N("X",bd),Q("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),Q("x",function(a,b,c){c._d=new Date(q(a))}),a.version="2.10.6",b(Da),a.fn=Od,a.min=Fa,a.max=Ga,a.utc=h,a.unix=Zb,a.months=jc,a.isDate=d,a.locale=w,a.invalid=l,a.duration=Ya,a.isMoment=o,a.weekdays=lc,a.parseZone=$b,a.localeData=y,a.isDuration=Ia,a.monthsShort=kc,a.weekdaysMin=nc,a.defineLocale=x,a.weekdaysShort=mc,a.normalizeUnits=A,a.relativeTimeThreshold=Ec;var oe=a;return oe});
