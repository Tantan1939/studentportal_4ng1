import React, {useEffect, useState} from 'react';
import { DATA_TYPES } from './RenderStudentList';
import Admission from './DetailsjS/Admission';
import Document from './DetailsjS/Document';
import Enrollment from './DetailsjS/Enrollment';
import Grades from './DetailsjS/Grades';
import ClassSchedules from './DetailsjS/ClassSchedules';

export default function RendererProxy({selected_type, selected_details}) {

    let [renderDetails, setRenderDetails] = useState(null);

    useEffect(()=> {
        setRenderDetails(() => renderSelectedDetails());
    }, [selected_details]);

    let renderSelectedDetails = () => {
        switch (selected_type){
            case DATA_TYPES.DOCUMENTS:
                return <Document selected_details={selected_details} />
            case DATA_TYPES.ADMISSION:
                return <Admission selected_details={selected_details} />
            case DATA_TYPES.ENROLLMENT:
                return <Enrollment selected_details={selected_details} />
            case DATA_TYPES.CLASS_SCHEDULES:
                return <ClassSchedules selected_details={selected_details} />
            case DATA_TYPES.GRADES:
                return <Grades selected_details={selected_details} />
            default:
                return null
        }
    };


    if (!selected_type) return null;
  return (
    <div>
        {renderDetails}
    </div>
  )
}
