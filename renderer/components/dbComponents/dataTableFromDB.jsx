import React, { useEffect, useState, useContext } from "react";
import { MongoDBContext } from "../../components/mongoDB/mongoDBContext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
const MongoClient = require("mongodb").MongoClient;
const mongoUrl = "mongodb://127.0.0.1:27017";

const DataTableFromDB = ({ data, tablePropsData, tablePropsColumn }) => {
  const [innerData, setInnerData] = useState([]);
  const [columns, setColumns] = useState([]); // [ { field: "name", header: "Name" }, { field: "age", header: "Age" }
  const { DB } = useContext(MongoDBContext);

  const getDatabaseData = (dbname, collectionName) => {
    const client = new MongoClient(mongoUrl);
    return new Promise(async (resolve, reject) => {
      try {
        await client.connect();
        console.log("Connected to the server", dbname, collectionName);
        const db = client.db(dbname);
        const collection = db.collection(collectionName);
        const fetchedData = await collection.find({}).toArray();
        console.log("Fetched data:", fetchedData);

        resolve(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        reject(error);
      } finally {
        await client.close();
      }
    });
  };

  useEffect(() => {
    if (data && data.uuid && data.path) {
      console.log("Fetching data with:", data);
      getDatabaseData(data.path, data.uuid)
        .then(fetchedData => {
          console.log("Fetched data2:", fetchedData);
          let collData = fetchedData.map((item) => {
            let keys = Object.keys(item)
            let values = Object.values(item)
            let dataObject = {}
            for (let i = 0; i < keys.length; i++) {
                if (keys[i] !== "_id") {
                    dataObject[keys[i]] = values[i]
                }
            }
            return dataObject
        })
          setInnerData(collData);
        })
        .catch(error => {
          console.error("Failed to fetch data:", error);
        });
    } else {
      console.warn("Invalid data prop:", data);
    }
  }, [data]);

  useEffect(() => {
    console.log("innerData updated:", innerData);
    if (innerData.length > 0) {
      const keys = Object.keys(innerData[0]);
      const newColumns = keys.map(key => ({ field: key, header: key }));
      setColumns(newColumns);
    }
  }, [innerData]);
  

  useEffect(() => {
    console.log("columns updated:", columns);
  }, [columns]);

  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      return Object.keys(data[0]).map((key) => (
        <Column key={key} field={key} header={key} {...tablePropsColumn} />
      ));
    }
    return null;
  };

  return (
    <>
      <h1>DataTableFromDB</h1>
      <p>DB: {DB ? DB.name : "No DB context"}</p>

      {innerData.length === 0 && <p>No data available</p>}
      <DataTable value={innerData} size="small" scrollable height={"100%"} width={"100%"} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}  {...tablePropsData} >
        {columns.length > 0
          ? columns.map((col) => (
              <Column key={col.field} field={col.field} header={col.header} />
            ))
          : getColumnsFromData(innerData)}
      </DataTable>
    </>
  );
};

export default DataTableFromDB;
