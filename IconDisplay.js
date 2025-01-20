import React from 'react';

import { libraries } from './IconConfig';

const IconDisplay = ({ library, icon, size = 40, color = 'black', onPress, disabled }) => {
  const IconComponent = libraries[library]?.default;

  if (!IconComponent) {
    console.warn(`Icon library "${library}" is not supported.`);
    return null;
  }

  return <IconComponent name={icon} size={size} color={color} onPress={onPress} disabled={disabled}/>;
};

export default IconDisplay;
