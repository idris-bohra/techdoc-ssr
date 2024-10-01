import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Input from '../common/input'
import { trimString } from '../common/utility'
import IconButtons from '../common/iconButton'
import { MdOutlineClose } from 'react-icons/md'
import ShowCaseSaveAsModal from './showCaseSaveAsModal/showCaseSaveAsModal'
import './endpoints.scss'

const SaveAsSidebar = (props) => {
  const saveAsSidebarStyle = {
    position: 'fixed',
    background: 'white',
    zIndex: '1050',
    top: '41px',
    right: '0px',
    height: '100vh',
    width: '35vw',
    boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
    overflow: 'hidden'
  }

  const [data, setData] = useState({
    name: '',
    description: ''
  })

  const title = data.name
  const saveAsSidebar = useRef(null)
  const inputRef = useRef(null)

  const pages = useSelector((state) => state.pages)

  useEffect(() => {
    const newData = { ...data, name: props?.name }
    setData(newData)
  }, [props?.name])

  const handleEndpointNameChange = (e) => {
    const dummyData = { ...props?.endpointContent }
    dummyData.data.name = e.currentTarget.value
    setData((prevState) => ({ ...prevState, name: e?.currentTarget?.value }))
    props.setQueryUpdatedData(dummyData)
  }

  const handleEndpointNameBlur = (e) => {
    if (!trimString(e.currentTarget.value)) {
      if (props?.params?.endpointId !== 'new') {
        props.setQueryUpdatedData({
          ...props.endpointContent,
          data: {
            ...props.endpointContent.data,
            name: pages?.[props?.params?.endpointId]?.name || ''
          }
        })
      } else {
        props.setQueryUpdatedData({
          ...props.endpointContent,
          data: { ...props.endpointContent.data, name: 'Untitled' }
        })
      }
    }
  }

  const handleEndpointSaveAsEndpointNameChange = (e) => {
    setData({ ...data, name: e.currentTarget.value })
  }

  const handleSaveAsEndpointNameBlur = (e) => {
    if (!trimString(e.currentTarget.value)) {
      setData({ ...data, name: props?.endpointContent?.data?.name })
    }
  }

  const renderEndpointNameInput = () => {
    return (
      <Input
        ref={inputRef}
        value={props?.endpointContent?.data?.name || ''}
        onChange={handleEndpointNameChange}
        onBlur={handleEndpointNameBlur}
        placeholder={'Endpoint Name'}
        mandatory={'mandatory'}
        firstLetterCapitalize
        label={'Name'}
      />
    )
  }

  const renderSaveAsExistingEndpointInput = () => {
    return (
      <Input
        value={data.name}
        onChange={handleEndpointSaveAsEndpointNameChange}
        onBlur={handleSaveAsEndpointNameBlur}
        placeholder={'Endpoint Name'}
        mandatory={'mandatory'}
        firstLetterCapitalize
        label={'Name'}
      />
    )
  }

  return (
    <div tabIndex={-1} ref={saveAsSidebar} style={saveAsSidebarStyle} className='save-as-sidebar-container'>
      <div className='custom-collection-modal-container modal-header align-items-center'>
        <div className='modal-title h4'>{props.location.pathname.split('/')[5] !== 'new' ? 'Save As' : 'Save'}</div>
        <IconButtons>
          <MdOutlineClose className='font-18' onClick={props.onHide} />
        </IconButtons>
      </div>
      <div className='drawer-body'>
        <form className='desc-box form-parent' onSubmit={props.handleSubmit}>
          <div className='p-form-group mb-3'>
            {props?.params?.endpointId === 'new' ? renderEndpointNameInput() : renderSaveAsExistingEndpointInput()}
            {title?.trim() === '' || title === 'Untitled' ? <small className='text-danger'>Please enter the Title</small> : <div />}
          </div>
        </form>
        <ShowCaseSaveAsModal save_endpoint={props.save_endpoint} name={data.name} description={data.description} onHide={props.onHide} />
      </div>
    </div>
  )
}

export default SaveAsSidebar
