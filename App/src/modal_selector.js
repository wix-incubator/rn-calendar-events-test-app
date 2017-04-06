import React, {PureComponent} from 'react';
import {Modal, FlatList, Button} from 'react-native';

export default class ModalSelector extends PureComponent {
  render() {
    return (
      <Modal
        animationType="slide"
        visible={this.props.visible}
      >
        <FlatList style={{marginTop: 20}}
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