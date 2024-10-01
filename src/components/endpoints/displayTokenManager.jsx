import React, { useState } from 'react'
import { Modal, ListGroup, Row, Col } from 'react-bootstrap'
import { MdDelete } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux'
import { deleteToken } from '../../store/tokenData/tokenDataActions';
import './endpoints.scss';
import { grantTypesEnums } from '../common/authorizationEnums';

const tokenDetailsToShow = ['tokenName', 'accessToken', 'grantType', 'scope', 'clientId', 'clientSecret', 'accessTokenUrl', 'createdTime'];

function AccessTokenManager(props) {
  const { tokenDetails } = useSelector((state) => {
    return {
      tokenDetails: state?.tokenData?.tokenDetails || {},
    }
  })

  const dispatch = useDispatch();

  const [selectedTokenId, setSelectedTokenId] = useState(null);

  const handleTokenClick = (tokenId) => {
    setSelectedTokenId(tokenId)
  }

  const handleDeleteTokenClick = (e, tokenId) => {
    e.stopPropagation()
    dispatch(deleteToken({ tokenId }));
  }

  const handleUseTokenClick = () => {
    props.setSelectedTokenId(selectedTokenId);
    props.setSelectedTokenValue(tokenDetails?.[selectedTokenId]?.accessToken);
    props.addAccessTokenInsideHeadersAndParams(tokenDetails?.[selectedTokenId]?.accessToken, selectedTokenId)
    props.onHide();
  }

  return (
    <Modal onHide={props?.onHide} show={props?.show} id='modal-display-token' size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>Manage Access Tokens</Modal.Title>
      </Modal.Header>
      <Row className='p-0 m-0 content-container'>
        <Col className='m-0 p-0' id='code-window-sidebar' sm={3}>
          <ListGroup>
            <p className='ml-3 mt-2 heading-token'>All Tokens</p>
            {Object.keys(tokenDetails).map((tokenId, index) => (
              <div onClick={() => handleTokenClick(tokenId)} className={`token-name-container ${selectedTokenId === tokenId && 'selected-token-state'}`} key={index}>
                <ListGroup.Item className='tokens-list-item ml-2 d-flex justify-content-between align-items-center'>
                  <p className='token-name'>{tokenDetails[tokenId].tokenName}</p>
                  <MdDelete onClick={(e) => handleDeleteTokenClick(e, tokenId)} className='delete-token-icon' size={14} />
                </ListGroup.Item>
              </div>
            ))}
          </ListGroup>
        </Col>
        <Col className='mt-2 mb-2 token-details-field-container d-flex flex-column justify-content-between' sm={9}>
          {selectedTokenId && <><div>
                <h6 className=''>Token Details</h6>
            <TokenDetailsComponent tokenDetails={tokenDetails} selectedTokenId={selectedTokenId} />
                
          </div>
          <button onClick={handleUseTokenClick} className='oauth2-token-details-list-item-button font-12 ml-auto btn btn-secondary' type='button'>
          Use Token
        </button>
        </> }
        </Col>
      </Row>
    </Modal>
  )
}

function TokenDetailsComponent({ tokenDetails, selectedTokenId }) {

  const getTitleValue = (key) => {
    let title = ''
    switch (key) {
      case 'tokenName':
        return title = 'Token Name'
      case 'accessToken':
        return title = 'Access Token'
      case 'clientId':
        return title = 'Client Id'
      case 'clientSecret':
        return title = 'Client Secret'
      case 'grantType':
        return title = 'Grant Type'
      case 'scope':
        return title = 'Scope'
      case 'accessTokenUrl':
        return title = 'Access Token URL'
      case 'createdTime':
        return title = 'Created At'
      default:
        break;
    }
  }

  const formatDate = (dateToConvert) => {
    if (!dateToConvert) return '';
    const date = new Date(dateToConvert);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const meridiem = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const year = date.getFullYear();
    const formattedDate = `${monthName} ${day}, ${year} ${hours}:${minutes} ${meridiem}`;
    return formattedDate;
  };

  return (
    <div className='h-100 mt-3'>
      {tokenDetailsToShow?.map((key) => {
        const title = getTitleValue(key);
        let value = tokenDetails?.[selectedTokenId]?.[key] ?? ''
        if (key === 'createdTime') value = formatDate(value);
        if (key === 'clientSecret' && tokenDetails?.[selectedTokenId]?.grantType === grantTypesEnums.implicit) return null;
        if (key === 'accessTokenUrl' && tokenDetails?.[selectedTokenId]?.grantType === grantTypesEnums.implicit) return null;
        return (
          <div className='d-flex justify-content-center align-items-center mt-1'>
            <div className='token-keys-container'>
              <span>{title}</span>
            </div>
            <textarea disabled value={value} className='token-value-container'></textarea>
          </div>
        )
      })}
    </div>
  )
}

export default AccessTokenManager
