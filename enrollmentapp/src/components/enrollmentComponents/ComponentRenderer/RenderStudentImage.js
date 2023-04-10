import React, {useState, useEffect} from 'react'

export default function RenderStudentImage({image}) {
    let [studentImage, setStudentImage] = useState('');

    useEffect(()=>{
        fetch_studentPicture(image);
    }, [image]);

    const fetch_studentPicture = async (imgurl) => {
        const res = await fetch(imgurl);
        const imageBlob = await res.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setStudentImage(imageObjectURL);
    };
    

  return (
    <div>
      <img className='mx-3' style={{width:'70px',height:'70px', borderRadius:'100px'}} src={studentImage} width="100" height="100" />
    </div>
  )
}
