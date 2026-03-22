import DomoApi from "@/API/domoAPI";
import "./index.css";
import { useEffect } from "react";

const DefaultPage = () => {
  // const fetchCoffeeDataAPI = async () => {
  //   await DomoApi.FetchDatasetRecords("TestDataset").then(([testData]) => {
  //     console.log("TestDataset", testData);
  //   });
  // };

  const createDoc = async () => {
    try {
      const newDoc = {
        name: "mr.ramkumar111",
        age: 4222,
        isStudent: 16,
        enrollmentDate: "2025-03-21"
      };

      const response = await DomoApi.CreateDocument("myDb", newDoc);

      console.log("Document Created:", response);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    createDoc();
  }, []);

  return <div>Hello</div>;
};

export default DefaultPage;
