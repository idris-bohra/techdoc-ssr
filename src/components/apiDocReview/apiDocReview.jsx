import React, { useState, useEffect, useRef } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { isDashboardRoute, SESSION_STORAGE_KEY } from '../common/utility'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from 'react-icons/bi'
import './apiDocReview.scss'
import { dislike, like } from '../../services/feedbackService'
import { VscStarFull } from "react-icons/vsc";
import { useLocation, useParams } from 'react-router-dom'

const LIKE = 'like'
const DISLIKE = 'dislike'

const ApiDocReview = (props) => {
  const [parentId, setParentId] = useState('')
  const [parentType, setParentType] = useState('')
  const [vote, setVote] = useState(null)
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [feedbackGiven, setFeedbackGiven] = useState(false)
  const [feedbackSaved, setFeedbackSaved] = useState(false)
  const [currentReviews, setCurrentReviews] = useState({})
  const prevProps = useRef(props)
  const [show, setShow] = useState(false)
  const [showSolidDislike, setShowSolidDislike] = useState(false)

  const handleClose = () => setShow(false)
  const params = useParams()

  const location = useLocation()

  useEffect(() => {
    setParent()
    setLocalStorageReviews()
  }, [])

  useEffect(() => {
    if (prevProps.current.params !== params) {
      setParent()
    }
    prevProps.current = props
    return () => {
      setFeedbackGiven(false)
      setFeedbackType('')
      setFeedbackSaved(false)
    }
  }, [params])

  const setLocalStorageReviews = () => {
    try {
      setCurrentReviews(JSON.parse(window.localStorage.getItem('review')) || {})
    } catch {
      setCurrentReviews({})
    }
  }

  const setParent = () => {
    const { pageId, endpointId } = params || {}
    const parentId = endpointId || pageId
    const parentType = endpointId ? 'endpoint' : 'page'
    setParentId(parentId)
    setParentType(parentType)
  }

  const handleFeedback = (type) => {
    setFeedbackGiven(true)
    setFeedbackType(type)
    setShow(true)
    // setshowSolidDislike(!showSolidDislike)
    setLiked(false)
  }

  const savelocalstorage = (key, value) => {
    let objList = {}
    try {
      objList = JSON.parse(window.localStorage.getItem('review')) || {}
    } catch {
      objList = {}
    }
    objList[key] = value
    setCurrentReviews(objList)
    window.localStorage.setItem('review', JSON.stringify(objList))
  }

  const handleDislike = () => {
    const pageId = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)
    const feedback = {
      pageId,
      comment,
      email
    }
    dislike(feedback)
      .then((response) => {
        setFeedbackSaved(true)
        setEmail(response.email)
        setComment(response.comment)
        setVote(null)
      })
      .catch((error) => {
        console.error(error)
      })
    setShowSolidDislike(true)
  }

  const handleLikeButton = () => {
    if (feedbackGiven) {
      return
    }

    const pageId = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW)

    like(pageId)
      .then((response) => {
        savelocalstorage(parentId, getVoteKey(vote))
        setEmail('')
        setComment('')
        setVote(null)
        setFeedbackGiven(true)
        setFeedbackType('LIKE')
      })
      .catch((error) => {
        console.error(error)
      })

    setLiked(!liked)

    if (!liked) {
      setShowSolidDislike(false)
    }
  }

  const getVoteKey = (value) => {
    return value === 1 ? LIKE : DISLIKE
  }

  const handleInput = (event) => {
    event.preventDefault()
    const { name, value } = event.target
    if (name === 'email') setEmail(value)
    else if (name === 'comment') setComment(value)
  }
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(String(email).toLowerCase())
  }

  const renderFeedbackResponse = () => {
    if (feedbackSaved || feedbackType === 'LIKE') {
      return
    } else if (feedbackType === 'DISLIKE') {
      return (
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Sorry to hear that. What can we do better?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className='mb-3' controlId='exampleForm.ControlInput1'>
                <Form.Label>Email address</Form.Label>
                <Form.Control type='email' placeholder='name@example.com' autoFocus onChange={handleInput} value={email} name='email' />
                {!validateEmail(email) && email && <div className='text-danger font-12'>Invalid email address</div>}
              </Form.Group>
              <Form.Group className='mb-3' controlId='exampleForm.ControlTextarea1'>
                <Form.Label>
                  Comment <VscStarFull size='8' color='red' />
                </Form.Label>
                <Form.Control
                  placeholder='Enter comment'
                  as='textarea'
                  onChange={handleInput}
                  rows={3}
                  value={comment}
                  type='text'
                  name='comment'
                />
                {comment && comment.trim().length < 5 && <div className='text-danger font-12'>Comment must be at least 5 characters long</div>}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {show && (
              <Button
                variant='primary'
                onClick={() => {
                  handleDislike()
                  handleClose()
                }}
                disabled={!comment.trim()}
              >
                Send
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )
    }
  }
  const [liked, setLiked] = useState(false)
  return (
    !isDashboardRoute({ location }) && (
      <>
        <div className='position-relative'>
          <p className='d-flex justify-content-center Modified-at mb-1'>Was this page helpful?</p>
          <div className='d-flex justify-content-center like-unline font-18'>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='like-tooltip'>Helpful</Tooltip>}>
              <div
                className='cursor-pointer'
                onClick={() => {
                  handleLikeButton()
                }}
              >
                {liked ? <BiSolidLike size={20} /> : <BiLike size={20} />}
              </div>
            </OverlayTrigger>
            <OverlayTrigger placement='bottom' overlay={<Tooltip id='dislike-tooltip'>Not helpful</Tooltip>}>
              <div
                className='cursor-pointer'
                onClick={() => {
                  handleFeedback('DISLIKE')
                }}
              >
                {showSolidDislike ? <BiSolidDislike size={20} /> : <BiDislike size={20} />}
              </div>
            </OverlayTrigger>
          </div>
          {feedbackGiven && renderFeedbackResponse()}
        </div>
      </>
    )
  )
}

export default ApiDocReview
