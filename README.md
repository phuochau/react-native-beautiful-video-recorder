react-native-beautiful-video-recorder
===

The video recorder component that extends from `react-native-camera`. It works for both iOS & Android.

![Sample](Screenshot.PNG)

## Features:
- Record video on iOS and Android.
- Support `cameraOptions` and `recordAsyncOptions` from `react-native-camera`

## Installation

```bash
yarn add react-native-beautiful-video-recorder react-native-camera react-native-vector-icons
```

Follow `react-native-camera` & `react-native-vector-icons` for linking native libraries.

Please file an issue if you have any trouble!
## Configuration
### iOS
With iOS 10 and higher you need to add the "Privacy - Camera Usage Description" key to the info.plist of your project. This should be found in `your_project/ios/your_project/Info.plist`. Add the following code:

```
<key>NSCameraUsageDescription</key>
<string>Your message to user when the camera is accessed for the first time</string>

<!-- Include this only if you are planning to use the microphone for video recording -->
<key>NSMicrophoneUsageDescription</key>
<string>Your message to user when the microsphone is accessed for the first time</string>
```

### Android
Add permissions in your Android Manifest (required for video recording feature)

```
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## Usage

```jsx
import VideoRecorder from 'react-native-beautiful-video-recorder';
....

start = () => {
	// 30 seconds
	this.videoRecorder.open({ maxLength: 30 },(data) => {
		console.log('captured data', data);
	});
}

render() {
	return (
		<View>
			......
		  <TouchableOpacity onPress={this.start}>
		  	<Text>Start</Text>
		  </TouchableOpacity>
		  <VideoRecorder ref={(ref) => { this.videoRecorder = ref; }} />
		</View>
	);
}
```

## Properties

param | Info
------ | ----
cameraOptions | https://github.com/react-native-community/react-native-camera/blob/master/docs/RNCamera.md
recordOptions | https://github.com/react-native-community/react-native-camera/blob/master/docs/RNCamera.md

## Callback Data

The calback will be fulfilled with an object with some of the following properties:

- `uri`: (string) the path to the video saved on your app's cache directory.

- `videoOrientation`: (number) orientation of the video

- `deviceOrientation`: (number) orientation of the device

- `iOS` `codec`: the codec of the recorded video. One of `RNCamera.Constants.VideoCodec`

- `isRecordingInterrupted`: (boolean) whether the app has been minimized while recording

## Todo
- Support playback before saving.
- Switch camera.

## License
MIT

## Contact
kevinvovn@gmail.com
