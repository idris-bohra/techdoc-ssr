import 'ace-builds'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/theme-github'
// import 'ace-builds/webpack-resolver'
import { addCompleter } from 'ace-builds/src-noconflict/ext-language_tools'
import React, { Component, createRef } from 'react'
import AceEditor from 'react-ace'
import BodyDescription from './bodyDescription'
import './endpoints.scss'
import GenericTable from './genericTable'
import { isSavedEndpoint } from '../common/utility'
import _ from 'lodash'
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums'
import IconButton from '../common/iconButton'

class BodyContainer extends Component {
  _isMounted = false // Add a flag to track if the component is mounted
  constructor(props) {
    super(props)
    this.state = {
      selectedBodyType: null,
      data: {
        raw: '',
        data: [
          {
            checked: 'notApplicable',
            key: '',
            value: '',
            description: '',
            type: 'text'
          }
        ],
        urlencoded: [
          {
            checked: 'notApplicable',
            key: '',
            value: '',
            description: '',
            type: 'text'
          }
        ]
      },
      endpointId: null,
      selectedRawBodyType: rawTypesEnums.TEXT,
      suggestions: [],
    }
    this.rawBodyTypes = Object.keys(rawTypesEnums);
    this.queryRef = createRef();
    this.variablesRef = createRef();

    addCompleter({
      getCompletions: function (editor, session, pos, prefix, callback) {
        callback(null, [...this.state.suggestions])
      }.bind(this)
    })
    this.loadEnvVarsSuggestions = this.loadEnvVarsSuggestions.bind(this);
  }

  componentDidMount() {
    this._isMounted = true
    this.setStateOfBody(this.props.body);
    this.loadEnvVarsSuggestions();
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.environment !== this.props.environment) {
      this.loadEnvVarsSuggestions();
    }

    const { body: prevBody } = prevProps;
    const { body: currentBody } = this.props;
    const { data: prevData } = prevState;
    const { data: currentData } = this.state;

    if (
      !_.isEqual(prevBody, currentBody) ||
      !_.isEqual(prevData, currentData)
    ) {
      this.setStateOfBody(currentBody);
    }
  }

  setStateOfBody(body) {
    let selectedBodyType = body.type;
    if (this.rawBodyTypes?.includes(selectedBodyType)) {
      this.showRawBodyType = true;
      this.rawBodyType = selectedBodyType;
      selectedBodyType = bodyTypesEnums['raw'];
    }
    else {
      this.showRawBodyType = false;
    }

    const data = {
      data: body?.[bodyTypesEnums['multipart/form-data']] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      urlencoded: body?.[bodyTypesEnums['application/x-www-form-urlencoded']] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      raw: body?.raw?.value || ''
    };

    this.rawBodyType = body?.raw?.rawType || rawTypesEnums.TEXT;

    if (document.getElementById(selectedBodyType + '-' + this.props.endpoint_id)) {
      document.getElementById(selectedBodyType + '-' + this.props.endpoint_id).checked = true
    }

    this.setState({
      selectedRawBodyType: body?.raw?.rawType || rawTypesEnums.TEXT,
      selectedBodyType,
      data
    });
  }

  handleSelectBodyType(bodyType, bodyDescription) {
    switch (bodyType) {
      case bodyTypesEnums['multipart/form-data']:
        this.props.set_body(bodyType, this.state.data.data, this.state.selectedRawBodyType)
        break
      case bodyTypesEnums['application/x-www-form-urlencoded']:
        this.props.set_body(bodyType, this.state.data.urlencoded, this.state.selectedRawBodyType)
        break
      case bodyTypesEnums['none']:
        this.props.set_body(bodyType, null, this.state.selectedRawBodyType)
        break
      default:
        break
    }
    if (bodyType === bodyTypesEnums['raw'] && bodyDescription) {
      this.flag = true
      this.showRawBodyType = true
      this.props.set_body(this.state.selectedRawBodyType, this.state.data.raw, this.state.selectedRawBodyType || 'TEXT')
    } else {
      this.flag = false
      if (document.getElementById(`toggle-raw-${this.props.endpoint_id}`)) {
        document.getElementById(`toggle-raw-${this.props.endpoint_id}`).className = 'btn active'
        document.getElementById(`toggle-body-description-${this.props.endpoint_id}`).className = 'btn '
      }
      if (bodyType === bodyTypesEnums['raw']) {
        this.showRawBodyType = true
        this.props.set_body(this.state.selectedRawBodyType, this.state.data[bodyType], this.state.selectedRawBodyType || 'TEXT')
      } else {
        this.showRawBodyType = false
      }
    }
  }

  loadEnvVarsSuggestions() {
    const suggestions = []
    _.keys(this.props.environment.variables).forEach((variable) => {
      suggestions.push({
        caption: `${variable}`,
        value: `{{${variable}}}`,
        meta: 'Environment variable'
      })
    })
    if (this._isMounted) {
      this.setState({ suggestions })
    }
  }

  handleChange(value) {
    this.alteredBody = true
    const data = this.state.data
    data.raw = value
    if (this._isMounted) {
      this.setState({ data })
    }
    this.props.set_body(this.state.selectedRawBodyType, value, this.state.selectedRawBodyType || 'TEXT')
  }

  handleChangeBody(title, dataArray) {
    const data = this.state.data
    switch (title) {
      case 'formData':
        data.data = dataArray
        this.setState({ data })
        this.props.set_body(this.state.selectedBodyType, dataArray, this.state.selectedRawBodyType || 'TEXT')
        break
      case 'x-www-form-urlencoded':
        data.urlencoded = dataArray
        this.setState({ data })
        this.props.set_body(this.state.selectedBodyType, dataArray, this.state.selectedRawBodyType || 'TEXT')
        break
      default:
        break
    }
  }

  handlePrettifyJson() {
    const { raw } = this.state.data;
    const prettifiedRaw = this.prettifyJson(raw);
    this.handleChange(prettifiedRaw);
  }


  prettifyJson(jsonString) {
      const parsedJson = JSON.parse(jsonString);
      return JSON.stringify(parsedJson, null, 2);
   
  }

  handleChangeGraphqlQuery() {
    this.props.setQueryTabBody({ query: this.queryRef.current.editor.getValue(), variables: this.variablesRef.current.editor.getValue() })
  }

  makeJson(body) {
    if (typeof body === 'string') return body
    if (!this.alteredBody) {
      try {
        const parsedBody = JSON.stringify(JSON.parse(body), null, 2)
        return parsedBody
      } catch (e) {
        return body
      }
    } else {
      return body
    }
  }

  setRawBodyType(rawBodyType) {
    this.props.set_body(rawBodyType, this.state.data.raw, rawBodyType)
  }

  renderBody() {
    if (this.state.selectedBodyType && this.flag) {
      return <BodyDescription {...this.props} body={this.state.data.raw} body_type={this.state.selectedRawBodyType} />
    } else if (this.state.selectedBodyType) {
      switch (this.state.selectedBodyType) {
        case bodyTypesEnums['multipart/form-data']:
          return (
            <GenericTable
              {...this.props}
              title='formData'
              dataArray={this.state.data.data || []}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={this.state.data.data || []}
              count='1'
            />
          )
        case bodyTypesEnums['application/x-www-form-urlencoded']:
          return (
            <GenericTable
              {...this.props}
              title='x-www-form-urlencoded'
              dataArray={this.state.data.urlencoded || []}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={this.state.data.urlencoded || []}
              count='2'
            />
          )

        case bodyTypesEnums['none']:
          return
        default:
          return (
            <>
              <div className="prettify-button position-absolute" >
                <IconButton><span className='text-grey' onClick={this.handlePrettifyJson.bind(this)}>Beautify</span></IconButton>
              </div>
              {' '}
              <AceEditor
                className='custom-raw-editor'
                mode={this.state.selectedRawBodyType.toLowerCase()}
                theme='github'
                value={this.state.selectedRawBodyType === rawTypesEnums.JSON ? this.makeJson(this.state.data.raw) : this.state.data.raw}
                onChange={this.handleChange.bind(this)}
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
                style={{ fontFamily: 'monospace' }}
                enableLiveAutocompletion
                enableBasicAutocompletion
              />
              </>
          )
      }
    }
  }

  matchCurrentBodyType(bodyType) {
    if (this.props.body && this.props.body.type + '-' + this.props.endpoint_id === bodyType) return true
    return false
  }

  endpointBody() {
    return (
      <React.Fragment>
        <div className='button-panel-wrapper'>
          <form className='body-select d-flex align-items-center mb-2 ml-3'>
            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`${bodyTypesEnums['none']}-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType(bodyTypesEnums['none'])}
                className='custom-radio-input'
              />
              <span className='text-grey font-12'>none</span>
              <span className='checkmark' />
            </label>

            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                defaultChecked={!this.state.selectedBodyType}
                id={`raw-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType(bodyTypesEnums['raw'])}
                onChange={() => { }}
                className='custom-radio-input'
                checked={this.state.selectedBodyType === bodyTypesEnums['raw']}
              />
              <span className='text-grey font-12'>raw</span>
              <span className='checkmark' />
            </label>
            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`${bodyTypesEnums['multipart/form-data']}-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType(bodyTypesEnums['multipart/form-data'])}
                onChange={() => { }}
                className='custom-radio-input'
                checked={this.matchCurrentBodyType(`${bodyTypesEnums['multipart/form-data']}-${this.props.endpoint_id}`)}
              />
              <span className='text-grey font-12'>form-data</span>
              <span className='checkmark' />
            </label>
            <label className='customRadio'>
              <input
                type='radio'
                name={`body-select-${this.props.endpoint_id}`}
                id={`${bodyTypesEnums['application/x-www-form-urlencoded']}-${this.props.endpoint_id}`}
                onClick={() => this.handleSelectBodyType(bodyTypesEnums['application/x-www-form-urlencoded'])}
                className='custom-radio-input'
                onChange={() => { }}
                checked={this.matchCurrentBodyType(`${bodyTypesEnums['application/x-www-form-urlencoded']}-${this.props.endpoint_id}`)}
              />
              <span className='text-grey font-12'>x-www-form-urlencoded</span>
              <span className='checkmark' />
            </label>
            {!(this.showRawBodyType && this.flag) && (
              <div className='body'>
                {this.showRawBodyType === true && (
                  <div>
                    <div className='dropdown'>
                      <button
                        className='btn dropdown-toggle text-grey font-12 border-0'
                        type='button'
                        id='dropdownMenuButton'
                        data-toggle='dropdown'
                        aria-haspopup='true'
                        aria-expanded='false'
                      >
                        {this.state.selectedRawBodyType}
                      </button>
                      <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                        {this.rawBodyTypes.map((rawBodyType) => (
                          <button
                            className='dropdown-item'
                            type='button'
                            onClick={() => this.setRawBodyType(rawBodyType)}
                            key={rawBodyType}
                          >
                            {rawBodyType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
          {isSavedEndpoint(this.props) &&
            this.state.selectedRawBodyType === rawTypesEnums.JSON &&
            (this.state.selectedBodyType === bodyTypesEnums['raw'] || this.state.selectedBodyType === rawTypesEnums.JSON) && (
              <div className='btn-group btn-group-toggle customBtnGroup mb-2' data-toggle='buttons' style={{ float: 'right' }}>
                <label className='btn active' id={`toggle-raw-${this.props.endpoint_id}`}>
                  <input
                    type='radio'
                    name='options'
                    id='option1'
                    autoComplete='off'
                    defaultChecked
                    onClick={() => this.handleSelectBodyType(bodyTypesEnums['raw'])}
                  />
                  Raw
                </label>
                <label className='btn btn-secondary body-desc' id={`toggle-body-description-${this.props.endpoint_id}`}>
                  <input
                    type='radio'
                    name='options'
                    id='option2'
                    autoComplete='off'
                    onClick={() => this.handleSelectBodyType(bodyTypesEnums['raw'], 'bodyDescription')}
                  />
                  Body Description
                </label>
              </div>
            )}
        </div>
        {this.renderBody()}
      </React.Fragment>
    )
  }

  graphqlBody() {
    const editorOptions = {
      markers: false,
      showGutter: false,
    };
    return (
      <div>
        {this.props.endpointContent?.data?.body?.query && <div className="mt-2">
          <span style={{ fontWeight: 600 }}>Query</span>
          <AceEditor
            ref={this.queryRef}
            className='custom-raw-editor'
            mode={'javascript'}
            theme='github'
            value={this.props.endpointContent?.data?.body?.query || ''}
            onChange={this.handleChangeGraphqlQuery.bind(this)}
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
            enableLiveAutocompletion
            enableBasicAutocompletion
            {...editorOptions}
            style={{ fontFamily: 'monospace' }}
          />
        </div>}
        {this.props.endpointContent?.data?.body?.variables && <div className='mt-2'>
          <span className='mt-4 pt-2' style={{ fontWeight: 600 }}>Variables</span>
          <AceEditor
            ref={this.variablesRef}
            className='custom-raw-editor'
            mode={'json'}
            theme='github'
            value={this.props.endpointContent?.data?.body?.variables || ''}
            onChange={this.handleChangeGraphqlQuery.bind(this)}
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
            enableLiveAutocompletion
            enableBasicAutocompletion
            {...editorOptions}
            style={{ fontFamily: 'monospace' }}
          />

        </div>}
      </div>
    )
  }

  render() {
    if (this.props.location.pathname.split('/')[5] !== this.endpointId) {
      this.endpointId = this.props.location.pathname.split('/')[5]
      this.alteredBody = false
    }

    return (
      <div className='body-wrapper position-relative'>
        {this.props.endpointContent?.protocolType === 1 && this.endpointBody()}
        {this.props.endpointContent?.protocolType === 2 && this.graphqlBody()}
      </div>
    )
  }
}

export default BodyContainer