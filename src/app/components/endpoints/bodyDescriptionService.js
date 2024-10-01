import jQuery from 'jquery'

let originalBodyDescription = ''
const parseBody = (rawBody) => {
  let body = {}
  try {
    body = JSON.parse(rawBody)
    return body
  } catch (error) {
    return null
  }
}

function handleUpdate(isFirstTime, props, msg) {
  originalBodyDescription = jQuery.extend(true, {}, props.body_description)
  const bodyDescription = updateBodyDescription(props.body, isFirstTime, msg)
  if (props.set_body_description) props.set_body_description(bodyDescription)
  return bodyDescription
}

function updateBodyDescription(body, isFirstTime, msg) {
  if (msg) {
    return msg
  }
  body = { payload: parseBody(body) }
  let bodyDescription = generateBodyDescription(body, isFirstTime)
  if (!isFirstTime) {
    bodyDescription = preserveDefaultValue(bodyDescription)
  }
  return bodyDescription
}
function generateBodyDescription(data, isFirstRun) {
  try {
    if (!data) {
      return null
    }

    let description
    let propertyKeys

    if (Array.isArray(data)) {
      description = []
      propertyKeys = data.map((_, index) => index.toString())
    } else {
      description = {}
      propertyKeys = Object.keys(data)
    } 

    // Iterate over each property or index
    propertyKeys.forEach((key) => {
      const element = Array.isArray(data) ? data[parseInt(key)] : data[key]

      if (typeof element === 'string' || typeof element === 'number' || typeof element === 'boolean') {
        description[key] = {
          value: isFirstRun ? element : null,
          type: typeof element,
          description: ''
        }
      } else if (Array.isArray(element)) {
        const nestedDescription = generateBodyDescription(element, isFirstRun)
        description[key] = {
          value: nestedDescription,
          type: 'array',
          description: ''
        }

        // Set default value for arrays on first run
        if (isFirstRun && nestedDescription.length > 0) {
          description[key]['default'] = nestedDescription[0]
        }
      } else if (typeof element === 'object') {
        // Recursively handle objects
        description[key] = {
          value: generateBodyDescription(element, isFirstRun),
          type: 'object',
          description: ''
        }
      } else {
        // Handle unexpected types with a default fallback
        description[key] = {
          value: null,
          type: 'unknown',
          description: 'Unexpected type'
        }
      }
    })

    return description
  } catch (error) {
    console.error('Error generating body description:', error)
    return null
  }
}

function preserveDefaultValue(bodyDescription) {
  if (!originalBodyDescription) return bodyDescription
  const copiedOriginalBodyDescription = originalBodyDescription
  let updatedBodyDescription = jQuery.extend(true, {}, bodyDescription)
  updatedBodyDescription = compareDefaultValue(updatedBodyDescription, copiedOriginalBodyDescription)

  return updatedBodyDescription
}

function compareDefaultValue(updatedBodyDescription, originalBodyDescription) {
  if (!updatedBodyDescription) return
  const updatedKeys = Object.keys(updatedBodyDescription)
  for (let i = 0; i < updatedKeys.length; i++) {
    if (
      originalBodyDescription?.[updatedKeys?.[i]] &&
      updatedBodyDescription[updatedKeys[i]].type === originalBodyDescription[updatedKeys[i]].type
    ) {
      switch (updatedBodyDescription[updatedKeys[i]].type) {
        case 'string':
        case 'number':
        case 'boolean':
          updatedBodyDescription[updatedKeys[i]].value = originalBodyDescription[updatedKeys[i]].value
          updatedBodyDescription[updatedKeys[i]].description = originalBodyDescription[updatedKeys[i]].description
          break
        case 'array':
          updatedBodyDescription[updatedKeys[i]].value = compareDefaultValue(
            updatedBodyDescription[updatedKeys[i]].value,
            originalBodyDescription[updatedKeys[i]].value
          )
          updatedBodyDescription[updatedKeys[i]].default = compareDefaultValue(
            updatedBodyDescription[updatedKeys[i]].value,
            originalBodyDescription[updatedKeys[i]].value
          )[0]
          updatedBodyDescription[updatedKeys[i]].description = originalBodyDescription[updatedKeys[i]].description
          break
        case 'object':
          updatedBodyDescription[updatedKeys[i]].value = compareDefaultValue(
            updatedBodyDescription[updatedKeys[i]].value,
            originalBodyDescription[updatedKeys[i]].value
          )
          updatedBodyDescription[updatedKeys[i]].description = originalBodyDescription[updatedKeys[i]].description
          break
        default:
          break
      }
    }
  }
  return updatedBodyDescription
}

export default {
  parseBody,
  handleUpdate
}