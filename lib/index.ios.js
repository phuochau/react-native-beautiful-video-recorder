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
import Camera from 'react-native-camera';
import Compress from 'react-native-compress';
import RecordingButton from './RecordingButton';
import Loader from './Loader';
import styles, { buttonClose, durationText, renderClose, renderDone } from './style';

export default class VideoRecorder extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    runAfterInteractions: PropTypes.bool,
    compressQuality: PropTypes.string,
    convertingText: PropTypes.string,
    buttonCloseStyle: PropTypes.shape({}),
    durationTextStyle: PropTypes.shape({}),
    maxLength: PropTypes.number,
    renderClose: PropTypes.func,
    renderDone: PropTypes.func,
  }

  static defaultProps = {
    isOpen: false,
    runAfterInteractions: true,
    compressQuality: 'medium',
    convertingText: 'Converting video to MP4...',
    buttonCloseStyle: buttonClose,
    durationTextStyle: durationText,
    maxLength: -1,
    renderClose,
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
      converting: false,
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
    const { compressQuality } = this.props;
    if (this.callback) {
      this.setState({ converting: true }, () => {
        Compress.compressVideo(this.state.recordedData.path, compressQuality).then((result) => {
          console.log('New video path', result);
          this.callback({
            path: result.path,
            mime: 'video/mp4',
          });
          this.close();
        });
      });
    } else this.close();
  }

  open = (callback) => {
    this.callback = callback;
    this.setState({
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
      this.camera.capture()
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
    if ((this.props.maxLength > 0) || (this.props.maxLength < 0)) {
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
      this.camera.stopCapture();
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
      if (this.props.maxLength > 0 && time >= this.props.maxLength) {
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
      <Camera
        ref={(cam) => { this.camera = cam; }}
        style={styles.preview}
        captureAudio
        captureMode={Camera.constants.CaptureMode.video}
        captureTarget={Camera.constants.CaptureTarget.temp}
        aspect={Camera.constants.Aspect.fill}>
        {this.renderContent()}
      </Camera>
    );
  }

  renderLoader() {
    if (this.state.converting) {
      return (
        <Loader style={styles.backdrop}>
          <Text style={styles.convertingText}>{this.props.convertingText}</Text>
        </Loader>
      );
    }
    return null;
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
              {this.renderLoader()}
            </View>
            <TouchableOpacity onPress={this.close} style={this.props.buttonCloseStyle}>
              {this.props.renderClose()}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}
