import { scaleOrdinal as d3ScaleOrdinal } from 'd3-scale';
import { timeFormat } from 'd3-time-format';

function setColorScale(value, colorDomain, colorRange) {
    let colorScale = d3ScaleOrdinal()
        .domain(colorDomain)
        .range(colorRange);

    return colorScale(value);
}

function highlightCircle(name, data) {
    let getCircles = document.getElementsByClassName(`circle-${name}`),
        allCircles = document.getElementsByClassName('map-circles');
    // remove highlight of previous circle
    for (let j = 0; j < allCircles.length; j++) {
        allCircles[j].r.baseVal.value = 4
    }
    for (let i = 0; i < getCircles.length; i++) {
        getCircles[i].r.baseVal.value = 6
    }
}

function formatDate(date) {
    //let parseTime = timeFormat("%B, %Y");
    //return parseTime(new Date(date));
    return (new Date(date)).toLocaleDateString("en-US", {year: 'numeric', month: 'short', day: 'numeric'});
}

function groupBy(data, column) {
    let grouped_data = {},
        key;
    switch (typeof column) {
        case "string":
            data.forEach(datum => {
                if(Array.isArray(datum[column])){
                   for(let i in datum[column]){
                    key = datum[column][i] ? datum[column][i] : "Unknown";
                    // console.log(key)
                    if(typeof key === "function"){}
                        // console.log(key)
                    else if (grouped_data[key]) {
                        grouped_data[key].push(datum);
                    } else {
                        grouped_data[key] = [datum];
                    }
                   }
                }
                else{
                    key = datum[column] ? datum[column] : "Unknown";
                    if (grouped_data[key]) {
                        grouped_data[key].push(datum);
                    } else {
                        grouped_data[key] = [datum];
                    }
                }
            });
            break;
        case "function":
            data.forEach(datum => {
                let key = column(datum);
                if (grouped_data[key]) {
                    grouped_data[key].push(datum);
                } else {
                    grouped_data[key] = [datum];
                }
            });
            break;
    }
    return grouped_data;
}

function empty() { return null; }

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function () {
        var status = xhr.status;
        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };
    xhr.send();
}

function getScreenSize() {
    let w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        width = w.innerWidth || e.clientWidth || g.clientWidth,
        height = w.innerHeight || e.clientHeight || g.clientHeight;

    return {
        width: width,
        height: height
    };
}

function throttle(fn, wait) {
    var time = Date.now();
    return function () {
        if ((time + wait - Date.now()) < 0) {
            fn();
            time = Date.now();
        }
    }
}

function sortByKey(array, key, order) {
    return array.sort((a, b) => {
        let x = a[key],
            y = b[key];

        switch (order) {
            case "asce":
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                break;
            case "desc":
                return ((x < y) ? 1 : ((x > y) ? -1 : 0));
                break;
            default:
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                break;
        }
    });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

module.exports = {
    getJSON: getJSON,
    empty: empty,
    getScreenSize: getScreenSize,
    groupBy: groupBy,
    setColorScale: setColorScale,
    highlightCircle: highlightCircle,
    formatDate: formatDate,
    throttle: throttle,
    sortByKey: sortByKey,
    slugify: slugify
}