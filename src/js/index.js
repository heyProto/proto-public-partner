import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';

window.ProtoGraph = window.ProtoGraph || {};
window.ProtoGraph.Card = window.ProtoGraph.Card || {};

ProtoGraph.Card.toMaps = function () {
    this.cardType = 'Map';
}

ProtoGraph.Card.toMaps.prototype.init = function (options) {
    this.options = options;
}

ProtoGraph.Card.toMaps.prototype.getData = function (data) {
    return this.containerInstance.exportData();
}

ProtoGraph.Card.toMaps.prototype.renderLaptop = function () {
    let dimension = getScreenSize(),
        mode;
    if (dimension.width <= 450) {
        mode = 'mobile';
    } else {
        mode = 'laptop';
    }
    ReactDOM.render(
        <App
            dataURL={this.options.dataURL}
            chartOptions={this.options.chartOptions}
            mode={mode}
            dimensionWidth={dimension.width}
            filters={this.options.filters}
            filterConfigurationJSON={this.options.filterConfigurationJSON}
            ref={(e) => {
                this.containerInstance = this.containerInstance || e;
            }} />,
        this.options.selector);
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
