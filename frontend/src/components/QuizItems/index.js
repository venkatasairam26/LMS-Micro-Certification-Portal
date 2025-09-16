import './index.css';
import { useState } from 'react';

const QuizItems = (props) => {
    const {quizDetails,setScore,
        score,isLastQuestion,submitQuiz,
        setQuizCompleted,nextQuestion} = props;
    const {questionText,options,correctAnswer} = quizDetails;
    const  jsOptions = JSON.parse(options);
    const [correctOption,setCorrectOption] = useState('');
    const [isSubmitted,setIsSubmitted] = useState(false);
    
    const [selectedOption, setSelectedOption] = useState(null);
    
    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    }
    const onsubmitOption = () => {
        const isCorrect = selectedOption === correctAnswer;
        if(isCorrect){
            setCorrectOption('correctOption');
        }else{
            setCorrectOption('incorrectOption');
        }
        const newScore = isCorrect ? score + 1 : score;
        setScore(newScore);
        setIsSubmitted(true);
        if(isLastQuestion){
            setQuizCompleted(true);
            submitQuiz(newScore);
        }else{
            nextQuestion();
        }        
    }
    
    return (
        <li className='quiz-item card'>
            <p className='question-text'>{questionText}</p>
            <ul className='option-list'>
                {jsOptions.map(eachOption=> (
                    <li key={eachOption} className={`option ${correctOption}`}>
                        <input type="radio" name="option" value={eachOption} id={eachOption} onChange={handleOptionChange} />
                       <label htmlFor={eachOption}> {eachOption}</label>
                    </li>
                ))}
            </ul>
            <button className='btn' onClick={onsubmitOption}>Submit</button>
        </li>
    )
}
export default QuizItems