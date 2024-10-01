  import React, { useEffect, useState } from 'react'
  import { Form } from 'react-bootstrap'
  import { useDispatch, useSelector } from 'react-redux'
  import { useParams } from 'react-router'
  import { updateAllEndpointCheckStatus } from '../../../store/clientData/clientDataActions'
  import {useQuery } from 'react-query'
  import { parseCronExpression, generateCronExpression } from '../../common/utility'
  import { updateCron } from '../../../services/cronJobs'
  import { toast } from 'react-toastify'

  const EditRuns = () => {
    const params = useParams()
    const dispatch = useDispatch()

    const { allPages, collectionName, clientData, allEnviroments } = useSelector((state) => {
      return {
        allPages: state.pages,
        collectionName: state.collections?.[params?.collectionId]?.name || 'collection',
        clientData: state.clientData,
        collections: state.collections,
        allEnviroments: state?.environment?.environments,
      }
    })

    const { data: cronData } = useQuery(
      ['scheduledRuns', params?.collectionId],
      {
        staleTime: 100000,
        cacheTime: 300000
      }
    );

    const [endpointsIds, setEndpiontsIds] = useState([])
    const [scheduleName, setScheduleName] = useState('')
    const [selectedEndpointIds, setSelectedEndpointIds] = useState([])
    const [basicRunFrequency, setBasicRunFrequency] = useState('')
    const [runFrequency, setRunFrequency] = useState('')
    const [runTime, setRunTime] = useState('')
    const [currentEnvironment, setCurrentEnvironmentId] = useState('')
    const [emailInput, setEmailInput] = useState([])

    useEffect(() => {
      filterEndpointsOfCollection()
      if (cronData) {
        const matchingCron = cronData.find(cron => cron.id === params?.cronId);
        const { basicRunFrequency, runFrequency, runTime } = parseCronExpression(matchingCron.cron_expression);
        const environmentId = matchingCron.environmentId;
        if (matchingCron) {
          setScheduleName(matchingCron.cron_name || '');
          setSelectedEndpointIds(matchingCron.endpointIds || []);
          setBasicRunFrequency(basicRunFrequency);
          setRunFrequency(runFrequency);
          setRunTime(runTime);
          setCurrentEnvironmentId(environmentId)
          setEmailInput(matchingCron.emails)
        }
      }
    }, [params?.collectionId, cronData, params?.cronId])

    const filterEndpointsOfCollection = () => {
      const endpointsIds = Object.keys(allPages).reduce((acc, pageId) => {
        if (allPages[pageId]?.collectionId === params?.collectionId && allPages[pageId].protocolType === 1) acc.push(pageId)
        return acc
      }, [])
      setEndpiontsIds(endpointsIds)
    }

    const handleSelectAndDeselectAll = (isSelectAll) => {
      dispatch(updateAllEndpointCheckStatus({ isSelectAll, endpointsIds }))
    }

    const renderEndpointName = (endpointId) => {
      return (
        <div className='d-flex justify-content-center align-items-center'>
          <span className={`api-label ${allPages?.[endpointId]?.requestType} request-type-bgcolor mr-2`}>
            {allPages?.[endpointId]?.requestType}
          </span>
          <span>{allPages?.[endpointId]?.name || 'Endpoint'}</span>
        </div>
      )
    }

    const handleEmailInputChange = (e) => {
      const inputValue = e.target.value
      const lastChar = inputValue[inputValue.length - 1]
      const emailsArray = inputValue.split(',').map((email) => email.trim())
      setEmailInput(emailsArray)
    }

    const handleSaveChanges = async () => { 
      const id = params?.cronId
      const status = cronData.find(cron => cron.cron_id ).status
      const cronUpdateData = {
        id,
        cron_name: scheduleName,
        cron_expression: generateCronExpression(basicRunFrequency, runFrequency, runTime),
        environmentId: currentEnvironment,
        emails: emailInput,
        // endpointsIds: selectedEndpointIds,
        status
      };

      try {
        await updateCron(cronUpdateData);
        return toast.success('Cron job updated successfully!');
      } catch (error) {
        return toast.error('Error updating cron job:', error);
      }
    };

    return (
      <div className='run-automation-container'>
        <div className='endpoints-container'>
          <h3 className='text-left'>Run Automation for {`${collectionName}`}</h3>
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
                </div>
              </div>
              <div className='mt-1 d-flex flex-column align-items-start justify-content-center'>
                {endpointsIds.map((endpointId) => {
                  const isChecked = selectedEndpointIds.includes(endpointId)
                  return (
                    <Form.Check
                      // onClick={() => handleEndpointChange(endpointId)}
                      className='mt-2'
                      type='checkbox'
                      id={endpointId}
                      label={renderEndpointName(endpointId)}
                      checked={isChecked}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className='options-container'>
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
              <Form.Control as='select'
                value={basicRunFrequency}
                onChange={(e) => setBasicRunFrequency(e.target.value)}
              >
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
              </Form.Control>
            </Form.Group>
            <div className='d-flex justify-content-between'>
              <Form.Group className='w-50 pr-2'>
                <Form.Control as='select'
                  value={runFrequency}
                  onChange={(e) => setRunFrequency(e.target.value)}
                >
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
                <Form.Control type='time'
                  value={runTime}
                  onChange={(e) => setRunTime(e.target.value)}
                />
              </Form.Group>
            </div>
            <Form.Group>
              <Form.Label className='muted-text'>Environment</Form.Label>
              <Form.Control as='select'
                value={currentEnvironment || ''} onChange={(e) => setCurrentEnvironmentId(e.target.value)}
              >
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
              <Form.Control type='text' placeholder='Add recipient'
              value={emailInput} onChange={handleEmailInputChange} 
              />
            </Form.Group>
          </div>
          <button onClick={handleSaveChanges} className='btn btn-primary btn-sm font-12 d-flex justify-content-center align-items-center'>
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    )
  }

  export default EditRuns;

