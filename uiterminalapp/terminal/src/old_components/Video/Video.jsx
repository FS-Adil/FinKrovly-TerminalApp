
import { useState } from 'react';
import './Video.css';

function Video(props) {

    const {title, videoName, img} = props;

    // let likesCount = 0;

    const [likesCount, setLikesCount] = useState(0);

    const increaseLikeByOne = () => {
        setLikesCount(likesCount + 1);
        // console.log(title, likesCount);
    }

    return (
         <div className='video'>
            <img className='video-img' src={img} alt="react Logo" />
            <p>{title}</p>
            <p>{videoName}</p>
            <div className='video-footer'>
                <p>Like: {likesCount}</p>
                <button onClick={increaseLikeByOne}>Like</button>
            </div>
        </div>
    )
}

export default Video;