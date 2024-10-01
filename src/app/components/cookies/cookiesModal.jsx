import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import CookiesList from './cookiesList/cookiesList'
import CookiesListItem from './cookiesListItem/cookiesListItem'
import { connect } from 'react-redux'
import { fetchAllCookies, addCookieDomain, updateCookies, deleteDomain } from './redux/cookiesActions'
import shortid from 'shortid'
import DeleteModal from '../common/deleteModal'

const mapStateToProps = (state) => {
  return {
    cookies: state.cookies
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_all_cookies: () => dispatch(fetchAllCookies()),
    add_cookies_domain: (domain) => dispatch(addCookieDomain(domain)),
    update_cookies: (domain) => dispatch(updateCookies(domain)),
    delete_domain: (domain) => dispatch(deleteDomain(domain))
  }
}

export class CookiesModal extends Component {
  state = {
    tab: 1,
    selectedDomain: null,
    domains: {},
    validityMessage: false,
    deleteModal: false,
    deleteModalData: {
      title: '',
      message: '',
      domain: {}
    }
  }

  componentDidMount() {
    // this.props.fetch_all_cookies()
    if (this.props.cookies) {
      this.setState({ domains: this.props.cookies })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.cookies !== prevProps.cookies) {
      this.setState({ domains: this.props.cookies })
    }
  }

  addDomain(domain) {
    domain.requestId = shortid.generate()
    if (domain.domain.trim() !== '') {
      this.props.add_cookies_domain(domain)
    } else this.setState({ validityMessage: true })
  }

  clearValidityMessage() {
    this.setState({ validityMessage: false })
  }

  addCookies(domain) {
    const domains = this.state.domains
    domains.push(domain)
    this.setState({ domains })
  }

  renderCookiesModal() {
    return (
      <Modal {...this.props} size='lg' aria-labelledby='contained-modal-title-vcenter' centered>
        <Modal.Header closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>Manage Cookies</Modal.Title>
        </Modal.Header>
        <Modal.Body className='cookie-modal'>{this.state.tab === 1 ? this.renderCookiesList() : this.renderCookiesListItem()}</Modal.Body>
      </Modal>
    )
  }

  changeModalTab(id, domain = null) {
    this.setState({ tab: id, selectedDomain: domain ? this.state.domains[domain.id] : null })
  }

  renderCookiesList() {
    return (
      <CookiesList
        {...this.props}
        addDomain={this.addDomain.bind(this)}
        domains={this.state.domains}
        changeModalTab={this.changeModalTab.bind(this)}
        toggleDelete={this.toggleDelete.bind(this)}
        validityMessage={this.state.validityMessage}
        clearValidityMessage={this.clearValidityMessage.bind(this)}
      />
    )
  }

  toggleDelete(deleteModal, deleteModalData) {
    this.setState({ deleteModal, deleteModalData })
  }

  handleEntityDelete() {
    const { title, domain } = this.state.deleteModalData
    if (title === 'Delete Cookie') {
      this.props.update_cookies(domain)
    }
    if (title === 'Delete Domain') {
      this.props.delete_domain(domain)
    }
    const newData = {
      title: '',
      message: '',
      domain: {}
    }
    this.setState({ deleteModalData: newData })
  }

  renderCookiesListItem() {
    const selectedDomainId = this.state.selectedDomain.id
    return (
      <CookiesListItem
        update_cookies={this.props.update_cookies.bind(this)}
        changeModalTab={this.changeModalTab.bind(this)}
        domain={this.state.domains[selectedDomainId]}
        toggleDelete={this.toggleDelete.bind(this)}
      />
    )
  }

  renderDeleteModal() {
    return (
      <DeleteModal
        show={this.state.deleteModal}
        onHide={() => this.setState({ deleteModal: false })}
        title={this.state.deleteModalData.title}
        message={this.state.deleteModalData.message}
        handleEntityDelete={this.handleEntityDelete.bind(this)}
      />
    )
  }

  render() {
    return (
      <div>
        {this.renderCookiesModal()}
        {this.renderDeleteModal()}
        {this.renderDeleteModal()}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CookiesModal)
