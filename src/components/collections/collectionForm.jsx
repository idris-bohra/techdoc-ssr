import React, { useState, useRef, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Joi from 'joi-browser';
import { onEnter, validate } from '../common/utility';
import { useDispatch, useSelector } from 'react-redux';
import { addCollection, updateCollection } from './redux/collectionsActions';
import Input from '../common/input';
import { addIsExpandedAction } from '../../store/clientData/clientDataActions';

const CollectionForm = (props) => {

  const inputRef = useRef(null);
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const collections = useSelector(state => state.collections);

  const schema = { name: Joi.string().min(3).max(50).trim().required().label('Collection Name') };


  const redirectToCollection = (collection) => {
    if (!collection.data) {
      console.error('collection.data is undefined');
      return;
    }
    if (collection.success) navigate(`/orgs/${params.orgId}/dashboard/collection/${collection.data.id}/settings`);
    props.onHide();
  };

  const doSubmit = async () => {
    const errors = validate({ name: inputRef.current.value }, schema);
    if (errors) return setErrors(errors)
    if (props?.isEdit) {
      dispatch(updateCollection({ name: inputRef.current.value, id: props.collectionId }))
      props.onHide();
      return;
    }
     const collection = await dispatch(addCollection({ name: inputRef.current.value }, null, redirectToCollection))
    dispatch(addIsExpandedAction({value:true, id:collection.id}))
    props.onHide();
  }

  return (
    <div onKeyPress={(e) => { onEnter(e, doSubmit) }}>
      <Modal.Header className="custom-collection-modal-container" onClick={props.onHide} closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Input defaultValue={collections[props?.collectionId]?.name} name="name" urlName="Name" label="Collection Name" placeholder="Collection Name" mandatory={true} isURLInput={true} note="*collection name accepts min 3 and max 50 characters" ref={inputRef} errors={errors} />
        <button className='btn btn-primary btn-sm font-12' onClick={doSubmit}>Save</button>
      </Modal.Body>
    </div>
  );
};

export default CollectionForm