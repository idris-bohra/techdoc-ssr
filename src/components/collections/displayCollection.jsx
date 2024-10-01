import React, { Component } from 'react'
import { store } from '../../store/store'
import ReactHtmlParser from 'html-react-parser'
import withRouter from '../common/withRouter'

class DisplayCollection extends Component {
  constructor(props) {
    super(props)
    this.state = {
      description: ''
    }
  }

  async componentDidMount() {
    if (!this.props.location.collection) {
      const collectionId = this.props.location.pathname.split('/')[2]
      this.fetchCollection(collectionId)
      store.subscribe(() => {
        this.fetchCollection(collectionId)
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.collections !== prevProps.collections) {
      const collectionId = this.props.params.collectionIdentifier
      if (this.props.collections[collectionId] && this.props.collections[collectionId] !== prevProps.collections[collectionId]) {
        this.setState({ description: this.props.collections[collectionId].description })
      }
    }
  }

  fetchCollection(collectionId) {
    const { collections } = store.getState()
    const collection = collections[collectionId]
    if (collection) {
      const { description } = collection
      this.setState({ description })
    }
  }

  render() {
    return <div className='collection-description'>{ReactHtmlParser(this.state.description)}</div>
  }
}

export default withRouter(DisplayCollection)
