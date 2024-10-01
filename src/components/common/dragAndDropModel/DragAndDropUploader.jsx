import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { CiImport } from "react-icons/ci";
import './dragAndDropUploader.scss';
import { importEnvironment } from '../../environments/redux/environmentsActions';
import { importCollection } from '../../collections/redux/collectionsActions';
import { addIsExpandedAction } from '../../../store/clientData/clientDataActions';


const DragAndDropUploader = ({ onClose, view, importType }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const dispatch = useDispatch();

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
  }, []);

  const handleImport = async() => {
    const uploadedFile = new FormData()
    uploadedFile.append('myFile', file, fileName)
    if (importType == 'environment') {
      dispatch(importEnvironment(uploadedFile, onClose))
    } 
    if (importType === 'collection') {
      const uploadedFile = new FormData()
      uploadedFile.append('myFile', file, fileName)
       const {collection} = await dispatch(importCollection(uploadedFile, view, onClose, 'testing'));
      dispatch(addIsExpandedAction({value:true, id:collection.id}))
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="drag-and-drop-uploader">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <div className="upload-icon">
          <CiImport size={50} />
        </div>
        <div className="upload-text">
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drop anywhere to import<br />or select <span className="file-link">files</span> or <span className="file-link">folders</span></p>
          )}
        </div>
      </div>
      {fileName && (
        <div className="file-info">
          <p>Selected file: {fileName}</p>
        </div>
      )}
      <button
        onClick={handleImport}
        className="btn btn-primary mt-3 btn-sm font-12"
        disabled={!file}
      >
        Import
      </button>
    </div>
  );
};

export default DragAndDropUploader;
