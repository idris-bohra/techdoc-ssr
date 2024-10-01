import isEqual from 'react-fast-compare'

function getHighlightsData(props, title, key) {
  let items = {}
  switch (title) {
    case 'Headers':
      typeof props.highlights?.headers?.items === 'object' ? (items = props.highlights.headers.items) : (items = {})
      break
    case 'Params':
      typeof props.highlights?.params?.items === 'object' ? (items = props.highlights.params.items) : (items = {})
      break
    case 'Path Variables':
      typeof props.highlights?.pathVariables?.items === 'object' ? (items = props.highlights.pathVariables.items) : (items = {})
      break
    case 'formData':
      typeof props.highlights?.body?.value?.items === 'object' ? (items = props.highlights.body.value.items) : (items = {})
      break
    case 'x-www-form-urlencoded':
      typeof props.highlights?.body?.value?.items === 'object' ? (items = props.highlights.body.value.items) : (items = {})
      break
    case 'sampleResponse':
      typeof props.highlights?.sampleResponse?.items === 'object' ? (items = props.highlights.sampleResponse.items) : (items = {})
      break
    default:
      break
  }
  return key in items ? items[key] : false
}

function willHighlight(props, title) {
  let result = false
  switch (title) {
    case 'Headers':
      result = typeof props.highlights?.headers?.isChanged === 'boolean' ? props.highlights.headers.isChanged : false
      break
    case 'Params':
      result = typeof props.highlights?.params?.isChanged === 'boolean' ? props.highlights.params.isChanged : false
      break
    case 'Path Variables':
      result = typeof props.highlights?.pathVariables?.isChanged === 'boolean' ? props.highlights.pathVariables.isChanged : false
      break
    case 'formData':
      result = typeof props.highlights?.body?.isChanged === 'boolean' ? props.highlights.body.isChanged : false
      break
    case 'x-www-form-urlencoded':
      result = typeof props.highlights?.body?.isChanged === 'boolean' ? props.highlights.body.isChanged : false
      break
    case 'sampleResponse':
      result = typeof props.highlights?.sampleResponse?.isChanged === 'boolean' ? props.highlights.sampleResponse.isChanged : false
      break
    case 'body':
      result = typeof props.highlights?.body?.isChanged === 'boolean' ? props.highlights.body.isChanged : false
      break
    default:
      result = false
  }
  return result
}

function makeHighlightsData(oldData, newData, type) {
  const temp = { isChanged: null, items: {} }
  temp.isChanged = !isEqual(oldData, newData)
  if (newData && temp.isChanged) {
    switch (type) {
      case 'headers':
        temp.isChanged = !isEqual(oldData, newData)
        Object.keys({ ...oldData, ...newData }).forEach((entry) => {
          temp.items[entry] = null
        })
        Object.entries(temp.items).forEach((entry) => {
          temp.items[entry[0]] = oldData ? !isEqual(oldData[entry[0]], newData[entry[0]]) : true
        })
        break
      case 'params':
        temp.isChanged = !isEqual(oldData, newData)
        Object.keys({ ...oldData, ...newData }).forEach((entry) => {
          temp.items[entry] = null
        })
        Object.entries(temp.items).forEach((entry) => {
          temp.items[entry[0]] = oldData ? !isEqual(oldData[entry[0]], newData[entry[0]]) : true
        })
        break
      case 'pathVariables':
        temp.isChanged = !isEqual(oldData, newData)
        Object.keys({ ...oldData, ...newData }).forEach((entry) => {
          temp.items[entry] = null
        })
        Object.entries(temp.items).forEach((entry) => {
          temp.items[entry[0]] = oldData ? !isEqual(oldData[entry[0]], newData[entry[0]]) : true
        })
        break
      case 'sampleResponse':
        temp.isChanged = !isEqual(oldData, newData)
        newData.forEach((entry) => {
          temp.items[entry.title] = null
        })
        Object.entries(temp.items).forEach((entry) => {
          temp.items[entry[0]] = oldData
            ? !isEqual(oldData[oldData.findIndex((o) => o.title === entry[0])], newData[newData.findIndex((o) => o.title === entry[0])])
            : true
        })
        break
      case 'body':
        temp.isChanged = !isEqual(oldData, newData)
        newData.forEach((entry) => {
          temp.items[entry.key] = null
        })
        Object.entries(temp.items).forEach((entry) => {
          temp.items[entry[0]] =
            oldData && typeof oldData !== 'string'
              ? !isEqual(oldData[oldData.findIndex((o) => o.key === entry[0])], newData[newData.findIndex((o) => o.key === entry[0])])
              : true
        })
        break
      default:
    }
  }
  return temp
}

export { getHighlightsData, willHighlight, makeHighlightsData }
