// Get Location Data Function
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
// Pick out the time and the latitude and longtitude of those location data
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
// Draw the list of map for the locations
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
// Make sure that the list is ordered by the time
function sortMe() {
      var arr = $.makeArray($('#google-locations > div'));
      var len = arr.length;
      var parent = $('#google-locations');
      var i = 0;

      while( i < len ) {
          var num = arr[ i ].className;
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


// Delete all the maps when the date is changed or bars of variables
function deletePreviousDiv() {

    var bar_names = ["miles-difference", "trek-difference", "active-difference", "away-difference", "google-locations"]

    $.each(bar_names, function(index, value){
        var prevDiv = document.getElementById(value)
        while (prevDiv.firstChild) {
            prevDiv.removeChild(prevDiv.firstChild)
        }
    })
}
// Take out the data from curent date
function showSummary(date, device) {
    var today = moment(date).format('YYYY-MM-DD');
    dsu.query(
        {
            date:today,
            device:device,
            success:
                function(data) {
                    var distance = (data["walking_distance"].value*0.621371192).toFixed(1);
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

                    var trek = (data["longest_trek"].value*0.621371192).toFixed(1);
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

                    var active = data["active_time"].value;
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

                    var away = data["home"]["time_not_at_home"].value;
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
// Get the past seven days' max
function pastSevenDaysSummary(date, device) {
    date = moment(date);
    var distance_array = [0]; var active_array = [0]; var away_array = [0]; var trek_array = [0];

    // query the data for the past 7 days and push them to the above arrays,
    // and then compute the maximum value for each individual array
    $.when.apply(
        this,
        _.range(1, 8).map(function(days){
            return dsu.query({
                date: date.subtract(days, 'days').format('YYYY-MM-DD'),
                device: device,
                success: function(data) {
                    distance_array.push((data["walking_distance"].value | 0) *0.621371192);
                    trek_array.push((data["longest_trek"].value | 0) *0.621371192);
                    if (data["home"]) {
                        if (data["home"]["time_not_at_home"].value) {
                            away_array.push(data["home"]["time_not_at_home"].value);
                        }
                        else {
                            away_array.push(0);
                        }
                    }
                    else {
                        away_array.push(0);
                    }
                    active_array.push(data["active_time"].value | 0);
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

// Draw the bar of the variables
function showYesterdaySummary(trekMax, activeMax, awayMax, distanceMax) {
    var walkingDistance = {
      todayData: $walkingDistance.data('value'),
      maxData: distanceMax,
      barName: 'miles',
      color: 'miles-color',
      backgroundColor: 'miles-background-color',
      difference: 'miles-difference'
    }

    var longestTrek = {
      todayData: $trekMile.data('value'),
      maxData: trekMax,
      barName: 'trek',
      color: 'trek-color',
      backgroundColor: 'trek-background-color',
      difference: 'trek-difference'
    }

    var distanceTrekArray = [walkingDistance, longestTrek];

    $.each(distanceTrekArray, function(index, value){
        var today = value['todayData'];
        var div_3 = document.getElementById(value['barName'] + '-3');
        var div_2 = document.getElementById(value['barName'] + '-2');
        var div_1 = document.getElementById(value['barName'] + '-1');
        div_3.className = "dashed_border " + value['color'];

        if (today == 'No Data' || today == 0) {
            div_3.setAttribute('style', 'border-right-style: dashed;');
            div_2.className = "";
            div_1.className = "";
        }
        else {
            if (Number(value['maxData']) <= Number(today)) {
                div_2.className = 'solid_border ' + value['color'] + ' ' + value['backgroundColor'];
                div_2.setAttribute('style', 'width: 100%');
                div_3.setAttribute('style', 'border-right-style: solid;');
                div_1.className = "";
            }else {
                var percentage = Number(today) / Number(value['maxData']);
                div_2.className = 'solid_border ' + value['color'] + ' ' + value['backgroundColor'];
                div_2.setAttribute('style', 'width:' + percentage*100 + "%");
                div_1.className = "";
                div_3.setAttribute('style', 'border-right-style: dashed;');
            }
        }

        if (today != 'No Data' && value['maxData'] != 'No Data') {
            var difference = Number(today) - Number(value['maxData']);
            if (difference > 0 ) {
                var arrow_up = document.createElement('img');
                arrow_up.src = 'images/arrow_up.png';
                arrow_up.className = 'arrow';
                var differences_text;
                if (difference < 2) {
                    differences_text = document.createTextNode(difference.toFixed(1) + 'mile');

                }else {
                    differences_text = document.createTextNode(difference.toFixed(1) + 'miles');
                }
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById(value['difference']).appendChild(arrow_up);
                document.getElementById(value['difference']).appendChild(differences_span);

            } else if (difference < 0){
                var arrow_down = document.createElement('img');
                arrow_down.src = 'images/arrow_down.png';
                arrow_down.className = 'arrow';

                var differences_text;
                if (difference < 2) {
                    differences_text = document.createTextNode(Math.abs(difference).toFixed(1) + 'mile');

                }else {
                    differences_text = document.createTextNode(Math.abs(difference).toFixed(1) + 'miles');
                }

                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);
                document.getElementById(value['difference']).appendChild(arrow_down);
                document.getElementById(value['difference']).appendChild(differences_span);

            } else {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);
                document.getElementById(value['difference']).appendChild(differences_span);
            }
        }
    })

/////////////////////////////////////////////////////////////////////////////
    var awayFromHome = {
        todayData: $awayFromHome.data('value'),
        maxData: awayMax/60,
        barName: 'away',
        color: 'away-color',
        backgroundColor: 'away-background-color',
        difference: 'away-difference'
    }

    var activeTime = {
        todayData: $activeTime.data('value'),
        maxData: activeMax/60,
        barName: 'active',
        color: 'active-color',
        backgroundColor: 'active-background-color',
        difference: 'active-difference'
    }

    var awayActiveArray = [awayFromHome, activeTime];

    $.each(awayActiveArray, function(index, value){
        var today = value['todayData'];
        var div_3 = document.getElementById(value['barName'] + '-3');
        var div_2 = document.getElementById(value['barName'] + '-2');
        var div_1 = document.getElementById(value['barName'] + '-1');
        div_3.className = "dashed_border " + value['color'];

        if (today == 'No Data' || today == 0) {
            div_3.setAttribute('style', 'border-right-style: dashed;');
            div_2.className = "";
            div_1.className = "";
        }else {
            if (Number(value['maxData']) <= Number(today)) {
                div_2.className = 'solid_border ' + value['color'] + ' ' + value['backgroundColor'];
                div_2.setAttribute('style', 'width: 100%');
                div_3.setAttribute('style', 'border-right-style: solid;');
                div_1.className = "";
            }else {
                var percentage = Number(today) / Number(value['maxData']);
                div_2.className = 'solid_border ' + value['color'] + ' ' + value['backgroundColor'];
                div_2.setAttribute('style', 'width:' + percentage*100 + "%");
                div_1.className = "";
                div_3.setAttribute('style', 'border-right-style: dashed;');
            }
        }

        if (today != 'No Data' && value['maxData'] != 'No Data') {
            var difference = today - (value['maxData']).toFixed(0);
            if (difference > 0) {
                var arrow_up = document.createElement('img');
                arrow_up.src = 'images/arrow_up.png';
                arrow_up.className = 'arrow';

                var differences_text;
                if (difference < 60) {
                    differences_text = document.createTextNode(difference + 'min');
                } else {
                    var minute = difference % 60;
                    var hour = Math.floor(difference/60);
                    differences_text = document.createTextNode(hour + 'hr' + minute + 'min');
                }
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById(value['difference']).appendChild(arrow_up);
                document.getElementById(value['difference']).appendChild(differences_span);

            } else if (difference < 0){
                var arrow_down = document.createElement('img');
                arrow_down.src = 'images/arrow_down.png';
                arrow_down.className = 'arrow';
                var differences_text;

                if (Math.abs(difference) < 60) {
                    differences_text = document.createTextNode(Math.abs(difference) + 'min');
                } else {
                    var minute = Math.abs(difference % 60);
                    var hour = Math.abs(Math.floor(difference/60)) - 1;
                    differences_text = document.createTextNode(hour + 'hr' + minute + 'min');
                }

                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);

                document.getElementById(value['difference']).appendChild(arrow_down);
                document.getElementById(value['difference']).appendChild(differences_span);

            } else {
                var differences_text = document.createTextNode("No Change!");
                var differences_span = document.createElement('span');
                differences_span.className = 'data-difference';
                differences_span.appendChild(differences_text);
                document.getElementById(value['difference']).appendChild(differences_span);
            }
        }
    })
}