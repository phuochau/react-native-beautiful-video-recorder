import React, { Component, PropTypes } from 'react';
import {
  TouchableOpacity,
  View,
  LayoutAnimation,
} from 'react-native';
import styles from './style';

export default class RecordingButton extends Component {

  static propTypes = {
    isRecording: PropTypes.bool,
    onStartPress: PropTypes.func,
    onStopPress: PropTypes.func,
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  renderRecording() {
    return (
      <TouchableOpacity onPress={this.props.onStopPress}
        style={[styles.buttonContainer, styles.buttonStopContainer]}>
        <View style={styles.buttonStop}></View>
      </TouchableOpacity>
    );
  }

  renderWaiting() {
    return (
      <TouchableOpacity onPress={this.props.onStartPress} style={styles.buttonContainer}>
        <View style={styles.circleInside}></View>
      </TouchableOpacity>
    );
  }

  render() {
    if (this.props.isRecording) {
      return this.renderRecording();
    }
    return this.renderWaiting();
  }
}
