// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import { ReactComponent as EmptyResponseImg } from './img/empty-response.svg'
import React, { Component, createRef } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import { hexToRgb, isDashboardRoute, isSavedEndpoint } from '../common/utility'
import { getCurrentUser } from '../auth/authServiceV2'
import SampleResponseForm from './sampleResponseForm'
import { Overlay, Spinner, Tooltip } from 'react-bootstrap'
import TestResults from './testResults'
import { connect } from 'react-redux'
import AceEditor from 'react-ace'
import { background } from '../backgroundColor'
import classNames from 'classnames';
import { FaPlus } from 'react-icons/fa'
import { RiCheckboxMultipleBlankLine } from 'react-icons/ri'
import JSONPrettyMon from 'react-json-pretty/dist/monikai'
import { ReactComponent as Example } from '../../assets/icons/example.svg';



const mapStateToProps = (state) => {
  return {
    tabs: state?.tabs?.tabs,
  }
}


class DisplayResponse extends Component {
  state = {
    rawResponse: false,
    prettyResponse: true,
    previewResponse: false,
    responseString: '',
    timeElapsed: '',
    show: false,
    showSampleResponseForm: { add: false, delete: false, edit: false },
    theme: '',
    showCopyMessage: false,
    selectedResponseTab: 'body',
    isOpen: false,
    output: null,
    isShow: false,
    Open: false,
    Show: false,
    selectedBodyTab: 'pretty',
    data: {},
    showPreScript: true,
  }

  constructor(props) {
    super(props)
    this.copyDivRef = createRef()
    this.myRef = React.createRef();
  }
  handleAceEditorChange = (value) => {
    const data = { ...this.state.data }
    data.body = value
    this.setState({ data })
  }

  responseTime() {
    const timeElapsed = this.props.timeElapsed
    this.setState({ timeElapsed })
  }

  rawDataResponse() {
    this.setState({
      rawResponse: true,
      previewResponse: false,
      prettyResponse: false,
      responseString: JSON.stringify(this.props.response.data)
    })
  }

  prettyDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: false,
      prettyResponse: true,
      responseString: JSON.stringify(this.props.response)
    })
  }

  previewDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: true,
      prettyResponse: false
    })
  }

  addSampleResponse(response) {
    this.openAddForm(response, null, 'Add Sample Response')
  }

  handleAddExampleRequest = () => {
      this.props.handleSave(null,null,null,'example');
  };

  openAddForm(obj, index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.add = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    })
  }

  closeForm() {
    const showSampleResponseForm = { add: false, delete: false, edit: false }
    this.setState({ showSampleResponseForm })
  }

  showAddForm() {
    return (
      this.state.showSampleResponseForm.add && (
        <SampleResponseForm
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
          index={this.state.index}
        />
      )
    )
  }

  componentDidMount() {
    const dynamicColor = hexToRgb(this.props.publicCollectionTheme, 0.02);
    const staticColor = background['background_boxes'];

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `,
    };

    this.setState({
      theme: { backgroundStyle },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.response !== this.props.response) {
      this.setState({ selectedResponseTab: 'body' })
    }
  }

  showCopyMessage() {
    this.setState({ showCopyMessage: true })
    setTimeout(
      function () {
        this.setState({ showCopyMessage: false })
      }.bind(this),
      2000
    )
  }

  displayBodyAndHeaderResponse() {
    const { data, errors } = this.state

    const TestResultsPreview = () => {
      const tests = this.props.tests
      if (!tests) return null
      const failedTests = tests.filter((test) => test.success === false)
      const passedTests = tests.filter((test) => test.success === true)
      let testMessage = ''
      let testMessageColor = 'inherit'
      if (failedTests.length) {
        testMessage = `(${failedTests.length}/${tests.length} Failed)`
        testMessageColor = 'red'
      } else if (passedTests.length) {
        testMessage = `(${passedTests.length}/${tests.length} Passed)`
        testMessageColor = 'green'
      }
      return <span style={{ color: testMessageColor }}>{testMessage}</span>
    }
    return (
      <>
        <div className='custom-tabs' ref={this.myRef}>
          <ul className='nav nav-tabs  respTabsListing border-0 rounded-0 w-100' id='myTab' role='tablist'>
            <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'body' }) }}>
              <a
                className={this.state.selectedResponseTab === 'body' ? 'nav-link active text-black' : 'nav-link text-grey'}
                style={this.state.selectedResponseTab === 'body' ? { borderColor: this.props.publicCollectionTheme } : {}}
                id='pills-response-tab'
                data-toggle='pill'
                role='tab'
                aria-controls={isDashboardRoute(this.props) ? `response-${this.props.tab.id}` : 'response'}
                aria-selected='true'
              >
                Body
              </a>
            </li>
            <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'header' }) }}>
              <a
                className={this.state.selectedResponseTab === 'header' ? 'nav-link active text-black' : 'nav-link text-grey'}
                style={this.state.selectedResponseTab === 'header' ? { borderColor: this.props.publicCollectionTheme } : {}}
                id='pills-header-tab'
                data-toggle='pill'
                aria-selected='false'
                href='#pills-header-tab'
                role='tab1'
              >
                Headers
              </a>
            </li>
            {isDashboardRoute(this.props) && (
              <>
                <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'testResults' }) }}>
                  <a
                    className={this.state.selectedResponseTab === 'testResults' ? 'nav-link active text-black' : 'nav-link text-grey'}
                    id='pills-testResults-tab'
                    data-toggle='pill'
                    aria-selected='false'
                    href='#pills-testResults-tab'
                    role='tab2'
                  >
                    Test Results <TestResultsPreview />
                  </a>
                </li>
                <li className='nav-item' onClick={() => { this.setState({ selectedResponseTab: 'console' }) }}>
                  <a
                    className={this.state.selectedResponseTab === 'console' ? 'nav-link active text-black' : 'nav-link text-grey'}
                    style={this.state.selectedResponseTab === 'console' ? { backgroundColor: this.props.publicCollectionTheme } : {}}
                    id='pills-console-tab'
                    data-toggle='pill'
                    aria-selected='false'
                    href='#pills-console-tab'
                    role='tab1'
                  >
                    Console
                  </a>
                </li>
              </>
            )}
          </ul>

          {/* Content Area */}
          <div className='tab-content ml-0'>
            {this.state.selectedResponseTab === 'body' && (
              <div>
                <div className='d-flex justify-content-between align-items-center mt-3 mb-1'>
                  <ul className='nav nav-pills body-button rounded'>
                    <li className='nav-item cursor-pointer' onClick={() => this.setState({ selectedBodyTab: 'pretty' })}>
                      <a className={this.state.selectedBodyTab === 'pretty' ? 'nav-link active px-3 py-1 font-10 text-black' : 'nav-link px-3 py-1 font-10 text-grey'}>Pretty</a>
                    </li>
                    <li className='nav-item cursor-pointer' onClick={() => this.setState({ selectedBodyTab: 'raw' })}>
                      <a className={this.state.selectedBodyTab === 'raw' ? 'nav-link active px-3 py-1 font-10 text-black' : 'nav-link px-3 py-1 font-10 text-grey'}>Raw</a>
                    </li>
                    <li className='nav-item cursor-pointer' onClick={() => this.setState({ selectedBodyTab: 'preview' })}>
                      <a className={this.state.selectedBodyTab === 'preview' ? 'nav-link active px-3 py-1 font-10 text-black' : 'nav-link px-3 py-1 font-10 text-grey'}>Preview</a>
                    </li>
                  </ul>
                  {getCurrentUser() && isSavedEndpoint(this.props) && isDashboardRoute(this.props) ? (
                    <div
                      // style={{ float: "right" }}
                      className='add-to-sample-response'
                    >
                      <div className='adddescLink d-flex align-items-center gap-1 icon-button px-2 py-1' onClick={() => this.handleAddExampleRequest()}>
                        <Example /> Save as Example Request
                      </div>
                      <div className='adddescLink d-flex align-items-center gap-1 icon-button px-2 py-1' onClick={() => this.addSampleResponse(this.props.response)}>
                        <FaPlus /> Add to Sample Response
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className='tab-content'>
                  {this.state.selectedBodyTab === 'pretty' && <div>
                    <AceEditor
                      style={{ border: '1px solid rgb(206 213 218)', fontFamily: 'monospace'  }}
                      className='custom-raw-editor'
                      mode='json'
                      theme='github'
                      value={JSON.stringify(this.props.response.data, null, 2)}
                      onChange={this.handleAceEditorChange}
                      setOptions={{
                        showLineNumbers: true
                      }}
                      editorProps={{
                        $blockScrolling: false
                      }}
                      onLoad={(editor) => {
                        editor.focus()
                        editor.getSession().setUseWrapMode(true)
                        editor.setShowPrintMargin(false)
                      }}
                    />
                  </div>}
                  {this.state.selectedBodyTab === 'raw' && <div> <>
                    {isDashboardRoute(this.props) && (
                      <div className='tab-content bg-white border rounded' id='myTabContent'>
                        <div className='tab-pane fade show active' id='home' role='tabpanel' aria-labelledby='home-tab'>
                          <JSONPretty className='raw-response' theme={JSONPrettyMon} data={this.props.response.data} />
                        </div>
                        <div className='tab-pane fade' id='profile' role='tabpanel' aria-labelledby='profile-tab'>
                          {JSON.stringify(this.props.response.data)}
                        </div>
                        <div className='tab-pane fade' id='contact' role='tabpanel' aria-labelledby='contact-tab'>
                          Feature coming soon... Stay tuned
                        </div>
                      </div>
                    )}
                    {!isDashboardRoute(this.props) && (
                      <div className='tab-content'>
                        <JSONPretty theme={JSONPrettyMon} data={this.props.response.data} />
                      </div>
                    )}
                  </></div>}
                  {this.state.selectedBodyTab === 'preview' && <div>
                    <div className='border p-2 rounded bg-white' dangerouslySetInnerHTML={{ __html: JSON.stringify(this.props.response.data) }} />
                  </div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  renderTableData() {
    const headerContent = this.props.response.headers
    const headerContentKeys = Object.keys(headerContent)
    return headerContentKeys.map((key, index) => {
      const value = headerContent[key]
      return (
        <tr key={key}>
          <th className='text-nowrap' scope='row'>
            {key}
          </th>
          <td className='text-break'>{value}</td>
        </tr>
      )
    })
  }
  renderResponseHeader() {
    const { originalHeaders } = this.props.endpointContent
    return (
      <div>
        {originalHeaders.map((header, index) => (
          <div key={index}>
            {Object.entries(header).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  displayHeader() {
    if (this.props.response.headers) {
      return (
        <div className='response-headers-container'>
          <table className='table table-sm'>
            <thead>
              <tr>
                <th scope='col'>Key</th>
                <th scope='col'>Value</th>
              </tr>
            </thead>
            <tbody>{this.renderTableData()}</tbody>
          </table>
        </div>
      )
    }
  }

  displayConsole() {
    return (
      <div className='test-results-container mt-1'>{this.renderConsole()}</div>
    )
  }

  toggleDropdown = () => {
    this.setState({ isOpen: !this.state.isOpen })
  }

  toggleDropdownBody = () => {
    this.setState({ Open: !this.state.Open })
  }
  toggleDropdownHeaders = () => {
    this.setState({ isShow: !this.state.isShow })
  }
  toggleDropdownRequest = () => {
    this.setState({ Show: !this.state.Show })
  }

  handlePreScriptClick = () => {
    this.setState({ showPreScript: true });
  };

  handlePostScriptClick = () => {
    this.setState({ showPreScript: false });
  };

  renderConsole() {
    const { tabs, activeTabId } = this.props;
    const { showPreScript } = this.state;
    const checkWhetherJsonOrNot = (data) => {
      try {
        if (JSON.parse(data)) return true
        return false
      }
      catch (error) {
        return false
      }
    }

    function RenderConsoleComponent(props) {
      let consoleString = ''
      props.data.forEach((singleConsole, index) => {
        const isJson = checkWhetherJsonOrNot(singleConsole)
        if (isJson) consoleString = consoleString + (index === 0 ? '' : '\n\n') + JSON.stringify(JSON.parse(singleConsole), null, 2)
        else consoleString = consoleString + (index === 0 ? '' : '\n\n') + singleConsole
      })
      return (
        <div className='p-2'>
          <AceEditor
            style={{ border: '1px solid rgb(206 213 218)',fontFamily: 'Inter' }}
            className='custom-raw-editor'
            mode='json'
            theme='github'
            value={consoleString}
            showGutter={false}
            readOnly={true}
            setOptions={{
              showLineNumbers: true
            }}
            editorProps={{
              $blockScrolling: false
            }}
            onLoad={(editor) => {
              editor.getSession().setUseWrapMode(true)
              editor.setShowPrintMargin(false)
            }}
          />
        </div>
      )
    }

    return (
      <div className='w-100'>
        <div className='console-button mt-3 mb-1 rounded'>
          <button
            className={classNames('script-button rounded font-10 btn-sm btn', { active: showPreScript })}
            onClick={this.handlePreScriptClick}
          >
            Pre-Script
          </button>
          <button
            className={classNames('script-button rounded font-10 btn-sm btn', { active: !showPreScript })}
            onClick={this.handlePostScriptClick}
          >
            Post-Script
          </button>
        </div>
        <RenderConsoleComponent data={showPreScript ? tabs?.[activeTabId]?.preScriptExecutedData || [] : tabs?.[activeTabId]?.postScriptExecutedData || []} />
      </div>
    )
  }

  renderBlank() {
    return (
      <div className='px-3 py-5 text-center'>
        <div>No logs yet.</div>
        <small>Send a request to view its detail in the console</small>
      </div>
    )
  }

  renderLoader() {
    return (
      <div className='text-center my-5'>
        <Spinner variant='dark' animation='border' />
        <div className='my-2'>Sending Request</div>
        <button className='btn btn-outline orange' onClick={this.props.handleCancel}>
          Cancel
        </button>
      </div>
    )
  }

  renderRequestError() {
    return (
      <div className='text-center my-5'>
        <div>Could not send request</div>
        <small className='text-danger'>{this.props?.response?.data}</small>
      </div>
    )
  }

  renderStatusMessage() {
    const { status, statusText } = this.props.response
    const color = status >= 400 || status >= 500 ? 'error' : status >= 200 && status < 300 ? 'success' : 'regular'
    return <div className={`response-status-value-${color}`}>{status + ' ' + statusText}</div>
  }

  render() {
    const { theme } = this.state
    return (
      <div className='endpoint-response-container overflow-auto mt-2' style={this.state?.theme?.backgroundStyle}>
        {this.props.loader ? (
          this.renderLoader()
        ) : this.props?.flagResponse ? (
          this.props?.response?.status ? (
            <div>
              <div className='response-status justify-content-end'>
                <div className='statusWrapper'>
                  {this.props?.response?.status && (
                    <div id='status'>
                      <div className='response-status-item-name'>Status :</div>
                      {this.renderStatusMessage()}
                    </div>
                  )}
                  <div id='time'>
                    <div className='response-status-item-name'>Time:</div>
                    <div className='response-status-value' style={{ color: theme }}>
                      {this.props?.timeElapsed} ms
                    </div>
                  </div>
                  <Overlay target={this.copyDivRef.current} show={this.state.showCopyMessage} placement='top'>
                    <Tooltip id='copy-message'>Copied</Tooltip>
                  </Overlay>
                  <div className='resPubclipboardWrapper' ref={this.copyDivRef} onClick={() => this.showCopyMessage()}>
                    <CopyToClipboard text={JSON.stringify(this.props?.response?.data)} onCopy={() => this.setState({ copied: true })}>
                    <button>
                    <RiCheckboxMultipleBlankLine/>
                    </button>
                    </CopyToClipboard>
                  </div>
                </div>
              </div>
              {this.showAddForm()}
              <div className='response-viewer'>
                <div className='response-tabs'>
                  
                </div>
                {this.props.response.status && this.displayBodyAndHeaderResponse()}
                {this.state.selectedResponseTab === 'header' && this.props.response.headers && this.displayHeader()}
                {this.state.selectedResponseTab === 'testResults' && isDashboardRoute(this.props) && this.props.tests && (
                  <TestResults tests={this.props.tests} />
                )}
                {this.state.selectedResponseTab === 'console' && this.displayConsole()}
              </div>
            </div>
          ) : (
            this.renderRequestError()
          )
        ) : (
          <div>
            <div className='empty-response'>Response</div>
            <div className='empty-response-container'>
              <EmptyResponseImg />
              <p className='mt-0'>Hit Send to trigger the API call</p>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(DisplayResponse)
