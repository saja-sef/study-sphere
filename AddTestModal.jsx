import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardBody, Button, Input, Textarea } from "@heroui/react";
import api from "../../api"; // Import the pre-configured Axios instance

const AddTestModal = React.memo(({ isOpen, onRequestClose, classId }) => {
  const [testTitle, setTestTitle] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      choices: ["", "", ""],
      correctAnswer: 0,
    },
  ]);

  const handleTestTitleChange = useCallback((e) => setTestTitle(e.target.value), []);

  const handleQuestionChange = useCallback((index, e) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === index ? { ...q, question: e.target.value } : q
      )
    );
  }, []);

  const handleChoiceChange = useCallback((questionIndex, choiceIndex, e) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              choices: q.choices.map((choice, j) =>
                j === choiceIndex ? e.target.value : choice
              ),
            }
          : q
      )
    );
  }, []);

  const handleCorrectAnswerChange = useCallback((questionIndex, choiceIndex) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) =>
        i === questionIndex ? { ...q, correctAnswer: choiceIndex } : q
      )
    );
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      { question: "", choices: ["", "", ""], correctAnswer: 0 },
    ]);
  }, []);

  const removeQuestion = useCallback((index) => {
    setQuestions((prevQuestions) => prevQuestions.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Basic validation
      if (!testTitle.trim()) {
        alert("Please enter a test title.");
        return;
      }

      const isValid = questions.every((q) => {
        if (!q.question.trim()) {
          alert(`Question ${questions.indexOf(q) + 1} is missing text.`);
          return false;
        }
        if (q.choices.filter((choice) => choice.trim()).length < 2) {
          alert(`Question ${questions.indexOf(q) + 1} must have at least two choices.`);
          return false;
        }
        return true;
      });

      if (!isValid) return;

      try {
        // Prepare the request body
        const formattedQuestions = questions.map((q) => ({
          text: q.question,
          order: questions.indexOf(q) + 1,
          answer_options: q.choices.map((choice, index) => ({
            text: choice,
            is_correct: index === q.correctAnswer,
          })),
        }));

        const requestData = {
          title: testTitle,
          description: "Exam created via AddTestModal",
          class_obj: classId, // Use the class ID passed as a prop
          questions: formattedQuestions,
        };

        // Send POST request to create the test using the `api` instance
        const response = await api.post("/tests/create/", requestData);

        console.log("Test created:", response.data);

        // Close the modal after successful submission
        onRequestClose();
      } catch (error) {
        console.error("Error creating test:", error);
        alert("Failed to create the test. Please try again.");
      }
    },
    [onRequestClose, testTitle, questions, classId]
  );

  if (!isOpen) return null;

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
        opacity: isOpen ? 1 : 0,
        transition: "opacity 0.3s ease-out",
      }}
    >
      <Card
        className="py-4"
        style={{
          width: "95%",
          maxWidth: "700px",
          maxHeight: "70vh",
          borderRadius: "10px",
          border: "2px solid rgba(166, 225, 250, 0.3)",
          background: "linear-gradient(145deg, #04091C, #0A0F24)",
          color: "white",
          transform: isOpen ? "translateY(30px)" : "translateY(100px)",
          opacity: isOpen ? 1 : 0,
          transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
          overflowY: "auto",
          boxShadow: "0 4px 20px rgba(166, 225, 250, 0.2)",
        }}
      >
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h2 className="text-3xl font-bold mb-6" style={{ color: "#A6E1FA" }}>
            Add New Test
          </h2>
        </CardHeader>
        <CardBody className="overflow-visible py-2" style={{ padding: "24px" }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <Input
                label="Test Title"
                value={testTitle}
                onChange={handleTestTitleChange}
                placeholder="Enter test title"
                variant="bordered"
                className="w-full transition-all duration-300 hover:border-[#A6E1FA]"
                classNames={{
                  input: "text-white",
                  label: "text-white",
                  inputWrapper: "bg-[#0A0F24] border-[#004493]",
                }}
              />
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold" style={{ color: "#A6E1FA" }}>
                    Question {questionIndex + 1}
                  </h3>
                  <Button
                    onClick={() => removeQuestion(questionIndex)}
                    color="danger"
                    variant="bordered"
                    className="transition-all duration-300 hover:bg-red-500 hover:text-white"
                  >
                    Remove Question
                  </Button>
                </div>

                <Textarea
                  label="Question Text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(questionIndex, e)}
                  placeholder="Enter question text"
                  variant="bordered"
                  className="w-full transition-all duration-300 hover:border-[#A6E1FA]"
                  minRows={2}
                  classNames={{
                    input: "text-white",
                    label: "text-white",
                    inputWrapper: "bg-[#0A0F24] border-[#004493]",
                  }}
                />

                <div className="space-y-4 mt-4">
                  {question.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`correctAnswer-${questionIndex}`}
                        checked={question.correctAnswer === choiceIndex}
                        onChange={() => handleCorrectAnswerChange(questionIndex, choiceIndex)}
                        className="form-radio h-4 w-4 text-blue-500 transition-all duration-200 hover:scale-110"
                      />
                      <Input
                        value={choice}
                        onChange={(e) => handleChoiceChange(questionIndex, choiceIndex, e)}
                        placeholder={`Enter choice ${choiceIndex + 1}`}
                        variant="bordered"
                        className="w-full transition-all duration-300 hover:border-[#A6E1FA]"
                        classNames={{
                          input: "text-white",
                          inputWrapper: "bg-[#0A0F24] border-[#004493]",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-8">
              <Button
                onClick={addQuestion}
                color="primary"
                variant="bordered"
                className="w-full transition-all duration-300 hover:bg-[#A6E1FA] hover:text-[#04091C]"
                style={{ borderColor: "#A6E1FA" }}
              >
                Add Question
              </Button>
            </div>

            <div className="mt-8 flex space-x-4">
              <Button
                type="submit"
                color="primary"
                variant="bordered"
                className="flex-1 transition-all duration-300 hover:bg-[#A6E1FA] hover:text-[#04091C]"
                style={{ borderColor: "#A6E1FA" }}
              >
                Submit
              </Button>
              <Button
                onClick={onRequestClose}
                color="primary"
                variant="bordered"
                className="flex-1 transition-all duration-300 hover:bg-[#A6E1FA] hover:text-[#04091C]"
                style={{ borderColor: "#A6E1FA" }}
              >
                Close
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <style>
        {`
          ::-webkit-scrollbar {
            width: 6px;
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(166, 225, 250, 0.4);
            border-radius: 10px;
            border: 1px solid rgba(166, 225, 250, 0.2);
            transition: background 0.3s ease-out, border 0.3s ease-out;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(166, 225, 250, 0.6);
            border: 1px solid rgba(166, 225, 250, 0.4);
          }

          ::-webkit-scrollbar-track {
            background: transparent;
            margin: 8px;
          }

          ::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}
      </style>
    </div>
  );
});

export default AddTestModal;