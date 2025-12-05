import {Modal} from "flowbite-react"
import React from "react"



export default function GuestModal({showModal,setShowModal}){

function closeModal(){
    localStorage.setItem("guestModal","true")
    setShowModal(false)
}



    return(
        <Modal popup size="md" show={showModal} onClose={closeModal}>
            <Modal.Header className="dark:bg-gray-700 flex items-center">
                <p className="dark:text-whtie p-2">Welcome to Guest Mode!</p>
            </Modal.Header>
            <Modal.Body>
                <div>
                <p className="dark:text-white text-md">In guest mode, you can manually input your scores and categories to help figure out your grade!</p>
                </div>

                <button onClick={closeModal} className="w-full rounded-lg bg-primary-500 text-white p-1 mt-5 hover:bg-primary-600 active:bg-primary-700">
                    {"Great, let's go!"}
                </button>
            </Modal.Body>
        </Modal>


    )
}