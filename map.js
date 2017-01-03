
// Testing Leaflet map
// REMEMBER TO COMMENT-IN ALSO Leadlet & Geohash libraries

var mymap;
var circleGroup;

function initMap()
{
    options.species = $("#species").val();

    if (undefined == mymap)
    {
        // http://stackoverflow.com/questions/37166172/mapbox-tiles-and-leafletjs
        mymap = L.map('container').setView([57.78670, 14.21844], 13);
        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'light-v9', // streets-v9 satellite-streets-v9 light-v9 dark-v9 outdoors-v9
            accessToken: mapboxAccessToken
        }).addTo(mymap);
    }

    // Remove old markers
    if (undefined != circleGroup)
    {
        mymap.removeLayer(circleGroup);
    }

    getTaxonMap();

    /*
    let circle = L.circle([57.786, 14.218], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 100
    }).addTo(mymap);
    circle.bindPopup("NNN occurrences");

    let circle2 = L.circle([57.78, 14.21], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 200
    }).addTo(mymap);
    circle2.bindPopup("YYY occurrences");
    */
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
        if (0 == count)
        {
            $("#ladda").html("");
            $("#total").text("Species not found");
            $("#container").html("");
            return;
        }

        // Leaflet map
        console.log("Mapdata:");
        console.log(elasticData);
        drawMap(elasticData);

        // Show count
        let countFormatted = count.toLocaleString();
        $("#total").text(countFormatted + " occurrences");
    };

    elasticQueryModule.query(queryObject, callback);
}

function drawMap(elasticData) {
    let buckets = elasticData.aggregations.grid.buckets;
    let circles = [];

    for (let i = 0; i < buckets.length; i++) {
//      console.log(buckets[i]);
        coordinateObject = Geohash.decode(buckets[i].key);

        let size = (buckets[i].doc_count);
        let circle = L.circle([coordinateObject.lat, coordinateObject.lon], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: size
        })
        console.log(circle);
        circle.bindPopup(buckets[i].doc_count + " occurrences");
        circles.push(circle);
    }

    circleGroup = L.layerGroup(circles);
    circleGroup.addTo(mymap);
    $("#ladda").html("");
}


