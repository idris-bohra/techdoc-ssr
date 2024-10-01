import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { IoIosPlay } from 'react-icons/io'
import { updateEndpointCheckStatus, updateAllEndpointCheckStatus } from '../../../store/clientData/clientDataActions'
import { toast } from 'react-toastify'
import './runAutomation.scss'
import { addCron, addWebhook } from '../../../services/cronJobs'
import { generateCronExpression } from '../../common/utility'
import { RiAiGenerate, RiCheckboxMultipleLine } from 'react-icons/ri'
import { FaExclamationCircle, FaLongArrowAltLeft } from 'react-icons/fa'
import { runAutomations, generateDescription } from './redux/runAutomationActions'
import { FiCopy } from 'react-icons/fi'
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaArrowLeft, FaMeta } from "react-icons/fa6";
import { IoInformationCircle } from "react-icons/io5";
import { updateEndpoint } from '../../endpoints/endpointApiService'
import { getCurrentOrg } from '../../auth/authServiceV2'
import IconButton from '../../common/iconButton'

export default function RunAutomation() {
  const userEmail = JSON.parse(localStorage.getItem('profile'))?.email || 'email not found'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const orgId = getCurrentOrg()?.id
  const webhookURL = `${import.meta.env.VITE_API_URL}/call-webhook`

  const { allPages, collectionName, clientData, currentEnvironmentId, allEnviroments, currentUser, users } = useSelector((state) => {
    return {
      allPages: state.pages,
      collectionName: state.collections?.[params?.collectionId]?.name || 'collection',
      clientData: state.clientData,
      collections: state.collections,
      currentEnvironmentId: state?.environment.currentEnvironmentId,
      allEnviroments: state?.environment?.environments,
      currentUser: state?.users?.currentUser,
      users: state?.users?.usersList
    }
  })

  const [endpointsIds, setEndpiontsIds] = useState([])
  const [automationLoading, setAutomationLoading] = useState(false)
  const [runType, setRunType] = useState('manual')
  const [scheduleName, setScheduleName] = useState('')
  const [runFrequency, setRunFrequency] = useState('Every day')
  const [runTime, setRunTime] = useState('12:00')
  const [currentEnvironment, setCurrentEnvironmentId] = useState('')
  const [emailInput, setEmailInput] = useState([])
  const [basicRunFrequency, setBasicRunFrequency] = useState('Daily')
  const [webhookResponse, setWebhookResponse] = useState('')
  const [tokenGenerationInProgress, setTokenGenerationInProgress] = useState(false)
  const [webhookUrlCopied, setwebhookUrlCopied] = useState(false)
  const [webhookResponseCopied, setwebhookResponseCopied] = useState(false)
  const [showAiIcon, setShowAiIcon] = useState(false)

  useEffect(() => {
    filterEndpointsOfCollection()
    renderEndpointName()
    if (runType !== 'webhook') {
      setTokenGenerationInProgress(false)
    }
    const hasIssues = Object.keys(allPages).some(pageId =>
      !allPages?.[pageId]?.description || !allPages?.[pageId]?.sampleResponse
    );
    setShowAiIcon(hasIssues);
  }, [params?.collectionId])

  const filterEndpointsOfCollection = () => {
    const endpointsIds = Object.keys(allPages).reduce((acc, pageId) => {
      if (allPages[pageId]?.collectionId === params?.collectionId && allPages[pageId].protocolType === 1) acc.push(pageId)
      return acc
    }, [])
    setEndpiontsIds(endpointsIds)
  }

  const getEndpointsWithoutDescriptionOrResponse = () => {
    return endpointsIds.filter(pageId =>
      !allPages?.[pageId]?.description || !allPages?.[pageId]?.sampleResponse
    );
  }

  const renderEndpointName = (endpointId) => {
    const hasIssues = !allPages?.[endpointId]?.description || !allPages?.[endpointId]?.sampleResponse;
    return (
      <div className='d-flex justify-content-center align-items-center'>
        <span className={`api-label ${allPages?.[endpointId]?.requestType} request-type-bgcolor mr-2`}>
          {allPages?.[endpointId]?.requestType}
        </span>
        <span>{allPages?.[endpointId]?.name || 'Endpoint'}</span>
        {hasIssues && (
          <OverlayTrigger
            placement="right"
            overlay={
              <Tooltip>
                {!allPages?.[endpointId]?.description && !allPages?.[endpointId]?.sampleResponse
                  ? 'No description and sample response'
                  : !allPages?.[endpointId]?.description
                  ? 'No description'
                  : 'No sample response'}
              </Tooltip>
            }
          >
            <span className='ml-2'>
              <AiOutlineExclamationCircle color='red' size={15} />
            </span>
          </OverlayTrigger>
        )}
      </div>
    )
  }

  const handleEmailInputChange = (e) => {
    const inputValue = e.target.value
    const lastChar = inputValue[inputValue.length - 1]
    const emailsArray = inputValue.split(',').map((email) => email.trim())
    setEmailInput(emailsArray)
  }

  const handleSelectAndDeselectAll = (isSelectAll) => {
    dispatch(updateAllEndpointCheckStatus({ isSelectAll, endpointsIds }))
  }

  const handleChangeEndpointCheckStatus = (endpointId) => {
    dispatch(updateEndpointCheckStatus({ id: endpointId, check: !clientData?.[endpointId]?.automationCheck }))
  }

  const filterSelectedEndpointIds = () => {
    return endpointsIds.reduce((acc, endpointId) => {
      if (clientData?.[endpointId]?.automationCheck === true) acc[endpointId] = allPages?.[endpointId]?.name
      return acc
    }, {})
  }

  const filterSelectedEndpointIdsArray = () => {
    return endpointsIds.filter((endpointId) => clientData?.[endpointId]?.automationCheck === true)
  }

  const handleRunAutomation = async () => {
    const filteredEndpointIds = filterSelectedEndpointIds()
    if (Object.keys(filteredEndpointIds).length === 0) return toast.warn('Please select endpoints')
    if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoint to run the automation')
    setAutomationLoading(true)
    try {
      const responseData = await dispatch(runAutomations({
        endpointIds: filteredEndpointIds,
        collectionId: params?.collectionId,
        userEmail,
        collectionName,
        environmentId: currentEnvironmentId || '',
        runType
      }, params?.collectionId))
      if (responseData.status === 200) {
        setAutomationLoading(false)
        return toast.success('Automation ran successfully!')
      }
    } catch (error) {
      console.error(error)
      setAutomationLoading(false)
      // return toast.error('Error occurred while running automation')
    }
  }

  const handleAskAi = async () => {
    const endpointIdsWithoutDescriptionAndSampleResponse = getEndpointsWithoutDescriptionOrResponse()
    try {
      await dispatch(generateDescription(endpointIdsWithoutDescriptionAndSampleResponse));
      //   endpointIdsWithoutDescriptionAndSampleResponse.forEach(endpointId => {
      //     const updatedData = {
      //         id: endpointId,
      //         description: response[endpointId]?.description, 
      //         sampleResponse: response[endpointId]?.sampleResponse 
      //     };
      //     dispatch(updateEndpoint(updatedData));
      // });
    } catch (error) {
      console.error(error);
      toast.error('Error occurred while generating descriptions.');
    }
  }

  const handleScheduleRun = async () => {
    const filteredEndpointIds = filterSelectedEndpointIdsArray()
    if (Object.keys(filteredEndpointIds).length === 0) return toast.warn('Please select endpoints')
    if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoint to run the automation')
    const cronExpression = generateCronExpression(basicRunFrequency, runFrequency, runTime)
    const cronSchedulerData = {
      collectionId: params?.collectionId,
      cron_name: scheduleName,
      cron_expression: cronExpression,
      description: '',
      environmentId: currentEnvironment,
      emails: emailInput,
      endpointIds: filteredEndpointIds,
      status: 1
    }
    setAutomationLoading(true)
    try {
      const responseData = await addCron(cronSchedulerData)
      if (responseData.status === 201) {
        setAutomationLoading(false)
        return toast.success('Scheduled successfully!')
      }
    } catch (error) {
      console.error(error)
      setAutomationLoading(false)
      return toast.error('Error occurred while scheduling')
    }
  }
  const generateToken = async () => {
    const filteredEndpointIds = filterSelectedEndpointIdsArray()
    if (Object.keys(filteredEndpointIds).length === 0) return toast.warn('Please select endpoints')
    if (filteredEndpointIds.length === 0) return toast.error('Please select at least one endpoint to run the automation')
    const payload = {
      collectionId: params?.collectionId,
      environmentId: currentEnvironment,
      emails: emailInput,
      endpointIds: filteredEndpointIds
    }
    setAutomationLoading(true)
    setTokenGenerationInProgress(true)
    try {
      const responseData = await addWebhook(payload)
      if (responseData.status === 200) {
        setAutomationLoading(false)
        setWebhookResponse(responseData.data.response)
      }
    } catch (error) {
      console.error(error)
      setAutomationLoading(false)
      return toast.error('Error occurred while generating token')
    }
  }

  const handleBack = () => {
    navigate(`/orgs/${orgId}/dashboard`)
  }

  const copyWebhookUrl = (text) => {
    navigator.clipboard.writeText(webhookURL)
    setwebhookUrlCopied(true);
    setTimeout(() => setwebhookUrlCopied(false), 1000);
  }

  const copyWebhookResponse = (text) => {
    navigator.clipboard.writeText(webhookResponse)
    setwebhookResponseCopied(true);
    setTimeout(() => setwebhookResponseCopied(false), 1000);
  }

  return (
    <div className='run-automation-container'>
      <div className='endpoints-container pt-3'>
        <div >
        <button className='btn position-absolute back-button-api-automation btn-sm rounded-circle icon-button' onClick={handleBack}>
          <FaArrowLeft />
        </button>
          <span className='mr-2'><IoInformationCircle size={15} color='#7fbaff' /></span>
          <span className='small-text'>If descriptions and sample responses are not provided, AI will not generate the order, and automation will fail.</span>
          {/* {showAiIcon && (
            <button className='btn btn-primary btn-sm font-12' title='Write your endpoint descriptions through AI' onClick={handleAskAi}>
              <span className='mr-1'><FaMeta /></span>
              Ask AI
            </button>
          )} */}
          <div className='separation'></div>
          <h3 className='text-left'>Run Automation for {`${collectionName}`}</h3>
        </div>
        {endpointsIds.length === 0 ? (
          <div className='p-3 d-flex flex-column justify-content-center'>
            <span className='data-message'>No Endpoint has been found...</span>
          </div>
        ) : (
          <div className='p-3 d-flex flex-column'>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='checkbox-container d-flex align-items-center'>
                <span onClick={() => handleSelectAndDeselectAll(true)} className='ml-1 select-all mr-1 cursor-pointer'>
                  Select All
                </span>
                <div className='separation'></div>
                <span onClick={() => handleSelectAndDeselectAll(false)} className='ml-1 cursor-pointer'>
                  Deselect All
                </span>
                <div className='separation'></div>
              </div>
            </div>
            <div className='mt-1 d-flex flex-column align-items-start justify-content-center'>
              {endpointsIds.map((endpointId) => {
                return (
                  <Form.Check
                    onClick={() => handleChangeEndpointCheckStatus(endpointId)}
                    className='mt-2'
                    type='checkbox'
                    id={endpointId}
                    label={renderEndpointName(endpointId)}
                    checked={clientData?.[endpointId]?.automationCheck || false}
                  />
                )
              })}
            </div>
          </div>
        )}

      </div>
      <div className='options-container'>
        <h5>Choose how to run your collection</h5>
        <Form.Group className='muted-text'>
          <Form.Check
            key={`manual-${runType}`}
            type='radio'
            label='Run manually'
            name='runType'
            id='manual'
            checked={runType === 'manual'}
            onChange={() => setRunType('manual')}
          />
          <Form.Check
            key={`schedule-${runType}`}
            type='radio'
            label='Schedule runs'
            name='runType'
            id='schedule'
            checked={runType === 'schedule'}
            onChange={() => setRunType('schedule')}
          />
          <Form.Check
            key={`webhook-${runType}`}
            type='radio'
            label='Automate runs via webhook'
            name='runType'
            id='webhook'
            checked={runType === 'webhook'}
            onChange={() => setRunType('webhook')}
          />
        </Form.Group>

        {runType === 'schedule' && (
          <div>
            <h5>Schedule Configuration</h5>
            <span>Your collection will be automatically run on the Techdoc at the configured frequency.</span>
            <Form.Group>
              <Form.Label className='muted-text'>Schedule name</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter schedule name'
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className='muted-text'>Run Frequency</Form.Label>
              <Form.Control as='select' value={basicRunFrequency} onChange={(e) => setBasicRunFrequency(e.target.value)}>
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
              </Form.Control>
            </Form.Group>
            <div className='d-flex justify-content-between'>
              <Form.Group className='w-50 pr-2'>
                <Form.Control as='select' value={runFrequency} onChange={(e) => setRunFrequency(e.target.value)}>
                  <option>Every day</option>
                  <option>Every weekday (Monday-Friday)</option>
                  <option>Every Monday</option>
                  <option>Every Tuesday</option>
                  <option>Every Wednesday</option>
                  <option>Every Thursday</option>
                  <option>Every Friday</option>
                </Form.Control>
              </Form.Group>
              <span className='mt-2'>at</span>
              <Form.Group className='w-50 pl-2'>
                <Form.Control type='time' value={runTime} onChange={(e) => setRunTime(e.target.value)} />
              </Form.Group>
            </div>
            <Form.Group>
              <Form.Label className='muted-text'>Environment</Form.Label>
              <Form.Control as='select' value={currentEnvironment || ''} onChange={(e) => setCurrentEnvironmentId(e.target.value)}>
                <option value=''>Select environment</option> // Add this line
                {allEnviroments &&
                  Object.keys(allEnviroments).map((envId) => (
                    <option key={envId} value={envId}>
                      {allEnviroments[envId].name || 'Unnamed Environment'}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className='muted-text'>Email notifications</Form.Label>
              <Form.Control type='text' placeholder='Add recipient' value={emailInput} onChange={handleEmailInputChange} />
            </Form.Group>
          </div>
        )}
        {runType === 'webhook' && (
          <div>
            <h5>Webhook Configuration</h5>
            <span>Automate using webhook</span>
            <Form.Group>
              <Form.Label className='muted-text'>Environment</Form.Label>
              <Form.Control as='select' value={currentEnvironment || ''} onChange={(e) => setCurrentEnvironmentId(e.target.value)}>
                <option value=''>Select environment</option> // Add this line
                {allEnviroments &&
                  Object.keys(allEnviroments).map((envId) => (
                    <option key={envId} value={envId}>
                      {allEnviroments[envId].name || 'Unnamed Environment'}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className='muted-text'>Email notifications</Form.Label>
              <Form.Control type='text' placeholder='Add recipient' value={emailInput} onChange={handleEmailInputChange} />
            </Form.Group>
            {webhookResponse && (
              <div>
                <Form.Group>
                  <Form.Label className='muted-text'>Generated Token</Form.Label>
                  <br />
                  <div className='mt-4 mb-6'>
                    <span>Webhook URL: {webhookURL}</span>
                    <button className='btn btn-outline-secondary ml-2' onClick={() => copyWebhookUrl()}>
                      {webhookUrlCopied ? (
                        <RiCheckboxMultipleLine size={17} color='black' />
                      ) : (
                        <FiCopy size={17} />
                      )}
                    </button>
                  </div>
                  <span style={{ color: '#ff8000' }}>
                    Make sure to copy your personal access token now as you will not be able to see this again.
                  </span>
                  <div className='d-flex mb-3'>
                    <Form.Control type='text' readOnly value={webhookResponse} />
                    <button className='btn btn-outline-secondary ml-2' onClick={() => copyWebhookResponse()}>
                      {webhookResponseCopied ? (
                        <RiCheckboxMultipleLine size={17} color='black' />
                      ) : (
                        <FiCopy size={17} />
                      )}
                    </button>
                    <br />
                  </div>
                  <span className='mt-4'>
                    Expires On:{' '}
                    {new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <br />
                </Form.Group>
                For detailed information, please refer to the documentation section.{' '}
              </div>
            )}
          </div>
        )}
        {runType === 'manual' ? (
          automationLoading ? (
            <button className='btn btn-primary btn-sm font-12 d-flex justify-content-center align-items-center'>
              <span className='spinner-border spinner-border-sm' role='status' aria-hidden='true'></span>
              <span className='ml-1'>Running...</span>
            </button>
          ) : (
            <button onClick={handleRunAutomation} className='btn btn-primary btn-sm font-12 d-flex justify-content-center align-items-center'>
              <IoIosPlay className='mr-1' />
              <span>Run</span>
            </button>
          )
        ) : runType === 'schedule' ? (
          <button onClick={handleScheduleRun} className='btn btn-primary btn-sm font-12 d-flex justify-content-center align-items-center'>
            <IoIosPlay className='mr-1' />
            <span>Schedule Run</span>
          </button>
        ) : (
          <div className='d-flex justify-content-between'>
            <button
              onClick={generateToken}
              disabled={tokenGenerationInProgress}
              className='btn btn-primary btn-sm font-12 d-flex justify-content-center align-items-center'
            >
              <RiAiGenerate className='mr-1' />
              <span>Generate Token</span>
            </button>
            <a href='https://techdoc.walkover.in/p/webhook?collectionId=lkm5WVs2Hc-2' target='_blank' rel='noopener noreferrer'>
              <FaExclamationCircle className='m-1' />
              Learn more.
            </a>
          </div>
        )}
      </div>
    </div>
  )
}