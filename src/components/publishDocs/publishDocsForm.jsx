import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CustomColorPicker from './customColorPicker'
import Joi from 'joi-browser'
import { Button, Tooltip, OverlayTrigger, Modal, Form, Dropdown } from 'react-bootstrap'
import { ReactComponent as UploadIcon } from '../../assets/icons/uploadIcon.svg'
import { onCollectionUpdated, updateCollection } from '../collections/redux/collectionsActions'
import './publishDocsForm.scss'
import { HOSTNAME_VALIDATION_REGEX } from '../common/constants'
import { handleChangeInUrlField, handleBlurInUrlField } from '../common/utility'
import { moveToNextStep } from '../../services/widgetService'
import { publishData } from '../modals/redux/modalsActions'
import PublishSidebar from '../publishSidebar/publishSidebar'
import { HiOutlineExternalLink } from 'react-icons/hi'
import { FiCopy } from 'react-icons/fi'
import { FaRegTimesCircle } from 'react-icons/fa'
import { RiCheckboxMultipleLine } from 'react-icons/ri'
import collectionsApiService from '../collections/collectionsApiService'
import { toast } from 'react-toastify'
import IconButton from '../common/iconButton'
import { MdDelete } from 'react-icons/md'

const MAPPING_DOMAIN = import.meta.env.VITE_TECHDOC_MAPPING_DOMAIN
const publishDocFormEnum = {
  NULL_STRING: '',
  LABELS: {
    title: 'Title',
    domain: 'Custom Domain',
    logoUrl: 'Logo URL',
    theme: 'Theme'
  }
}

const PublishDocForm = (props) => {
  const dispatch = useDispatch()

  const { collections, isPublishSliderOpen, tabs, pages, environment, publicEnv } = useSelector((state) => ({
    collections: state.collections,
    isPublishSliderOpen: state.modals.publishData,
    tabs: state.tabs,
    pages: state.pages,
    environment: state.environment,
    publicEnv: state?.collections[state?.tabs?.activeTabId]?.environment
  }))
  const [data, setData] = useState({
    title: '',
    domain: '',
    logoUrl: '',
    theme: '',
    republishNeeded: false
  })
  const [errors, setErrors] = useState({})
  const [binaryFile, setBinaryFile] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loader, setLoader] = useState(false)
  const [openPublishSidebar, setOpenPublishSidebar] = useState(false)
  const [republishNeeded, setRepublishNeeded] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showCreateEnvForm, setShowCreateEnvForm] = useState(false)
  const [showCopyEnvModal, setShowCopyEnvModal] = useState(false)
  const [selectedEnv, setSelectedEnv] = useState(null)
  const [rows, setRows] = useState([
    { checked: false, variable: '', value: '', isEnabled: true },
    { checked: false, variable: '', value: '', isEnabled: true }
  ])

  useEffect(() => {
    setSelectedCollection()
  }, [props.selected_collection_id, collections])

  const setSelectedCollection = () => {
    const collectionId = props.selected_collection_id
    let collection = {}
    let title, logoUrl, domain, theme, cta, links, favicon
    if (collections) {
      collection = collections[collectionId]
      if (collection && Object.keys(collection).length > 0) {
        title = collection?.docProperties?.defaultTitle || collection?.name || publishDocFormEnum.NULL_STRING
        logoUrl = collection?.docProperties?.defaultLogoUrl || publishDocFormEnum.NULL_STRING
        domain = collection?.customDomain || publishDocFormEnum.NULL_STRING
        theme = collection?.theme || publishDocFormEnum.NULL_STRING
        favicon = collection?.favicon || publishDocFormEnum.NULL_STRING
        setData({ title, logoUrl, domain, theme })
        setBinaryFile(favicon)
      }
    }
  }

  const unPublishCollection = (selectedCollection) => {
    if (selectedCollection?.isPublic === true) {
      const editedCollection = { ...selectedCollection }
      editedCollection.isPublic = false
      dispatch(updateCollection(editedCollection))
    }
  }

  const handleChange = (e, isURLInput = false) => {
    const newData = { ...data }
    newData[e.currentTarget.name] = e.currentTarget.value
    if (isURLInput) {
      newData[e.currentTarget.name] = handleChangeInUrlField(newData[e.currentTarget.name])
    }
    setData(newData)
  }

  const handleBlur = (e, isURLInput = false) => {
    const newData = { ...data }
    if (isURLInput) {
      newData[e.currentTarget.name] = handleBlurInUrlField(newData[e.currentTarget.name])
    }
    setErrors({})
    setData(newData)
  }

  const schema = {
    title: Joi.string().min(3).max(50).required().trim().label(publishDocFormEnum.LABELS.title),
    domain: Joi.string()
      .allow('')
      .regex(HOSTNAME_VALIDATION_REGEX, { name: 'URL' })
      .trim()
      .required()
      .label('domain')
      .error(() => {
        return { message: 'Domain must be valid' }
      }),
    logoUrl: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.logoUrl),
    theme: Joi.string().trim().allow('').label(publishDocFormEnum.LABELS.theme)
  }

  const validate = (data) => {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, schema, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  const saveAndPublishCollection = (selectedCollection) => {
    const collectionId = props.selected_collection_id
    const collection = { ...collections[collectionId] }
    const newData = { ...data }
    const customDomain = newData.domain.trim()
    collection.customDomain = customDomain.length !== 0 ? customDomain : null
    collection.theme = newData.theme
    collection.favicon = binaryFile
    collection.docProperties = {
      defaultTitle: newData.title.trim(),
      defaultLogoUrl: newData.logoUrl.trim()
    }
    delete collection.isPublic
    let newErrors = validate({ ...data })
    const fileSize = Math.round(uploadedFile?.size / 1024)
    if (fileSize > 50) {
      newErrors = { ...newErrors, icon: "Image size shouldn't be greater than 50KB" }
    }
    setErrors(newErrors || {})
    if (newErrors) return
    setLoader(true)
    dispatch(
      updateCollection(collection, () => {
        setLoader(false)
        if (selectedCollection?.isPublic !== true) {
          const editedCollection = { ...selectedCollection }
          editedCollection.isPublic = true
          dispatch(updateCollection(editedCollection))
          moveToNextStep(6)
        }
        setRepublishNeeded(true)
      })
    )
  }

  const setTheme = (theme) => {
    setData((prevData) => ({
      ...prevData,
      theme
    }))
  }

  const renderColorPicker = () => (
    <div className='form-group mb-4'>
      <label>{publishDocFormEnum.LABELS.theme}</label>
      <div className='colorChooser'>
        <CustomColorPicker set_theme={setTheme} theme={data.theme} />
      </div>
    </div>
  )

  const handleReaderLoaded = (readerEvt) => {
    const binaryString = readerEvt.target.result
    setBinaryFile(window.btoa(binaryString))
  }

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const reader = new window.FileReader()
      reader.onload = handleReaderLoaded
      reader.readAsBinaryString(selectedFile)
    }
    setUploadedFile(selectedFile || null)
  }

  const getDisabledStyle = (disabled) => (disabled ? { cursor: 'not-allowed', opacity: 0.4 } : { cursor: 'pointer' })

  const renderUploadModule = (disabled) => (
    <>
      <div>
        <label style={getDisabledStyle(disabled)} htmlFor='upload-button'>
          <UploadIcon />
        </label>
        <input
          type='file'
          id='upload-button'
          disabled={disabled}
          style={{ display: 'none' }}
          accept='.png'
          onChange={(e) => onFileChange(e)}
        />
      </div>
    </>
  )

  const renderUploadBox = (name) => {
    const error = errors[name]
    return (
      <>
        <div className='d-flex'>
          <div className='uploadBox' style={getDisabledStyle(data.logoUrl)}>
            {!binaryFile && <div className='d-flex align-items-center'>{renderUploadModule(data.logoUrl)}</div>}
            {binaryFile && <img src={`data:image/png;base64,${binaryFile}`} height='60' width='60' alt='data' />}
            <div className='uplod-info d-none'>
              {binaryFile && (
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const newErrors = { ...errors }
                    delete newErrors.icon
                    setBinaryFile(null)
                    setUploadedFile(null)
                    setErrors(newErrors)
                  }}
                >
                  <FaRegTimesCircle className='text-dark' />
                </span>
              )}
            </div>
          </div>
        </div>
        {error && <small className='text-danger'>{error}</small>}
      </>
    )
  }

  const renderInput = (name, disabled, placeholder, isURLInput = false) => {
    const value = data[name]
    const error = errors[name]
    return (
      <div className='form-group mb-4'>
        <label>{publishDocFormEnum.LABELS[name]}</label>
        <input
          type='text'
          placeholder={placeholder}
          disabled={disabled}
          className='form-control'
          name={name}
          value={value}
          onChange={(e) => handleChange(e, isURLInput)}
          onBlur={(e) => handleBlur(e, isURLInput)}
        />
        {name === 'domain' && (
          <span className='domain-info font-12 mt-1 d-block text-danger'>
            {`Point c name of the above domain to ${MAPPING_DOMAIN}`}
            <a className='ml-1' href='https://techdoc.walkover.in/p/White-Labelling?collectionId=2Uv_sfKTLPI3'>
              Learn More
            </a>
          </span>
        )}
        {name === 'title' && (
          <span className='domain-info font-12 mt-1 d-block'>Collection name will be used by default when no title is entered.</span>
        )}
        {error && <small className='alert alert-danger'>{error}</small>}
      </div>
    )
  }

  const getSelectedCollection = () => {
    const collectionId = props.selected_collection_id
    return { ...collections[collectionId] }
  }

  const isCollectionPublished = (selectedCollection) => selectedCollection?.isPublic || false

  const redirectUser = () => {
    setOpenPublishSidebar(true)
    dispatch(publishData(true))
  }

  const openExternalLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setIsCopied(true) // Set copied status to true
    setTimeout(() => setIsCopied(false), 1000)
  }

  const renderPublicUrl = () => {
    const collectionId = props.selected_collection_id
    const isCollectionPublished = collections[collectionId]?.isPublic
    const url = import.meta.env.VITE_PUBLIC_UI_URL + '/p?collectionId=' + collectionId
    const isDisabled = IsParentPagePublishedInACollection(collections[collectionId]?.rootParentId)

    if (!isCollectionPublished) return null

    return (
      <div>
        <div className='published-post d-flex align-items-center mt-4 mb-1'>
          <span className='public-title d-block'>Preview Documentation</span>
          <div className='api-label POST request-type-bgcolor ml-2 w-auto px-1 '> published </div>
        </div>
        <OverlayTrigger
          overlay={
            <Tooltip id='tooltip-unpublished-endpoint' className={isDisabled ? 'd-none' : ''}>
              At least one endpoint/page is to be published to enable this link.
            </Tooltip>
          }
        >
          <div className={`sidebar-public-url d-flex align-items-center justify-content-start mb-4`}>
            <HiOutlineExternalLink className='mr-1' size={13} />
            <span onClick={() => isDisabled && openExternalLink(url)} className={isDisabled ? 'text-disable flex-grow-1' : 'disabled-link'}>
              {url}
            </span>
            <div className='ml-2'>
              <button
                className='copy-button-link ml-2 border-0 bg-white'
                onClick={() => copyToClipboard(url)}
                title='Copy URL'
                onMouseDown={(e) => e.preventDefault()}
              >
                {isCopied ? <RiCheckboxMultipleLine size={13} color='black' /> : <FiCopy size={13} />}
              </button>
            </div>
          </div>
        </OverlayTrigger>
      </div>
    )
  }

  const IsParentPagePublishedInACollection = (rootParentId) => {
    const childs = pages?.[rootParentId]?.child
    if (childs?.length > 0) {
      for (const child of childs) {
        if (pages[child]?.isPublished === true) {
          return true
        }
      }
    }
    return false
  }

  const openPublishSidebars = () => <>{isPublishSliderOpen && <PublishSidebar {...props} closePublishSidebar={closePublishSidebar} />}</>

  const closePublishSidebar = () => {
    setOpenPublishSidebar(false)
    dispatch(publishData(false))
  }

  const renderActionButtons = (publishCheck) => {
    const selectedCollection = getSelectedCollection()
    const isNotPublished = !isCollectionPublished(selectedCollection)
    const rootParentId = collections[props.selected_collection_id]?.rootParentId
    const disableCondition = pages[rootParentId]?.child?.length > 0
    return (
      <div className='mt-2'>
        <Button
          disabled={!disableCondition}
          id='publish_collection_btn'
          variant='btn btn-outline'
          className='m-1 btn-sm font-12'
          onClick={redirectUser}
          title='This will publish all the pages and endpoints inside this collection.'
        >
          Bulk Publish
        </Button>
        <Button
          className={loader ? 'buttonLoader m-1 btn-sm font-12' : 'm-1 btn-sm font-12'}
          disabled={!data.title.trim()}
          onClick={() => {
            saveAndPublishCollection(selectedCollection)
          }}
          variant='btn btn-outline'
          title='This will save as well as publish the doc'
        >
          {republishNeeded ? 'Save and Republish' : 'Save and Publish'}
        </Button>
        {!isNotPublished && (
          <Button
            variant='btn btn-outline-danger btn-sm font-12'
            className='m-1 btn-sm font-12'
            onClick={() => {
              unPublishCollection(selectedCollection)
              setRepublishNeeded(false)
            }}
          >
            Unpublish Doc
          </Button>
        )}
      </div>
    )
  }

  const publishCheck = collections[tabs?.activeTabId]?.isPublic

  const handleAddRow = () => {
    setRows([...rows, { checked: false, variable: '', value: '', isEnabled: true }])
  }

  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    setRows(updatedRows)
  }

  const handleToggleEnable = (index) => {
    const updatedRows = rows.map((row, i) => (i === index ? { ...row, isEnabled: !row.isEnabled } : row))
    setRows(updatedRows)
  }

  const handleSave = async () => {
    const formattedData = {}
    rows.forEach((row) => {
      if (row.variable) {
        formattedData[row.variable] = {
          currentValue: row.value,
          IsEditable: row.isEnabled,
          Checked: row.checked
        }
      }
    })
    const response = await collectionsApiService.updateCollection(props.selected_collection_id, {
      environment: formattedData,
      name: collections[props.selected_collection_id].name
    })
    dispatch(onCollectionUpdated(response.data))
    setShowCreateEnvForm(false)
  }

  const handleCopyExistingEnv = (environment) => {
    const copiedRows = Object.keys(environment?.variables).map((key) => ({
      variable: key,
      value: environment?.variables[key]?.initialValue || '',
      isEnabled: false,
      checked: false
    }))

    setRows(copiedRows)
    setShowCopyEnvModal(false)
    setShowCreateEnvForm(true)
  }

  const handlePublicEnvClick = () => {
    const prefilledRows = Object.keys(publicEnv).map((key) => ({
      variable: key,
      value: publicEnv[key].currentValue,
      isEnabled: publicEnv[key].IsEditable,
      checked: publicEnv[key].Checked
    }))
    setRows(prefilledRows)
    setShowCreateEnvForm(true)
  }

  const handleDeleteSelectedIndex = (collectionId, variable) => {
    const updatedRows = rows.filter(row => row.variable !== variable);
    setRows(updatedRows);
  }

  const handleDelete = async (collectionId) => {
    try {
      const response = await collectionsApiService.updateCollection(props.selected_collection_id, {
        environment: {},
        name: collections[props.selected_collection_id].name
      })
      dispatch(onCollectionUpdated(response.data))
      toast.success("Public Environment deleted successfully")
      setRows([
        { checked: false, variable: '', value: '', isEnabled: true },
        { checked: false, variable: '', value: '', isEnabled: true }
      ])
      setShowCreateEnvForm(false)
    } catch (error) {
      throw error
    }
  }

  return (
    <>
      <div className='d-flex justify-content-center'>
        <div className={'publish-on-tab'}>
          <div className='d-flex justify-content-between align-item-center'>
            <div className='d-flex align-items-center'>
              <h3 className='page-title mb-0'>Publish Collection Settings</h3>
            </div>
          </div>
          <span className='mt-2 d-inline-block'>Completing this step will make your collection available at a public URL.</span>

          {publishCheck && renderPublicUrl()}
          <div className='small-input mt-2'>
            {renderInput('title', false, 'brand name', false)}
            <div className='form-group mb-4'>
              <label>Select Environment</label>
              {publicEnv === null || Object.keys(publicEnv)?.length === 0 ? (
                <Dropdown>
                  <Dropdown.Toggle className='justify-content-between bg-white border w-100 font-12' variant="light" id='dropdown-basic'>
                    {'Select Environment'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {Object.keys(environment.environments).map((envId) => (
                      <Dropdown.Item
                        key={envId}
                        onClick={() => {
                          handleCopyExistingEnv(environment.environments[envId])
                          setSelectedEnv(envId)
                        }}
                      >
                        {environment.environments[envId]?.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <input
                  type='text'
                  className='d-block w-100 font-12'
                  value='Public Environment'
                  readOnly
                  onClick={() => handlePublicEnvClick()}
                  style={{ cursor: 'pointer', border: '1px solid #ced4da', padding: '5px', borderRadius: '4px' }}
                />
              )}
            </div>
            {renderInput('domain', false, 'docs.example.com', false)}
          </div>
          {showCreateEnvForm && (
            <Modal className='main-modal-contanier' show={showCreateEnvForm} onHide={() => setShowCreateEnvForm(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Public Environment</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form className='main-body-modal overflow-auto'>
                  <table className='table my-0'>
                    <thead className='bg-white position-sticky'>
                      <tr>
                        <th className='text-center'>
                          <Dropdown>
                          <IconButton>
                            <Dropdown.Toggle className='select-check p-0 bg-transparent text-dark border-0' id="dropdown-basic">
                              Select
                            </Dropdown.Toggle>
                            </IconButton>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => setRows(rows.map(row => ({ ...row, checked: true })))}>Select All</Dropdown.Item>
                              <Dropdown.Item onClick={() => setRows(rows.map(row => ({ ...row, checked: false })))}>Deselect All</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </th>
                        <th width={140}>Key</th>
                        <th>Value</th>
                        <th className='text-center'>
                        <Dropdown>
                          <IconButton>
                          <Dropdown.Toggle className='select-check p-0 bg-transparent text-dark border-0' variant="success" id="dropdown-basic">
                            Editable
                          </Dropdown.Toggle >
                          </IconButton>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setRows(rows.map(row => ({ ...row, isEnabled: true })))}>Editable All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setRows(rows.map(row => ({ ...row, isEnabled: false })))}>Disable All</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        </th>
                        <th className='text-center'>Delete</th>
                      </tr>
                    </thead>
                    <tbody height={100}>
                      {rows.map((row, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Check
                              className='text-center pl-0'
                              type='checkbox'
                              checked={row.checked}
                              onChange={(e) => handleInputChange(index, 'checked', e.target.checked)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              className='key-input-field text-grey font-12'
                              type='text'
                              placeholder='Environment Key'
                              value={row.variable}
                              onChange={(e) => handleInputChange(index, 'variable', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form.Control
                              className='text-grey'
                              type='text'
                              placeholder='Value'
                              value={row.value}
                              onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                            />
                          </td>
                          <td>
                            <Form>
                              <Form.Check
                                className='text-center pl-5'
                                type="switch"
                                id={`custom-switch-${index}`} // Unique ID for each switch
                                checked={row.isEnabled}
                                onChange={() => handleToggleEnable(index)}
                              />
                            </Form>
                          </td>
                          <td className='text-center'>
                            <IconButton><MdDelete className='text-grey' size={18} onClick={() => handleDeleteSelectedIndex(props.selected_collection_id, row.variable)} /></IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>


                </Form>
              </Modal.Body>
              <Modal.Footer className='justify-content-between'>
                <Button className='add-more-button text-grey bg-white font-12 border-0' onClick={handleAddRow}>
                  + Add More Rows
                </Button>
                <div className='d-flex gap-2'>
                  <Button className='btn-sm font-12' onClick={handleSave}>
                    Save
                  </Button>

                  <Button className='btn-sm font-12' onClick={() => handleDelete(props.selected_collection_id)}>
                    Delete
                  </Button>
                </div>
              </Modal.Footer>
            </Modal>
          )}
          <div className='d-flex favicon mb-4'>
            <div className='form-group mb-0'>
              <label> Fav Icon </label>
              <div className='favicon-uploader'>{renderUploadBox('icon')}</div>
            </div>
            <div className='or-wrap d-flex align-items-center'>
              <p className='mb-0'>OR</p>
            </div>
            {renderInput('logoUrl', false, false, binaryFile, '')}
          </div>
          <div className='color-picker'>{renderColorPicker()}</div>
          {renderActionButtons(publishCheck)}
        </div>
      </div>
      {openPublishSidebar && openPublishSidebars()}
    </>
  )
}

export default PublishDocForm
