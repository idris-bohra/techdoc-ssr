import React, { Component } from 'react'
import './cookiesList.scss'
const DeleteIcon =() =>( <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
  <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  <path
    d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z'
    stroke='#E98A36'
    strokeWidth='1.5'
    strokeLinecap='round'
    strokeLinejoin='round'
  />
  <path d='M7.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
  <path d='M10.5 8.25V12.75' stroke='#E98A36' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
</svg>
)
// import DeleteIcon from '../../../assets/icons/delete-icon.svg'
class CookiesList extends Component {
  state = {
    domains: [],
    currentDomain: {
      domain: ''
    }
  }

  handleChange(e) {
    if (e.target.value.trim() !== '') this.props.clearValidityMessage()
    this.setState({ currentDomain: { ...this.state.currentDomain, domain: e.target.value } })
  }

  handleSubmit(e) {
    e.preventDefault()
    //  let domains=this.state.domains;
    //  domains.push(this.state.currentDomain);
    this.props.addDomain(this.state.currentDomain)
    this.setState({ currentDomain: { domain: '' } })
  }

  deleteDomain(domain) {
    const deleteModalData = {
      title: 'Delete Domain',
      message: 'Are you sure, Do you want to delete this domain?',
      domain
    }

    this.props.toggleDelete(true, deleteModalData)
  }

  renderAddDomain() {
    return (
      <div className='form-group'>
        <form className='d-flex p-2' onSubmit={(e) => this.handleSubmit(e)}>
          <input
            className='form-control'
            placeholder='Add Domain'
            value={this.state.currentDomain.domain}
            onChange={(e) => this.handleChange(e)}
          />
          <button className='btn btn-primary btn-sm font-12 ml-3' type='submit' disabled={this.state.currentDomain.domain === ''}>
            Add
          </button>
        </form>
        {this.props.validityMessage && <small className='muted-text'>*Please enter valid Domain</small>}
      </div>
    )
  }

  renderCookiesListItem(domain) {
    this.props.changeModalTab(2, domain)
  }

  renderDomainList() {
    return Object.keys(this.props.domains).length > 0 ? (
      Object.values(this.props.domains).map((domain, index) => (
        <div key={index} className='d-flex justify-content-between align-items-center'>
          <div
            className='cookie-list-parent-item d-flex justify-content-between cursor-pointer w-100'
            onClick={() => this.renderCookiesListItem(domain)}
          >
            <div className='mr-5'>{domain.domain}</div>
            <div className='d-flex justify-content-between align-items-center'>
              <div>{`${Object.keys(domain.cookies || {}).length} cookies`}</div>
            </div>
          </div>
          <div className='cursor-pointer ml-2 icon-center' onClick={() => this.deleteDomain(domain)}>
            {' '}
            <DeleteIcon />{' '}
          </div>
        </div>
      ))
    ) : (
      <h4 className='text-center font-12 text-secondary'>No Domain available!</h4>
    )
  }

  render() {
    return (
      <div>
        {this.renderAddDomain()}
        {this.renderDomainList()}
      </div>
    )
  }
}

export default CookiesList
