import React, {PureComponent} from 'react';
import {Modal, View, FlatList, Button} from 'react-native';

export default class ModalSelector extends PureComponent {
  render() {
    return (
      <Modal
        animationType="slide"
        visible={this.props.visible}
        onRequestClose={this.props.onCancel}
      >
        <View style={{marginTop: 20}}/>
        <Button
          title="Cancel"
          onPress={this.props.onCancel}
        />
        <FlatList
          style={{marginTop: 20}}
          data={this.props.data}
          renderItem={({item}) => 
            <Button
              title={item.title}
              onPress={() => this.props.onSelection(item.key)}
            />
          }
        />
      </Modal>
    );
  }
}