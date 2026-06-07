import { Link as RouterLink } from 'expo-router';
import React from 'react';
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableHighlight as RNTouchableHighlight,
  View as RNView,
} from 'react-native';
import { useCssElement, useNativeVariable as useFunctionalVariable } from 'react-native-css';
import Animated from 'react-native-reanimated';

export const useCSSVariable =
  process.env.EXPO_OS !== 'web' ? useFunctionalVariable : (variable) => `var(${variable})`;

export const Link = (props) => useCssElement(RouterLink, props, { className: 'style' });
Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

export const View = (props) => useCssElement(RNView, props, { className: 'style' });
View.displayName = 'CSS(View)';

export const Text = (props) => useCssElement(RNText, props, { className: 'style' });
Text.displayName = 'CSS(Text)';

export const ScrollView = (props) =>
  useCssElement(RNScrollView, props, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
  });
ScrollView.displayName = 'CSS(ScrollView)';

export const Pressable = (props) => useCssElement(RNPressable, props, { className: 'style' });
Pressable.displayName = 'CSS(Pressable)';

export const TextInput = (props) => useCssElement(RNTextInput, props, { className: 'style' });
TextInput.displayName = 'CSS(TextInput)';

export const AnimatedScrollView = (props) =>
  useCssElement(Animated.ScrollView, props, {
    className: 'style',
    contentClassName: 'contentContainerStyle',
    contentContainerClassName: 'contentContainerStyle',
  });

function TouchableHighlightBase(props) {
  const { underlayColor, ...style } = StyleSheet.flatten(props.style) || {};
  return <RNTouchableHighlight underlayColor={underlayColor} {...props} style={style} />;
}

export const TouchableHighlight = (props) => useCssElement(TouchableHighlightBase, props, { className: 'style' });
TouchableHighlight.displayName = 'CSS(TouchableHighlight)';
