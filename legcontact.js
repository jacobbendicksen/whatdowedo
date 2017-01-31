"use strict";
    exports.getReps = function(address){

        var geoObj = null;
        var localReps = null;
        var stateReps = null;

        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();

        xhr.open("GET", 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyDtpQ_AqE3ug_60ZCfRYnBGKDpPJTEh3WA', false);
        xhr.send();

        if (xhr.status == 200){
            geoObj = JSON.parse(xhr.responseText);
            var lat = JSON.stringify(geoObj.results[0].geometry.location.lat);
            var long = JSON.stringify(geoObj.results[0].geometry.location.lng);
            var state = geoObj.results[0].address_components[5].short_name;
        }

        if (geoObj != null){
            // console.log("lat: " + lat);
            // console.log("long: " + long);
            // console.log("state: " + state);
            xhr.open("GET", 'https://openstates.org/api/v1/legislators/geo/?lat=' + lat + "&long=" + long, false);
            xhr.send();
        }

        if (xhr.status == 200){
            // console.log("got data");
            localReps = JSON.parse(xhr.responseText);
        }

        var returnObjList = [];
        if (localReps != null){
            for (var legIndex = 0; legIndex < localReps.length; legIndex++){
                returnObjList.push({
                    name: localReps[legIndex].full_name,
                    phone: localReps[legIndex].offices[0].phone,
                    email: localReps[legIndex].offices[0].email
                });
                // console.log(localReps[legIndex].full_name);
                // console.log(localReps[legIndex].offices[0].phone)
                // console.log(localReps[legIndex].offices[0].email)
                // console.log();
            }
            // console.log(localReps);
        }
        return returnObjList;
    }
