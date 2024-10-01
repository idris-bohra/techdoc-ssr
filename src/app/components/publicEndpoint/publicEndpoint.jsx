import React, { Component } from 'react'
import { connect } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import DisplayEndpoint from '../endpoints/displayEndpoint'
import SideBarV2 from '../main/sideBarV2.jsx'
import { ERROR_404_PUBLISHED_PAGE } from '../../components/errorPages'
import '../collections/collections.scss'
import { fetchAllPublicEndpoints } from './redux/publicEndpointsActions.js'
import './publicEndpoint.scss'
import SplitPane from '../splitPane/splitPane.jsx'
import '../collectionVersions/collectionVersions.scss'
import { setTitle, setFavicon, comparePositions, hexToRgb, isTechdocOwnDomain, SESSION_STORAGE_KEY, isOnPublishedPage } from '../common/utility'
import { Style } from 'react-style-tag'
import { Modal } from 'react-bootstrap'
import { addCollectionAndPages } from '../redux/generalActions'
import generalApiService from '../../services/generalApiService'
import { useQueryClient, useMutation } from 'react-query'
import { MdDehaze, MdClose } from 'react-icons/md'
import { background } from '../backgroundColor.js'
import withRouter from '../common/withRouter.jsx'
import PublicPage from '../../pages/publicPage/publicPage.jsx'
import IconButton from '../common/iconButton.jsx'

const withQuery = (WrappedComponent) => {
  return (props) => {
    const queryClient = useQueryClient()

    const setQueryUpdatedData = (type, id, data) => {
      queryClient.setQueryData([type, id], data)
      return
    }

    const keyExistInReactQuery = (id) => {
      return queryClient.getQueryData(id) == undefined
    }

    const mutation = useMutation(
      (data) => {
        return data
      },
      {
        onSuccess: (data) => {
          queryClient.setQueryData([data.type, data.id], data?.content || '', {
            staleTime: Number.MAX_SAFE_INTEGER, // Set staleTime to a large value
            retry: 2
          })
        }
      }
    )
    return (
      <WrappedComponent
        {...props}
        setQueryUpdatedData={setQueryUpdatedData}
        mutationFn={mutation}
        keyExistInReactQuery={keyExistInReactQuery}
      />
    )
  }
}

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetch_all_public_endpoints: (collectionIdentifier, domain) =>
      dispatch(fetchAllPublicEndpoints(ownProps.navigate, collectionIdentifier, domain)),
    add_collection_and_pages: (orgId, queryParams) => dispatch(addCollectionAndPages(orgId, queryParams))
  }
}

class PublicEndpoint extends Component {
  constructor() {
    super()
    this.state = {
      publicCollectionId: '',
      collectionName: '',
      collectionTheme: null,
      isNavBar: false,
      isSticky: false,
      likeActive: false,
      dislikeActive: false,
      review: {
        feedback: {},
        endpoint: {}
      },
      openReviewModal: false,
      idToRenderState: null
    }
    this.iconRef = React.createRef()
    this.hamburgerIconRef = React.createRef()
    this.logoName = React.createRef()
    this.closeIconRef = React.createRef()
  }

  async componentDidMount() {
    // [info] => part 1 scroll options
    window.addEventListener('scroll', () => {
      let sticky = false
      if (window.scrollY > 20) {
        sticky = true
      } else {
        sticky = false
      }
      this.setState({ isSticky: sticky })
    })

    let url = new URL(window.location.href)
    if (this.props?.location?.search) {
      var queryParams = new URLSearchParams(this.props.location.search)
    }

    // even if user copy paste other published collection with collection Id in the params change it
    if (queryParams?.has('collectionId')) {
      var collectionId = queryParams.get('collectionId')
      sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId)
    } else if (sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID) != null) {
      var collectionId = sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID)
    }

    this.setState({ publicCollectionId: collectionId })

    var queryParamApi2 = {}
    // example `https://localhost:300/path`
    // [info] part 2 get sidebar data and collection data  also set queryParmas for 2nd api call
    if (isTechdocOwnDomain()) {
      // internal case here collectionId will be there always
      queryParamApi2.collectionId = collectionId
      queryParamApi2.path = url.pathname.slice(3) // ignoring '/p/' in pathName
      this.props.add_collection_and_pages(null, { collectionId: collectionId, public: true })
    } else if (!isTechdocOwnDomain()) {
      // external case
      queryParamApi2.custom_domain = window.location.hostname // setting hostname
      queryParamApi2.path = url.pathname.slice(1) // ignoring '/' in pathname
      this.props.add_collection_and_pages(null, { custom_domain: window.location.hostname })
    }

    // setting version if present
    if (queryParams?.has('version')) {
      queryParamApi2.versionName = queryParams.get('version')
    }

    let queryParamsString = '?'
    for (let key in queryParamApi2) {
      if (queryParamApi2.hasOwnProperty(key)) {
        // Check if the property belongs to the object (not inherited)
        queryParamsString += `${encodeURIComponent(key)}=${encodeURIComponent(queryParamApi2[key])}&`
      }
    }

    // Remove the last '&' character
    queryParamsString = queryParamsString.slice(0, -1)

    try {
      const response = await generalApiService.getPublishedContentByPath(queryParamsString)
      this.setDataToReactQueryAndSessionStorage(response)
    } catch (e) {
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, 'undefined')
      this.setState({ idToRenderState: 'undefined' })
    }
  }

  async componentDidUpdate(prevProps) {
    window.onpopstate = async (event) => {
      if (event.state) {
        const url = new URL(window.location.href);
        const queryParams = this.props?.location?.search ? new URLSearchParams(this.props.location.search) : null;
        
        let collectionId = queryParams?.get('collectionId') || sessionStorage.getItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID);
        if (collectionId) {
          sessionStorage.setItem(SESSION_STORAGE_KEY.PUBLIC_COLLECTION_ID, collectionId);
        }

        this.setState({ publicCollectionId: collectionId });

        const queryParamApi2 = {};
        if (isTechdocOwnDomain()) {
          queryParamApi2.collectionId = collectionId;
          queryParamApi2.path = url.pathname.slice(3);
          this.props.add_collection_and_pages(null, { collectionId, public: true });
        } else {
          queryParamApi2.custom_domain = window.location.hostname;
          queryParamApi2.path = url.pathname.slice(1);
          this.props.add_collection_and_pages(null, { custom_domain: window.location.hostname });
        }

        if (queryParams?.has('version')) {
          queryParamApi2.versionName = queryParams.get('version');
        }

        const queryParamsString = new URLSearchParams(queryParamApi2).toString();

        try {
          const response = await generalApiService.getPublishedContentByPath(`?${queryParamsString}`);
          this.setDataToReactQueryAndSessionStorage(response);
        } catch (e) {
          sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, 'undefined');
          this.setState({ idToRenderState: 'undefined' });
        }
      }
    };
    
    const currentIdToShow = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW);
    if (!this.props.keyExistInReactQuery(currentIdToShow)) {
      try {
        const response = await generalApiService.getPublishedContentByIdAndType(currentIdToShow, this.props.pages?.[currentIdToShow]?.type);
        if (this.props.pages?.[currentIdToShow]?.type == 4) {
          // Example: Handle endpoint case
          // this.props.mutationFn.mutate({ type: 'endpoint', id: currentIdToShow, content: response });
        } else {
          // Example: Handle page content case
          // this.props.mutationFn.mutate({ type: 'pageContent', id: currentIdToShow, content: response });
        }
      } catch (e) {
        console.error("Failed to fetch content", e);
      }
    }
  }

  setDataToReactQueryAndSessionStorage(response) {
    if (response) {
      var id = response?.data?.publishedContent?.id
      if (response?.data?.publishedContent?.type === 4) {
        // this.props.mutationFn.mutate({ type: 'endpoint', id: id, content: response?.data?.publishedContent })
      } else {
        // this.props.mutationFn.mutate({ type: 'pageContent', id: id, content: response?.data?.publishedContent?.contents })
      }
      sessionStorage.setItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW, id)
      this.setState({ idToRenderState: id })
    }
  }

  openLink(link) {
    window.open(`${link}`, '_blank')
  }

  getCTALinks() {
    const collectionId = this.props?.params?.collectionIdentifier
    let { cta, links } = this.props.collections?.[collectionId]?.docProperties || { cta: [], links: [] }
    cta = cta ? cta.filter((o) => o.name.trim() && o.value.trim()) : []
    links = links ? links.filter((o) => o.name.trim() && o.link.trim()) : []
    const isCTAandLinksPresent = cta.length !== 0 || links.length !== 0
    return { cta, links, isCTAandLinksPresent }
  }

  displayCTAandLink() {
    const { cta, links, isCTAandLinksPresent } = this.getCTALinks()
    return (
      <>
        <div className={this.state.isSticky ? 'd-flex public-navbar stickyNav' : 'public-navbar d-flex'}>
          {/* <div className='entityTitle'>
            {this.state.currentEntityName}
          </div> */}
          {isCTAandLinksPresent && (
            <div className='d-flex align-items-center'>
              {links.map((link, index) => (
                <div key={`link-${index}`}>
                  <label
                    className='link'
                    htmlFor={`link-${index}`}
                    onClick={() => {
                      this.openLink(link.link)
                    }}
                  >
                    {link.name}
                  </label>
                </div>
              ))}
              {cta.map((cta, index) => (
                <div className='cta-button-wrapper' key={`cta-${index}`}>
                  <button
                    style={{
                      backgroundColor: this.state.collectionTheme,
                      borderColor: this.state.collectionTheme,
                      color: this.state.collectionTheme
                    }}
                    name={`cta-${index}`}
                    onClick={() => {
                      this.openLink(cta.value)
                    }}
                  >
                    {cta.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )
  }

  fetchEntityName(entityName) {
    if (entityName) {
      this.setState({ currentEntityName: entityName })
    } else {
      this.setState({ currentEntityName: '' })
    }
  }

  toggleReviewModal = () => this.setState({ openReviewModal: !this.state.openReviewModal })

  reviewModal() {
    return (
      <div onHide={() => this.props.onHide()} show top>
        <Modal show top>
          <div className=''>
            <Modal.Header closeButton>
              <Modal.Title>API FeedBack</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form className='form-group d-flex flex-column'>
                <label>
                  User Name:
                  <input type='text' name='name' className='form-control w-75 mb-2' />
                </label>
                <label>
                  Comment:
                  <textarea type='text' name='name' className='form-control w-75 mb-3' />
                </label>
                <input type='submit' value='Submit' className='btn btn-primary w-25' />
              </form>
            </Modal.Body>

            <Modal.Footer>
              <button
                className='btn btn-custom-dark'
                onClick={() => this.subscribeToExtendedLog()}
                onHide={() => this.setState({ showExtendedLog: false })}
              >
                Subscribe For Extended Log
              </button>
            </Modal.Footer>
          </div>
        </Modal>
      </div>
    )
  }

  setDislike() {
    this.setState({ dislikeActive: !this.state.dislikeActive }, () => {
      const data = this.props.params.endpointId
      // const endpoint = this.state
      this.setState({ endpoint: data })
      const review = { ...this.state.review.endpoint }
      review.endpoint = this.props.params
      if (this.state.dislikeActive) {
        review.feedback = 'disliked'
      }
      window.localStorage.setItem('review', JSON.stringify(review))
    })
    this.toggleReviewModal()
  }

  setLike() {
    this.setState({ likeActive: !this.state.likeActive }, () => {
      const review = { ...this.state.review }
      review.endpoint = this.props.params
      if (this.state.likeActive) {
        review.feedback = 'liked'
      }
      window.localStorage.setItem('review', JSON.stringify(review))
    })
  }

  handleLike() {
    if (this.state.dislikeActive) {
      // this.setLike();
      // this.setDislike();
    }
    this.setLike()
  }

  handleDislike() {
    if (this.state.likeActive) {
      // this.setDislike();
      // this.setLike();
    }
    this.setDislike()
  }

  handleShowSideBar() {
    const splitPaneElement = document.querySelector('.split-sidebar-public')
    const hamburgerElement = document.querySelector('#hamburgerIcon')
    const logoElement = document.querySelector('#logoName')
    const closeElement = document.querySelector('#closeIcon')
    if (this.iconRef.current && splitPaneElement) {
      if (this.iconRef.current.classList.contains('close-icon') && splitPaneElement.classList.contains('open')) {
        this.iconRef.current.classList.remove('close-icon')
        splitPaneElement.classList.remove('open')
        closeElement.classList.add('icon-none')
        hamburgerElement.classList.remove('icon-none')
        // logoElement.classList.remove('icon-none');
      } else {
        this.iconRef.current.classList.add('close-icon')
        splitPaneElement.classList.add('open')
        hamburgerElement.classList.add('icon-none')
        // logoElement.classList.add('icon-none');
        closeElement.classList.remove('icon-none')
      }
    }
  }

  render() {
    let idToRender = sessionStorage.getItem(SESSION_STORAGE_KEY.CURRENT_PUBLISH_ID_SHOW) || this.state.idToRenderState
    let type = this.props?.pages?.[idToRender]?.type

    // [info] part 1  set collection data
    let collectionId = this.props?.pages?.[idToRender]?.collectionId ?? null

    // [info] part 2 seems not necessary
    // TODO later
    if (collectionId) {
      const docFaviconLink = this.props.collections[collectionId]?.favicon
        ? `data:image/png;base64,${this.props.collections[collectionId]?.favicon}`
        : this.props.collections[collectionId]?.docProperties?.defaultLogoUrl
      const docTitle = this.props.collections[collectionId]?.docProperties?.defaultTitle
      setTitle(docTitle)
      setFavicon(docFaviconLink)
      var collectionName = this.props.collections[collectionId]?.name
      var collectionTheme = this.props.collections[collectionId]?.theme
    }
    let collectionKeys = Object.keys(this.props?.collections || {})
    const { isCTAandLinksPresent } = this.getCTALinks()
    const dynamicColor = hexToRgb(collectionTheme, 0.04)
    const staticColor = background['background_sideBar']

    const backgroundStyle = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColor}, ${staticColor})
      `
    }
    const staticColors = background['background_mainPage']

    const backgroundStyles = {
      backgroundImage: `
        linear-gradient(to right, ${dynamicColor}, ${dynamicColor}),
        linear-gradient(to right, ${staticColors}, ${staticColors})
      `
    }

    return (
      <>
        {/* [info] part 1 style component */}
        <Style>
          {`
          .link {
            &:hover {
              color: ${collectionTheme};
            }
  
          }
        `}
        </Style>
        <main
          role='main'
          className={this.state.isSticky ? 'mainpublic-endpoint-main hm-wrapper stickyCode' : 'mainpublic-endpoint-main hm-wrapper'}
        >
          <span ref={this.iconRef} style={backgroundStyles} className={'hamberger-icon'}>
            <IconButton onClick={() => {
                  this.handleShowSideBar()
                }}>
              <MdDehaze
                id='hamburgerIcon'
                className='icon-active fw-bold'
              />
            </IconButton>
            <IconButton onClick={() => {
                  this.handleShowSideBar()
                }}>
              <MdClose 
                id='closeIcon'
                className='icon-none'
              />
            </IconButton>
            {/* <span className='logo-name' id="logoName"> 
             {this.props.collections[collectionKeys[0]]?.favicon && (
                <img
                    className='hamberger-img'
                    id='publicLogo'
                    alt='public-logo'
                    src={
                      this.props.collections[collectionKeys[0]]?.favicon
                        ? `data:image/png;base64,${this.props.collections[collectionKeys[0]]?.favicon}`
                        : this.props.collections[collectionKeys[0]]?.docProperties?.defaultLogoUrl || ''
                    }
                    // onError={() => { this.setState({ publicLogoError: true })}}
                    width='20'
                    height='20'
                  />
                 )} */}
            {/* <span className="icon-name">{this.props.collections[collectionId]?.name}</span> */}

            {/* </span> */}
            {/* Original icons */}
          </span>
          {/* [info] part 3 */}
          <SplitPane split='vertical' className={'split-sidebar-public'}>
            {/* [info] part 3 subpart 1 sidebar data left content */}
            <div className='hm-sidebar' style={backgroundStyle}>
              {collectionId && <SideBarV2 {...this.props} collectionName={collectionName} OnPublishedPage={true} />}
            </div>
            {/*  [info] part 3 subpart 1 sidebar data right content */}
            <div
              className={isCTAandLinksPresent ? 'hm-right-content hasPublicNavbar' : 'hm-right-content'}
            // style={{ backgroundColor: hexToRgb(collectionTheme, '0.05') }}
            >
              {idToRender ? (
                <div
                  onScroll={(e) => {
                    if (e.target.scrollTop > 20) {
                      this.setState({ isSticky: true })
                    } else {
                      this.setState({ isSticky: false })
                    }
                  }}
                >
                  {(type == 4 || type == 5) && (
                    <DisplayEndpoint
                      {...this.props}
                      fetch_entity_name={this.fetchEntityName.bind(this)}
                      publicCollectionTheme={collectionTheme}
                    />
                  )}

                  {(type == 1 || type == 3) && (
                    <PublicPage
                      {...this.props}
                      fetch_entity_name={this.fetchEntityName.bind(this)}
                      publicCollectionTheme={collectionTheme}
                    />
                  )}

                  {!type && idToRender == 'undefined' && (
                    <ERROR_404_PUBLISHED_PAGE
                      error_msg={Object.keys(this.props?.pages)?.length > 1 ? null : 'Collection is not published'}
                    />
                  )}

                  {/* {this.displayCTAandLink()} */}
                  {/* <div className='d-flex flex-row justify-content-start'>
                      <button onClick={() => { this.handleLike() }} className='border-0 ml-5 icon-design'> <img src={ThumbUp} alt='' /></button>
                      <button onClick={() => { this.handleDislike() }} className='border-0 ml-2 icon-design'> <img src={ThumbDown} alt='' /></button>
                    </div> */}
                  {this.state.openReviewModal && this.reviewModal()}
                </div>
              ) : (
                <>
                  <div className='custom-loading-container'>
                    <progress class='pure-material-progress-linear w-25' />
                  </div>
                </>
              )}
            </div>
          </SplitPane>
        </main>
      </>
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withQuery(PublicEndpoint)))
