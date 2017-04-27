import React, { PureComponent } from 'react';
import { Modal, FlatList, Text, View, Button, TouchableHighlight, StyleSheet, TextInput, ScrollView } from 'react-native';
import _ from 'lodash';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ModalSelector from './modal_selector';

export default class EventEditor extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editedData: null,
      editMode: false,
      edited: false,
      datetimePickerEditingDateField: null,
      activeSelectableTextField: null,
      activeSelectableTextFieldOptions: null,
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
    this.setState({ editedData: newData });
  }

  _editDate(fieldName) {
    const date = this._getField(fieldName);
    this.setState({ datetimePickerEditingDateField: fieldName });
  }

  _isEditMode() {
    return this.state.editMode || this.props.type === 'new';
  }

  _topBar() {
    return (
      <View style={{ marginTop: 20, height: 44, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button
          title={this._isEditMode() ? 'cancel' : 'edit'}
          disabled={this.props.type === 'view'}
          onPress={() => {
            if (this._isEditMode()) {
              this.setState({ editedData: null });
            }
            if (this.props.type === 'new') {
              this.props.onFinish({});
              return;
            }
            this.setState({ editMode: !this._isEditMode() });
          }}
        />
        <Button
          title='done'
          disabled={
            !this._getField('title') ||
            !this._getField('title').length === 0 ||
            !this._getField('startDate') ||
            !this._getField('endDate')
          }
          onPress={() => {
            this.props.onFinish({
              sourceData: this.props.data,
              editedData: this.state.editedData,
              editMode: false
            });
            this.setState({
              editedData: null,
              editMode: false
            });
          }}
        />
      </View>
    );
  }

  _dateRowForField(fieldName) {
    return (
      <View style={styles.editableItem}>
        <Text style={styles.editableItemLabel}>{fieldName}: </Text>
        <View style={styles.editableItemData}>
          <Button
            title={(() => {
              const date = this._getField(fieldName);
              if (date) return date.toLocaleString();
              return 'tap to set the date';
            })()}
            disabled={!this._isEditMode()}
            onPress={() => this.setState({ datetimePickerEditingDateField: fieldName })}
            style={styles.editableItemData}
          />
        </View>
      </View>
    );
  }

  _dateTimePickerForDateFields() {
    return (
      <DateTimePicker
        mode='datetime'
        isVisible={!!this.state.datetimePickerEditingDateField}
        onCancel={() => this.setState({ datetimePickerEditingDateField: null })}
        onConfirm={(date) => {
          date.setSeconds(0, 0);
          this._mergeEditedFieldIntoState(this.state.datetimePickerEditingDateField, date);
          this.setState({ datetimePickerEditingDateField: null });
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
    );
  }

  _textRowForField(field) {
    return (
      <View style={styles.editableItem}>
        <Text style={styles.editableItemLabel}>{`${field.charAt(0).toUpperCase() + field.slice(1)}: `}</Text>
        <TextInput
          placeholder={`type event ${field} here`}
          defaultValue={this._getField(field)}
          onChangeText={(text) => this._mergeEditedFieldIntoState(field, text)}
          style={[styles.editableItemData, { textAlignVertical: 'center', textAlign: 'center', paddingTop: 20 }]}
          editable={this._isEditMode()}
        />
      </View>
    );
  }

  _selectableTextRowForField(field, options) {
    return (
      <View>
        <Text style={styles.editableItemLabel}>{`${field.charAt(0).toUpperCase() + field.slice(1)}: `}</Text>
        <Button
          title={this._getField(field) || 'none'}
          disabled={!this._isEditMode() || this._getField(field) === 'unsupported'}
          onPress={() => this.setState({
            activeSelectableTextField: field,
            activeSelectableTextFieldOptions: options
          })}
        />
      </View>
    )
  }

  _modalSelectorForSelectableTextFields() {
    return (<ModalSelector
      visible={!!this.state.activeSelectableTextField}
      data={!this.state.activeSelectableTextField ? [] :
        _.map(_.range(this.state.activeSelectableTextFieldOptions.length), (i) => ({
          key: i,
          title: this.state.activeSelectableTextFieldOptions[i]
        }))
      }
      onCancel={() => this.setState({activeSelectableTextField: null})}
      onSelection={(key) => {
        this._mergeEditedFieldIntoState(this.state.activeSelectableTextField, this.state.activeSelectableTextFieldOptions[key]);
        this.setState({activeSelectableTextField: null});
      }}
    />);
  }

  render() {
    return (
      <Modal
        animationType="slide"
        visible={this.props.visible}
        onRequestClose={() => {}}
      >
        {this._topBar()}

        <View style={{ backgroundColor: 'ghostwhite' }}>
          {this._dateTimePickerForDateFields()}
          {this._modalSelectorForSelectableTextFields()}

          {this._textRowForField('title')}
          {this._dateRowForField('startDate')}
          {this._dateRowForField('endDate')}
          {this._selectableTextRowForField('availability', ['free', 'busy', 'tentative'])}
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