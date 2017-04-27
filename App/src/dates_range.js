import React, {PureComponent} from 'react';
import {Modal, Button, View} from 'react-native';
import RNDates from 'react-native-dates';

export default class ModalSelector extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      focusedInput: 'startDate',
      pickerVisible: false
    };
  }

  render() {
    return (
      <View>
        <Button
          title={`${this.state.startDate.toDateString()}  ..  ${this.state.endDate.toDateString()}`}
          onPress={() => this.setState({pickerVisible: true})}
        />

        <Modal
          animationType="slide"
          visible={this.state.pickerVisible}
          onRequestClose={() => this.setState({pickerVisible:false})}
        >
          <RNDates
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            focusedInput={this.state.focusedInput}
            onDatesChange={
              ({startDate, endDate, focusedInput}) => {
                this.setState({focusedInput}, () => {
                  this.setState({
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                  })
                })
              }
            }
            isDateBlocked={() => false}
            range={true}
          />

          <Button
            title="Done"
            onPress={() => {
              this.setState({pickerVisible:false});
              this.props.onChange(new Date(this.state.startDate), new Date(this.state.endDate));
            }}
          />
        </Modal>
      </View>
    );
  }
}