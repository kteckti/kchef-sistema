'use client'
import { useState } from 'react';
import FuncionarioModal from './FuncionarioModal';

export default function AddButton() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        <i className="fa fa-plus mg-r-5"></i> Novo Funcionário
      </button>
      <FuncionarioModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}