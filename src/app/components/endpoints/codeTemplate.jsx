import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Dropdown, Col } from 'react-bootstrap'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { updateStateOfCurlSlider } from '../modals/redux/modalsActions'
import { languages, primaryLanguages, secondaryLanguages } from './languages'
import IconButton from '../common/iconButton'
import { hexToRgb, isOnPublishedPage } from '../common/utility'
import { background } from '../backgroundColor.js'
import { RiCloseLine } from 'react-icons/ri'
import { TbCopy } from 'react-icons/tb'
import { FaCheck } from 'react-icons/fa6'
import { BsThreeDots } from 'react-icons/bs'
import { FaChevronRight } from 'react-icons/fa'
import AceEditor from 'react-ace'
// import 'ace-builds/webpack-resolver'
import 'ace-builds'
import 'ace-builds/src-noconflict/theme-tomorrow_night'
import 'ace-builds/src-noconflict/theme-github'
import './endpoints.scss'
import { HTTPSnippet } from 'httpsnippet-lite'

const CodeTemplate = (props) => {
  const [theme, setTheme] = useState('')
  const [curlSlider, setCurlSlider] = useState(false)
  const [codeSnippet, setCodeSnippet] = useState('')
  const [copied, setCopied] = useState(false)
  const [editorHeight, setEditorHeight] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('shell')

  const codeTemplateRef = useRef()
  const dispatch = useDispatch()
  const params = useParams()

  const handleButtonClick = () => {
    setCurlSlider(!curlSlider)
    dispatch(updateStateOfCurlSlider(!curlSlider))
  }

  const makeCodeTemplate = async (newSelectedLanguage) => {
    const harObject = props.harObject

    if (!harObject || !harObject.method) {
      console.error('HAR object is missing or invalid.')
      return
    }

    setSelectedLanguage(newSelectedLanguage)

    try {
      const codeSnippet = await makeCodeSnippet(newSelectedLanguage)

      if (codeSnippet) {
        let formattedSnippet = codeSnippet

        if (formattedSnippet.includes('///')) {
          formattedSnippet = formattedSnippet.replace('///', '//')
        }

        formattedSnippet = decodeURI(formattedSnippet)
        setCodeSnippet(formattedSnippet)
        setCopied(false)
      } else {
        console.error('Failed to generate code snippet.')
      }
    } catch (error) {
      console.error('Error in makeCodeTemplate:', error)
    }
  }

  const makeCodeSnippet = async (newSelectedLanguage) => {
    const harObject = props.harObject
    if (!harObject) {
      console.error('HAR object is missing.')
      return null
    }
    let { method, url, httpVersion, cookies, headers, postData } = harObject
    try {
      const request = {
        method,
        url,
        httpVersion,
        cookies,
        headers,
        postData
      }

      const snippet = new HTTPSnippet(request)

      // Define options for generating the snippet
      const options = { indent: '  ' }
      const client = newSelectedLanguage === 'axiosNode' ? 'axios' : undefined
      const language = newSelectedLanguage === 'axiosNode' ? 'node' : newSelectedLanguage

      const output = await snippet.convert(language, client, options)

      return output
    } catch (err) {
      return 'curl --request GET \\ \n  --url https://';
    }
  }

  useEffect(() => {
    if (props.harObject) {
      makeCodeTemplate(selectedLanguage)
    }
    const dynamicColor = hexToRgb(props.publicCollectionTheme, 0.04)
    const staticColor = background['background_pubCode']

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `
    }
    setTheme({ backgroundStyle })
  }, [props.harObject])

  useEffect(() => {
    if (props.harObject) {
      makeCodeTemplate(selectedLanguage)
    }
  }, [props.harObject, selectedLanguage])

  useEffect(() => {
    if (codeTemplateRef.current) {
      const editor = codeTemplateRef.current.editor
      const newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth()
      setEditorHeight(`${newHeight}px`)
    }
  }, [codeSnippet])

  const getClassForLanguages = (key) => {
    const commonClass = 'mr-2 d-flex d-md-flex flex-column justify-content-center align-items-center'
    let classToReturn = key === selectedLanguage ? 'active ' + commonClass : commonClass
    return props.theme !== 'light' ? classToReturn + ' ' : classToReturn
  }

  return (
    <>
      <div className={`${isOnPublishedPage() ? '' :'sample-code-inner position-sticky top-0'}`}>
        <div
          className={
            params.endpointId
              ? 'show-curl-endpoint h-100 pubCodeWrapper bg-white pb-1'
              : curlSlider
              ? 'pubCodeWrapper-hide pubCodeWrapper'
              : 'pubCodeWrapper h-100'
          }
          style={{
            backgroundColor: hexToRgb(theme?.backgroundStyle, '0.04')
          }}
        >
          <div className='inner-editor'>
            <Col id='code-window-sidebar' xs={12} className='px-3 pt-3 pb-1'>
              <div className='code-heading mb-3 d-flex align-items-center'>
                <span className={props.theme === 'light' ? 'col-black' : 'col-black'}>Sample code</span>
                {props.showClosebtn && (
                  <div className='d-flex justify-content-end flex-grow-1'>
                    <IconButton>
                      <RiCloseLine
                        color='black'
                        className='cursor-pointer'
                        onClick={() => {
                          dispatch(updateStateOfCurlSlider(false))
                        }}
                      />
                    </IconButton>
                  </div>
                )}
              </div>
              <div className='select-code-wrapper d-flex align-items-center mb-3 img'>
                {primaryLanguages.map((key) => {
                  const LanguageIcon = languages[key].imagePath
                  return (
                    <button
                      key={key}
                      className={`${params.endpointId ? 'btn' : ''} ${getClassForLanguages(key)}`}
                      onClick={() => makeCodeTemplate(key)}
                    >
                      <LanguageIcon width={15} />
                      {languages[key].name}
                    </button>
                  )
                })}
                <Dropdown className='dropdown-more'>
                  <Dropdown.Toggle
                    className={secondaryLanguages.includes(selectedLanguage) ? 'active dropdownMore mr-0' : 'dropdownMore mr-0'}
                  >
                    {primaryLanguages.includes(selectedLanguage) ? (
                      <div className='d-flex flex-column '>
                        <span>
                          <BsThreeDots />
                        </span>
                        <span>More</span>
                      </div>
                    ) : (
                      <span>{languages[selectedLanguage].name}</span>
                    )}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {secondaryLanguages.map((key) => {
                      const LanguageIcon = languages[key].imagePath
                      return (
                        <Dropdown.Item
                          key={key}
                          className={key === selectedLanguage ? 'active mb-2 mt-2' : 'mb-2 mt-2'}
                          onClick={() => makeCodeTemplate(key)}
                        >
                          <LanguageIcon className='mr-2' width={20} height={20} />
                          {languages[key].name}
                        </Dropdown.Item>
                      )
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
            <Col className={isOnPublishedPage() ? 'editor-body-wrapper' : 'editor-body-wrapper editor-body-wrapper-height'} xs={12}>
              <div className='ace-editor-wrapper'>
                <div id='code-window-body' className={!isOnPublishedPage() ? 'copy-button-light' : 'copy-button-dark'}>
                  <CopyToClipboard
                    text={codeSnippet}
                    onCopy={() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 1000) // Change back after 5 seconds
                    }}
                    className='copy-to-clipboard mt-1'
                  >
                    <button>
                      {copied ? (
                        <IconButton>
                          <FaCheck color={props.theme === 'light' ? 'black' : 'white'} />
                        </IconButton>
                      ) : (
                        <IconButton>
                          <TbCopy className='cursor-pointer' color={props.theme === 'light' ? 'black' : 'white'} />
                        </IconButton>
                      )}
                    </button>
                  </CopyToClipboard>
                </div>
                <AceEditor
                  height={editorHeight}
                  ref={codeTemplateRef}
                  mode={languages[selectedLanguage].mode}
                  theme={props.theme === 'light' ? 'kuroir' : 'tomorrow_night'}
                  highlightActiveLine={false}
                  focus={false}
                  value={codeSnippet}
                  readOnly
                  editorProps={{
                    $blockScrolling: false
                  }}
                  showGutter={false}
                  onLoad={(editor) => {
                    editor.getSession().setUseWrapMode(true)
                    editor.setShowPrintMargin(false)
                  }}
                />
                <div id='code-window-body' className={!isOnPublishedPage() ? 'empty-div-light' : 'empty-div-dark'}></div>
              </div>
            </Col>
          </div>
        </div>
      </div>
    </>
  )
}

export default CodeTemplate
