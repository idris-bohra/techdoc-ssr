import React, { useState } from 'react'
import IconButton from '../../../../common/iconButton';
import { MdKeyboardArrowRight, MdOutlineKeyboardArrowDown } from 'react-icons/md';

export default function RenderFields(props) {
    const [showFieldArg, setShowFieldArg] = useState(false);

    function toggleShowState() {
        setShowFieldArg((prev) => !prev)
    }

    return (
        <div>
            <div className='d-flex align-items-start schema-data-container' onClick={() => toggleShowState()}>
                {props?.fieldData?.args && props?.fieldData?.args.length > 0 &&
                    <IconButton variant='sm'>
                        {!showFieldArg ? <MdKeyboardArrowRight size={18} /> : <MdOutlineKeyboardArrowDown size={18} />}
                    </IconButton>
                }
                <div className='d-flex flex-column align-items-start ml-1'>
                    <div>
                        <span className='field-name'>{props?.fieldData?.name}</span>
                        {props?.fieldData?.type?.name && <span className='schema-input-type ml-1'>{props?.fieldData?.type?.name}</span>}
                    </div>
                    {props?.fieldData?.description && <span className='field-description'>{props?.fieldData?.description}</span>}
                </div>
            </div>
            {(props?.fieldData?.args && props?.fieldData?.args?.length > 0 && showFieldArg) &&
                <div className='pl-3 schema-data-parent-container mt-1 mb-2'>
                    {props?.fieldData?.args?.map((fieldData, index) => {
                        return <RenderFields key={index} fieldData={fieldData} />
                    })}
                </div>
            }
        </div>
    )
}
