import React, { useCallback } from 'react';
import { CustomPicker, TwitterPicker } from 'react-color';

const colors = ['#f2994a', '#7DCCEE', '#27AE60', '#F0BD3B', '#DD755E', '#333333'];

const CustomColorPicker = (props) => {

  const handleChangeComplete = useCallback((color) => {
    props.set_theme(color.hex);
  }, []);

  const customColor = {
    backgroundColor: props.theme,
    height: '40px',
    width: '40px',
    borderRadius: '4px',
  };

  return (
    <div className='d-flex align-items-center justify-content-between'>
      <TwitterPicker triangle='hide' colors={colors} color={props.theme} onChangeComplete={handleChangeComplete} width='400px' />
      <div style={customColor} />
    </div>
  );
};

export default CustomPicker(CustomColorPicker);
