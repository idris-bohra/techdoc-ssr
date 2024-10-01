import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './exportCollection.scss';

const techdocLogo= <img src="/maskable_icon_x192.png" alt="Techdoc Logo" height={30}/>
const openApiLogo = <img src='/placeholder-image_0.jpg' alt= "Open API Logo" height={30}/>


const exportModalEnum = {
  TECHDOC: 'techdoc',
  OPENAPI: 'openapi',
};

const choices = {
  [exportModalEnum.TECHDOC]: {
    key: exportModalEnum.TECHDOC,
    label: 'TechDoc',
    logo: techdocLogo,
    disabled: false,
    modalTitle: 'Export as TechDoc',
  },
  [exportModalEnum.OPENAPI]: {
    key: exportModalEnum.OPENAPI,
    label: 'Open API',
    logo: openApiLogo,
    disabled: false,
    modalTitle: 'Are you sure ?',
    warningText: 'Your version and endpoint description will get deleted if you select Open API.',
  },
};

const ExportModal = (props) => {
  const [choiceSelected, setChoiceSelected] = useState(null);

  useEffect(() => {
    if (!props.show) {
      setChoiceSelected(exportModalEnum.TECHDOC);
    }
  }, [props.show]);

  const selectChoice = (choice) => {
    setChoiceSelected(choice);
  };

  const removeSelection = () => {
    setChoiceSelected(exportModalEnum.TECHDOC);
  };

  const renderChoices = () => (
    <div className='choices d-flex justify-content-center'>
      {Object.values(choices).map((choice) => (
        <div
        key={choice.key}
        className={['export-collection-item', choice.disabled ? 'disabled' : '', choiceSelected === choice.key ? 'selected' : ''].join(' ')}
        onClick={() => (choice.disabled ? {} : selectChoice(choice.key))}
      >
          <div className='d-flex flex-column align-items-center'>
          <div className='choice-logo'>{choice.logo}</div>
            <span>{choice.label}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const handleConfirmOpenApi = () => {
    props.onExport(1);
    removeSelection();
  };

  const handleConfirmTechDoc = () => {
    props.onExport(2);
    removeSelection();
  };
  

  const renderSelectedForm = () => {
  if (choiceSelected === exportModalEnum.OPENAPI) {
    return (
      <div>
        <p>{choices[exportModalEnum.OPENAPI].warningText}</p>
        <div>
          <button className="btn btn-primary btn-sm font-12 mr-2" onClick={handleConfirmOpenApi}>Download</button>
          <button className="btn btn-secondary btn-sm font-12" onClick={removeSelection}>Cancel</button>
        </div>
      </div>
    );
  }
  return null;
};

  const selectedChoice = choices[choiceSelected];

  let modalTitle = props.title;
  let modalBody = (
    <div>
      {renderChoices()}
      <div className='mt-3'>
        <button className="btn btn-primary btn-sm" onClick={handleConfirmTechDoc}>Export</button>
      </div>
    </div>
  );

  if (selectedChoice && choiceSelected === exportModalEnum.OPENAPI) {
    modalTitle = selectedChoice.modalTitle;
    modalBody = renderSelectedForm();
  }

  return (
    <Modal className='export-modal' size='sm' onHide={props.onHide} show={props.show} dialogClassName='export-choice-modal'>
      <div>
        <Modal.Header className='custom-export-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalBody}</Modal.Body>
      </div>
    </Modal>
  );
};

export default ExportModal;