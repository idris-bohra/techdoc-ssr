import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
import { BiSolidPencil } from 'react-icons/bi'
import { Button } from 'react-bootstrap'
import { updatePage } from '../../pages/redux/pagesActions'
import { addParentPageVersion } from '../redux/collectionVersionsActions'
import { deletePage } from '../../pages/redux/pagesActions'
import { onDefaultVersion } from '../redux/collectionVersionsActions'
import OutsideClickHandler from 'react-outside-click-handler'
import './selectVersion.scss'
import { toast } from 'react-toastify'
import { getOrgId } from '../../common/utility'
import { RiDeleteBinLine } from "react-icons/ri";

const VersionInput = (props) => {
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })
  const versionNameInputRef = useRef()

  const dispatch = useDispatch()

  const onRename = (versionId) => {
    const versionChilds = pages?.[props?.parentPageId]?.child
    try {
      if (versionNameInputRef.current.value.trim().length === 0) return toast.error('Name cannot be empty')
      versionChilds.forEach((element) => {
        if (versionId !== element && pages[element]?.name.trim().toLowerCase() === versionNameInputRef.current.value.trim().toLowerCase()) {
          throw new Error('StopIteration')
        }
      })
    } catch (error) {
      return toast.error('Version Name already Exist!')
    }
    dispatch(updatePage({ ...pages?.[versionId], name: versionNameInputRef.current.value }))
    props.setShowEdit(null)
  }

  const handleEditClick = () => {
    props.setShowEdit(props?.index)
    setTimeout(() => {
      if (versionNameInputRef.current) versionNameInputRef.current.focus()
    }, 100)
  }

  const handleOutsideClickOfInputField = () => {
    props.setShowEdit(null)
  }

  return (
    <div className='d-flex justify-content-start align-items-center'>
      {props?.showEdit === props?.index ? (
        <OutsideClickHandler onOutsideClick={handleOutsideClickOfInputField}>
          <div className='d-flex justify-content-start align-items-center'>
            <input
              type='text'
              className='form-control version-input col-form-label-sm'
              aria-label='Small'
              aria-describedby='inputGroup-sizing-sm'
              defaultValue={pages?.[props?.singleChildId]?.name}
              ref={versionNameInputRef}
            ></input>
            <Button id='publish_collection_btn' variant='btn btn-outline btn-sm font-12 ml-2' onClick={() => onRename(props?.singleChildId)}>
              Save
            </Button>
          </div>
        </OutsideClickHandler>
      ) : (
        <div className='d-flex justify-content-start align-items-center'>
          <div className='version-title'>{pages?.[props?.singleChildId]?.name}</div>
          <BiSolidPencil size={14} className='cursor-pointer ml-1' onClick={handleEditClick} />
          {pages[props?.singleChildId]?.state === 1 && <span class='badge badge-primary ml-1'>Default</span>}
        </div>
      )}
    </div>
  )
}

const AddVersion = (props) => {
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })

  const dispatch = useDispatch()

  const newVersionNameInputRef = useRef()

  const addVersion = () => {
    if (newVersionNameInputRef.current.value.trim().length === 0) return toast.error('Name cannot be empty')
    const versionChilds = pages?.[props?.parentPageId]?.child
    try {
      versionChilds.forEach((element) => {
        if (pages[element]?.name.trim().toLowerCase() === newVersionNameInputRef.current.value.trim().toLowerCase()) {
          throw new Error('StopIteration')
        }
      })
    } catch (error) {
      return toast.error('Version Name already Exist!')
    }
    const parentPageId = props?.parentPageId
    const newVersion = { name: newVersionNameInputRef.current.value.trim(), state: 0 }
    newVersionNameInputRef.current.value = ''
    toast.success("Version added successfully")
    dispatch(addParentPageVersion(newVersion, parentPageId))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      addVersion()
    }
  }

  return (
    <div className='version-modal-footer d-flex justify-content-start'>
      <input
        placeholder='Add New Version'
        type='text'
        class='form-control add-version-input'
        aria-label='Small'
        aria-describedby='inputGroup-sizing-sm'
        ref={newVersionNameInputRef}
        onKeyDown={handleKeyDown}
      ></input>
      <Button onClick={addVersion} id='publish_collection_btn' className='btn-sm font-12' variant='btn btn-outline ml-2'>
        Add
      </Button>
    </div>
  )
}

export default function SelectVersion(props) {
  const dispatch = useDispatch()
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })

  const findDefaultVersion = () => {
    const children = pages[props?.parentPageId]?.child || []
    return children.map((childId) => pages[childId]).find((page) => page?.state === 1)
  }

  const handleDeleteVersion = (versionId) => {
    const versionToDelete = pages[versionId]
    dispatch(deletePage(versionToDelete))
  }

  const handleDefaultVersion = async (versionId) => {
    const orgId = getOrgId()
    const defaultVersionData = findDefaultVersion()
    const versionData = { oldVersionId: defaultVersionData.id, newVersionId: versionId }
    dispatch(onDefaultVersion(orgId, versionData))
  }

  const [showEdit, setShowEdit] = useState(null)

  return (
    <div className='version-modal-container'>
      <h4 className='version-modal-header mb-0'>Manage Versions</h4>
      <div className='version-modal-body'>
        {pages[props?.parentPageId]?.child?.map((singleChildId, index) => {
          return (
            <div>
              <div className='d-flex justify-content-between align-items-center'>
                <VersionInput {...props} setShowEdit={setShowEdit} showEdit={showEdit} index={index} singleChildId={singleChildId} />
                <div>
                  {pages?.[singleChildId]?.state !== 1 && (
                    <Button
                      variant='btn btn-outline ml-1'
                      className='btn-sm font-12'
                      onClick={() => {
                        handleDefaultVersion(singleChildId)
                      }}
                    >
                      Default
                    </Button>
                  )}
                  {pages?.[singleChildId]?.state !== 1 && (
                    <RiDeleteBinLine
                      className='ml-2 cursor-pointe text-grey'
                      size={22}
                      onClick={() => {
                        handleDeleteVersion(singleChildId)
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <AddVersion {...props} />
    </div>
  )
}
