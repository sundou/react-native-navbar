import React, { Component, PropTypes } from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  Platform,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
// var Dimensions = require('Dimensions');
// import Dimensions from 'Dimensions';
var screenWidth = Dimensions.get('window').width;

import NavbarButton from './NavbarButton';
import styles from './styles';

const ButtonShape = {
  title: PropTypes.string.isRequired,
  style: View.propTypes.style,
  handler: PropTypes.func,
  disabled: PropTypes.bool,
};

const TitleShape = {
  title: PropTypes.string.isRequired,
  tintColor: PropTypes.string,
};

const StatusBarShape = {
  style: PropTypes.oneOf(['light-content', 'default']),
  hidden: PropTypes.bool,
  tintColor: PropTypes.string,
  hideAnimation: PropTypes.oneOf(['fade', 'slide', 'none']),
  showAnimation: PropTypes.oneOf(['fade', 'slide', 'none']),
};

function getButtonElement(data, style) {
  return (
    <View style={styles.navBarButtonContainer}>
      {(!data || data.props) ? data : (
        <NavbarButton
          title={data.title}
          style={[data.style, style]}
          tintColor={data.tintColor}
          handler={data.handler}
          accessible={data.accessible}
          accessibilityLabel={data.accessibilityLabel}
        />
      )}
    </View>
  );
}

function getTitleElement(data) {
  if (!data || data.props) {
    return <View style={styles.customTitle}>{data}</View>;
  }

  const colorStyle = data.tintColor ? { color: data.tintColor } : null;

  return (
    <View style={styles.navBarTitleContainer}>
      <Text style={[styles.navBarTitleText, data.style, colorStyle]}>
        {data.title}
      </Text>
    </View>
  );
}

export default class NavigationBar extends Component {
  static propTypes = {
    style: View.propTypes.style,
    tintColor: PropTypes.string,
    statusBar: PropTypes.shape(StatusBarShape),
    leftButton: PropTypes.oneOfType([
      PropTypes.shape(ButtonShape),
      PropTypes.element,
      React.PropTypes.oneOf([null]),
    ]),
    rightButton: PropTypes.oneOfType([
      PropTypes.shape(ButtonShape),
      PropTypes.element,
      React.PropTypes.oneOf([null]),
    ]),
    title: PropTypes.oneOfType([
      PropTypes.shape(TitleShape),
      PropTypes.element,
      React.PropTypes.oneOf([null]),
    ]),
    containerStyle: View.propTypes.style,
  };

  static defaultProps = {
    style: {},
    tintColor: '',
    leftButton: null,
    rightButton: null,
    title: null,
    statusBar: {
      style: 'default',
      hidden: false,
      hideAnimation: 'slide',
      showAnimation: 'slide',
    },
    containerStyle: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      btnRotateZ: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.customizeStatusBar();
    this.beginRotate();
  }

  componentWillReceiveProps() {
    this.customizeStatusBar();
  }

  beginRotate() {
      this.state.btnRotateZ.setValue(0);
      Animated.timing(this.state.btnRotateZ, {
        toValue:100,
        duration: 35000,
        easing: Easing.linear ,
      }).start(() => this.beginRotate());
  }

  customizeStatusBar() {
    const { statusBar } = this.props;
    if (Platform.OS === 'ios') {
      if (statusBar.style) {
        StatusBar.setBarStyle(statusBar.style);
      }

      const animation = statusBar.hidden ?
        statusBar.hideAnimation : statusBar.showAnimation;

      StatusBar.showHideTransition = animation;
      StatusBar.hidden = statusBar.hidden;
    }
  }

  render() {
    const {
      containerStyle,
      tintColor,
      title,
      leftButton,
      rightButton,
      style,
    } = this.props;
    const customTintColor = tintColor ? { backgroundColor: tintColor } : null;

    const customStatusBarTintColor = this.props.statusBar.tintColor ?
      { backgroundColor: this.props.statusBar.tintColor } : null;

    let statusBar = null;

    if (Platform.OS === 'ios') {
      statusBar = !this.props.statusBar.hidden ?
        <View style={[styles.statusBar, customStatusBarTintColor]} /> : null;
    }

    return (
      <View style={[styles.navBarContainer, containerStyle, customTintColor,{width:screenWidth}]}>
        <View style={[{height: styles.navBar.height}, style,{
          overflow: 'hidden',
        }]}>

          <Image source={require('./asset/navBarBg.png')}
            style={{position:'absolute', top:0,bottom:0,
            width:screenWidth,
            right:0,left:0,height:style.height || styles.navBar.height}}
          />
          <Animated.Image source={require('./asset/ball.png')}
            resizeMode='contain'
            style={{position:'absolute', top:0,left:0,
            width:screenWidth,height:screenWidth,
            transform: [
            {rotateZ: this.state.btnRotateZ.interpolate({
              inputRange:[0, 100],
              outputRange:['0deg','360deg'],
              })
            },
            {perspective: 1000},
          ]
          }}/>


          {statusBar}

          <View style={[styles.navBar,{
          height: Platform.OS === 'ios'? styles.navBar.height-styles.statusBar.height
          :styles.navBar.height}]}>
          {getTitleElement(title)}
          {getButtonElement(leftButton, { marginLeft: 8 })}
          {getButtonElement(rightButton, { marginRight: 8 })}
          </View>
        </View>
      </View>
    );
  }
}
