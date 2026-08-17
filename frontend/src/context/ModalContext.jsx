/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import Modal from '../components/Modal/Modal'

const ModalContext = createContext()

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({ isOpen: false, title: '', children: null })

  const openModal = useCallback((title, children) => {
    setModalState({ isOpen: true, title, children })
  }, [])

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, title: '', children: null })
  }, [])

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
        {modalState.children}
      </Modal>
    </ModalContext.Provider>
  )
}

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within ModalProvider')
  return ctx
}
