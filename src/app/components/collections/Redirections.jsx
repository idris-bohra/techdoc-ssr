import React, { useState, useEffect, useRef } from 'react'
const DeleteIcon = () => (<svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  <path
    d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z'
    stroke='#E98A36'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  />
  <path d='M7.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  <path d='M10.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
</svg>
)
// import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import Joi from 'joi'
import { addUrlWithAdditionalPath, deleteMappedUrl } from './redirectionApiServices'
import { getUrlPathById } from '../common/utility'
import { addOldUrlOfPage, deleteOldUrlOfPage } from '../pages/redux/pagesActions'
import { toast } from 'react-toastify'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { BiLogoGraphql } from 'react-icons/bi'
import { addCollectionAndPages } from '../redux/generalActions'
import './redirections.scss'
import { FaLongArrowAltLeft } from 'react-icons/fa'
import { getCurrentOrg } from '../auth/authServiceV2'
import { FaArrowLeft } from 'react-icons/fa6'

const Redirections = () => {
  const params = useParams()
  const userPathRef = useRef(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const orgId = getCurrentOrg()?.id

  const { pages, collections, childIds, customDomain } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
      childIds: state?.pages?.[state.collections?.[params.collectionId]?.rootParentId]?.child || [],
      customDomain: state.collections?.[params.collectionId]?.customDomain || ''
    }
  })

  const [redirectUrls, setRedirectUrls] = useState([])
  const [selectedPageId, setselectedPageId] = useState(null)
  const [latestUrl, setLatestUrl] = useState('')
  const [errors, setErrors] = useState({})

  const visiblePath = customDomain ? `https://${customDomain}/` : `${import.meta.env.VITE_UI_URL}/p/`

  useEffect(() => {
    getAllPagesAndCollection()
  }, [params?.collectionId])

  const getAllPagesAndCollection = async () => {
    addCollectionAndPages(params.orgId)
    loadUrls()
  }

  const addOldUrlsOfChilds = (pagesHaveOldUrls, pageId) => {
    {
      pages[pageId]?.oldUrls &&
        Object.keys(pages[pageId]?.oldUrls).length > 0 &&
        Object.entries(pages[pageId]?.oldUrls).forEach(([index, path]) => {
          pagesHaveOldUrls.push({ pageId, path, pathId: index })
        })
    }
    if (pages?.[pageId]?.child.length > 0) {
      pages[pageId].child.forEach((pageId) => addOldUrlsOfChilds(pagesHaveOldUrls, pageId))
    }
  }

  const loadUrls = async () => {
    const collectionId = params.collectionId
    const rootParentId = collections?.[collectionId]?.rootParentId
    const rootParentChilds = pages?.[rootParentId]?.child
    const pagesHaveOldUrls = []
    try {
      rootParentChilds.forEach((pageId) => addOldUrlsOfChilds(pagesHaveOldUrls, pageId))
      setRedirectUrls(pagesHaveOldUrls)
    } catch (error) {
      console.error('Failed to fetch URLs:', error.message)
    }
  }

  const schema = Joi.object({
    path: Joi.string().min(1).required().trim().label('Slug').messages({
      'string.empty': 'Slug cannot be empty',
      'any.required': 'Slug is required'
    }),
    latestUrl: Joi.string().min(1).required().trim().label('Redirection URL').messages({
      'string.empty': 'Redirection URL cannot be empty',
      'any.required': 'Redirection URL is required'
    })
  })

  const validate = (data) => {
    const options = { abortEarly: false }
    const { error } = schema.validate(data, options)
    if (!error) return null
    const errors = {}
    for (const item of error.details) errors[item.path[0]] = item.message
    return errors
  }

  const handleAddUrl = async (event) => {
    event.preventDefault()
    const path = userPathRef.current.value.trim()
    const validationErrors = validate({ path, latestUrl })
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    if (!selectedPageId) {
      setErrors({ path: 'Please select a page to add the redirection URL' })
      return
    }
    let result
    try {
      result = (await addUrlWithAdditionalPath(selectedPageId, params.collectionId, path)).data
      const updatedRedirectUrls = [...redirectUrls, { pageId: result.pageId, path, pathId: result.id }]
      dispatch(addOldUrlOfPage({ pageId: result.pageId, path, pathId: result.id }))
      setRedirectUrls(updatedRedirectUrls)
      userPathRef.current.value = ''
    } catch (error) {
      console.error('Failed to create URL:', error)
      toast.error(error.response.data.msg)
    }
  }

  const handleDeleteUrl = async (indexId, pageId, pathId) => {
    deleteMappedUrl(pathId)
      .then(() => {
        dispatch(deleteOldUrlOfPage({ pageId, pathId }))
        setRedirectUrls((prev) => prev.filter((_, i) => i !== indexId))
      })
      .catch((error) => {
        console.error(error.message)
        toast.error(error.message)
      })
  }

  const setLatestUrlForPage = (id, setInUseState = true) => {
    if (setInUseState) setselectedPageId(id)
    let pathName = getUrlPathById(id, pages)
    pathName = pathName.replace('null', params.collectionId)
    if (setInUseState) setLatestUrl(pathName)
    return pathName
  }

  const renderAllVersionOfParentPage = (versionId) => {
    const versionChilds = pages?.[versionId]?.child || []
    return (
      <>
        {versionChilds?.length === 0 ? null : (
          <div className='mt-2'>
            <span className='version-heading'>{pages?.[versionId]?.name}</span>
            <div className='pl-2'>{renderAllPagesOfParent(versionChilds)}</div>
          </div>
        )}
      </>
    )
  }

  const renderParentPage = (pageId) => {
    const parentPageChildIds = pages?.[pageId]?.child || []
    return (
      <div className='mt-4'>
        <div className='page-heading-container cursor-pointer d-flex align-items-center' onClick={() => setLatestUrlForPage(pageId)}>
          <IoDocumentTextOutline size={14} className='mb-1' />
          <span className='ml-1 page-heading page-heading parent-page-heading'>{pages?.[pageId]?.name}</span>
        </div>
        <div className='pl-3'>{parentPageChildIds.map((versionId) => renderAllVersionOfParentPage(versionId))}</div>
      </div>
    )
  }

  const renderSubPage = (subPageId) => {
    const subPageChildIds = pages?.[subPageId]?.child || []
    return (
      <div className='mt-1'>
        <div className='page-heading-container cursor-pointer' onClick={() => setLatestUrlForPage(subPageId)}>
          <span className='page-heading page-heading d-flex align-items-center'>
            <IoDocumentTextOutline size={14} className='mb-1' />
            <span className='ml-1 page-heading page-heading'>{pages?.[subPageId]?.name}</span>
          </span>
        </div>
        <div className='pl-2'>{renderAllPagesOfParent(subPageChildIds)}</div>
      </div>
    )
  }

  const renderEndpoint = (endpointId) => {
    const getRequestTypeIcon = () => {
      if (pages?.[endpointId]?.protocolType === 2) return <BiLogoGraphql className='graphql-icon' />
      else {
        return (
          <div className={`${pages?.[endpointId]?.requestType}-chip`}>
            <div className='endpoint-request-div'>{pages?.[endpointId]?.requestType}</div>
          </div>
        )
      }
    }

    return (
      <div className='mt-1 page-heading-container cursor-pointer d-flex align-items-center' onClick={() => setLatestUrlForPage(endpointId)}>
        <span className='mr-1 page-heading'>{pages?.[endpointId]?.name}</span>
        {getRequestTypeIcon()}
      </div>
    )
  }

  const renderAllPagesOfParent = (parentChilds) => {
    return (
      <div>
        {parentChilds?.map((singleId) => {
          const type = pages?.[singleId]?.type || null
          switch (type) {
            case 1:
              return renderParentPage(singleId)
            case 3:
              return renderSubPage(singleId)
            case 4:
              return renderEndpoint(singleId)
            default:
              return null
          }
        })}
      </div>
    )
  }

  const getLatestUrl = (pageId) => {
    const path = setLatestUrlForPage(pageId, false)
    return `${visiblePath}${path}`
  }

  const handleRedirection = (value, type) => {
    switch (type) {
      case 'slug':
        window.open(`${visiblePath}${value}?collectionId=${params.collectionId}`, '_blank')
        break
      case 'redirection':
        window.open(value, '_blank')
        break
      default:
        break
    }
  }
  const handleBack = () => {
    navigate(`/orgs/${orgId}/dashboard`)
  }

  const renderTable = () => {
    return (
      <div className='mt-5'>
        {redirectUrls.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th className='center-heading'>Slug</th>
                <th className='center-heading'>Redirection URL</th>
                <th className='center-heading'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redirectUrls.map((redirectUrlDetails, index) => {
                return (
                  <tr key={index}>
                    <td className='cursor-pointer url-path'>
                      <span
                        title='click to open link'
                        className='cursor-pointer url-path'
                        onClick={(e) => handleRedirection(e.target.innerText, 'slug')}
                      >
                        {redirectUrlDetails.path}
                      </span>
                    </td>
                    <td>
                      <span
                        title='click to open link'
                        className='cursor-pointer url-redirection'
                        onClick={(e) => handleRedirection(e.target.innerText, 'redirection')}
                      >
                        {getLatestUrl(redirectUrlDetails?.pageId)}
                      </span>
                    </td>
                    <td>
                      <DeleteIcon
                        className='cursor-pointer'
                        onClick={() => handleDeleteUrl(index, redirectUrlDetails?.pageId, redirectUrlDetails?.pathId)}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className='empty-table-heading d-flex justify-content-center align-items-center'> No Data is present here </div>
        )}
      </div>
    )
  }

  return (
    <div className='redirections d-flex h-100'>
      <div className='d-flex justify-content-start sidebar-pages-container mb-4' >
        <div className='p-4'>
        <button className='btn position-absolute back-button-api-redirect btn-sm rounded-circle icon-button' onClick={handleBack}>
          <FaArrowLeft />
        </button>
          {renderAllPagesOfParent(childIds)}
          </div>
      </div>
      <div className='separation'></div>
      <div className='d-flex justify-content-center redirection-table-container mt-4'>
        <div className='main-container'>
          <h3>
            {collections?.[params.collectionId]?.name.charAt(0).toUpperCase() + collections?.[params.collectionId]?.name.slice(1)}{' '}
            Redirections
          </h3>
          <div className='form'>
            <div className='d-flex justify-content-center flex-grow-1'>
              <div className='d-flex flex-column flex-grow-1'>
                <input ref={userPathRef} type='text' className=' h-100' id='part2' placeholder='Slug' />
                {errors.path && <small className='text-danger'>{errors.path}</small>}
                <span className='mt-1 additional-info'>
                  Domain - <span className='domain-name'>{visiblePath}</span>
                </span>
              </div>
              <div className='d-flex flex-column flex-grow-1 ml-2'>
                <input size='sm' disabled type='text' className='' placeholder='Redirection URL' value={latestUrl} />
                {errors.latestUrl && <small className='text-danger'>{errors.latestUrl}</small>}
                <span className='mt-1 additional-info'>Click on the pages and endpoints to add the redirection URL</span>
              </div>
            </div>
            <button className='h-100 font-12 ml-2' onClick={handleAddUrl}>
              Add
            </button>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  )
}

export default Redirections
