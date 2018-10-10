import React from 'react';
import axios from 'axios';
import { RiseLoader } from 'halogenium';
import List from './List.js';
import Utils from './utility.js';
import Filter from "./filter.js";
import Modal from "./Modal.js";

class App extends React.Component {
  constructor(props) {
    super(props)
    let state = window.location.hash.split('/')[1];
    this.state = {
      dataJSON: undefined,
      category: null,
      filterJSON: [],
      filteredDataJSON: undefined,
      filters: this.props.filters,
      showModal: false,
      card: undefined,
      mode: window.innerWidth <= 500 ? 'col4' : 'col7',
      filterConfigurationJSON: this.props.filterConfigurationJSON,
      obj: {}
    }
    this.ListReference = undefined;
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    // this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    const { dataURL, filterConfigsURL } = this.props;
    axios.all([
      axios.get(dataURL)
    ]).then(axios.spread((card) => {
        let data,
          filters,
          filterJSON,
          keyValue,
          groupBy;

        data = card.data;
        data.sort((x,y) => new Date(y.date) - new Date(x.date));
        data.forEach((e,i) => { e.u_id = (i+1) });

        filters = this.state.filters.map((filter) => {
          groupBy = Utils.groupBy(data, filter.propName)
          keyValue = this.findKeyValue(groupBy)
          return {
            name: filter.alias,
            key: filter.propName,
            filters: this.sortObject(this.createObj(groupBy, filter.propName, keyValue), filter)
            // filters: this.sortObject(Utils.groupBy(data, filter.propName), filter)
          }
        });

        filterJSON = [
          {
            name: "Tab - 1",
            filters: filters
          }
        ];

        this.setState({
          dataJSON: data,
          filteredDataJSON: data,
          filterJSON: filterJSON,
          keyValue: keyValue
        }, (e) => {
          var that = this;
          if (window.ga) {
            ga(function(){
              var tracker = ga.getAll()[0].get('name');
              window.ga(`${tracker}.send`, {
                hitType: 'event',
                eventCategory: 'user interaction',
                eventAction: 'click',
                eventLabel: 'map view'
              });
              window.ga(`${tracker}.send`, {
                hitType: 'event',
                eventCategory: 'user interaction',
                eventAction: 'select',
                eventLabel: this.state.mapDropdownName
              });
            })
          }
        });
    }));

    let dimension = this.getScreenSize();
    //Polyfill for element.closest in old browsers.
    if (window.Element && !Element.prototype.closest) {
      Element.prototype.closest =
        function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
          do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) { };
          } while ((i < 0) && (el = el.parentElement));
          return el;
        };
    }
  }

  findKeyValue(group){
    let arr_of_values = [];
    for (let value in group){
      arr_of_values.push(value)
    }
    // console.log(arr_of_values,"arr_of_values");
    return arr_of_values;
  }


  createObj(group, param, keyValue){
    let obj = {};

    for (let i=0; i<keyValue.length; i++){
      let currentKey = keyValue[i];
      if(param === "date") {
        currentKey = new Date(currentKey).getFullYear();
      }
        if (!obj[currentKey]) {
          obj[currentKey] = [];
        }
        
        if(group[keyValue[i]]) { 
          obj[currentKey].push(...group[keyValue[i]]); 
        }
      //  else {
      //   if (group[currentKey] === undefined){
      //             obj[keyValue[i]] = []
      //           } else {
      //             obj[keyValue[i]] = group[keyValue[i]]
      // }
    }
    // console.log(obj, "object")
    return obj;
  }

  initF3BTWShareLinks() {
    var url = window.location.href,
      fb_share = $('meta[property="og:description"]').attr('content'),
      tw_share = $('meta[name="twitter:description"]').attr('content'),
      fb_share_url,
      tw_share_url;

    url = url.split("#")[0]

    fb_share_url = `http://www.facebook.com/sharer/sharer.php?u=${url}${fb_share ? '&description=' + encodeURI(fb_share) : ''}`;
    tw_share_url = `http://twitter.com/share?url=${url}${tw_share ? '&text=' + encodeURI(tw_share) : ''}`;

    document.getElementById('facebook-share-link').href = fb_share_url;
    document.getElementById('twitter-share-link').href = tw_share_url;
  }

  componentDidUpdate() {
    $(".tabs-area .single-tab").on("click", function(e){
      $(".single-tab").removeClass("active-tab");
      $(this).addClass("active-tab");
      $(".tabs.active-area").removeClass("active-area");
      $(".tabs"+this.dataset.href).addClass("active-area");
    });

    if (this.state.mode === 'col4') {
      $('.hamburger-icon').on('click', (e) => {
        $('.mobile-navigations-screen').addClass('mobile-navigations-screen-slide-in')
      });

      $('.close-icon').on('click', (e) => {
        $('.mobile-navigations-screen').removeClass('mobile-navigations-screen-slide-in')
      })
    }

  }

  getUniqueValuesOfKey(array, key) {
    return array.reduce(function (carry, item) {
      if (item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
      return carry;
    }, []);
  }


  sortObject(obj, filter) {
    var arr = [],nai,na;
    
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        arr.push({
          'name': `${prop}`,
          'value': (prop === "Unknown")? "":prop,
          'count': obj[prop] === undefined ? 0 : obj[prop].length
        });
      }
    }
    na = arr.findIndex(x => x.name === "Unknown" );
    if(na >= 0)
      nai = arr.splice(na,1);
    if (filter.propName === 'date') { //sort by year
      	arr.sort((a,b) => {
	        return parseInt(b.value) - parseInt(a.value);
      	});
    }
    else {	//sort by count
    	arr.sort((a, b) => { 
	    	let key1 = a.count,
		        key2 = b.count;
		      return key2 - key1;
    	});
    }
    if(na >= 0)
      arr.push(nai[0]);
    return arr; // returns array
  }

  onChange(filteredData) {
    // console.log(filteredData, "filteredData")
    let groupBy, keyValue;
    let filtDat = this.state.filters.map((filter) => {
      groupBy = Utils.groupBy(filteredData, filter.propName)
      keyValue = this.findKeyValue(Utils.groupBy(this.state.dataJSON, filter.propName))
      // console.log(groupBy, "groupBy")
      return {
        name: filter.alias,
        key: filter.propName,
        filters: this.sortObject(this.createObj(groupBy, filter.propName, keyValue), filter)
        // filters: this.sortObject(Utils.groupBy(filteredData, filter.propName), filter)
      }
    });

    // console.log(filtDat, filteredData, "on chnage filteredData")

    let filterJSON = [
      {
        name: "Tab - 1",
        filters: filtDat
      }
    ];

    this.setState({
      filteredDataJSON: filteredData,
      filterJSON: filterJSON
    });
  }

  showModal(e) {
    e.persist();
    if (window.ga) {
      window.ga(function(){
        var tracker = ga.getAll()[0].get('name');
        window.ga(`${tracker}.send`, {
          hitType: 'event',
          eventCategory: 'user interaction',
          eventAction: 'click',
          eventLabel: 'tell me how this map is constructed'
        });
      });
    }
    let iframe_url = e.target.closest('.protograph-trigger-modal').getAttribute('data-iframe_url')
    this.setState({
      iframeURL: iframe_url,
      showModal: true
    })
  }

  closeModal() {
    this.setState({
      iframeURL: undefined,
      showModal: false
    })
  }

  // onTabChange (e) {
  //   let tab = e.target.getAttribute('id'),
  //     label;

  //   if (!window.ga) return;
  //   if (window.ga && window.ga.constructor !== Function) return;

  //   switch (tab) {
  //     case 'map-tab':
  //       label = 'map view';
  //       break;
  //     case 'list-tab':
  //       label = 'table view';
  //       break;
  //     default:
  //       label = '';
  //       break;
  //   }

  //   if (window.ga) {
  //     ga(function(){
  //       var tracker = ga.getAll()[0].get('name');
  //       window.ga(`${tracker}.send`, {
  //         hitType: 'event',
  //         eventCategory: 'user interaction',
  //         eventAction: 'click',
  //         eventLabel: label
  //       });
  //     });
  //   }
  // }


  renderLoader() {
    let color = ProtoGraph.site['house_colour'],
      style = {
        display: '-webkit-flex',
        display: 'flex',
        WebkitFlex: '0 1 auto',
        flex: '0 1 auto',
        WebkitFlexDirection: 'column',
        flexDirection: 'column',
        WebkitFlexGrow: 1,
        flexGrow: 1,
        WebkitFlexShrink: 0,
        flexShrink: 0,
        WebkitFlexBasis: '100%',
        flexBasis: '100%',
        maxWidth: '100%',
        height: '200px',
        WebkitAlignItems: 'center',
        alignItems: 'center',
        WebkitJustifyContent: 'center',
        justifyContent: 'center'
      };
    return (
      <div
        className="outer-container"
        style={{
          boxSizing: 'border-box',
          display: '-webkit-flex',
          display: 'flex',
          WebkitFlex: '0 1 auto',
          flex: '0 1 auto',
          WebkitFlexDirection: 'row',
          flexDirection: 'row',
          WebkitFlexWrap: 'wrap',
          flexWrap: 'wrap',
          clear: 'both'
      }}>
        <div className="inner-container" style={style}><RiseLoader color={color} /></div>
      </div>
    )
  }

  renderLaptop() {
    if (this.state.dataJSON === undefined) {
      return this.renderLoader();
    } else {
      return (
        <div className="banner-area">
          <div className="proto-col col-4 filter-col protograph-filter-area">
            <Filter
              configurationJSON={this.props.filterConfigurationJSON}
              dataJSON={this.state.filteredDataJSON}
              filterJSON={this.state.filterJSON}
              onChange={(e) => {this.onChange(e);}}
              hintText="Select a parameter to filter by its value."
            />
          </div>
          <div className="proto-col col-12 protograph-app-map-and-list">
            <div className="tabs list-area active-area" id='list-area'>
              <List
                dataJSON={this.state.filteredDataJSON}
                mode={this.props.mode}
                showModal={this.showModal}
              />
            </div>
            <Modal
              showModal={this.state.showModal}
              closeModal={this.closeModal}
              mode={this.state.mode}
              iframeURL={this.state.iframeURL}
            />
          </div>
        </div>
      )
    }
  }

  render() {
    return this.renderLaptop();
  }

  getScreenSize() {
    let w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      width = w.innerWidth || e.clientWidth || g.clientWidth,
      height = w.innerHeight|| e.clientHeight|| g.clientHeight;

    return {
      width: width,
      height: height
    };
  }
}

export default App;