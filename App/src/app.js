import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
  Button,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import RNCalendarEventsWrapper from './react_native_calendar_events_wrapper';
import _ from 'lodash';
import ModalSelector from './modal_selector';
import DatesRange from './dates_range';
import EventEditor from './event_editor';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authorized: false,
      calendarsList: null,
      calendarsById: null,
      calendar: {id: null, title: 'Not selected'},
      calendarPickerVisible: false,
      startDate: new Date(),
      endDate: new Date(),
      events: [],
      eventEditingType: 'new'
    };
  }

  componentWillMount() {
    this._getReady();
  }

  async _getReady() {
    await RNCalendarEventsWrapper.authorize();
    if(RNCalendarEventsWrapper.isAuthhorized) {
      this.setState({authorized: true});
    }
    await RNCalendarEventsWrapper.findCalendars();
    this.setState({
      calendarsList: RNCalendarEventsWrapper.calendarsList(),
      calendarsById: _.keyBy(RNCalendarEventsWrapper.calendarsList(), 'id')
    });
  }

  async _updateOrSaveEvent(sourceData, editedData) {
    if(!editedData) return;

    RNCalendarEventsWrapper.saveOrUdpateEvent(
      editedData.title || sourceData.title,
      editedData.startDate || sourceData.startDate,
      editedData.endDate || sourceData.endDate,
      this.state.calendar.id,
      _.get(sourceData, 'eventId')
    )
  }

  render() {
    return this.state.calendarsList ? this._renderReady() : this._renderNotReady();
  }

  _renderReady() {
    return (
      <View style={{flex: 1, flexDirection: 'column', marginTop: 20, padding: 10}}>
        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Text>Calendar: </Text>
          <Button
            title={this.state.calendar.title}
            onPress={() => {this.setState({calendarPickerVisible: true})}}
          />
        </View>

        <ModalSelector
          visible={this.state.calendarPickerVisible}
          data={! this.state.calendarsList ? [] :
                  _.map(_.range(this.state.calendarsList.length), (i) => ({key: i, title: this.state.calendarsList[i].title}))
               }
          onSelection={(key) => {
            this.setState({
                calendar: this.state.calendarsList[key],
                calendarPickerVisible: false
              })
          }}
        />

        <View style={{marginTop: 20}}>
          <DatesRange
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            onChange={(startDate, endDate) => this.setState({startDate, endDate})}
          />
        </View>

        <View style={{marginTop: 20}}>
          <Button
            title="Fetch events"
            onPress={() => {
              const startTime = this.state.startDate.getTime();
              const endDatePlusDay = new Date();
              endDatePlusDay.setDate(this.state.endDate.getDate() + 1)
              const endTime = endDatePlusDay.getTime()
              this._fetchEvents(
                startTime,
                endTime,
                this.state.calendar ? [this.state.calendar.id] : []
              );
            }}
          />
        </View>

        <View style={{marginTop: 20}}>
          <Button
            title={
              (() => {
                if(!this.state.calendar.id) return 'add event to default calendar';
                if(!this.state.calendar.editable) return 'selected calendar is not editable';
                return `Add event to calendar '${this.state.calendar.title}'`;
              })()
            }
            disabled={this.state.calendar.id && !this.state.calendar.editable}
            onPress={() => {
              this.setState({
                selectedEvent: {calendar: this.state.calendar},
                eventEditingType: 'new'
              })
            }}
          />
        </View>

        <View style={{marginTop: 20}}>
          <Text>Fetched events (tap to view/edit): </Text>
          <FlatList
            data={this.state.events}
            renderItem={({item}) => 
              <TouchableHighlight
                onPress={() => this.setState({
                  selectedEvent: item,
                  eventEditingType: this.state.calendarsById[item.calendarId].editable ? 'edit' : 'view'
                })}
              >
                <Text style={{fontSize: 16, padding: 4}}>{item.title}</Text>
              </TouchableHighlight>
            }
          />
        </View>

        <EventEditor
          data={this.state.selectedEvent}
          visible={!!this.state.selectedEvent}
          type={this.state.eventEditingType}
          onFinish={(data) => {
            if(data.sourceData) {
              this._updateOrSaveEvent(data.sourceData, data.editedData);
            }
            this.setState({selectedEvent: undefined});
          }}
        />

      </View>
    );
  }

  async _fetchEvents(startTime, endTime, calendars) {
    const events = await RNCalendarEventsWrapper.fetchEvents(startTime, endTime, calendars);
    this.setState({events: _.map(_.range(events.length), (i) => ({...events[i], key: i}))});
  }

  _renderNotReady() {
    let status;
    if(!this.state.authorized) {
      status = 'Not authorized to access calendars';
    } else {
      status = 'Loading calendars';
    }

    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
        <Text>{status}</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('App', () => App);
