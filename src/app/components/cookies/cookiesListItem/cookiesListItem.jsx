import React, { Component } from 'react'
import moment from 'moment'
import './cookiesListItem.scss'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
class CookiesListItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      addCookie: false,
      updateCookie: {
        key: '',
        value: ''
      },
      currentDomain: {}
    }
  }

  componentDidMount() {
    this.setState({ currentDomain: JSON.parse(JSON.stringify(this.props.domain)) })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.domain !== prevProps.domain) {
      this.setState({ currentDomain: JSON.parse(JSON.stringify(this.props.domain)) })
    }
  }

  handleAddCookie() {
    const domain = { ...this.state.currentDomain }
    const newCookie = this.getNewCookie()
    domain.cookies[newCookie.key] = newCookie.value
    this.props.update_cookies(domain)
    this.setState({ updateCookie: newCookie })
  }

  handleCookieEdit(e) {
    const cookieValue = e.target.value
    this.setState({ updateCookie: { ...this.state.updateCookie, value: cookieValue } })
  }

  showDisableButton() {
    const currentDomain = { ...this.state.currentDomain }
    const currentCookie = this.state.updateCookie
    return currentDomain.cookies[currentCookie.key] !== currentCookie.value
  }

  saveCookie() {
    const currentDomain = { ...this.state.currentDomain }
    const currentCookie = this.state.updateCookie
    let updateCookie = {}
    let cookieName = ''

    if (currentDomain.cookies[currentCookie.key] === currentCookie.value) {
      updateCookie = {}
    } else if (currentCookie.value.trim()) {
      cookieName = currentCookie.key
      const { cookieString, name, expiresValue } = this.prepareCookieString(currentCookie.value.trim())
      const time = moment(expiresValue)
      if (expiresValue && moment(time).isBefore(moment().format())) {
        const domain = currentDomain
        delete domain.cookies[cookieName]
        this.props.update_cookies(domain)
        return
      }
      if (cookieString !== currentCookie.value) {
        if (name && name !== cookieName) {
          delete currentDomain.cookies[cookieName]
          currentDomain.cookies[name] = cookieString
        } else {
          currentDomain.cookies[cookieName] = cookieString
        }
        this.props.update_cookies(currentDomain)
      }
    }
    this.setState({ updateCookie })
  }

  prepareCookieString(cookieValue) {
    let cookie = ''
    let name
    let path = 'Path=/ ;'
    let expires = ''
    let secure = ''
    let httponly = ''
    let cookieString = ''
    const cookieArray = cookieValue.split(';')
    let expiresValue = null
    cookieArray.forEach((item, index) => {
      if (index === 0) {
        let [key, value] = item.split('=')?.filter((v) => v !== '')
        name = key?.trim()
        value = value?.trim()
        cookie = `${name}=${value || ''} ;`
      } else {
        let [key, value] = item.split('=')?.filter((v) => v !== '')
        value = value?.trim()
        if (key?.trim() === 'Path') {
          path = `Path=${value || '/'} ;`
        }
        if (key?.trim() === 'Expires') {
          expires = `Expires=${value || ''} ;`
          expiresValue = value
        }
        if (key?.trim() === 'HttpOnly') {
          httponly = 'HttpOnly ;'
        }
        if (key?.trim() === 'Secure') {
          secure = 'Secure ;'
        }
      }
    })
    cookieString = cookie + path + expires + httponly + secure
    cookieString = cookieString.trim();
    if (cookieString.endsWith(';')) {
      cookieString = cookieString.slice(0, -1).trim();
  }
    return { cookieString, name, expiresValue }
  }

  deleteCookie(name) {
    const domain = JSON.parse(JSON.stringify(this.state.currentDomain))
    delete domain.cookies[name]
    const deleteModalData = {
      title: 'Delete Cookie',
      message: 'Are you sure, Do you want to delete this cookie?',
      domain
    }

    this.props.toggleDelete(true, deleteModalData)
  }

  renderCookiesList() {
    const cookies = this.state.currentDomain.cookies
    return Object.keys(cookies || {}).length > 0 ? (
      Object.keys(cookies || {}).map((name, index) => (
        <div key={index} className='cookie-item'>
          <div className='w-100' key={index}>
            <div
              className='cursor-pointer'
              onClick={() => this.setState({ updateCookie: { key: name, value: this.state.currentDomain.cookies[name] } })}
            >
              {name}
            </div>
            {name === this.state.updateCookie.key && this.renderCookieArea()}
          </div>
          <div className='delete-abs' onClick={() => this.deleteCookie(name)}>
            <DeleteIcon className='cursor-pointer' />
          </div>
        </div>
      ))
    ) : (
      <h4 className='text-center'>No Cookies available!</h4>
    )
  }

  getNewCookie() {
    let cookies = this.state.currentDomain.cookies
    cookies = Object.keys(cookies || {})
    for (let i = 1; cookies.length + 1; i++) {
      const cookieName = `Cookie${i}`
      if (!cookies.includes(cookieName)) {
        const time = moment().add(1, 'Y').format()
        const cookieValue = `${cookieName}=value; Path=/; Expires=${time}`
        return { key: cookieName, value: cookieValue }
      }
    }
  }

  renderCookieArea() {
    return (
      <>
        <textarea
          className='form-control custom-input'
          rows='2'
          onChange={(e) => this.handleCookieEdit(e)}
          id='update-cookie'
          value={this.state.updateCookie.value}
        />
        <div className='text-right mt-2'>
          {this.showDisableButton() && (
            <span className='cursor-pointer mr-3 btn default' onClick={() => this.setState({ updateCookie: {} })}>
              Update
            </span>
          )}
          <button className='btn btn-primary' disabled={!this.showDisableButton()} onClick={() => this.saveCookie()}>
            save
          </button>
        </div>
      </>
    )
  }

  render() {
    return (
      <div>
        <div className='back-link' onClick={() => this.props.changeModalTab(1)}>
          {'< Back'}
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='domain-title'>{this.state.currentDomain.domain}</div>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='mr-3'>{`${Object.entries(this.state.currentDomain.cookies || {}).length} cookies`}</div>
            <button className='btn btn-primary' onClick={() => this.handleAddCookie()}>
              Add Cookie
            </button>
          </div>
        </div>
        <div className='mt-3'>{this.renderCookiesList()}</div>
      </div>
    )
  }
}

export default CookiesListItem
