import './index.css';
import QuizItems from '../../components/QuizItems/index';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const apiStatusConstants = {
    initial: 'initial',
    success: 'success',
    failure: 'failure',
    loading: 'loading'
};

const Quiz = () => {
    const [apiResponse, setApiResponse] = useState({
        apiData: null,
        apiStatus: apiStatusConstants.initial,
        errorMsg: null
    });
    const [score, setScore] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRank, setUserRank] = useState(null);
    const [quizIdState, setQuizIdState] = useState(null);

    useEffect(() => {
        fetchApiData();
    }, []);

    const fetchApiData = async () => {
        setApiResponse({
            apiData: null,
            apiStatus: apiStatusConstants.loading,
            errorMsg: null
        });
        const token = Cookies.get('token');
        const url = 'http://localhost:4000/quiz';
        const options = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            setApiResponse({
                apiData: data,
                apiStatus: apiStatusConstants.success,
                errorMsg: null
            });
        } catch (error) {
            setApiResponse({
                apiData: null,
                apiStatus: apiStatusConstants.failure,
                errorMsg: error.message
            });
        }
    };

    const submitQuiz = async (finalScore) => {
        const quizId = apiResponse?.apiData?.[0]?.quizId;
        if (quizId === undefined) {
            setApiResponse({
                apiData: null,
                apiStatus: apiStatusConstants.failure,
                errorMsg: 'Unable to determine quizId'
            });
            return;
        }

        const url = 'http://localhost:4000/quiz_results';
        const options = {
            headers: {
                Authorization: `Bearer ${Cookies.get('token')}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ quizResult: { quizId, score: finalScore ?? score } })
        };
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                setApiResponse({
                    apiData: null,
                    apiStatus: apiStatusConstants.failure,
                    errorMsg: data?.error || 'Failed to submit quiz'
                });
                return;
            }
            
            setQuizIdState(quizId);
            await fetchAndSetUserResultAndRank(quizId);
            setApiResponse((prev) => ({
                ...prev,
                apiStatus: apiStatusConstants.success,
                errorMsg: null
            }));
        } catch (error) {
            setApiResponse({
                apiData: null,
                apiStatus: apiStatusConstants.failure,
                errorMsg: error.message
            });
        }
    };

    const fetchAndSetUserResultAndRank = async (quizId) => {
        try {
            const token = Cookies.get('token');
            const quizRes = await fetch('http://localhost:4000/quiz', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const quizData = await quizRes.json();
            const latest = Array.isArray(quizData) && quizData.length > 0 ? quizData[quizData.length - 1] : null;
            if (latest && latest.userName) {
                setUserName(latest.userName);
            }
            const scoreRes = await fetch('http://localhost:4000/score', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const allScores = await scoreRes.json();
            if (Array.isArray(allScores)) {
                const selfRow = allScores.find((row) => row.quizId === quizId && row.name === (latest?.userName || userName));
                if (selfRow) {
                    setUserRank(selfRow.rank);
                }
            }
        } catch (e) {
            console.error('Failed to fetch user result/rank', e);
        }
    };


    const skipQuestion = () => {
        if (currentQuestionIndex < apiResponse.apiData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    const nextQuestion = () => {
        if (currentQuestionIndex < apiResponse.apiData.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };




    const renderContent = () => {
        const { apiData, apiStatus, errorMsg } = apiResponse;
        

        switch (apiStatus) {
            case apiStatusConstants.success:
                if (quizCompleted) {
                    return (
                        <div className="quiz-result-card card">
                            <h2>Quiz Completed!</h2>
                            <div className="result-row"><strong>Name:</strong> <span>{userName || 'You'}</span></div>
                            <div className="result-row"><strong>Score:</strong> <span>{score}</span></div>
                            <div className="result-row"><strong>Rank:</strong> <span>{userRank ?? '-'}</span></div>
                        </div>
                    );
                }
                if (apiData.length === 0) {
                    return <div>
                       <p>No Quiz Found</p>
                    </div>;
                }
                const currentQuestion = apiData[currentQuestionIndex];
                const isLastQuestion = currentQuestionIndex === apiData.length - 1;
                return (
                    <div className="quiz-question-container">
                        {quizCompleted ? (
                            <div className="quiz-result-card card">
                                <h2>Quiz Completed!</h2>
                                <div className="result-row"><strong>Name:</strong> <span>{userName || 'You'}</span></div>
                                <div className="result-row"><strong>Score:</strong> <span>{score}</span></div>
                                <div className="result-row"><strong>Rank:</strong> <span>{userRank ?? '-'}</span></div>
                            </div>
                        ) : (<>
                            <QuizItems
                            key={currentQuestion.id}
                            quizDetails={currentQuestion}
                            score={score}
                            setScore={setScore}
                            isLastQuestion={isLastQuestion}
                            setQuizCompleted={setQuizCompleted}
                            nextQuestion={nextQuestion}
                            submitQuiz={submitQuiz}
                        />

                        <div className="quiz-controls">
                            {currentQuestionIndex < apiData.length - 1 && <button onClick={skipQuestion}>skip</button>}
                        </div>
                        <p>
                            Question {currentQuestionIndex + 1} of {apiData.length}
                        </p></>
                        )}
                    </div>
                );
            case apiStatusConstants.failure:
                return <p>{errorMsg}</p>;
            case apiStatusConstants.loading:
                return <p>Loading......</p>;
            default:
                return null;
        }
    };

    return (
        <div className="container">
            <h1>Quiz</h1>
            {renderContent()}
        </div>
    );
};

export default Quiz;

