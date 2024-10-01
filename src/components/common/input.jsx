import React, { forwardRef } from 'react'

const Input = forwardRef((props, ref) => {
  const inputStyle = props?.firstLetterCapitalize ? { textTransform: 'capitalize' } : {}
  return (
    <div className='form-group'>
      <label htmlFor={props?.name} className='custom-input-label'>
        {props?.label}
      </label>
      {props?.mandatory && <span className='alert alert-danger'>*</span>}
      <input
        defaultValue={props?.defaultValue}
        value={props?.value}
        ref={ref}
        onChange={props?.onChange}
        onBlur={props?.onBlur}
        id={props?.name}
        name={props?.name}
        className='form-control custom-input'
        type='text'
        placeholder={props?.placeholder}
        disabled={props?.disabled}
        style={inputStyle}
      />
      <div>
        <small className='muted-text'>{props?.note}</small>
      </div>
      {props?.error && <div className='alert alert-danger'>{props?.error}</div>}
    </div>
  )
})
export default Input