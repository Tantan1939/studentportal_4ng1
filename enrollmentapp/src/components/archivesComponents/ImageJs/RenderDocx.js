import React, {useEffect, useState} from 'react';

export default function RenderDocx({image}) {

    let [imageUrl, setImageUrl] = useState("")

    const fetch_image = async (imgurl) => {
        const res = await fetch(imgurl);
        const imageBlob = await res.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setImageUrl(imageObjectURL);
    }

    useEffect(()=> {
        fetch_image(image);
    }, [image]);

  return (
    <div>
      <img src={imageUrl} />
    </div>
  )
}
