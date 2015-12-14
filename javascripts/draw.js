

function drawDate(date, device){
    dsu.query(
        {
            date: date,
            device: device,
            success:
                function(data) {
                    showLocation(data);
                },
            error:
                function(){
                    var myNode = document.getElementById("google-locations");
                    if (myNode.firstChild) {
                        myNode.removeChild(myNode.firstChild);
                    }
                    $("#google-locations").html("No Data for mapping!");
                }
        }

    );
}

function showLocation(data) {
    var i = 0;
    data["episodes"].forEach(function (epi) {
        var state = epi["inferred-state"].toLocaleUpperCase();
        var start = new Date(epi["start"]);
        var end = new Date(epi["end"]);
        var cluster = epi["cluster"];
        if (state == "STILL" && cluster) {
            getLocationMap(cluster["latitude"], cluster["longitude"], start, end, i++);
        }
    });

}

function getLocationMap(averg_lac, averg_long, start_time, end_time, index) {
    var start_time = moment(start_time).format("hh:mm A");
    var end_time = moment(end_time).format("hh:mm A");

    $.ajax({
        type: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        data: {
            latlng: averg_lac + ',' + averg_long,
            result_type: "neighborhood",
            key: "AIzaSyC1GFrL26ugupKi80EQynafH6-uiLcgZDg"
        },
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
                img_div.src = "https://maps.googleapis.com/maps/api/staticmap?" +
                    "center="+ averg_lac + ',' + averg_long +
                    "&zoom=14&size=400x400"+
                    "&scale=2"+
                    "&markers=color:red%7Clabel:A%7C" + averg_lac + ',' + averg_long;
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
        error: function() {
           console.error("Can't find the neighborhood!");
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
    }
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

function showSummary(date, device) {
    var today = moment(date).format('YYYY-MM-DD');
    dsu.query(
        {
            date:today,
            device:device,
            success:
                function(data) {
                    var distance = (data["walking_distance_in_km"]*0.621371192).toFixed(1);
                    if (typeof distance != 'undefined') {
                        $walkingDistance.data('value', distance);
                        if (distance < 2) {
                            $walkingDistance.html(distance + 'mile');
                        }
                        else {
                            $walkingDistance.html(distance + 'miles');
                        }
                    } else {
                        $walkingDistance.data('value', 'No Data');
                        $walkingDistance.html('No Data');
                    }

                    var trek = (data["longest-trek-in-km"]*0.621371192).toFixed(1);
                    if (typeof trek != 'undefined') {
                        $trekMile.data('value', trek);
                        if (trek < 2) {
                            $trekMile.html(trek + 'mile');
                        }
                        else {
                            $trekMile.html(trek + 'miles');
                        }
                    } else {
                        $trekMile.data('value', 'No Data');
                        $trekMile.html('No Data');
                    }

                    var active = data["active_time_in_seconds"];
                    if (typeof active != 'undefined') {
                        var active_data = (active/60).toFixed(0);
                        $activeTime.data('value', active_data);
                        if (active_data < 60) {
                            $activeTime.html(active_data + 'min');
                        }
                        else {
                            var active_minute = active_data % 60;
                            var active_hour = Math.floor(active_data/60);
                            $activeTime.html(active_hour + 'hr' + active_minute + 'min');
                        }
                    } else {
                        $activeTime.data('value','No Data');
                        $activeTime.html('No Data');
                    }

                    var away = data["time_not_at_home_in_seconds"];
                    if (typeof away != 'undefined') {
                        var away_data = (away/60).toFixed(0);
                        $awayFromHome.data('value', away_data);
                        if (away_data < 60) {
                            $awayFromHome.html(away_data + 'min');
                        }
                        else {
                            var away_minute = away_data % 60;
                            var away_hour = Math.floor(away_data/60);
                            $awayFromHome.html(away_hour + 'hr' + away_minute + 'min');
                        }

                    } else {
                        $awayFromHome.data('value', 'No Data');
                        $awayFromHome.html('No Data');
                    }

                    pastSevenDaysSummary(today, device);

                },
            error:
                function(){
                    $walkingDistance.html('No Data');
                    $walkingDistance.data('value', 'No Data');
                    $trekMile.html('No Data');
                    $trekMile.data('value', 'No Data');
                    $awayFromHome.html('No Data');
                    $awayFromHome.data('value', 'No Data');
                    $activeTime.html('No Data');
                    $activeTime.data('value','No Data');

                    pastSevenDaysSummary(today, device);
            }


        }
    );

}

function pastSevenDaysSummary(date, device) {
    date = moment(date);
    var distance_array = []; var active_array = []; var away_array = []; var trek_array = [];
    $.when.apply(
        this,
        _.range(1, 8).map(function(days){
            return dsu.query({
                date: date.subtract(days, 'days').format('YYYY-MM-DD'),
                device: device,
                success: function(data) {
                    var one_day_distance = (data["walking_distance_in_km"]*0.621371192).toFixed(1);
                    if (typeof one_day_distance == 'undefined') {
                        one_day_distance = 0;
                    }

                    var one_day_trek = (data["longest-trek-in-km"]*0.621371192).toFixed(1);
                    if (typeof one_day_trek == 'undefined') {
                        one_day_trek = 0;
                    }

                    var one_day_active = data["active_time_in_seconds"];
                    if (typeof one_day_active == 'undefined') {
                        one_day_active = 0;
                    }

                    var one_day_away = data["time_not_at_home_in_seconds"];
                    if (typeof one_day_away == 'undefined') {
                        one_day_away = 0;
                    }
                    distance_array.push(parseFloat(one_day_distance));
                    away_array.push(parseFloat(one_day_away));
                    active_array.push(parseFloat(one_day_active));
                    trek_array.push(parseFloat(one_day_trek));
                },
                error: function(data) {
                }
            })
        })

    )
    .then(function() {
        var distance_max = Math.max.apply(Math, distance_array);
        var away_max = Math.max.apply(Math, away_array);
        var active_max = Math.max.apply(Math, active_array);
        var trek_max = Math.max.apply(Math, trek_array);
        showYesterdaySummary(trek_max, active_max, away_max, distance_max);
    })
}


function showYesterdaySummary(trek_max, active_max, away_max, distance_max) {
    var distance = $walkingDistance.data('value');
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


    var trek = $trekMile.data('value');
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

    var active = $activeTime.data('value');
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


    var away = $awayFromHome.data('value');
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


