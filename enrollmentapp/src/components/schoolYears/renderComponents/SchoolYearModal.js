import React, {useState, useEffect} from 'react'

export default function SchoolYearModal({open, close, syname}) {
    const [formData, setFormData] = useState({});
    let [startOnEditable, setEditable] = useState(false);
    let [csrfToken, setToken] = useState('');

    useEffect(()=> {
        if (open) {
            get_sy_details();
        }
    }, [open]);

    let get_sy_details = async () => {
        try{
            let response = await fetch('/Registrar/schoolyear/Api/get_schoolyear/');
            let data = await response.json();
            spreadDatas(data);
        } catch (error) {
            errorHandler(error);
        };
    };

    function spreadDatas(datas){
        setEditable(datas.schoolyear_details.can_update_startdate);
        setToken(datas.csrf_token);
        setFormData((prevFormData) => ({
            ...prevFormData,
            ["start_on"] : datas.schoolyear_details.start_on,
            ["until"] : datas.schoolyear_details.until,
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
              let changeDate = await fetch('/Registrar/schoolyear/Api/get_schoolyear/', {
                method: "POST",
                headers : {
                  "Content-Type": "application/json",
                  "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({start_on : formData.start_on,
                                        until : formData.until})
              })
              let response = await changeDate.json();
              console.log(response);
            } catch (error) {
              errorHandler(error);
            };
        };

        let start_date = new Date(formData.start_on);
        let until_date = new Date(formData.until);

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
                    <form onSubmit={handleFormSubmit}>
                        <h3 class="py-2 mb-2"> 
                            <i class="fa fa-pencil me-2" aria-hidden="true"> 
                            </i>
                        <i>{syname} Period  </i>
                        </h3>
                        
                        {startOnEditable && (
                            <label>
                                Start On: 
                                <input type='date' name="start_on" value={formData.start_on} onChange={handleFieldChanges}/>
                            </label>
                        )}

                        <label>
                            Until: 
                            <input type='date' name="until" value={formData.until} onChange={handleFieldChanges}/>
                        </label>

                        <button type='submit' class="btn btn-success btn-md ms-2">
                            Save
                        </button>
                    </form>
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
