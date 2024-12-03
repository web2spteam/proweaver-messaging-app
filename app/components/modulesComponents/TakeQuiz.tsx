"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getData, postData } from "../../hooks/useAxios";
import DOMPurify from "dompurify";

// Interfaces
interface QuizItem {
    questionHTML: string;
    questionType: "multipleChoice" | "trueFalse" | "identification";
    choices?: string[];
    answer?: string | number; // Added to ensure correctAnswer matches logic
}

interface QuizData {
    quiz_title: string;
    quiz_desc: string;
    questions: QuizItem[];
    module_id: string;
}

interface SubmitQuizResponse {
    success: boolean;
    score: string;
    module_id: string;
}

const TakeQuiz: React.FC = () => {
    const { user } = useAuth();
    const { quiz_id } = useParams();
    const router = useRouter();

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<(string | number)[]>([]); // Dynamic array for answers
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);

    const [currentQuestion, setCurrentQuestion] = useState<QuizItem | null>(null);

    // Update current question on state change
    useEffect(() => {
        if (quizData) {
            setCurrentQuestion(quizData.questions[currentQuestionIndex] || null);
        }
    }, [quizData, currentQuestionIndex]);

    // Shuffle questions
    const shuffleArray = (array: QuizItem[]) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    // Fetch Student ID
    const fetchStudentId = useCallback(async () => {
        if (!user?.uid) return;
        try {
            const response = await getData<{ id_number: string }>(`/students/getIDNumber/${user.uid}`);
            setStudentId(response.id_number);
        } catch (err) {
            console.error("Failed to fetch student ID:", err);
            setError("Failed to fetch student ID. Please try again later.");
        }
    }, [user?.uid]);

    // Fetch Quiz Data
    const fetchQuizData = useCallback(async () => {
        if (!quiz_id) return;
        setLoading(true);
        setError(null); // Reset error on retry
        try {
            const response = await getData<QuizData>(`/quiz/getQuizData/${quiz_id}`);
            const shuffledQuestions = shuffleArray(response.questions || []);
            setQuizData({ ...response, questions: shuffledQuestions });
            setAnswers(new Array(shuffledQuestions.length).fill("")); // Initialize answers array
        } catch (err) {
            setError("Failed to load quiz data. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [quiz_id]);

    useEffect(() => {
        fetchStudentId();
        fetchQuizData();
    }, [fetchStudentId, fetchQuizData]);

    // Handle Answer Change
    const handleAnswerChange = (answer: string | number) => {
        const updatedAnswers = [...answers];
        updatedAnswers[currentQuestionIndex] = answer;
        setAnswers(updatedAnswers);
    };

    // Navigation Handlers
    const handleNext = () => setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    const handlePrev = () => setCurrentQuestionIndex((prevIndex) => prevIndex - 1);

    // Submit Quiz
    const handleSubmit = async () => {
        if (!quizData || !studentId) {
            setError("Quiz data or student ID is missing.");
            return;
        }
        // Calculate the score using the correctAnswer field
        const correctAnswers = quizData.questions.map((question) => question.answer);
        const score = answers.reduce((total: number, answer, index) => {
            if (answer == correctAnswers[index]) {
                return total + 1; // Increment for correct answers
            }
            return total;
        }, 0);

        const passingScore = Math.ceil(quizData.questions.length * 0.5);
        const remarks = score >= passingScore ? "Passed" : "Failed";
        const totalScore = `${score}/${quizData.questions.length}`;

        try {
            const response = await postData<SubmitQuizResponse, any>("/quiz/submitQuiz", {
                student_id: studentId,
                quiz_id,
                totalScore,
                remarks,
                result_type: 1,
            });

            if (response.success) {
                alert(`Quiz submitted! Your score: ${score}/${quizData.questions.length}. Remarks: ${remarks}`);
                router.push(`/dashboard/modules/${response.module_id}`);
            } else {
                setError("Quiz submission failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("Unexpected error. Please try again.");
        }
    };



    // Render Component
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!currentQuestion) return <p>Quiz complete or no questions available.</p>;

    return (
        <div className="p-4">
            <h2 className="mb-4 text-center text-xl font-bold">{quizData?.quiz_title}</h2>
            <p className="text-center">{quizData?.quiz_desc}</p>
            <hr />
            <p
                className="my-10"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(currentQuestion.questionHTML || ""),
                }}
            />

            <div className="mb-20">
                {/* Render questions dynamically */}
                {currentQuestion.questionType === "multipleChoice" &&
                    currentQuestion.choices?.map((choice, index) => (
                        <label key={index} className="mb-2 flex items-center">
                            <input
                                type="radio"
                                name="answer"
                                value={choice}
                                checked={answers[currentQuestionIndex] === index}
                                onChange={() => handleAnswerChange(index)}
                                className="mr-2"
                            />
                            {choice}
                        </label>
                    ))}

                {currentQuestion.questionType === "trueFalse" && (
                    <>
                        <label className="mb-2 flex items-center">
                            <input
                                type="radio"
                                name="answer"
                                value="True"
                                checked={answers[currentQuestionIndex] === 0}
                                onChange={() => handleAnswerChange(0)}
                                className="mr-2"
                            />
                            True
                        </label>
                        <label className="mb-2 flex items-center">
                            <input
                                type="radio"
                                name="answer"
                                value="False"
                                checked={answers[currentQuestionIndex] === 1}
                                onChange={() => handleAnswerChange(1)}
                                className="mr-2"
                            />
                            False
                        </label>
                    </>
                )}

                {currentQuestion.questionType === "identification" && (
                    <input
                        type="text"
                        value={answers[currentQuestionIndex] || ""}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm"
                        placeholder="Enter your answer here"
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-4 flex justify-end space-x-2">
                {currentQuestionIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="w-1/2 rounded-lg bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
                    >
                        Prev
                    </button>
                )}
                {currentQuestionIndex < (quizData?.questions.length || 0) - 1 ? (
                    <button
                        onClick={handleNext}
                        className="w-1/2 rounded-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="w-1/2 rounded-lg bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
                    >
                        Submit
                    </button>
                )}
            </div>
        </div>
    );
};

export default TakeQuiz;