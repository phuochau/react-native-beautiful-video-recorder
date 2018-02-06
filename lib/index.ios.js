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
import Icon from 'react-native-vector-icons/MaterialIcons';
import RecordingButton from './RecordingButton';
import Loader from './Loader';
import styles from './style';

export default class VideoRecorder extends Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    compressQuality: PropTypes.string,
  }

  static defaultProps = {
    isOpen: false,
    compressQuality: 'medium',
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
    InteractionManager.runAfterInteractions(() => {
      this.setState({ loading: false });
    });
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
    InteractionManager.runAfterInteractions(() => {
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
    });
  }

  stopCapture = () => {
    InteractionManager.runAfterInteractions(() => {
      this.stopTimer();
      this.camera.stopCapture();
      this.setState({
        isRecording: false,
      });
    });
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.setState({ time: this.state.time + 1 });
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
          <Text style={styles.durationText}>
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
                <View style={styles.btnUseContainer}>
                  <Icon style={styles.btnUseText} name="done" size={24} color="white" />
                </View>
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
          <Text style={styles.convertingText}>Converting video to MP4...</Text>
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
            <TouchableOpacity onPress={this.close} style={styles.buttonClose}>
              <Icon name="close" size={32} color={'white'} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}
