import React from 'react'
import { isStateReject, isStateApproved } from '../common/utility'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

export function ApproveRejectEntity(props) {
  const { entity, entityId, entityName } = props

  return (
    <span>
      <button
        className='ml-2 btn btn-outline orange'
        type='button'
        onClick={() => (entityName === 'endpoint' ? props.approve_endpoint(entity[entityId]) : props.approve_page(entity[entityId]))}
      >
        Approve
      </button>
      <button
        className='ml-2 btn btn-outline orange'
        type='button'
        onClick={() => (entityName === 'endpoint' ? props.reject_endpoint(entity[entityId]) : props.reject_page(entity[entityId]))}
      >
        Reject
      </button>
    </span>
  )
}

export function PublishEntityButton(props) {
  const { entity, entityId, publishLoader, entityName } = props
  const params = useParams()
  const { pages } = useSelector((state) => {
    return {
      pages: state.pages
    }
  })
  return (
    <button
      className={(publishLoader ? 'btn buttonLoader btn-secondary outline ml-2 orange btn-sm font-12' : 'btn text-grey btn-sm font-12')}
      type='button'
      onClick={() => props.open_publish_confirmation_modal()}
      disabled={pages[params.pageId]?.state === 2 ? true : false}
    >
      Publish
    </button>
  )
}

export function UnPublishEntityButton(props) {
  const { publishLoader, entityName, onUnpublish } = props
  const handleClick = () => {
    if (onUnpublish) {
      onUnpublish()
    } else {
      props.open_unpublish_confirmation_modal()
    }
  }
  return (
    <button
      className={(publishLoader ? 'btn buttonLoader  ml-2 btn-sm font-12' : 'btn text-danger btn-sm font-12 button ')}
      type='button'
      onClick={handleClick}
    >
      UnPublish
    </button>
  )
}

export default {
  ApproveRejectEntity,
  PublishEntityButton,
  UnPublishEntityButton
}
