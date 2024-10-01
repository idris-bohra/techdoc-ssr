import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ReactComponent as EmptyHistory } from '../../assets/icons/emptyHistroy.svg'
import { Dropdown } from 'react-bootstrap'
import { GrGraphQl } from 'react-icons/gr'
import './history.scss'

function compareByCreatedAt(a, b) {
  const t1 = a?.createdAt
  const t2 = b?.createdAt
  let comparison = 0
  if (t1 < t2) {
    comparison = 1
  } else if (t1 > t2) {
    comparison = -1
  }
  return comparison
}

const History = () => {
  const { orgId } = useParams()
  const navigate = useNavigate()

  const historySnapshots = useSelector((state) => state.history)

  const [historySnapshot, setHistorySnapshot] = useState([])

  useEffect(() => {
    if (historySnapshots) {
      setHistorySnapshot(Object.values(historySnapshots))
    }
  }, [historySnapshots])

  const openHistorySnapshot = (id) => {
    navigate(`/orgs/${orgId}/dashboard/history/${id}`, {
      state: { historySnapshotId: id }
    })
  }

  const renderName = (history) => {
    const baseUrl = history?.endpoint?.BASE_URL ? history?.endpoint?.BASE_URL + history?.endpoint?.uri : history?.endpoint?.uri
    const endpointName = history?.endpoint?.name || baseUrl || 'Random Trigger'
    return endpointName
  }

  const renderHistoryItem = (history) => {
    return (
      Object.keys(history).length !== 0 && (
        <Dropdown.Item
          key={history.id}
          className='history-option btn d-flex align-items-center mb-2 pt-2'
          onClick={() => {
            openHistorySnapshot(history.id)
          }}
        >
          {history?.endpoint?.protocolType === 1 && (
            <div className={`api-label lg-label ${history?.endpoint?.requestType}`}>
              <div className='endpoint-request-div'>{history?.endpoint?.requestType}</div>
            </div>
          )}
          {history?.endpoint?.protocolType === 2 && <GrGraphQl className='ml-2 graphql-icon' size={14} />}
          <div className='ml-3'>
            <div className='sideBarListWrapper'>
              <div className='text-left'>
                <p>{renderName(history)}</p>
              </div>
              <small className='text-muted'>{moment(history.createdAt).format('ddd, Do MMM h:mm a')}</small>
            </div>
          </div>
        </Dropdown.Item>
      )
    )
  }

  const renderHistoryList = () => {
    if (!historySnapshot || historySnapshot.length === 0) {
      return (
        <div className='empty-collections text-center'>
          <div>
            <EmptyHistory />
          </div>
          <div className='content'>
            <h5>No History available.</h5>
          </div>
        </div>
      )
    }

    const groupedHistory = {}

    historySnapshot.forEach((history) => {
      const today = moment().startOf('day')
      const createdAtMoment = moment(history.createdAt)
      let dateGroup

      if (today.isSame(createdAtMoment, 'day')) {
        dateGroup = 'Today'
      } else if (createdAtMoment.isSame(today.clone().subtract(1, 'days'), 'day')) {
        dateGroup = 'Yesterday'
      } else {
        dateGroup = createdAtMoment.format('MMMM D, YYYY')
      }

      if (!groupedHistory[dateGroup]) {
        groupedHistory[dateGroup] = []
      }

      groupedHistory[dateGroup].push(history)
    })

    const sortedGroupedHistory = Object.entries(groupedHistory).sort(([dateGroupA], [dateGroupB]) => {
      if (dateGroupA === 'Today') return -1
      if (dateGroupB === 'Today') return 1
      if (dateGroupA === 'Yesterday') return -1
      if (dateGroupB === 'Yesterday') return 1
      return moment(dateGroupB, ['MMMM D, YYYY']).diff(moment(dateGroupA, ['MMMM D, YYYY']))
    })

    const dropdowns = sortedGroupedHistory.map(([dateGroup, histories]) => (
      <ul key={dateGroup}>
        <li>
          <h6 className='pb-4 ml-3'>{dateGroup}</h6>
          <ul>
            {histories.sort(compareByCreatedAt).map((history) => (
              <li
                key={history.id}
                onClick={() => {
                  openHistorySnapshot(history.id)
                }}
              >
                {renderHistoryItem(history)}
              </li>
            ))}
          </ul>
        </li>
      </ul>
    ))

    return <div className='mt-3 dropdown-menu-center px-2'>{dropdowns}</div>
  }

  return renderHistoryList()
}

export default History
