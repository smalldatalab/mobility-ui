#Mobility-omh User Interface (Visualization of Your Data)
####Overview

Mobility-omh is a support application for [ohmage-omh](http://ohmage-omh.smalldata.io/) that adds personal location tracking and activity classification (e.g. still, walking, running, etc.) Mobility tracks and uploads location data to the ohmage-omh server. Visualizations and statistics are then computed and made available on the dashboard via the ohmage-omh DPU.

Mobility-omh UI compares today's data with yesterday and shows the difference. It also sets the largest data of the past seven days as the max for four aspects of your Mobility data, Active Minutes, Longest Trek, Hours Out of House, and Miles Walked in the upper part of the interface. In the bottom interface, you could see a list of the locations each with a Google map that you have been in a day with the time interval.

####Framework and plugins
Mobility UI uses [Middleman](https://middlemanapp.com/), a static site generator for the front-end development. After you make edits to the files under `/source` folder, the code will be compressed into `/build` folder. Here are the useful commend lines when running Middleman. 
+ `middleman` is to run Middleman on the terminal. 
+ `middleman build` is to compile all your source code. 
+ `middleman deploy` enables you to deploy the site via git. 

For JS library
+ `jquery.js` 
+ `moment.js` for rendering and reading the time/date
+ `underscore.js` 

Main JS files for editing 
+ `source/javascripts/draw.js` is to draw out all the visualization.
+ `source/javascripts/dsu.js` is to make the GET request to the DSU and run through the authentication. 
+ `source/javascripts/url.js` is to break down the information contained in the url.

Mobility UI exacts the data from the url in `source/index.html.erb` such as date and numeric data. See the code below. 

```js
/// Set all the properties
var today = moment().subtract(1, 'days');
var token = url("#access_token");
var device = _.contains(['iPad', 'iPhone', 'iPod'], navigator.platform) ? 'ios': 'android';
var $currentDate = $('#current-date');
var $nextDate = $('#next-date');
var $prevDate = $('#previous-date');
var $walkingDistance = $("#walking-distance");
var $trekMile = $("#trek-mile");
var $activeTime = $("#active-time");
var $awayFromHome = $("#away-from-home");
$currentDate.html(today.format('dddd, MMMM Do YYYY') + ' (Yesterday)');


/// Every time the date is changed, the visualization should be redrawn
var redraw = function(){
    deletePreviousDiv();
    // For drawing the locations
    drawDate(moment(today).format('YYYY-MM-DD'), device);
    // For drawing out the bars of variables
    showSummary(moment(today).format('YYYY-MM-DD'), device);
};

/// Set the navigation buttons to change the date
$nextDate.click(function(){
    today = today.add(1, 'days');
    $currentDate.html(today.format('dddd, MMMM Do YYYY'));
    redraw();
    sortMe();
});
$prevDate.click(function(){
    today = today.subtract(1, 'days');
    $currentDate.html(today.format('dddd, MMMM Do YYYY'));
    redraw();
});
redraw();
```

Having obtaine the data, functions `drawDate()` and `showSummary()` will be called to display the data visually.

#####Set Up Your Own
Change the variable in the `source/javascripts/dsu.js` as `var dsu = 'Your Own URL For Getting Data'`

