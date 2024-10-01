import React, { useState, useEffect } from 'react'
import { isDashboardRoute } from '../common/utility'
import './endpointBreadCrumb.scss'

function DisplayDescription(props) {

  const [description, setDescription] = useState(props?.endpoint?.description || '');

  useEffect(() => {
    if (props.endpointId === props.currentEndpointId) {
      setDescription(props?.endpoint?.description || '');
    }
  }, [props.endpointId, props.currentEndpointId, props.endpoint]);

  const handleChangeDescription = (e) => {
    const value = e.currentTarget.value
    if (value.length > 500) return;
    setDescription(value)
    props.props_from_parent(value)
  }

  return (
    <div className='endpoint-header flex-grow-1'>
      <div className={isDashboardRoute(props) ? 'panel-endpoint-name-container' : 'endpoint-name-container'}>
        {isDashboardRoute(props) && props.endpoint && <input placeholder='Write Description' value={description} onChange={handleChangeDescription} className='endpoint-description text-grey w-100' />}
      </div>
    </div>
  )
}

export default DisplayDescription