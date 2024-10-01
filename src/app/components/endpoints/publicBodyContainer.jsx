import 'ace-builds'
import React, { Component, createRef } from 'react'
import GenericTable from './genericTable'
import AceEditor from 'react-ace'
import { willHighlight } from './highlightChangesHelper'
import './publicEndpoint.scss'
import { Badge } from 'react-bootstrap'
import { bodyTypesEnums, rawTypesEnums } from '../common/bodyTypeEnums'
import { hexToRgb, isDashboardAndTestingView, isOnPublishedPage } from '../common/utility'
import { background } from '../backgroundColor.js'
import { FaLongArrowAltUp } from 'react-icons/fa'
class PublicBodyContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      theme: {
        publicCollectionTheme: this.props.publicCollectionTheme,
        backgroundStyle: {}
      },
      showBodyCodeEditor: true,
      data: {
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
      editorHeight: '250px',
      isExpanded: false,
    }
    this.queryRef = createRef();
    this.variablesRef = createRef();
    this.expandEditor = this.expandEditor.bind(this);
    this.collapseEditor = this.collapseEditor.bind(this);
  }
  expandEditor() {
    this.setState({
      editorHeight: '500px',
      isExpanded: true,
    });
  }
  collapseEditor(event) {
    event.stopPropagation()
    this.setState({
      editorHeight: '250px',
      isExpanded: false,
    });
  }

  componentDidMount() {
    const data = {
      data: this.props?.body?.[bodyTypesEnums['multipart/form-data']] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
      urlencoded: this.props?.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] || [{ checked: 'notApplicable', key: '', value: '', description: '', type: 'text' }],
    }
    this.setState({ data });
    this.updateBackgroundStyle();

  } updateBackgroundStyle() {
    const { publicCollectionTheme } = this.state.theme;
    const dynamicColor = hexToRgb(publicCollectionTheme, 0.02);
    const staticColor = background['background_boxes'];

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `,
    };

    this.setState(prevState => ({
      theme: {
        ...prevState.theme,
        backgroundStyle,
      },
    }));
  }

  handleChangeBody(title, dataArray) {
    const data = this.state.data
    switch (title) {
      case 'formData':
        data.data = dataArray
        this.setState({ data })
        this.props.set_body(bodyTypesEnums['multipart/form-data'], dataArray)
        break
      case 'x-www-form-urlencoded':
        data.urlencoded = dataArray
        this.setState({ data })
        this.props.set_body(bodyTypesEnums['application/x-www-form-urlencoded'], dataArray)
        break
      default:
        break
    }
  }

  setBody(data) {
    this.props.set_body_description(data.bodyDescription)
    this.props.set_public_body(data.body)
  }

  handleChangeBodyDescription = (data) => {
    try {
      const body = data;
      const bodyData = {
        bodyDescription: this.bodyDescription,
        body: body
      };
      this.setBody(bodyData);
    } catch (e) {
      console.error("Error beautifying data:", e);
    }
  }

  makeJson(body) {
    try {
      const parsedBody = JSON.stringify(JSON.parse(body), null, 2)
      return parsedBody
    } catch (e) {
      return body
    }
  }

  displayBodyDecription(parentPath = '', object) {
    // Check if the object is null or undefined and return early if true.
    if (!object) {
      return null;
    }

    // Function to display a legend for the types of values in the object.
    const displayLegend = () => {
      const types = ['string', 'number', 'boolean', 'array', 'object'];
      return (
        <div className='d-flex flex-row-reverse'>
          {types.map((type, index) => (
            <small key={index} className='ml-3 text-small'>
              <Badge className={`body-desc-type ${type}`}>{type.charAt(0)}</Badge> <span className='text-capitalize'>{type}</span>
            </small>
          ))}
        </div>
      );
    };

    // Renders a badge for the type of the value.
    const renderType = (type) => {
      return (
        <Badge className={`body-desc-type ${type}`} style={{ cursor: 'default' }}>
          {type.charAt(0)}
        </Badge>
      );
    };

    // Renders an item in the object, including its type and description.
    const renderItem = (parentPath, key, value) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      return (
        <div key={path} className='py-1'>
          {renderType(value.type)}
          <strong className='pl-1' style={{ cursor: 'default' }}>
            {key}
          </strong>
          <span>{value.description ? ` : ${value.description}` : ''}</span>
        </div>
      );
    };

    // Recursively renders objects, handling nested structures.
    const renderObject = (parentPath, obj) => {
      return Object.entries(obj).map(([key, value]) => {
        const newPath = parentPath ? `${parentPath}.${key}` : key;
        if (['object', 'array'].includes(value.type)) {
          return (
            <div key={newPath} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
              <strong className='pl-1' style={{ cursor: 'default' }}>
                {value.type === 'object' ? <Badge className="body-desc-type object">O</Badge> : null}
                {value.type === 'array' ? <Badge className="body-desc-type array">A</Badge> : null} {key}
              </strong>
              {value.type === 'object' ? renderObject(newPath, value.value) : null}
              {value.type === 'array' ? renderArray(newPath, value.value) : null}
            </div>
          );
        } else {
          return renderItem(newPath, key, value);
        }
      });
    };

    // Recursively renders arrays, handling nested structures.
    const renderArray = (parentPath, arr) => {
      return arr.map((item, index) => {
        const newPath = `${parentPath}[${index}]`;
        if (['object', 'array'].includes(item.type)) {
          return (
            <div key={newPath} className='ml-2 pl-2' style={{ borderLeft: '1px solid rgb(0,0,0,0.1)' }}>
              <strong className='pl-1' style={{ cursor: 'default' }}>
                {item.type === 'object' ? <Badge className="body-desc-type object">O</Badge> : null}
                {item.type === 'array' ? <Badge className="body-desc-type array">A</Badge> : null} Item {index}
              </strong>
              {item.type === 'object' ? renderObject(newPath, item.value) : null}
              {item.type === 'array' ? renderArray(newPath, item.value) : null}
            </div>
          );
        } else {
          return renderItem(newPath, index.toString(), item);
        }
      });
    };

    return (
      <div className='public'>
        {renderObject('', object)}
        <hr />
        {displayLegend()}
      </div>
    );
  }

  handleSetQueryData() {
    
    const query = this.queryRef?.current?.editor?.getValue() || '';
    const variables = this.variablesRef?.current?.editor?.getValue() || '';
    this.props.setQueryTabBody({ query, variables })
  }

  graphqlBody() {
    
    const editorOptions = {
      markers: false,
      showGutter: false,
    };
    return (
      <div className='hm-public-table'>
        {this.props.endpointContent?.data?.body?.query && <div className="mt-3">
          <div className='public-generic-table-title-container'>
            Query
          </div>
          <AceEditor
            ref={this.queryRef}
            className={`${isOnPublishedPage() ? "custom-raw-editor-public" : "custom-raw-editor"}`}
            mode={'json'}
            theme='github'
            style={{ fontFamily: 'monospace' }}
            value={this.props.endpointContent?.data?.body?.query || ''}
            onChange={this.handleSetQueryData.bind(this)}
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
          />
        </div>}
        {this.props.endpointContent?.data?.body?.variables && <div className='mt-3'>
          <div className='public-generic-table-title-container'>
            Variables
          </div>
          <AceEditor
            ref={this.variablesRef}
            className={`${isOnPublishedPage() ? "custom-raw-editor-public" : "custom-raw-editor"}`}
            mode={'json'}
            theme='github'
            style={{ fontFamily: 'monospace' }}
            value={this.props.endpointContent?.data?.body?.variables || ''}
            onChange={this.handleSetQueryData.bind(this)}
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
          />
        </div>}
      </div>
    )
  }

  render() {
    this.bodyDescription = this.props.body_description
    if (this.props.body && this.props.endpointContent?.protocolType == 2) return this.graphqlBody();
    if (this.props.body && this.props.body.type === 'none') return null;
    return (
      <>
        {this.props.body && this.props.body.type === bodyTypesEnums['multipart/form-data'] && this.props?.body?.[bodyTypesEnums['multipart/form-data']].length > 0 && (
          <GenericTable
            {...this.props}
            title='formData'
            dataArray={this.props?.body?.[bodyTypesEnums['multipart/form-data']]}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={this.props?.body?.[bodyTypesEnums['multipart/form-data']]}
          />
        )}

        {this.props.body?.[bodyTypesEnums['application/x-www-form-urlencoded']] && this.props.body.type === bodyTypesEnums['application/x-www-form-urlencoded'] && this.props.body?.[bodyTypesEnums['application/x-www-form-urlencoded']]?.length > 0 && (
          <GenericTable
            {...this.props}
            title='x-www-form-urlencoded'
            dataArray={this.props.body?.[bodyTypesEnums['application/x-www-form-urlencoded']]}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={this.props.body?.[bodyTypesEnums['application/x-www-form-urlencoded']]}
          />
        )}

        {this.props.body?.[bodyTypesEnums['multipart/form-data']] && this.props.body.type !== bodyTypesEnums['multipart/form-data'] && this.props.body.type !== bodyTypesEnums['application/x-www-form-urlencoded'] &&
          (this.props.body.type === rawTypesEnums.JSON ?
            (
              <div className='hm-public-table mb-2'>
                <div className="d-flex justify-content-between align-items-center mt-4">
                  {isOnPublishedPage(this.props) &&
                    <div className='public-generic-table-title-container'>
                      Body <small className='text-muted'>({this.props.body.type})</small>{' '}
                      {willHighlight(this.props, 'body') ? <i className='fas fa-circle' /> : null}
                    </div>}
                  <div className='d-flex justify-content-between'>
                    <ul className='public-endpoint-tabs'>
                      <li
                        className={this.state.showBodyCodeEditor ? 'active' : ''}
                        style={this.state.showBodyCodeEditor ? { backgroundColor: this.props.publicCollectionTheme, opacity: 0.9 } : {}}
                        onClick={() => this.setState({ showBodyCodeEditor: true })}
                      >
                        Raw
                      </li>
                      <li
                        className={!this.state.showBodyCodeEditor ? 'active' : ''}
                        style={!this.state.showBodyCodeEditor ? { backgroundColor: this.props.publicCollectionTheme, opacity: 0.9 } : {}}
                        onClick={() => this.setState({ showBodyCodeEditor: false })}
                      >
                        Body description
                      </li>
                    </ul>
                  </div>
                </div>
                {this.state.showBodyCodeEditor ? (
                  <div className='body-ace-editer' onClick={this.toggleEditor}>
                    <div onClick={this.expandEditor} className='custom-editor-public-page' style={this.state.theme.backgroundStyle}>
                      <AceEditor
                        className={`${isOnPublishedPage() ? 'custom-raw-editor-public' : 'custom-raw-editor'}`}
                        mode='json'
                        theme='github'
                        value={this.props.body?.raw?.value}
                        onChange={this.handleChangeBodyDescription.bind(this)}
                        style={{ height: this.state.editorHeight, fontFamily: 'monospace' }}
                        setOptions={{
                          showLineNumbers: true,
                        }}
                        editorProps={{
                          $blockScrolling: false,
                        }}
                        onLoad={(editor) => {
                          editor.getSession().setUseWrapMode(true);
                          editor.setShowPrintMargin(false);
                          const textarea = editor.renderer.textarea;
                          if (textarea) {
                            textarea.setAttribute('type', 'text');
                            textarea.setAttribute('aria-label', 'Search');
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className='body-description-container' style={this.state.theme.backgroundStyle}>
                    {this.displayBodyDecription(undefined, this.bodyDescription)}
                  </div>
                )}
              </div>
            ) :
            (<div className='hm-public-table'>
              <div className='public-generic-table-title-container'>
                Body <small className='text-muted'>({this.props.body.type})</small>
                {willHighlight(this.props, 'body') ? <i className='fas fa-circle' /> : null}
              </div>
              <AceEditor
                style={{ fontFamily: 'monospace' }}
                className='custom-raw-editor'
                mode={this.props.body.type.toLowerCase()}
                theme='github'
                value={this.makeJson(this.props.body?.raw?.value || '')}
                onChange={(value) => this.props.set_body(this.props.body.type, value)}
                setOptions={{
                  showLineNumbers: true
                }}
                editorProps={{
                  $blockScrolling: false
                }}
                onLoad={(editor) => {
                  if (window.innerWidth > 425) {
                    editor.focus();
                  }
                  editor.getSession().setUseWrapMode(true)
                  editor.setShowPrintMargin(false)
                }}
              />
            </div>
            )
          )
        }
      </>
    )
  }
}

export default PublicBodyContainer