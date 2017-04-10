import React, {PureComponent} from 'react';
import {Modal, FlatList, Text, View, Button, TouchableHighlight, StyleSheet, TextInput, ScrollView} from 'react-native';
import _ from 'lodash';
import DateTimePicker from 'react-native-modal-datetime-picker';

export default class EventEditor extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editedData: null,
      editMode: false,
      edited: false,
      datetimePickerEditingDateField: null
    };

    this._getField = this._getField.bind(this);
    this._mergeEditedFieldIntoState = this._mergeEditedFieldIntoState.bind(this);
    this._editDate = this._editDate.bind(this);
    this._isEditMode = this._isEditMode.bind(this);
  }

  _getField(field) {
    return _.get(this.state.editedData, field) || _.get(this.props.data, field);
  }

  _mergeEditedFieldIntoState(field, value) {
    let newData = _.clone(this.state.editedData || {});
    newData[field] = value;
    this.setState({editedData: newData});
  }

  _editDate(fieldName) {
    const date = this._getField(fieldName);
    this.setState({datetimePickerEditingDateField: fieldName});
  }

  _isEditMode() {
    return this.state.editMode || this.props.type === 'new';
  }

  _dateRowForField(fieldName) {
    return (
      <View style={styles.editableItem}>
        <Text style={styles.editableItemLabel}>{fieldName}: </Text>
        <View style={styles.editableItemData}>
          <Button
            title={(() => {
              const date = this._getField(fieldName);
              if(date) return date.toLocaleString();
              return 'tap to set the date';
            })()}
            disabled={!this._isEditMode()}
            onPress={() => this.setState({datetimePickerEditingDateField: fieldName})}
            style={styles.editableItemData}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <Modal
        animationType="slide"
        visible={this.props.visible}
      >
        <View style={{marginTop: 20, height: 44, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Button
            title={this._isEditMode() ? 'cancel' : 'edit'}
            disabled={this.props.type === 'view'}
            onPress={() => {
              if(this._isEditMode()) {
                this.setState({editedData: null});
              }
              if(this.props.type === 'new') {
                this.props.onFinish({});
                return;
              }
              this.setState({editMode: !this._isEditMode()});
            }}
          />
          <Button
            title='done'
            disabled={
              ! this._getField('title') ||
                ! this._getField('title').length === 0 ||
                ! this._getField('startDate') ||
                ! this._getField('endDate')
            }
            onPress={() => {
              this.props.onFinish({
                sourceData: this.props.data,
                editedData: this.state.editedData,
                editMode: false
              });
              this.setState({editedData: null});
            }}
          />
        </View>

        <View style={{backgroundColor: 'ghostwhite'}}>
          <View style={styles.editableItem}>
            <Text style={styles.editableItemLabel}>Title: </Text>
            <TextInput
              placeholder='type event title here'
              defaultValue={this._getField('title')}
              onChangeText={(text) => this._mergeEditedFieldIntoState('title', text)}
              style={[styles.editableItemData, {textAlignVertical: 'center', textAlign: 'center', paddingTop:20}]}
              editable={this._isEditMode()}
            />
          </View>

          {this._dateRowForField('startDate')}
          {this._dateRowForField('endDate')}

          <DateTimePicker
            mode='datetime'
            isVisible={!!this.state.datetimePickerEditingDateField}
            onCancel={() => this.setState({datetimePickerEditingDateField: null})}
            onConfirm={(date) => {
              date.setSeconds(0, 0);
              this._mergeEditedFieldIntoState(this.state.datetimePickerEditingDateField, date);
              this.setState({datetimePickerEditingDateField: null});
            }}
            minimumDate={
              this.state.datetimePickerEditingDateField === 'endDate' ?
                (this._getField('startDate') || undefined) : undefined
            }
            maximumDate={
              this.state.datetimePickerEditingDateField === 'startDate' ?
                (this._getField('endDate') || undefined) : undefined
            }
            date={this._getField(this.state.datetimePickerEditingDateField) || undefined}
          />
        </View>

        <ScrollView>
          <Text>
            Event JSON:{'\n'}
            {JSON.stringify(this.props.data, null, '  ')}
          </Text>
        </ScrollView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  editableItem: {
    flexDirection: 'row',
    height: 50
  },
  editableItemLabel: {
    fontSize: 16,
    width: 100,
    textAlignVertical: 'center'
  },
  editableItemData: {
    flex: 1
  }
});