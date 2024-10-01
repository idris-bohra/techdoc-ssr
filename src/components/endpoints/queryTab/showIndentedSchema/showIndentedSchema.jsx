import React, { useState } from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import IconButton from '../../../common/iconButton';
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import RenderFields from './renderFields/renderFields';
import './showIndentedSchema.scss';

const parents = ['queryType', 'mutationType']

export default function ShowIndentedSchema(props) {
    const [queryMutationState, setQueryMutationState] = useState({ mutationType: true, queryType: true })

    const handleArrowClick = (type) => {
        setQueryMutationState((prev) => {
            return { ...prev, [type]: !prev[type] }
        })
    }

    return (
        <div className='accordion-container'>
            {parents.map((parentName, index) => {
                return (
                    <div key={index}>
                        <div className='d-flex align-items-center parent-accordion-container' onClick={() => handleArrowClick(parentName)}>
                            <IconButton variant='sm'>
                                {!queryMutationState?.[parentName] ? <MdKeyboardArrowRight size={18} /> : <MdOutlineKeyboardArrowDown size={18} />}
                            </IconButton>
                            <span className='ml-1'>{parentName === 'queryType' ? 'Query' : 'Mutation'}</span>
                        </div>
                        {queryMutationState?.[parentName] &&
                            <div className='mt-2 mb-2'>
                                {props?.loadedSchema?.[parentName]?.fields?.map((fieldData, index) => {
                                    return <RenderFields key={index} fieldData={fieldData} />
                                })}
                            </div>
                        }
                    </div>
                )
            })}
        </div>
    )
}

