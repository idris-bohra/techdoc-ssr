import React, { Component } from 'react'
import { getCurrentUser } from '../auth/authServiceV2'
import { Link } from 'react-router-dom'

class UserInfo extends Component {
  constructor(props) {
    super(props)
    this.state = { user: { name: '', email: '' } }
  }

  componentDidMount() {
    if (getCurrentUser()) {
      const user = getCurrentUser()
      user.name = user.first_name + user.last_name
      this.setState({ user })
    }
  }

  render() {
    return (
      <div className='btn-grp' id='user-menu'>
        <div className='dropdown user-dropdown'>
          <button
            className='user-dropdown-btn'
            type='button'
            id='dropdownMenuButton'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
          >
            <div className='user-info'>
              <div className='user-avatar'>
                <i className='uil uil-user' />
              </div>
              <div className='user-details'>
                <div className='user-details-heading'>
                  <div className='user-name'>{this.state.user.name}</div>
                </div>
              </div>
            </div>
          </button>
          <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
            <div className='user-info'>
              <div className='user-avatar'>
                <i className='uil uil-user' />
              </div>
              <div className='user-details'>
                <div className='user-details-heading'>
                  <div className='user-name'>{this.state.user.name}</div>
                </div>
                <div className='user-details-text'>{this.state.user.email}</div>
              </div>
            </div>
            <li>
              <Link to='/logout'>Sign out</Link>
            </li>
            {getCurrentUser() === null ? null : (
              <li>
                <Link to='/dashboard'>My Collections</Link>
              </li>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default UserInfo
