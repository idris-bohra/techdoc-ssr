import React, { useRef, useState } from 'react'
import AceEditor from 'react-ace'
import { MdOutlineRefresh } from "react-icons/md";
import IconButton from '../../common/iconButton';
import { VscServerProcess } from "react-icons/vsc";
import { getSchemaThroughIntrospectionQuery } from '../endpointApiService';
import ShowIndentedSchema from './showIndentedSchema/showIndentedSchema';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { setIntrospectionSchema } from '../../tabs/redux/tabsActions';
import './queryTab.scss'
import { getInnerText } from '../../../utilities/htmlConverter';

export default function QueryTab(props) {

    const editorOptions = {
        markers: false,
        showGutter: false,
    };

    const { activeTabId, introspectionSchemaData, currentEnvironment } = useSelector((state) => {
        return {
            activeTabId: state.tabs.activeTabId,
            introspectionSchemaData: state?.tabs?.tabs?.[state.tabs.activeTabId]?.introspectionSchemaData,
            currentEnvironment: state?.environment.environments?.[state?.environment?.currentEnvironmentId] || {},
        }
    })

    const [loadingStateForSchema, setLoadingStateForSchema] = useState(false)

    const queryEditorRef = useRef(null);
    const variableEditorRef = useRef(null);

    const dispatch = useDispatch()

    const callIntrospectionQueryAPI = async () => {
        
        const graphQlUrl = props.replaceVariables(getInnerText(props?.endpointContent?.data.URL), currentEnvironment?.variables) || ''
        if (graphQlUrl) {
            try {
                setLoadingStateForSchema(true)
                const responseData = await getSchemaThroughIntrospectionQuery(graphQlUrl);
                const schema = responseData.__schema
                const schemaData = { mutationType: schema.mutationType, queryType: schema.queryType }
                dispatch(setIntrospectionSchema(activeTabId, schemaData))
                setLoadingStateForSchema(false)
            }
            catch (error) {
                setLoadingStateForSchema(false)
                toast.error(error.message)
            }
        }
        else {
            return toast.error('Please enter graphQL URL')
        }
    }

    function ShowSchemaMessage() {
        return (
            <React.Fragment>
                {loadingStateForSchema ?
                    <div className='loading-schema'>
                        {[1, 2, 3, 4, 5, 6].map((item) => {
                            return (
                                <div key={item} className='d-flex schema-box-container align-items-center gap-3 mt-2'>
                                    <div className='schema-box bg rounded-1'></div>
                                    <div className='bg send rounded-1'></div>
                                </div>
                            )
                        })}
                    </div>
                    :
                    <div className='query-schema d-flex flex-column align-items-center justify-content-center'>
                        <VscServerProcess className='text-grey' size={100} />
                        <span className='text-grey'>Explore data available from server</span>
                        <span className='text-grey'>Enter server URL to load schema using introspection and refresh it.</span>
                    </div>}
            </React.Fragment>
        )
    }

    function handleEditorChange() {
        queryEditorRef.current.editor.getValue();
        if (queryEditorRef.current && variableEditorRef.current) {
            props.setQueryTabBody({ query: queryEditorRef.current.editor.getValue(), variables: variableEditorRef.current.editor.getValue() })
        }
    }

    return (
        <div className='d-flex justify-content-start w-100 graphql-container p-3'>
            <div className='w-50 h-100 p-2 schema-container bg-white mr-2'>
                <div className='d-flex justify-content-between align-items-center query-schema-head ml-1'>
                    <h6 className='text-grey'>Schema</h6>
                    <IconButton>
                        <MdOutlineRefresh className='text-grey' size={18} onClick={callIntrospectionQueryAPI} />
                    </IconButton>
                </div>
                {(introspectionSchemaData && !loadingStateForSchema) ? <ShowIndentedSchema loadedSchema={introspectionSchemaData} /> : <ShowSchemaMessage />}
            </div>
            <div className='w-50 h-100 editor-main-container ml-2'>
                <div className='editor-box editor-box-query'>
                    <AceEditor
                        ref={queryEditorRef}
                        className='query-ace-editor'
                        placeholder='Enter Query Here'
                        mode="json"
                        theme="github"
                        width="100%"
                        height='100%'
                        fontSize={11}
                        onChange={(value) => handleEditorChange(value, 'query')}
                        value={props?.endpointContent?.data?.body?.query}
                        onLoad={(editor) => {
                            editor.getSession().setUseWrapMode(true);
                            editor.setShowPrintMargin(false);
                        }}
                        style={{ fontFamily: 'monospace' }}
                        {...editorOptions}
                    />
                </div>
                <div className='editor-box editor-box-variables mt-1'>
                    <AceEditor
                        ref={variableEditorRef}
                        className='query-ace-editor'
                        placeholder='Enter Variables Here'
                        mode="json"
                        theme="github"
                        width="100%"
                        height='100%'
                        fontSize={11}
                        value={props?.endpointContent?.data?.body?.variables}
                        onChange={(value) => handleEditorChange(value, 'variables')}
                        onLoad={(editor) => {
                            editor.getSession().setUseWrapMode(true);
                            editor.setShowPrintMargin(false);
                        }}
                        style={{ fontFamily: 'monospace' }}
                        {...editorOptions}
                    />
                </div>
            </div>
        </div>
    )
}