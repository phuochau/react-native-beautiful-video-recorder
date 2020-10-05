import React, { Component } from 'react';
import {
  Modal,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Text,
  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types'
import moment from 'moment';
import { RNCamera } from 'react-native-camera';
import RecordingButton from './RecordingButton';
import styles, { 
  buttonClose, 
  durationText, 
  renderClose, 
  renderDone, 
  buttonSwitchCamera,
  renderSwitchCamera
} from './style';

export default class VideoRecorder extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    runAfterInteractions: PropTypes.bool,
    cameraOptions: PropTypes.shape({}),
    recordOptions: PropTypes.shape({}),
    buttonCloseStyle: PropTypes.shape({}),
    buttonSwitchCameraStyle: PropTypes.shape({}),
    durationTextStyle: PropTypes.shape({}),
    renderClose: PropTypes.func,
    renderSwitchCamera: PropTypes.func,
    renderDone: PropTypes.func,
  }

  static defaultProps = {
    isOpen: false,
    runAfterInteractions: true,
    cameraOptions: {},
    recordOptions: {},
    buttonCloseStyle: buttonClose,
    buttonSwitchCameraStyle: buttonSwitchCamera,
    durationTextStyle: durationText,
    renderClose,
    renderSwitchCamera: renderSwitchCamera,
    renderDone,
  }

  constructor(...props) {
    super(...props);
    this.state = {
      isOpen: this.props.isOpen,
      loading: true,
      time: 0,
      recorded: false,
      recordedData: null,
      cameraType: this.props.cameraOptions.type || RNCamera.Constants.Type.back
    };
  }

  componentDidMount() {
    const doPostMount = () => this.setState({ loading: false });
    if (this.props.runAfterInteractions) {
      InteractionManager.runAfterInteractions(doPostMount);
    } else {
      doPostMount();
    }
  }

  onSave = () => {
    if (this.callback) {
      this.callback(this.state.recordedData);
    } 
    
    this.close();
  }
  
  switchCamera = () => {
    let type = (this.state.cameraType === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back)
    if (!this.state.isRecording){
      this.setState({cameraType: type })
    }
  }

  open = (options, callback) => {
    this.callback = callback;
    this.setState({
      maxLength: -1,
      ...options,
      isOpen: true,
      isRecording: false,
      time: 0,
      recorded: false,
      recordedData: null,
      converting: false,
    });
  }

  close = () => {
    this.setState({ isOpen: false });
  }

  startCapture = () => {
    const shouldStartCapture = () => {
      this.camera.recordAsync(this.props.recordOptions)
      .then((data) => {
        console.log('video capture', data);
        this.setState({
          recorded: true,
          recordedData: data,
        });
      }).catch(err => console.error(err));
      setTimeout(() => {
        this.startTimer();
        this.setState({
          isRecording: true,
          recorded: false,
          recordedData: null,
          time: 0,
        });
      });
    };
    if ((this.state.maxLength > 0) || (this.state.maxLength < 0)) {
      if (this.props.runAfterInteractions) {
        InteractionManager.runAfterInteractions(shouldStartCapture);
      } else {
        shouldStartCapture();
      }
    }
  }

  stopCapture = () => {
    const shouldStopCapture = () => {
      this.stopTimer();
      this.camera.stopRecording();
      this.setState({
        isRecording: false,
      });
    };
    if (this.props.runAfterInteractions) {
      InteractionManager.runAfterInteractions(shouldStopCapture);
    } else {
      shouldStopCapture();
    }
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      const time = this.state.time + 1;
      this.setState({ time });
      if (this.state.maxLength > 0 && time >= this.state.maxLength) {
        this.stopCapture();
      }
    }, 1000);
  }

  stopTimer = () => {
    if (this.timer) clearInterval(this.timer);
  }

  convertTimeString = (time) => {
    return moment().startOf('day').seconds(time).format('mm:ss');
  }

  renderTimer() {
    const { isRecording, time, recorded } = this.state;
    return (
      <View>
        {
          (recorded || isRecording) &&
          <Text style={this.props.durationTextStyle}>
            <Text style={styles.dotText}>●</Text> {this.convertTimeString(time)}
          </Text>
        }
      </View>
    );
  }

  renderContent() {
    const { isRecording, recorded } = this.state;
    return (
      <View style={styles.controlLayer}>
        {this.renderTimer()}
        <View style={[styles.controls]}>
          <RecordingButton style={styles.recodingButton} isRecording={isRecording} onStartPress={this.startCapture}
            onStopPress={this.stopCapture} />
          {
            recorded &&
              <TouchableOpacity onPress={this.onSave} style={styles.btnUse}>
                {this.props.renderDone()}
              </TouchableOpacity>
          }
        </View>
      </View>
    );
  }

  renderCamera() {
    return (
      <RNCamera
        ref={(cam) => { this.camera = cam; }}
        style={styles.preview}
        {...this.props.cameraOptions}
        type={this.state.cameraType}
        captureAudio
      >
        {this.renderContent()}
      </RNCamera>
    );
  }

  render() {
    const { loading, isOpen } = this.state;
    if (loading) return <View />;
    return (
      <Modal visible={isOpen} transparent animationType="fade"
        onRequestClose={this.close}>
        <View style={styles.modal}>
          <TouchableWithoutFeedback onPress={this.close}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.container}>
            <View style={styles.content}>
              {this.renderCamera()}
            </View>
            <TouchableOpacity onPress={this.close} style={this.props.buttonCloseStyle}>
              {this.props.renderClose()}
            </TouchableOpacity>
            <TouchableOpacity onPress={this.switchCamera} style={this.props.buttonSwitchCameraStyle}>
              {this.props.renderSwitchCamera()}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}
