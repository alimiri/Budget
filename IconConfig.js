// IconConfig.js
import * as FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Ionicons from 'react-native-vector-icons/Ionicons';
import * as EvilIcons from 'react-native-vector-icons/EvilIcons';

import IoniconsList from './assets/Ionicons.json';

// Icon libraries
export const libraries = {
  FontAwesome,
  MaterialIcons,
  Ionicons,
  EvilIcons,
};

// Available icons in each library
export const iconData = {
  FontAwesome: ['star', 'heart', 'car', 'camera'],
  MaterialIcons: ['home', 'account-circle', 'alarm', 'pets'],
  Ionicons: Object.keys(IoniconsList),
  EvilIcons: ['archive', 'bell', 'camera', 'credit-card'],
};
