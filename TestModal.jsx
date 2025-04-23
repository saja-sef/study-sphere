import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Button } from "@heroui/react";
import api from "../api";

const TestModal = ({ isOpen, onRequestClose, testId, studentId }) => {
  const [test, setTest] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/list/?class_id=${testId}`);
        setTest(response.data[0]); // Assuming a single test for simplicity
      } catch (error) {
        console.error("Error fetching test:", error);
      }
    };

    if (isOpen && testId) {
      fetchTest();
      setSelectedAnswers({});
      setSubmitted(false);
      setScore(0);
    }
  }, [isOpen, testId]);

  const handleAnswerSelect = (questionIndex, choiceIndex) => {
    if (!submitted) {
      setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: choiceIndex }));
    }
  };

  const handleSubmit = async () => {
    const correctAnswers = test.questions.reduce((acc, question, index) => {
      return acc + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const answersPayload = test.questions.map((question, index) => ({
      question_id: question.id,
      selected_answer: selectedAnswers[index],
    }));

    try {
      await api.post("/tests/submit/", {
        test_id: test.id,
        student_id: studentId, // Replace with actual student ID
        answers: answersPayload,
      });

      setScore(correctAnswers);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit the test. Please try again.");
    }
  };

  if (!isOpen || !test) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <Card
        className="py-4"
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "80vh",
          borderRadius: "10px",
          border: "2px solid rgba(166, 225, 250, 0.3)",
          background: "linear-gradient(145deg, #04091C, #0A0F24)",
          color: "white",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(166, 225, 250, 0.2)",
        }}
      >
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h2 className="text-lg font-semibold mb-2 text-white">Take Test</h2>
        </CardHeader>
        <CardBody className="overflow-visible py-2" style={{ padding: "24px" }}>
          <h3 className="text-2xl font-bold mb-6" style={{ color: "#A6E1FA" }}>
            {test.title}
          </h3>
          <div className="space-y-6">
            {test.questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="bg-[#0A0F24] p-6 rounded-lg transition-all duration-300 hover:bg-[#0E142A]"
              >
                <p className="font-semibold mb-4">{question.question}</p>
                <ul className="space-y-3">
                  {question.choices.map((choice, choiceIndex) => (
                    <li
                      key={choiceIndex}
                      className={`flex items-center space-x-3 ${
                        submitted && choiceIndex === question.correctAnswer
                          ? "text-green-300"
                          : submitted && selectedAnswers[questionIndex] === choiceIndex
                          ? "text-red-300"
                          : "text-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        className="form-radio h-4 w-4 text-blue-500 transition-all duration-200 hover:scale-110"
                        checked={selectedAnswers[questionIndex] === choiceIndex}
                        onChange={() => handleAnswerSelect(questionIndex, choiceIndex)}
                        disabled={submitted}
                      />
                      <span>{choice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {!submitted && (
            <div className="mt-8">
              <Button
                color="primary"
                variant="bordered"
                onClick={handleSubmit}
                className="w-full transition-all duration-300 hover:bg-[#A6E1FA] hover:text-[#04091C]"
                style={{ borderColor: "#A6E1FA" }}
              >
                Submit
              </Button>
            </div>
          )}
          {submitted && (
            <div className="mt-8 text-center">
              <p className="text-xl font-semibold" style={{ color: "#A6E1FA" }}>
                Your Score: {score} / {test.questions.length}
              </p>
            </div>
          )}
          <div className="mt-8">
            <Button
              color="primary"
              variant="bordered"
              onClick={onRequestClose}
              className="w-full transition-all duration-300 hover:bg-[#A6E1FA] hover:text-[#04091C]"
              style={{ borderColor: "#A6E1FA" }}
            >
              Close
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TestModal;