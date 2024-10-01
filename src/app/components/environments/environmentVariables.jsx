import React, { useState, useEffect } from 'react'
import { Modal, Table } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import jQuery from 'jquery'
import '../../styles/environmentVariables.scss'
import { addEnvironment, updateEnvironment } from './redux/environmentsActions'
import Joi from 'joi-browser'
import { validate, onEnter } from '../common/utility'
import './environments.scss'
import { getCurrentUser } from '../auth/authServiceV2'
import { RiDeleteBinLine } from 'react-icons/ri'

const EnvironmentVariables = ({ title, show, onHide, environment: initialEnvironment }) => {
  const [environment, setEnvironment] = useState({
    name: '',
    variables: {
      BASE_URL: { initialValue: '', currentValue: '' },
      1: { initialValue: '', currentValue: '' }
    }
  })
  const [originalVariableNames, setOriginalVariableNames] = useState(['BASE_URL', '1'])
  const [updatedVariableNames, setUpdatedVariableNames] = useState(['BASE_URL', ''])
  const [errors, setErrors] = useState(null)
  const [environmentType, setEnvironmentType] = useState(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (title === 'Add new Environment') return

    if (initialEnvironment && Object.keys(initialEnvironment.variables).length > 0) {
      let environmentCopy = jQuery.extend(true, {}, initialEnvironment)
      const originalVars = Object.keys(environmentCopy.variables)
      const len = originalVars.length
      originalVars.push(len.toString())
      const updatedVars = [...Object.keys(environmentCopy.variables), '']
      environmentCopy.variables[len.toString()] = { initialValue: '', currentValue: '' }

      setEnvironment(environmentCopy)
      setOriginalVariableNames(originalVars)
      setUpdatedVariableNames(updatedVars)
    }
  }, [title, initialEnvironment])

  const schema = {
    name: Joi.string().min(3).max(50).trim().required().label('Environment Name'),
    type: title === 'Edit Environment' ? Joi.number().optional() : Joi.number().required().label('Environment Type')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doSubmit()
  }

  const doSubmit = () => {
    const validationErrors = validate({ name: environment.name, type: title === 'Edit Environment' ? undefined : environmentType  }, schema)
    if (validationErrors) {
      setErrors(validationErrors)
      return null
    }

    onHide()
    const envCopy = { ...environment }
    const originalVars = [...originalVariableNames]
    const updatedVars = [...updatedVariableNames]
    delete envCopy.variables[originalVars.pop()]
    updatedVars.pop()

    const updatedVariables = {}
    for (let i = 0; i < updatedVars.length; i++) {
      const variableName = updatedVars[i].trim()
      if (variableName && variableName !== 'deleted') {
        updatedVariables[variableName] = envCopy.variables[originalVars[i]]
      }
    }
    const updatedEnvironment = { variables: updatedVariables }
    const userId = getCurrentUser()?.id
    const existingEnvironment = initialEnvironment && initialEnvironment.name === environment.name;

    if (title === 'Add new Environment' && !existingEnvironment) {
      dispatch(addEnvironment({ name: environment.name, ...updatedEnvironment, type: environmentType }))
      setEnvironment({ name: '', variables: {} })
      setOriginalVariableNames([])
      setUpdatedVariableNames([])
    } else {
      const originalEnvCopy = jQuery.extend(true, {}, initialEnvironment)
      if(environment.id) {
        if (JSON.stringify(originalEnvCopy) !== JSON.stringify(updatedEnvironment)) {
          dispatch(updateEnvironment({ id: environment.id, name: environment.name, ...updatedEnvironment }))
        }
      }
    }
  }

  const handleAdd = () => {
    const envCopy = { ...environment }
    const len = originalVariableNames.length
    const originalVars = [...originalVariableNames, len.toString()]
    const updatedVars = [...updatedVariableNames, '']
    if (originalVars[len.toString() - 1] !== '') {
      envCopy.variables[len.toString()] = { initialValue: '', currentValue: '' }
    }
    setEnvironment(envCopy)
    setOriginalVariableNames(originalVars)
    setUpdatedVariableNames(updatedVars)
  }

  const handleChangeEnv = (e) => {
    const envCopy = { ...environment }
    envCopy[e.currentTarget.name] = e.currentTarget.value
    setEnvironment(envCopy)
    setErrors(null)
  }

  const handleChange = (e) => {
    const name = e.currentTarget.name.split('.')
    const lastIndex = originalVariableNames.length - 1

    const originalVars = [...originalVariableNames]
    const updatedVars = [...updatedVariableNames]
    let data = {}
    if (name[1] === 'name') {
      updatedVars[name[0]] = e.currentTarget.value
      data = { updatedVariableNames: updatedVars }
    } else {
      const envCopy = { ...environment }
      envCopy.variables[originalVars[name[0]]][name[1]] = e.currentTarget.value
      data = { environment: envCopy }
    }

    setEnvironment((prev) => ({ ...prev, ...data }))
    setUpdatedVariableNames(updatedVars)
    setOriginalVariableNames(originalVars)

    if (name[0] === lastIndex.toString()) {
      handleAdd()
    }
  }

  const handleDelete = (index) => {
    const updatedVars = [...updatedVariableNames]
    updatedVars[index] = 'deleted'
    setUpdatedVariableNames(updatedVars)
  }

  const handleEnvType = (e) => {
    setEnvironmentType(e.currentTarget.value === 'global' ? 0 : 1);
  }

  return (
    <div onKeyDown={(e) => onEnter(e, doSubmit)}>
      <Modal show={show} onHide={onHide} size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered className='custom-environment'>
        <form onSubmit={handleSubmit}>
          <div className='custom-environment-modal-container'>
            <Modal.Header className='custom-collection-modal-container p-3' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-3'>
              <div className='form-group mb-0'>
                <label htmlFor='custom-environment-input'>
                  Environment Name<span className='mx-1 alert alert-danger'>*</span>
                </label>
                <input
                  name='name'
                  value={environment.name}
                  onChange={handleChangeEnv}
                  type='text'
                  id='custom-environment-input'
                  className='form-control'
                  placeholder='Environment Name'
                />
                <div>
                  <small className='muted-text'>*environment name accepts min 3 and max 50 characters</small>
                </div>
                {errors?.name && <div className='alert alert-danger'>{errors?.name}</div>}
              </div>
              {title === 'Add new Environment' && (
                <div className='form-group py-2'>
                  <label htmlFor='custom-environment-input'>Environment Type <span className='mx-1 alert alert-danger'>*</span></label>
                  <div>
                    <label className='radio-inline pr-4'>
                      <input
                        type='radio'
                        name='environmentType'
                        value='global'
                        onChange={handleEnvType}
                        className='mr-2 pt-2'
                      />
                      Global Environment
                    </label>
                    <label className='radio-inline ml-3'>
                      <input
                        type='radio'
                        name='environmentType'
                        value='private'
                        onChange={handleEnvType}
                        className='mr-2 pt-2'
                      />
                      Private Environment
                    </label>
                  </div>
                </div>
              ) }
             { errors?.type && <div className='alert alert-danger'>{errors?.type}</div>}
              <div className='custom-table-container env-table'>
                <Table size='sm' className='my-1'>
                  <thead>
                    <tr>
                      <th className='custom-td'>Variable</th>
                      <th className='custom-td'>Initial Value</th>
                      <th className='custom-td'>Current Value</th>
                      <th className='custom-td'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedVariableNames.map((variable, index) =>
                      variable !== 'deleted' ? (
                        <tr key={index}>
                          <td className='custom-td'>
                            <input
                              name={index + '.name'}
                              value={variable}
                              onChange={handleChange}
                              type='text'
                              style={{ border: 'none' }}
                              className='form-control'
                            />
                          </td>
                          <td className='custom-td'>
                            <input
                              name={index + '.initialValue'}
                              value={environment.variables[originalVariableNames[index]].initialValue}
                              onChange={handleChange}
                              type='text'
                              className='form-control'
                              style={{ border: 'none' }}
                            />
                          </td>
                          <td className='custom-td'>
                            <input
                              name={index + '.currentValue'}
                              value={environment.variables[originalVariableNames[index]].currentValue}
                              onChange={handleChange}
                              type='text'
                              style={{ border: 'none' }}
                              className='form-control'
                            />
                          </td>
                          {updatedVariableNames.length - 1 !== index && (
                            <td className='custom-td'>
                              <button type='button' className='btn btn-light btn-sm btn-block' onClick={() => handleDelete(index)}>
                               <RiDeleteBinLine className='text-grey' size={18}/>
                              </button>
                            </td>
                          )}
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <div className='custom-table-footer p-3'>
              <div className='text-left'>
                <button className='btn btn-primary btn-sm font-12 mr-2' id='add_env_save_btn'>
                  Save
                </button>
                <button className='btn btn-secondary outline btn-sm font-12' onClick={onHide}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default EnvironmentVariables
