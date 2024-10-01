import React, { useMemo } from 'react';
import './manualRuns.scss';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import moment from 'moment'

const formatDate = (date) => moment(date).format('MMMM D, YYYY [at] HH:mm:ss');
function ManualRuns() {
  const params = useParams()
  const { automation, activeTabId, collections, pages } = useSelector((state) => {
    return {
      automation: state.automation,
      activeTabId: state.tabs.activeTabId,
      collections: state.collections,
      pages: state.pages
    }
  })
  const collectionId = params?.collectionId
  const averageResponseTime = useMemo(() => {
    const responseTime = automation[activeTabId]?.responseTime || 0;
    const executionOrderLength = automation[activeTabId]?.executionOrder.length || 1;
    return responseTime / executionOrderLength;
  }, [automation, activeTabId]);

  return (
    <div className="manual-runs-container">
      <h1> {collections[collectionId]?.name} - Run results</h1>
      <div className="run-details">
        <span>Ran on {formatDate(automation[activeTabId]?.date)}</span>
        <a className='ml-2' href={`/orgs/:orgId/dashboard/collection/${collectionId}/runs`}>View all runs</a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Environment</th>
            <th>Iterations</th>
            <th>Duration</th>
            <th>All tests</th>
            <th>Avg. Resp. Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Runner</td>
            <td>New Environment</td>
            <td>1</td>
            <td>{automation[activeTabId]?.responseTime}ms</td>
            <td>0</td>
            <td>{averageResponseTime.toFixed(2)} ms</td>
          </tr>
        </tbody>
      </table>
      <div className="test-results">
        <h2>All Tests</h2>
        <div className="iteration-details">
          {automation[activeTabId]?.executionOrder.map(id => (
            <>
              <div className='iteration-details-api d-flex justify-content-between' key={id}>
                <div>
                  <span className={`${pages[id]?.requestType} request-type-bgcolor mr-2`}>{pages[id]?.requestType} </span>
                  <span>{pages[id]?.name}</span>
                </div>
                <div className="run-details" >
                  <span>{automation[activeTabId]?.executedScriptResponses[id]?.requestDuration}ms</span>
                  <span className='ml-1'>{automation[activeTabId]?.executedScriptResponses[id]?.status}</span>
                </div>
              </div>
              <div>
                {Object.entries(automation[activeTabId]?.executedScriptResponses[id]?.data || {}).map(([key, value]) => (
                  <div key={key}>{`${key}: ${value}`}</div>
                ))}
              </div>
              <div>{automation[activeTabId]?.executedScriptResponses[id]?.endpointError}</div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManualRuns;