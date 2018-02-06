import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types'
import styles from './style';
const Spinner = require('react-native-spinkit');

// we will change component later
export default class Loader extends Component {
  static propTypes = {
    style: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.object]),
    isVisible: PropTypes.bool,
    size: PropTypes.number,
    color: PropTypes.string,
    type: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  }

  static defaultProps = {
    isVisible: true,
    size: 48,
    type: 'Bounce',
    color: '#ffffff',
  }

  render() {
    const { style, isVisible, size, type, color, children } = this.props;
    return (
      <View style={[styles.container, style]}>
        <Spinner isVisible={isVisible} size={size} type={type} color={color} />
        {children}
      </View>
    );
  }

}
