import React from 'react';
import {
  ModalContainer,
  Overlay,
  ConfirmButton,
  CancelButton,
} from '../../style'; // Correct import path to style.js

const DeleteModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onCancel} />
      <ModalContainer>
        <h2>{title}</h2>
        <p>{message}</p>
        <ConfirmButton onClick={onConfirm}>Yes, Delete</ConfirmButton>
        <CancelButton onClick={onCancel}>Cancel</CancelButton>
      </ModalContainer>
    </>
  );
};

export default DeleteModal;
