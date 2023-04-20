import React, {useState, useEffect} from 'react'

export default function ScheduleModal({open, close}) {
  const [formData, setFormData] = useState({});
  let [startOnEditable, setEditable] = useState(false);
  let [updateThisSetup, setUpdateThisSetup] = useState(false);
  let [csrfToken, setToken] = useState('');

  useEffect(()=> {
    if (open) {
        get_setup_details();
    }
  }, [open]);

  let get_setup_details = async () => {
      try{
          let response = await fetch('/Registrar/schoolyear/Api/admission_schedule/');
          let data = await response.json();
          spreadDatas(data);
      } catch (error) {
          errorHandler(error);
      };
  };

  function spreadDatas(datas){
      setEditable(datas.setupDetails.can_update_startdate);
      setUpdateThisSetup(datas.setupDetails.can_update_this_setup);
      setToken(datas.csrf_token);
      setFormData((prevFormData) => ({
          ...prevFormData,
          ["start_date"] : datas.setupDetails.start_date,
          ["end_date"] : datas.setupDetails.end_date,
          ["ea_setup_sy"] : datas.setupDetails.ea_setup_sy,
      }));
  };

  function errorHandler(error){
      console.error(error);
      close();
  };

  const handleFormSubmit = (event) => {
      event.preventDefault();
      let me = async ()=> {
          try {
            let changeDate = await fetch('/Registrar/schoolyear/Api/admission_schedule/', {
              method: "POST",
              headers : {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              body: JSON.stringify({start_on : formData.start_date,
                end_date : formData.end_date})
            })
            let response = await changeDate.json();
            console.log(response);
          } catch (error) {
            errorHandler(error);
          };
      };

      let start_date = new Date(formData.start_date);
      let until_date = new Date(formData.end_date);

      if (start_date < until_date && until_date > Date.now()){
          if (startOnEditable && start_date <= Date.now()){
              alert(`${formData.start_on} is invalid. Try again.`);
          } else {
              me();
              close();
          };
      } else {
          alert('Invalid dates. Try again.');
      };

  };

  const handleFieldChanges = (event) => {
      const {name, value} = event.target;

      setFormData((prevFormData) => ({
          ...prevFormData,
          [name] : value,
      }));
  };


  if (!open) return null;

  return (
    <div onClick={close} className='overlay'>
      <div onClick={(e)=> e.stopPropagation()} className='modalContainer'>
        <div className='modalRight'>
          <p onClick={close} className='closeBtn'> X </p>


          <div class="container pt-3">
          <div className='content'>
            {updateThisSetup ? (
              <div>
                <form onSubmit={handleFormSubmit}>
                  <h4 class="py-2 mb-2"> 
                      <i class="fa fa-pencil me-2" aria-hidden="true"></i>
                  <i> {formData.ea_setup_sy} Admission/Enrollment Period </i>
                
                  </h4>

                  {startOnEditable && (
                    <label>
                      Start Date: 
                      <input type='date' name="start_date" value={formData.start_date} onChange={handleFieldChanges}/>
                    </label>
                  )}

                  <label>
                      End Date: 
                      <input type='date' name="end_date" value={formData.end_date} onChange={handleFieldChanges}/>
                  </label>

                  <button type='submit' class="btn btn-success btn-md ms-2">
                      Save
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <h4> This admission schedule can no longer be edited. </h4>
              </div>
            )}
          </div>

       
          <div class="buttonz d-flex justify-content-end">
            <button class="btn btn-primary btn-md mt-3" onClick={close}>
              Exit
            </button>
          </div>

        </div>
      </div>
    </div>
    </div>
  )
}
