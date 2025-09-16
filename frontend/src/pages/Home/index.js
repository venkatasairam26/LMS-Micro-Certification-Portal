import './index.css';
import { useEffect, useState } from 'react';
import ScoreListItems from '../../components/ScoreListItems/index';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
const apiStatusConstants = {
    initial: 'initial',
    success: 'success',
    failure: 'failure',
    loading: 'loading'
}
const Home = () => {
    const [apiResponse, setApiResponse] = useState({ apiData: null, apiStatus: apiStatusConstants.initial, errorMsg: null });
    useEffect(() => {
        fetchApiData();
    }, []);

    const fetchApiData = async () => {
        setApiResponse({ apiData: null, apiStatus: apiStatusConstants.loading, errorMsg: null });
        try {
            const response = await fetch('http://localhost:4000/score',{
                method: 'GET',
                cache: 'no-store',
                headers:{
                    Authorization: `Bearer ${Cookies.get('token')}`
                }
            });
            const data = await response.json();
            if(!response.ok){
                return setApiResponse({ apiData: null, apiStatus: apiStatusConstants.failure, errorMsg: data?.error || 'Failed to load scores' });
            }
            setApiResponse({ apiData: data, apiStatus: apiStatusConstants.success, errorMsg: null });
        } catch (error) {
            setApiResponse({ apiData: null, apiStatus: apiStatusConstants.failure, errorMsg: error.message });
        }
    }
     
    const RenderView = () =>{
        const {apiData,apiStatus,errorMsg} = apiResponse;
        switch (apiStatus) {
            case apiStatusConstants.success:
                return <>
                    <button className="btn" onClick={fetchApiData}>Refresh</button>
                    <ul>
                        <li className="score-list-item">
                            <div className="name"> <p>Name</p></div>
                            <p>Score</p>
                            <p>Rank</p>
                        </li>
                        {apiData.length > 0 ? apiData.map((item) => (
                            <ScoreListItems key={item.id} scoreDetails={item}/>
                        )) : (
                            <div className="empty-state">
                                <p>You are the first one.</p>
                                <Link to="/quiz">
                                    <button className="btn">Take Quiz</button>
                                </Link>
                            </div>
                        )}
                    </ul>
                </>
            case apiStatusConstants.failure:
                return <p>{errorMsg}</p>
            case apiStatusConstants.loading:
                return <p>Loading......</p>
            default:
                return null
        }
    }
    

    return (
        <div className="container">
            <h1>Score Dashboard</h1>
            {RenderView()}
        </div>

    )
}
export default Home;
