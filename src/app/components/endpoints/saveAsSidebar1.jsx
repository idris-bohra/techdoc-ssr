import React, { useEffect, useRef, useState } from 'react'
import Input from '../common/input'
import { trimString } from '../common/utility'
import IconButtons from '../common/iconButton'
import { MdOutlineClose } from 'react-icons/md'
import ShowCaseSaveAsModal from './showCaseSaveAsModal/showCaseSaveAsModal1'
import './endpoints.scss'

const SaveAsPageSidebar = (props) => {
  const saveAsSidebarStyle = {
    position: 'fixed',
    background: 'white',
    zIndex: '1050',
    top: '0px',
    right: '0px',
    height: '100vh',
    width: '35vw',
    boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
    overflow: 'hidden'
  }

  const [data, setData] = useState({ name: '' })

  const title = data.name
  const saveAsSidebar = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const newData = { ...data, name: props?.name }
    setData(newData)
  }, [props?.name])

  const handlePageNameChange = (e) => {
    setData((prevState) => ({ ...prevState, name: e?.currentTarget?.value }))
    props.setName(e?.currentTarget?.value)
  }

  const handlePageNameBlur = (e) => {
    if (!trimString(e.currentTarget.value)) {
      setData({ ...data, name: 'Untitled' })
    }
  }

  return (
    <div tabIndex={-1} ref={saveAsSidebar} style={saveAsSidebarStyle} className='save-as-sidebar-container'>
      <div className='custom-collection-modal-container modal-header align-items-center'>
        <div className='modal-title h4'>Save Page</div>
        <IconButtons>
          <MdOutlineClose className='font-18' onClick={props.onHide} />
        </IconButtons>
      </div>
      <div className='drawer-body'>
        <form className='desc-box form-parent' onSubmit={props.handleSubmit}>
          <div className='p-form-group mb-3'>
            <Input ref={inputRef} value={props?.name} onChange={handlePageNameChange} onBlur={handlePageNameBlur} placeholder={'Page Name'} mandatory={'mandatory'} firstLetterCapitalize label={'Name'} />
            {title === '' || title === 'Untitled' ? <small className='text-danger'>Please enter the Title</small> : <div />}
          </div>
        </form>
        <ShowCaseSaveAsModal pageId={props.pageId} name={props.name} onHide={props.onHide} />
      </div>
    </div>
  )
}

export default SaveAsPageSidebar