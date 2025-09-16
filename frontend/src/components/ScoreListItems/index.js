import './index.css';


const ScoreListItems = (props) => {
    const {scoreDetails} = props;
    const {name,score,rank} = scoreDetails;
    
    return (
        <div className='score-list-item'>
           <div className="name"> <p className="name">{name}</p></div>
            <p className="score">{score}</p>
            <p className="rank">{rank}</p>
        </div>
    )
}
export default ScoreListItems;
