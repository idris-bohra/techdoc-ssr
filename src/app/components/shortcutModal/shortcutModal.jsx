import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { BsCommand } from 'react-icons/bs';
import { PiControlBold } from "react-icons/pi";
import './shortcutModal.scss'

const ShortcutModal = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const shortcuts = [
        { name: 'Save', key: isMac ? [<BsCommand key="cmd" />, 'S'] : ['Ctrl', 'S'] },
        { name: 'Open Tab', key: isMac ? [<PiControlBold key="ctrl" />, 'N'] : ['Alt', 'N'] },
        { name: 'Publish', key: isMac ? [<BsCommand key="cmd" />, 'B'] : ['Ctrl', 'B'] },
        { name: 'Close Tab', key: isMac ? [<PiControlBold key="ctrl" />, 'W'] : ['Alt', 'W'] },
        { name: 'Unpublish', key: isMac ? [<BsCommand key="cmd" />, 'U'] : ['Ctrl', 'U'] },
        { name: 'Switch Tab', key: isMac ? [<PiControlBold key="ctrl" />, 'T'] : ['Alt', 'T'] },
        { name: 'Show Shortcuts', key: isMac ? [<BsCommand key="cmd" />, '/'] : ['Ctrl', '/'] },

    ];

    return (
        <>
                <Modal.Header closeButton>
                    <Modal.Title>Keyboard Shortcuts</Modal.Title>
                </Modal.Header>
                <Modal.Body className='name-Shortcuts-contanier gap-2'>{shortcuts.map((shortcut, index) => (
                        <div className='name-Shortcuts d-flex justify-content-between align-items-center p-1' key={index}>
                            <span className='font-12 text-grey'>{shortcut.name}</span>
                            <span className="key-Shortcuts d-flex gap-2">
                                {shortcut.key.map((keyPart, idx) => (
                                    <span key={idx} className="border rounded px-2 py-1 font-12 text-grey text-center">{keyPart}</span>
                                ))}
                            </span>
                        </div>
                    ))}</Modal.Body>
                </>
    );
};

export default ShortcutModal;