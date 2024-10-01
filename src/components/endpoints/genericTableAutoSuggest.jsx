import React, { useEffect, useRef, useState } from 'react';
import { restoreCaretPosition, getCaretPosition } from '../../utilities/caretUtility';
import AutoSuggest from 'env-autosuggest';
import { useSelector } from 'react-redux';

function GenericTableAutoSuggest(props) {

    const { currentEnvironment, activeTabId } = useSelector((state) => {
        return {
            currentEnvironment: state?.environment?.environments[state?.environment?.currentEnvironmentId]?.variables || {},
            activeTabId: state?.tabs?.activeTabId
        };
    });

    const genericAutoSuggestRef = useRef(null);

    const [htmlData, sethtmlData] = useState(props?.htmlValue)

    useEffect(() => {
        sethtmlData(props?.htmlValue)
    }, [activeTabId, props?.title])

    useEffect(() => {
        setTimeout(() => {
            if (document.activeElement !== genericAutoSuggestRef?.current) sethtmlData(props?.htmlValue || '')
        }, 0);
    }, [props?.URL, props?.htmlValue])

    const handleValueChange = () => {
        const caretPosition = getCaretPosition(genericAutoSuggestRef.current);
        const value = genericAutoSuggestRef.current.innerHTML === "<br>" ? "" : genericAutoSuggestRef.current.innerHTML;
        props.handleChange(value, { name: props?.valueKey, value: value });
        setTimeout(() => restoreCaretPosition(genericAutoSuggestRef.current, caretPosition), 0);
    }

    return (
        <AutoSuggest
            contentEditableDivRef={genericAutoSuggestRef}
            suggestions={props?.suggestions}
            handleValueChange={handleValueChange}
            initial={htmlData}
            disable={props?.disable}
            placeholder={props?.placeholder || ''}
        />
    );
}

export default React.memo(GenericTableAutoSuggest)