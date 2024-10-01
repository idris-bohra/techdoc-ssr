import React, { Component } from 'react'
import './testResults.scss'

class TestResults extends Component {
  state = {}
  render() {
    return this.props.tests.length > 0 ? (
      <div className='test-results-container px-2'>{this.props.tests.map((test, index) => this.renderTestResult(test, index))}</div>
    ) : (
      this.renderEmpty()
    )
  }

  renderTestResult(testcase, index) {
    let details = testcase.testName
    if (!testcase.success) {
      details += ` (${testcase.msg})`
    }
    return (
      <div key={index} className='test-result-item my-2'>
        <div className={`test-badge ${testcase.status}`}>{testcase.status}</div>
        <span className='name'>{details}</span>
      </div>
    )
  }

  renderEmpty() {
    return (
      <div className='px-3 py-5 text-center'>
        <div>There are no tests for this request.</div>
        <small>Write a test script to automate debugging</small>
      </div>
    )
  }
}

export default TestResults
