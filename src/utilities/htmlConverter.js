function decodeHtmlEntities(input) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    return textarea.value;
}

function getQueryParamsHTML(html) {
    html = decodeHtmlEntities(html);
    let pairs = [];
    let inTag = false;
    let inTemplate = false;
    let currentKey = '';
    let currentValue = '';
    let startProcessing = false;
    let readingKey = true;
    let keyStartIndex = -1;
    let keyEndIndex = -1;
    let valueStartIndex = -1;
    let valueEndIndex = -1;

    for (let i = 0; i < html.length; i++) {
        let char = html[i];
        if (char === '<') {
            if(html[i+1] === '/' && inTemplate){
                inTemplate = false;
            }
            if(html[i+6] === 'v'){
                inTemplate = true;
            }
            inTag = true;
            if (startProcessing) {
                if (readingKey) {
                    currentKey += char;
                } else {
                    currentValue += char;
                }
            }
            continue;
        } else if (char === '>') {
            inTag = false;
            if (startProcessing) {
                if (readingKey) {
                    currentKey += char;
                } else {
                    currentValue += char;
                }
            }
            continue;
        }
        if (inTag || inTemplate) {
            if (startProcessing) {
                if (readingKey) {
                    currentKey += char;
                } else {
                    currentValue += char;
                }
            }
            continue;
        }

        if (char === '?' && !startProcessing) {
            keyStartIndex = i + 1;
            startProcessing = true;
            continue;
        }

        if (startProcessing) {
            if (char === '=' && readingKey) {
                keyEndIndex = i;
                valueStartIndex = i + 1;
                readingKey = false;
                continue;
            }

            if (char === '&' && !readingKey) {
                valueEndIndex = i - 1;
                pairs.push({
                    key: {
                        html: currentKey.trim(),
                        startIndex: keyStartIndex,
                        endIndex: keyEndIndex
                    },
                    value: {
                        html: currentValue.trim(),
                        startIndex: valueStartIndex,
                        endIndex: valueEndIndex
                    }
                });
                keyStartIndex = i + 1;
                currentKey = '';
                currentValue = '';
                readingKey = true;
                continue;
            }

            if (readingKey) {
                currentKey += char;
            } else {
                currentValue += char;
            }
        }
    }

    if (currentKey.trim() || currentValue.trim()) {
        valueEndIndex = html.length - 1;
        pairs.push({
            key: {
                html: currentKey.trim(),
                startIndex: keyStartIndex,
                endIndex: keyEndIndex
            },
            value: {
                html: currentValue.trim(),
                startIndex: valueStartIndex,
                endIndex: valueEndIndex
            }
        });
    }

    return pairs;
}

function getPathVariableHTML(html) {
    let finalValue = [];
    let str = '';
    let inTag = false;
    let inTemplate = false;
    let c1 = 0;

    for (let i = 0; i < html.length; i++) {
        let char = html[i];

        if (char === '<') {
            if(html[i+1] === '/' && inTemplate){
                inTemplate = false;
            }
            if(html[i+6] === 'v'){
                inTemplate = true;
            }
            inTag = true;
        } else if (char === '>') {
            inTag = false;
        }

        if(char === '?' && !inTag && !inTemplate){
            break;
        }

        if (char === ':' && html[i - 1] === '/' && c1 === 0 && !inTemplate) {
            c1++;
            continue;
        }

        if (c1 !== 0) {
            str += char;
        }

        if (c1 !== 0 && (html[i] === '/' || html[i] === '?' || i === html.length - 1)) {
            if (inTag || inTemplate) {
                continue;
            } else {
                if (i === html.length - 1 && char !== '/' && char !== '?') {
                    str += char;
                }
                if (html[i] === '/' || html[i] === '?' || html[i] === '>') {
                    str = str.slice(0, -1);
                }
                c1 = 0;
                finalValue.push(str.trim());
                str = '';
            }
        }
    }

    if (str) {
        finalValue.push(str.trim());
    }

    return finalValue;
}

function fixSpanTags(html) {
    if (!html || html?.length === 0) return '';

    if (html === '</span>' || html === '<span text-block="true">' || html === `<span text-block='true'>`) return '';

    if (html.startsWith('</span>')) {
        html = html?.slice(7);
    }
    else if (html.startsWith("<span text-block='true'>") || html.startsWith('<span text-block="true">')) {
        html = html?.slice(24);
    }
    else if ((!html.startsWith(`<span text-block='true'>`) || !html.startsWith(`<span text-block="true">`)) && (!html.startsWith(`<span variable-block='true'>`) || !html.startsWith(`<span variable-block="true">`))) {
        html = `<span text-block='true'>` + html;
    }

    if (html.endsWith("<span text-block='true'>") || html.endsWith('<span text-block="true">')) {
        html = html?.slice(0, -24);
    } else if (html.endsWith("<span variable-block='true'>") || html.endsWith('<span variable-block="true">')) {
        html = html?.slice(0, -29);
    }
    else if (!html.endsWith('</span>')) {
        html = html + '</span>';
    }

    return html;
}

function replaceParamsHtmlInHostContainerHtml(pureHTML, updateParams, startIndex, endIndex, separatorIndex) {
    pureHTML = decodeHtmlEntities(pureHTML);
    // THIS CASE IS FOR DELETING THE QUERY PARAMS
    if (!updateParams) {
        if (separatorIndex === null) {
            while (endIndex < pureHTML.length) {
                if (pureHTML[endIndex] === '&') break;
                endIndex++
            }
            endIndex++
        }
        else {
            while (startIndex > 0) {
                const findVar = separatorIndex === true ? '?' : '&'
                if (pureHTML[startIndex] === findVar) break;
                startIndex--
            }
        }
    }
    let beforeStart = pureHTML.substring(0, startIndex);
    endIndex = endIndex === pureHTML.length - 1 ? endIndex + 1 : endIndex;
    let afterEnd = pureHTML.substring(endIndex);
    if (afterEnd.startsWith('>')) afterEnd = afterEnd?.slice(1, afterEnd.length);
    if (!beforeStart.endsWith('</span>')) {
        beforeStart += '</span>';
    }
    if (!afterEnd.startsWith('<span text-block="true">')) {
        afterEnd = `<span text-block="true">${afterEnd}`;
    }
    let newHTML;
    if (!updateParams) { // THIS CASES IS FOR DELETING QUERY PARAMS
        newHTML = `${beforeStart}${afterEnd}`;
    }
    else {
        newHTML = `${beforeStart}${updateParams}${afterEnd}`
    }
    if (newHTML.endsWith("<span text-block='true'>") || newHTML.endsWith('<span text-block="true">')) {
        newHTML = newHTML?.slice(0, -24);
    } else if (newHTML.endsWith("<span variable-block='true'>") || newHTML.endsWith('<span variable-block="true">')) {
        newHTML = newHTML?.slice(0, -29);
    }
    else if (!newHTML.endsWith('</span>')) {
        newHTML = newHTML + '</span>';
    }
    return newHTML;
}

function getInnerText(html) {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function getIntoTextBlock(text) {
    return `<span text-block="true">${text}</span>`
}

function getIntoVariableBlock(text) {
    return `<span variable-block="true">{{${text}}}</span>`
}

function convertToHTML(input) {
    const regex = /\{\{(.*?)\}\}/g;
    let lastIndex = 0;
    let result = '';
    let match;
    while ((match = regex.exec(input)) !== null) {
        if (match.index > lastIndex) {
            result += getIntoTextBlock(input.slice(lastIndex, match.index))
        }
        result += getIntoVariableBlock(match[1]);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < input.length) {
        result += getIntoTextBlock(input.slice(lastIndex));
    }
    return result;
}

const convertTextToHTML = (str) => {
    if (str == null || typeof str !== 'string' || str.trim() === '') return str;

    str = str.trim();

    if (str.startsWith('<span')) {
        return str; // Do nothing if the string starts with <span>
    }
    const regex = /(\{\{[^\}]+\}\})/g;
    const parts = str.split(regex).filter(part => part !== '');

    return parts.map(part => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
            return `<span variable-block='true'>${part}</span>`;
        } else {
            return `<span text-block='true'>${part}</span>`;
        }
    }).join('');
};

export { fixSpanTags, getPathVariableHTML, getQueryParamsHTML, replaceParamsHtmlInHostContainerHtml, getInnerText, getIntoTextBlock, getIntoVariableBlock, convertToHTML, decodeHtmlEntities, convertTextToHTML };