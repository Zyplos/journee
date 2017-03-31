var weatherData;
var newsData;
var w;
var news_technology = [];
// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
//
var mainNewsData = {
    news_technology: [],
    news_business: [],
    news_science: [],
    news_sport: [],
    news_entertainment: []
};
var loadedNewsStates = {
    news_technology: false,
    news_business: false,
    news_science: false,
    news_sport: false,
    news_entertainment: false
};
//
function printNewsCards(section) {

    //console.log("READY FOR DEPLOYMENT");
    //console.log(mainNewsData["news_" + section]);
    for (var j = 0; j < mainNewsData["news_" + section].length; j++) {
        //console.log(j + " - " + mainNewsData["news_" + section][j].title);
        var newsCard = $("#template_" + section + "_card").clone();
        newsCard.removeAttr("id");
        if (mainNewsData["news_" + section][j].urlToImage) {
            newsCard.find(".panel-img").css("background-image", "url(" + mainNewsData["news_" + section][j].urlToImage + ")");
            newsCard.find(".news_description").text(mainNewsData["news_" + section][j].description);
            newsCard.find(".panel-heading-title").text(mainNewsData["news_" + section][j].title);
        }
        else {
            newsCard.find(".panel-img").remove();
            newsCard.find(".panel-body").prepend('<p style="font-size: 24px">' + mainNewsData["news_" + section][j].title + '</p>');
            newsCard.find(".news_description").text(mainNewsData["news_" + section][j].description);
        }
        newsCard.find(".news_urlBtn").attr("href", mainNewsData["news_" + section][j].url);
        if (mainNewsData["news_" + section][j].author) {
            newsCard.find(".news_author").text(mainNewsData["news_" + section][j].author);
        }
        else {
            newsCard.find(".news_author").text(mainNewsData["news_" + section][j].source);
        }
        if (mainNewsData["news_" + section][j].publishedAt) {
            var newsDateFull = mainNewsData["news_" + section][j].publishedAt;
            var newsDate = newsDateFull.split("T");
            var newsDateFinal = newsDate[0].split("-");
            newsCard.find(".news_date").text(newsDateFinal[1] + '/' + newsDateFinal[2] + '/' + newsDateFinal[0]);
        }
        else {
            newsCard.find(".news_date").text("???");
        }
        if (mainNewsData["news_" + section][j].description) {
            newsCard.find(".news_description").text(mainNewsData["news_" + section][j].description);
        }
        else {
            newsCard.find(".news_description").remove();
        }
        newsCard.find(".news_urlBtnSource").text(mainNewsData["news_" + section][j].source);
        $(".news_modal_body_" + section).append(newsCard);
    }

    loadedNewsStates["news_" + section] = true;

}
//
var news_queue = [];
//
function getArticles(source, name, section) {
    var naurl = "https://newsapi.org/v1/articles?source=" + source + "&apiKey=d05bc27feb824689a88d734339e5b9a2";
    $.ajax({
        url: naurl,
        method: 'GET',
        dataType: 'json'
    }).done(function(data) {
        //console.log("---- " + source + " ART ----");
        //console.log(data.articles);
        for (var i = 0; i < data.articles.length; i++) {
            var article_data = {
                source: name,
                sourceid: source,
                author: data.articles[i].author,
                description: data.articles[i].description,
                publishedAt: data.articles[i].publishedAt,
                title: data.articles[i].title,
                url: data.articles[i].url,
                urlToImage: data.articles[i].urlToImage
            };
            //console.log(article_data);
            mainNewsData["news_" + section].push(article_data);
        }
        mainNewsData["news_" + section] = shuffle(mainNewsData["news_" + section]);
        //console.log(news_technology);
        //console.log("--------------------");
        var index = news_queue.indexOf(source);
        if (index >= 0) {
            news_queue.splice(index, 1);
        }
        //console.log(news_queue);
        if (news_queue.length === 0) {
            printNewsCards(section);
        }
    }).fail(function(err) {
        //alert("An error occured while getting news data.")
        throw err;
    });
}

function main() {
    if (!localStorage.init) {
        $('#initModal').modal('show');
    }
    else {
        //
        $("#header_user").text(localStorage.name);
        //
        weatherData = JSON.parse(localStorage.getItem("weather"));
        newsData = localStorage.getItem("news").split(",");
        //
        var wurl = "https://api.darksky.net/forecast/74e2826853eb6fa631f7a0c6c6eb1d8c/" + weatherData.lat + "," + weatherData.long;
        //console.log(wurl);
        $.ajax({
            url: wurl,
            method: 'GET',
            dataType: 'jsonp'
        }).done(function(data) {
            w = data;
            //console.log(data);
            //console.log("-------------");
            //
            var sc_header = new Skycons({
                "color": "white",
                "resizeClear": true
            });
            var sc_screen = new Skycons({
                "color": "black",
                "resizeClear": true
            });
            sc_header.add("header_icon", data.currently.icon);
            $("#header_temp").text(Math.floor(data.currently.temperature));
            $("#header_desc").text(data.currently.summary);
            $("#header_loc").text(weatherData.city + ", " + weatherData.state);
            //
            //console.log(data.daily.data[0]);
            sc_screen.add("weather_icon_today", data.daily.data[0].icon);
            $("#weather_temp_todayMin").text(Math.floor(data.daily.data[0].temperatureMin));
            $("#weather_temp_todayMax").text(Math.floor(data.daily.data[0].temperatureMax));
            $("#weather_desc_today").text(data.daily.data[0].summary);
            //
            for (var i = 1; i < 6; i++) {
                //console.log(i);
                sc_screen.add("weather_icon_hourly" + i, data.hourly.data[i].icon);
                $("#weather_temp_hourly" + i).text(Math.floor(data.hourly.data[i].temperature));
                $("#weather_desc_hourly" + i).text(data.hourly.data[i].summary);
            }
            //
            for (var j = 1; j < 6; j++) {
                //console.log(j);
                sc_screen.add("weather_icon_daily" + j, data.daily.data[j].icon);
                $("#weather_temp_daily" + j + "Min").text(Math.floor(data.daily.data[j].temperatureMin));
                $("#weather_temp_daily" + j + "Max").text(Math.floor(data.daily.data[j].temperatureMax));
                $("#weather_desc_daily" + j).text(data.daily.data[j].summary);
            }
            //
            sc_header.play();
            sc_screen.play();
        }).fail(function(err) {
            alert("An error occured while getting weather data.");
            throw err;
        });
        //
        //
    }
}
$(document).ready(function() {
    main();
    $('.carousel').carousel({
        interval: false
    });
});
$("#init_forward").click(function() {
    if (!$(this).hasClass("disabled")) {
        $("#initCarousel").carousel('next');
    }
});
$("#init_back").click(function() {
    if (!$(this).hasClass("disabled")) {
        $("#initCarousel").carousel('prev');
    }
});
//
$('#init_weather_input').on('input', function() {
    if (!$('#init_weather_input').val()) {
        $("#init_forward").addClass("disabled");
    }
    else {
        $("#init_forward").removeClass("disabled");
    }
});
//
$('#init_name_input').on('input', function() {
    if (!$('#init_name_input').val()) {
        $("#init_forward").addClass("disabled");
    }
    else {
        $("#init_forward").removeClass("disabled");
    }
});
//
$('#initCarousel').on('slide.bs.carousel', function(e) {
    //console.log(e.relatedTarget.id);
    switch (e.relatedTarget.id) {
        case "init_carousel_start":
            $("#init_forward").removeClass("disabled");
            $("#init_back").fadeOut();
            break;
        case "init_carousel_name":
            $("#init_back").fadeIn();
            if (!$("#init_name_input").val()) {
                $("#init_forward").addClass("disabled");
            }
            break;
        case "init_carousel_weather":
            if (!$("#init_weather_input").val()) {
                $("#init_forward").addClass("disabled");
            }
            break;
        case "init_carousel_calendar":
            $("#init_forward").fadeIn();
            break;
        case "init_carousel_finish":
            $("#init_forward").fadeOut();
            break;
        default:
            break;
    }
});
//
var blinkerID;
var blinkerID2;
//
function showError(error) {
    console.log(error);
    console.log('ERROR(' + error.code + '): ' + error.message);
    //
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("Could not show places nearby since you denied the request.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("We couldn't get your position.");
            break;
        case error.TIMEOUT:
            alert("It took too long to get your location!");
            break;
        case error.UNKNOWN_ERROR:
            alert("We couldn't get your location. (Sorry!)");
            break;
    }
}
//
var gpsLocLat;
var gpsLocLong;
//
function getWeatherInitLoc(loc) {
    console.log(loc);
    //
    var lat = loc.coords.latitude;
    var long = loc.coords.longitude;
    gpsLocLat = lat;
    gpsLocLong = long;
    var latlong = lat + "," + long;
    var weather_callurl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlong + '&key=AIzaSyA284UZT37ThoOi4ZM8g8gGnmgv2lx0tZc';
    console.log(weather_callurl);
    //
    var weather_city;
    var weather_state;
    //
    $.getJSON(weather_callurl).done(function(data) {
        console.log("--- WEATHER CALLBACK ---");
        console.log(data.results[0].address_components);
        //
        $.each(data.results[0].address_components, function(i, v) {
            console.log(i);
            console.log(v.types);
            for (var k = 0; k < v.types.length; k++) {
                if (v.types[k] == "locality") {
                    weather_city = v.long_name;
                }
                else if (v.types[k] == "administrative_area_level_1") {
                    weather_state = v.short_name;
                }
            }
        });
        console.log("CITY: " + weather_city);
        console.log("STATE: " + weather_state);
        $("#init_weather_input").val(weather_city + ", " + weather_state);
        clearInterval(blinkerID);
        clearInterval(blinkerID2);
        $(".init_weather_locBtnIcon").text("near_me");
        $("#init_forward").removeClass("disabled");
    });
}
//
$("#init_weather_locBtn").click(function() {
    $(".init_weather_locBtnIcon").text("gps_not_fixed");
    //
    blinkerID = setInterval(function() {
        $(".init_weather_locBtnIcon").text("gps_fixed");
    }, 1000);
    blinkerID2 = setInterval(function() {
        $(".init_weather_locBtnIcon").text("gps_not_fixed");
    }, 2000);
    //
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeatherInitLoc, showError);
    }
    else {
        $(".init_weather_locBtnIcon").text("near_me");
        alert("Your device does not support getting your location.");
    }
});
//
$("#init_finish").click(function() {
    //
    var name_input = $("#init_name_input").val();
    localStorage.setItem("name", name_input);
    // Weather
    var weather_input = $("#init_weather_input").val();
    weather_input = weather_input.replace(/ /g, "+");
    var weather_callurl = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + weather_input + '&key=AIzaSyA284UZT37ThoOi4ZM8g8gGnmgv2lx0tZc';
    //
    var weather_city;
    var weather_state;
    //
    $.getJSON(weather_callurl).done(function(data) {
        console.log("--- WEATHER CALLBACK ---");
        console.log(data);
        console.log(data.results[0].address_components);
        //
        $.each(data.results[0].address_components, function(i, v) {
            console.log(i);
            console.log(v.types);
            for (var l = 0; l < v.types.length; l++) {
                if (v.types[l] == "locality") {
                    weather_city = v.long_name;
                }
                else if (v.types[l] == "administrative_area_level_1") {
                    weather_state = v.short_name;
                }
            }
        });
        console.log("CITY: " + weather_city);
        console.log("STATE: " + weather_state);
        localStorage.setItem("weather", JSON.stringify({
            "city": weather_city,
            "state": weather_state,
            "lat": data.results[0].geometry.location.lat,
            "long": data.results[0].geometry.location.lng
        }));
        main();
    });
    // News
    var news_subjects = [];
    $('#init_news_checklist input:checked').each(function() {
        news_subjects.push($(this).val());
    });
    localStorage.setItem("news", news_subjects);
    // Calendar
    main();
    localStorage.setItem("init", true);
    $('#initModal').modal("toggle");
    main();
});
//
$("#tab_weather").click(function() {
    $("#screen_news").hide();
    $("#screen_agenda").hide();
    $("#screen_weather").fadeIn();
    $('html, body').animate({
        scrollTop: $("#main-header").outerHeight() - 43
    }, 500);
});
$("#tab_news").click(function() {
    $("#screen_weather").hide();
    $("#screen_agenda").hide();
    $("#screen_news").fadeIn();
    $('html, body').animate({
        scrollTop: $("#main-header").outerHeight() - 43
    }, 500);
});
$("#tab_agenda").click(function() {
    $("#screen_weather").hide();
    $("#screen_agenda").fadeIn();
    $("#screen_news").hide();
    $('html, body').animate({
        scrollTop: $("#main-header").outerHeight() - 43
    }, 500);
});
//
$("#techModalBtn").click(function() {
    var nourl = "https://newsapi.org/v1/sources?language=en&category=technology";
    //
    if (!loadedNewsStates.news_technology) {

        $.getJSON(nourl).done(function(data) {
            //console.log("---- SOURCE SUB ----");
            //console.log(data);
            for (var i = 0; i < data.sources.length; i++) {
                if (data.sources[i].id != "hacker-news") {
                    news_queue.push(data.sources[i].id);
                    getArticles(data.sources[i].id, data.sources[i].name, "technology");
                }
            }
            //console.log("--------------------");
            $("#techModal").modal("show");
        });
    }
    else {

        $("#techModal").modal("show");
    }
});
//
$("#businessModalBtn").click(function() {
    var nourl = "https://newsapi.org/v1/sources?language=en&category=business";
    //
    if (!loadedNewsStates.news_business) {
        $.getJSON(nourl).done(function(data) {
            //console.log("---- SOURCE SUB ----");
            //console.log(data);
            for (var i = 0; i < data.sources.length; i++) {
                if (data.sources[i].id != "hacker-news") {
                    news_queue.push(data.sources[i].id);
                    getArticles(data.sources[i].id, data.sources[i].name, "business");
                }
            }
            //console.log("--------------------");
            $("#businessModal").modal("show");
        });
    }
    else {

        $("#businessModal").modal("show");
    }
});
$("#scienceModalBtn").click(function() {
    var nourl = "https://newsapi.org/v1/sources?language=en&category=science-and-nature";
    //
    if (!loadedNewsStates.news_science) {
        $.getJSON(nourl).done(function(data) {
            //console.log("---- SOURCE SUB ----");
            //console.log(data);
            for (var i = 0; i < data.sources.length; i++) {
                if (data.sources[i].id != "hacker-news") {
                    news_queue.push(data.sources[i].id);
                    getArticles(data.sources[i].id, data.sources[i].name, "science");
                }
            }
            //console.log("--------------------");
            $("#scienceModal").modal("show");
        });
    }
    else {

        $("#scienceModal").modal("show");
    }
});
$("#sportModalBtn").click(function() {
    var nourl = "https://newsapi.org/v1/sources?language=en&category=sport";
    //
    if (!loadedNewsStates.news_sport) {
        $.getJSON(nourl).done(function(data) {
            //console.log("---- SOURCE SUB ----");
            //console.log(data);
            for (var i = 0; i < data.sources.length; i++) {
                if (data.sources[i].id != "hacker-news") {
                    news_queue.push(data.sources[i].id);
                    getArticles(data.sources[i].id, data.sources[i].name, "sport");
                }
            }
            //console.log("--------------------");
            $("#sportModal").modal("show");
        });
    }
    else {

        $("#sportModal").modal("show");
    }
});
$("#entertainmentModalBtn").click(function() {
    var nourl = "https://newsapi.org/v1/sources?language=en&category=entertainment";
    //
    if (!loadedNewsStates.news_entertainment) {
        $.getJSON(nourl).done(function(data) {
            //console.log("---- SOURCE SUB ----");
            //console.log(data);
            for (var i = 0; i < data.sources.length; i++) {
                if (data.sources[i].id != "hacker-news") {
                    news_queue.push(data.sources[i].id);
                    getArticles(data.sources[i].id, data.sources[i].name, "entertainment");
                }
            }
            //console.log("--------------------");
            $("#entertainmentModal").modal("show");
        });
    }
    else {

        $("#entertainmentModal").modal("show");
    }
});
//

$(".scrollUpBtn").click(function() {
    $('.modal').animate({
        scrollTop: 0
    }, 500);
});

$("#settingsBtn").click(function() {
    $("#initModal").modal('show');
    $("#init_name_input").val(localStorage.name);
    $("#init_weather_input").val(weatherData.city + ", " + weatherData.state);
});

$(window).on('load', function(e) {
    $("#loader").fadeOut();
});



/////

var CLIENT_ID = '642579947353-05qqqb9heom2j074m62d9brpp9pjegtt.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');


function handleClientLoad() {
    //console.log("CLIENT LOADING");
    gapi.load('client:auth2', initClient);
}


function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function() {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        //
        $(".authorize-button").click(function() {
            handleAuthClick();
        });
        $(".signout-button").click(function() {
            handleSignoutClick();
            $("#agenda_list").empty();
        });

    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        $(".authorize-button").hide();
        $(".signout-button").show();
        listUpcomingEvents();
    }
    else {
        $(".authorize-button").show();
        $(".signout-button").hide();
    }
}


function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

//
var mainCalendarData = {};
var calendarColors = {};
//

function listUpcomingEvents() {

    var maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);

    //console.log(maxDate);

    gapi.client.calendar.calendarList.list().then(function(response) {
        /*console.log("---- RESPONSE ----");
        console.log(response);
        console.log("-------------------");*/
        //

        //
        for (var l = 0; l < response.result.items.length; l++) {
            calendarColors[response.result.items[l].summary] = response.result.items[l].backgroundColor;
        }
        //console.log(response.result.items);
        for (var i = 0; i < response.result.items.length; i++) {
            //
            gapi.client.calendar.events.list({
                'calendarId': response.result.items[i].id,
                'timeMin': (new Date()).toISOString(),
                'timeMax': maxDate.toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 10,
                'orderBy': 'startTime'
            }).then(function(responseinner) {
                var events = responseinner.result.items;
                //console.log("---- RESPONSE EVENTS ----");
                //console.log(responseinner);
                //console.log("-------------------------");


                if (events.length > 0) {




                    for (j = 0; j < events.length; j++) {
                        var event = events[j];

                        //console.log("---- EVENT ----");
                        //console.log(event);
                        //console.log("---------------");

                        when = event.start.date;


                        //

                        var agendaCard = $("#template_calendar_card").clone();
                        agendaCard.removeAttr("id");
                        //
                        agendaCard.find(".agenda_calendarName").text(responseinner.result.summary);
                        agendaCard.find(".agenda_eventTitle").text(event.summary);

                        agendaCard.css("border-color", calendarColors[responseinner.result.summary]);
                        agendaCard.find(".panel-heading").css("border-color", calendarColors[responseinner.result.summary]);
                        agendaCard.find(".panel-heading").css("background-color", calendarColors[responseinner.result.summary]);
                        //
                        if (when) {

                            var datefull = when.split("-");
                            //
                            var year = parseInt(datefull[0]);
                            var month = parseInt(datefull[1]);
                            var day = parseInt(datefull[2]);

                            month--;

                            var d = new Date(year, month, day)
                            agendaCard.find(".panel-body").append("<p>" + d.toDateString() + "</p>");
                        }
                        else {
                            //
                            var item_date = new Date(event.start.dateTime);
                            var itemTimeFriendly;
                            if (item_date.getHours() >= 13) {
                                itemTimeFriendly = item_date.getHours() - 12;
                            }
                            else {
                                itemTimeFriendly = item_date.getHours();
                            }
                            if (itemTimeFriendly === 0) {
                                itemTimeFriendly = 12;
                            }
                            if (item_date.getHours() >= 12) {
                                if (item_date.getMinutes() == 0) {
                                    itemTimeFriendly += ":" + "00pm";
                                }
                                else {
                                    itemTimeFriendly += ":" + item_date.getMinutes() + "pm";
                                }

                            }
                            else {
                                if (item_date.getMinutes() == 0) {
                                    itemTimeFriendly += ":" + "00am";
                                }
                                else {
                                    itemTimeFriendly += ":" + item_date.getMinutes() + "am";
                                }
                            }
                            //
                            var item_date2 = new Date(event.end.dateTime);
                            var itemTimeFriendly2;
                            if (item_date2.getHours() >= 13) {
                                itemTimeFriendly2 = item_date2.getHours() - 12;
                            }
                            else {
                                itemTimeFriendly2 = item_date2.getHours();
                            }
                            if (itemTimeFriendly2 === 0) {
                                itemTimeFriendly2 = 12;
                            }
                            if (item_date2.getHours() >= 12) {
                                if (item_date2.getMinutes() == 0) {
                                    itemTimeFriendly2 += ":" + "00pm";
                                }
                                else {
                                    itemTimeFriendly2 += ":" + item_date2.getMinutes() + "pm";
                                }

                            }
                            else {
                                if (item_date2.getMinutes() == 0) {
                                    itemTimeFriendly2 += ":" + "00am";
                                }
                                else {
                                    itemTimeFriendly2 += ":" + item_date2.getMinutes() + "am";
                                }
                            }
                            //
                            agendaCard.find(".panel-body").append("<p>" + item_date.toDateString() + " at " + itemTimeFriendly + " to " + item_date2.toDateString() + " at " + itemTimeFriendly2 + "</p>");
                        }
                        //



                        //
                        $("#agenda_list").append(agendaCard);

                        //console.log("APPENDING " + event.summary)
                        //$("#screen_agenda").append("<p>" + event.summary + ' (' + when + ') |||| ' + "response.result.items[i].id" + "</p>");
                    }



                }
            });
            //
        }
    });

    //

}
