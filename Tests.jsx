import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import api from "../api";// Import the pre-configured Axios instance
import TestModal from "./TestModal";

export default function Tests({ courseId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [modalMode, setModalMode] = useState("view");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get(`/tests/list/?class_id=${courseId}`);
        setTests(response.data);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setError("Failed to load tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [courseId]);

  const openModal = (test, mode) => {
    setCurrentTest(test);
    setModalMode(mode);
    setIsTestModalOpen(true);
  };

  const closeModal = () => {
    setIsTestModalOpen(false);
    setCurrentTest(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 rounded-lg" style={{ backgroundColor: "transparent" }}>
      <div className="overflow-x-auto flex justify-center mt-12 md:mt-0 overflow-hidden">
        <table style={{ width: "60%" }} className="text-white border-collapse">
          <tbody>
            {tests.map((test, index) => (
              <tr key={test.id} className="block md:table-row mb-8 md:mb-8">
                <td colSpan="3" className="block md:table-cell p-0">
                  <div
                    className="rounded-lg transition-all transform hover:scale-105 hover:shadow-[0_0_15px_#004493] backdrop-blur-md bg-opacity-20 bg-[#04091C] border border-[#004493] hover:border-[#A6E1FA]"
                  >
                    <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] md:gap-0 items-center justify-between py-2 px-3">
                      <div className="text-center md:text-left">
                        <span className="inline-block hover:translate-x-2 hover:scale-105 transition-transform duration-300 hover:text-[#A6E1FA]">
                          {test.title}
                        </span>
                      </div>
                      <div className="relative text-center md:text-left">
                        <Button
                          variant="bordered"
                          className="rounded-2xl bg-transparent text-white hover:scale-105 transition-transform duration-300 border-transparent hover:border-[#A6E1FA]"
                          onClick={() => openModal(test, "view")}
                        >
                          Take Test
                        </Button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TestModal
        isOpen={isTestModalOpen}
        onRequestClose={closeModal}
        test={currentTest}
        mode={modalMode}
      />
    </div>
  );
}