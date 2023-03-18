import React from 'react'
import akainu from './akainu.jpg'

export default function AdmissionDetailsModal({isHovering, admission}) {
    if (!isHovering) return null;

  return (
    <div className='overlay'>
        <div className='modalContainer'>
            <img src={akainu} alt='' />
            <div className='modalRight'>
                <div className='content'>
                    <p> Email: {admission.admission_owner} </p>
                    <p> Birthdate: {admission.date_of_birth} </p>
                    <p> Birthplace: {admission.birthplace} </p>
                    <p> Nationality: {admission.nationality} </p>
                    <p> Type of Applicant: {admission.type} </p>
                    <p> First Strand: {admission.first_chosen_strand} </p>
                    <p> Second Strand: {admission.second_chosen_strand} </p>
                </div>
            </div>
        </div>
    </div>
  )
}
