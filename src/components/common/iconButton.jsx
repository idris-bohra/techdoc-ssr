import React from 'react';
import './iconButton.scss'

export default function IconButton(props) {
  return (
    <div onClick={props?.onClick} className={props?.variant === 'sm' ? 'icon-button-sm' : 'icon-button'}>
      {props.children}
    </div>
  )
}