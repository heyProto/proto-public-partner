import React from 'react';
import {groupBy} from './utility.js';

export default class Filter extends React.Component {

  constructor(props) {
    super(props);

    var filterJSON = this.props.filterJSON.map((e, i) => {
      e.id = this.uuidv4();
      e.parent_ids = [i];
      e.filters = this.setIDs(e.parent_ids, e.filters);
      return e;
    });
    filterJSON[0].is_active = true;

    var stateVars = {
      moveIn: undefined,
      activeTab: 0,
      currentViewLevel: 0,
      filterParams: [],
      filteredData: [],
      dataJSON: this.props.dataJSON,
      filterJSON: filterJSON,
      activeTabJSON: this.props.filterJSON.filter((e,i) => {return e.is_active === true;})[0]
    };

    this.state = stateVars;

    this.toggleFilter = this.toggleFilter.bind(this);
    this.registerFilter = this.registerFilter.bind(this);
    this.unRegisterFilter = this.unRegisterFilter.bind(this);
  }

  setIDs(previous_ids, items, parent_id) {
    return items.map((e, i) => {
      e.id = this.uuidv4();
      e.parent_id = parent_id;
      e.parent_ids = [...previous_ids, i];
      if(e.filters && e.filters.length > 0) {
        e.filters = this.setIDs(e.parent_ids, e.filters, e.id)
      }
      return e;
    });
  }

  onChange() {
    this.props.onChange(this.state.filteredData);
  }

  arrayDifference(newArr, oldArr) {
    return oldArr.filter((e, i) => {
      return !newArr.find((f, j) => { return f.name === e.name })
    })
  }

  componentWillReceiveProps(nextProps) {
    let activeTab = this.state.activeTab,
      newFilterJSON = nextProps.filterJSON,
      filterJSON = this.state.filterJSON,
      filterParams = this.state.filterParams,
      activeTabJSON,
      tabJSON,
      parent_ids,
      f,
      h;

    newFilterJSON.map((e, i) => {
      e.id = this.uuidv4();
      e.parent_ids = [i];
      e.filters = this.setIDs(e.parent_ids, e.filters);
      return e;
    });

    newFilterJSON.forEach((e, i) => {
      f = filterJSON[i];
      e.filters.forEach((g, j) => {
        h = f.filters[j];

        h.filters.forEach((x) => {
          let new_filter = g.filters.find((y) => { return y.name === x.name })
          if (new_filter) {
            // x.id = new_filter.id;
            x.count = new_filter.count;
            // x.parent_ids = new_filter.parent_ids;
            x.is_hidden = undefined;
          } else {
            x.is_hidden = true;
          }
        });
      })
    })

    activeTabJSON = filterJSON[activeTab];

    // Changing the id of filter items.
    filterParams = filterParams.map((e, i) => {
      var item = this.getItemJSON(e.parent_ids);
      e.id = item.id;
      return e;
    });

    this.setState({
      filterJSON: filterJSON,
      activeTabJSON: activeTabJSON,
      filterParams: filterParams
    });
  }

  componentDidMount () {
    this.setCSS();
  }

  setCSS () {
    let filterItemsContainer = document.querySelector('.protograph-filter-items-container'),
      filterHeader = document.querySelector('.protograph-filters-header'),
      filterTabs = document.querySelector('.protograph-filters-tabs-container'),
      top = 0;

    if (filterHeader) {
      top += filterHeader.getBoundingClientRect().height;
    }

    if (filterTabs) {
      top += filterTabs.getBoundingClientRect().height;
    }

    filterItemsContainer.style.top = `${top}px`;
  }

  uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  handleReset(e) {
    let filterParams = this.state.filterParams,
      filterJSON = this.state.filterJSON,
      tempJSON,
      parent_ids;

    if (!filterParams.length) {
      return;
    }

    filterParams.forEach((e) => {
      parent_ids = e.parent_ids;
      for ( let i = 0; i < parent_ids.length; i++) {
        if (i === 0) {
          tempJSON = filterJSON[parent_ids[i]]
        } else {
          tempJSON = tempJSON.filters[parent_ids[i]];
          tempJSON.is_active = false;
        }
      }
    });

    this.resetFilterItems();

    this.setState({
      filterParams: [],
      filterJSON: filterJSON
    }, this.filterData)
  }

  resetFilterItems() {
    let active_filters = document.querySelectorAll('.protograph-filter-item-detail.protograph-show-more-filters');

    for (let i = 0; i < active_filters.length; i++ ) {
      let filter = active_filters[i],
        chevron = filter.querySelector('i.chevron');

      filter.classList.remove('protograph-show-more-filters');
      chevron.classList.remove('up');
      chevron.classList.add('down');
    }
  }

  //Reset the currentViewLevel
  handleTabClick (e) {
    var tabID = +e.target.closest('.protograph-filters-tab').getAttribute('data-tab_id'),
      activeTab = document.querySelector('.protograph-filters-tab.protograph-filters-tab-active'),
      activeTabId = activeTab.getAttribute('data-tab_id'),
      filterJSON = this.state.filterJSON,
      activeTabJSON;

    filterJSON[activeTabId].is_active = false;
    filterJSON[tabID].is_active = true;

    activeTabJSON = this.props.filterJSON.filter((e,i) => {return e.is_active === true;})[0];

    this.setState({
      activeTab: tabID,
      filterJSON: filterJSON,
      activeTabJSON: activeTabJSON
    });
  }

  toggleFilter(e) {
    let filter_details = e.target.closest('.protograph-filter-item-detail'),
      chevron = filter_details.querySelector('i.chevron');

    filter_details.classList.toggle('protograph-show-more-filters');

    if (chevron.classList.contains('up')) {
      chevron.classList.remove('up');
      chevron.classList.add('down');
    } else {
      chevron.classList.add('up');
      chevron.classList.remove('down');
    }
  }

  getItemJSON(parent_ids, filterJSON) {
    return parent_ids.reduce((prev, current) => {
      let itemJSON = prev[current];
      if (itemJSON.filters) {
        itemJSON = itemJSON.filters;
      }
      return itemJSON;
    }, filterJSON || this.state.filterJSON);
  }

  registerFilter(e) {
    //Set filterParams
    //Update the filterJSON: Mark the filters as active.
    var parent_ids = e.target.closest('.protograph-filter-item').getAttribute('data-item_parent_ids').split(',').map((e) => +e ),
      item = this.getItemJSON(parent_ids),
      filterJSON = this.state.filterJSON,
      tempJSON = filterJSON[parent_ids[0]],
      filterParams = this.state.filterParams,
      activeTabJSON;

    filterParams.push(item);

    for (let i = 1; i < parent_ids.length; i++) {
      tempJSON.filters[parent_ids[i]].is_active = true;
      tempJSON = tempJSON.filters[parent_ids[i]];
    }

    activeTabJSON = filterJSON[parent_ids[0]];

    this.setState({
      filterJSON: filterJSON,
      activeTabJSON: activeTabJSON,
      filterParams: filterParams
    }, this.filterData);
  }

  unRegisterFilter(e) {
    var parent_ids = e.target.closest('.protograph-filter-item').getAttribute('data-item_parent_ids').split(',').map((e) => +e),
      item = this.getItemJSON(parent_ids),
      parent_ids = item.parent_ids,
      filterJSON = this.state.filterJSON,
      tempJSON = filterJSON[parent_ids[0]],
      filterParams = this.state.filterParams,
      activeTabJSON;

    filterParams = filterParams.filter((e, i ) => {
      return e.id !== item.id;
    });

    for (let i = 1; i < parent_ids.length; i++) {
      tempJSON.filters[parent_ids[i]].is_active = undefined;
      tempJSON = tempJSON.filters[parent_ids[i]];
    }

    activeTabJSON = filterJSON[parent_ids[0]];

    this.setState({
      filterJSON: filterJSON,
      activeTabJSON: activeTabJSON,
      filterParams: filterParams,
    }, this.filterData);
  }

  filterData() {
    let filterParams = this.state.filterParams,
      dataJSON = this.state.dataJSON,
      filteredData = [],
      filterGroup,
      filterGroupKeys;

    filterGroup = groupBy(filterParams, 'parent_id');
    filterGroupKeys = Object.keys(filterGroup);

    filterGroupKeys.forEach(group => {
      let orResults = [];
      filterGroup[group].forEach((e, i) => {
        let temp = dataJSON.filter((f, j) => {
          if(Array.isArray(this.getDataValue(f,e))){
            return this.getDataValue(f,e).indexOf(e.value) !== -1
          }
          return this.getDataValue(f, e) === e.value
        });
        orResults = orResults.concat(temp);
      });
      if (!filteredData.length) {
        filteredData = orResults;
      } else {
        filteredData = filteredData.filter((e, i) => {
          return orResults.find((f, j) => {
            return f.u_id === e.u_id
          })
        })
      }
    });

    if (filterParams.length === 0 && filteredData.length <= 0) {
      filteredData = this.state.dataJSON;
    }

    filteredData.sort((x,y) => new Date(y.date) - new Date(x.date));

    this.setState({
      filteredData: filteredData
    }, this.onChange);
  }

  getDataValue(data, filter_obj) {
    var parent_ids = filter_obj.parent_ids,
      activeTabJSON = this.state.filterJSON[parent_ids[0]];

    for (let i = 1; i < parent_ids.length - 1; i++) {
      let key = activeTabJSON.filters[parent_ids[i]].key;
      data = key === "date"? new Date(data[key]).getFullYear().toString() 
            : data[key];
    
      activeTabJSON = activeTabJSON.filters[parent_ids[i]];
    }
    return data;
  }

  getStyleString() {
    return `
      .protograph-house-color {
        color: ${this.props.configurationJSON.colors.house_color};
      }
      .protograph-filter-item:hover, .protograph-active-item {
        color: ${this.props.configurationJSON.colors.active_text_color} !important;
      }
      .protograph-house-bg-color, .protograph-filters-header, .protograph-filters-all-filters {
        background-color: ${this.props.configurationJSON.colors.house_color};
      }
      .protograph-filters-tab.protograph-filters-tab-active {
        border-bottom: 2px solid ${this.props.configurationJSON.colors.house_color};
      }
      .protograph-filters-header, .protograph-filters-all-filters-group-item-name, .protograph-filters-all-filters-group-item-cross, .protograph-filters-all-filters-group-item-number {
        color: ${this.props.configurationJSON.colors.filter_summary_text_color};
      }
    `
  }

  getOnClickCallback(e) {
    if (this.itemHasMoreFilters(e)) {
      return this.toggleFilter;
    } else {
      return e.is_active ? undefined : this.registerFilter;
    }
  }

  getName(e) {
    if (!e.renderName) {
      return e.name;
    } else {
      if (e.renderName && e.renderName.constructor === Function) {
        return e.renderName(e);
      } else if (e.renderName && e.renderName.constructor === String) {
        return e.renderName;
      }
    }
  }

  itemHasMoreFilters(e) {
    return e.filters && e.filters.length > 0;
  }

  hasTabs() {
    return this.state.filterJSON.length > 1;
  }

  renderFilterItems(filters, subItems) {
    return (
      <div className={`${!subItems ? 'protograph-filter-items-container' : 'protograph-filter-sub-items-container' }`} >
        <div className= {`${!subItems ? 'protograph-filter-list-area' : '' }`}>
          {
            (this.props.hintText && !subItems) &&
              <div className="protograph-filter-hint-text">{this.props.hintText}</div>
          }
          {
            filters.map((e, i) => {

              if (e.is_hidden) {
                return <div key={i} />;
              }

              let onClickCallback = this.getOnClickCallback(e);
              let name = this.getName(e);

              return (
                <div key={i} className="protograph-filter-item-detail">
                  <div
                    key={i}
                    className={`protograph-filter-item ${(e.is_active && !this.itemHasMoreFilters(e)) ? 'protograph-active-item' : ''}`}
                    onClick={onClickCallback}
                    data-item_parent_ids={e.parent_ids.join(',')}
                  >
                    <div className="protograph-filter-item-name" >
                      {name}
                    </div>
                    {
                      this.itemHasMoreFilters(e) ?
                        <div className="protograph-filter-chevron-icon">
                          <i className="chevron down icon"></i>
                        </div>
                        :
                        <div className="protograph-filter-item-arrow" > {e.count} </div>
                    }
                    {
                      e.is_active &&
                        <div
                          className="protograph-filters-remove-filter"
                          onClick={((e) => { this.unRegisterFilter(e); })}
                        >
                          Remove
                        </div>
                    }
                  </div>
                  {
                    this.itemHasMoreFilters(e) &&
                      <div className="protograph-filter-body">
                        {this.renderFilterItems(e.filters, true)}
                      </div>
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }

  render() {
    let styles = this.getStyleString();
    return (
      <div>
        <style dangerouslySetInnerHTML={{__html: styles}} />
        <div className="protograph-filters-container">
          <div className="protograph-filters-header">
            <span className="protograph-filters-active-count">{this.state.filterParams.length}</span>
            <span
              className="protograph-filters-selected-filter-toggle"
              >
                {this.props.configurationJSON.selected_heading}
            </span>
            <span
              className="protograph-filters-reset-filter"
              onClick={((e) => {this.handleReset(e);})}
            >
              {this.props.configurationJSON.reset_filter_text}
            </span>
          </div>
          { this.state.filterJSON.length > 1 &&
              <div className="protograph-filters-tabs-container">
                {
                  this.state.filterJSON.map((e,i)=> {
                    return(
                      <div
                        key={i}
                        id={`protograph_filter_tab_${i}`}
                        data-tab_id={i}
                        className={`protograph-filters-tab ${e.is_active ? 'protograph-filters-tab-active' : ''}`}
                        onClick={((e) => { this.handleTabClick(e) })}
                      >
                        {e.name}
                      </div>
                    )
                  })
                }
              </div>
          }
          { this.state.filterJSON.length >= 1 &&
            this.renderFilterItems(this.state.activeTabJSON.filters)
          }
        </div>
      </div>
    );
  }
}
