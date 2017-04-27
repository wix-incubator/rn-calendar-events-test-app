import RNCalendarEvents from 'react-native-calendar-events';
import _ from 'lodash';

let instance = null;

class ReactNativeCalendarEventsWrapper {
  constructor() {
    if(instance) {
      return instance;
    }

    instance = this;
    
    this._authorizationStatus = null;
    this._calendars = [];
  }

  isAuthhorized() {
    return this._authorizationStatus === "authorized";
  }

  async authorize() {
    await RNCalendarEvents.authorizeEventStore();
    this._authorizationStatus = await RNCalendarEvents.authorizationStatus();
  }

  async findCalendars() {
    const data = await RNCalendarEvents.findCalendars();
    this._calendars = _.map(data, (x) => ({
      id: x.id,
      title: x.title,
      editable: x.allowsModifications
    }))
  }

  calendarsList() {
    return this._calendars;
  }

  async fetchEvents(startDate, endDate, calendars) {
    var startDateTime = new Date(startDate);
    var endDateTime = new Date(endDate);

    const data = await RNCalendarEvents.fetchAllEvents( startDateTime.toISOString(), endDateTime.toISOString(), calendars);
    return _.map(data, (event) => ({
      rawData: event,
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      eventId: event.id,
      calendarId: event.calendar.id,
      availability: event.availability,
    }));
  }

  async saveOrUdpateEvent(title, startDate, endDate, availability, calendarId, eventId) {
    let settings = {
      startDate: JSON.parse(JSON.stringify(startDate)),
      endDate: JSON.parse(JSON.stringify(endDate)),
      availability: availability,
      calendarId: calendarId || undefined,
    }
    if(eventId) {
      settings.id = eventId;
    }
    RNCalendarEvents.saveEvent(title, settings);
  }
}

export default new ReactNativeCalendarEventsWrapper();