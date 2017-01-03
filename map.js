
// Testing Leaflet map
// REMEMBER TO COMMENT-IN ALSO Leadlet & Geohash libraries

var mymap;
var circleGroup;
var largestDoc_count;

function initMap()
{
    options.species = $("#species").val();

    if (undefined == mymap)
    {
        // http://stackoverflow.com/questions/37166172/mapbox-tiles-and-leafletjs
        mymap = L.map('mymap').setView([60, 14], 5);
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'light-v9', // streets-v9 satellite-streets-v9 light-v9 dark-v9 outdoors-v9
            accessToken: mapboxAccessToken
        }).addTo(mymap);
    }
    
    clearMap();
    getTaxonMap();
}

function clearMap() {
    // Remove old markers
    if (undefined != circleGroup)
    {
        mymap.removeLayer(circleGroup);
        largestDoc_count = undefined;
    }    
}


function getTaxonMap()
{
    let queryObject = {
        "size" : 0,
        "query" : {
            "term" : {
                "species" : options.species
            }
        },
        "aggregations" : {
            "grid" : {
                "geohash_grid" : {
                    "field" : "coordinates",
                    "precision" : 4
                }
            }
        }
    };

    console.log(queryObject);

    let callback = function(elasticData) {

        let count = elasticData.hits.total;
        if (0 == count) {
            console.log("DATA MISSING, count == " + count);
            $("#ladda").html("");
            $("#total").text("Species not found");
            $("#container").html("");
        }
        else {
            console.log("FOUND DATA, count == " + count);
            // Leaflet map
            console.log("Mapdata:");
            console.log(elasticData);
            drawMap(elasticData);

            // Show count
            let countFormatted = count.toLocaleString();
            $("#total").text(countFormatted + " occurrences");
        }
    };

    elasticQueryModule.query(queryObject, callback);
}

function drawMap(elasticData) {
    let buckets = elasticData.aggregations.grid.buckets;
    let circles = [];

    for (let i = 0; i < buckets.length; i++) {
//      console.log(buckets[i]);
        circles.push(createMarker(buckets[i]));
    }

    circleGroup = L.layerGroup(circles);
    circleGroup.addTo(mymap);

    $("#ladda").html("");
}

function createMarker(bucket)
{
    let coordinateObject = Geohash.decode(bucket.key);

    if (undefined == largestDoc_count)
    {
        largestDoc_count = bucket.doc_count;
    }
    let size = Math.floor(bucket.doc_count / largestDoc_count * 15000);

    let circle = L.circle([coordinateObject.lat, coordinateObject.lon], {
        color: '#006AA7',
        fillColor: '#006AA7',
        fillOpacity: 0.5,
        radius: size
    })
//    console.log(circle);
    circle.bindPopup(bucket.doc_count + " occurrences");
    return circle;
}


