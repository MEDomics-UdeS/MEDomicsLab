import React, { useEffect, useState, useContext } from "react";
import { MongoDBContext } from "../mongoDB/mongoDBContext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button"; // Import Button component
import { MongoClient, ObjectId } from "mongodb";
const mongoUrl = "mongodb://127.0.0.1:27017";

const DataTableFromDB = ({ data, tablePropsData, tablePropsColumn }) => {
  const [innerData, setInnerData] = useState([]);
  const [columns, setColumns] = useState([]);
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
          .then((fetchedData) => {
            console.log("Fetched data:", fetchedData);
            let collData = fetchedData.map((item) => {
              let keys = Object.keys(item);
              let values = Object.values(item);
              let dataObject = {};
              for (let i = 0; i < keys.length; i++) {
                dataObject[keys[i]] =
                    keys[i] === "_id" ? item[keys[i]].toString() : values[i];
              }
              return dataObject;
            });
            setInnerData(collData);
          })
          .catch((error) => {
            console.error("Failed to fetch data:", error);
          });
    } else {
      console.warn("Invalid data prop:", data);
    }
  }, [data]);

  useEffect(() => {
    console.log("innerData updated:", innerData);
    if (innerData.length > 0) {
      const keys = Object.keys(innerData[0]).filter((key) => key !== "_id");
      const newColumns = keys.map((key) => ({ field: key, header: key }));
      setColumns(newColumns);
    }
  }, [innerData]);

  useEffect(() => {
    console.log("columns updated:", columns);
  }, [columns]);

  const getColumnsFromData = (data) => {
    if (data.length > 0) {
      return Object.keys(data[0])
          .filter((key) => key !== "_id")
          .map((key) => (
              <Column
                  key={key}
                  field={key}
                  header={key}
                  {...tablePropsColumn}
              />
          ));
    }
    return null;
  };

  const updateDatabaseData = async (
      dbname,
      collectionName,
      id,
      field,
      newValue
  ) => {
    const client = new MongoClient(mongoUrl);
    try {
      await client.connect();
      console.log("Connected to the server for update", dbname, collectionName);
      const db = client.db(dbname);
      const collection = db.collection(collectionName);
      console.log(
          `Updating document with _id: ${id}, setting ${field} to ${newValue}`
      );
      const result = await collection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { [field]: newValue } }
      );
      console.log("Update result:", result);
      if (result.modifiedCount === 0) {
        console.error("No documents were updated");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      await client.close();
    }
  };

  const deleteDatabaseData = async (dbname, collectionName, id) => {
    const client = new MongoClient(mongoUrl);
    try {
      await client.connect();
      console.log(
          "Connected to the server for deletion",
          dbname,
          collectionName
      );
      const db = client.db(dbname);
      const collection = db.collection(collectionName);
      console.log(`Deleting document with _id: ${id}`);
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log("Delete result:", result);
      if (result.deletedCount === 0) {
        console.error("No documents were deleted");
      } else {
        // If the deletion was successful, update the UI to reflect the change
        setInnerData(innerData.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error("Error deleting data:", error);
    } finally {
      await client.close();
    }
  };

  const onCellEditComplete = (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
      rowData[field] = newValue;
      console.log("Calling updateDatabaseData with:", {
        dbname: data.path,
        collectionName: data.uuid,
        id: rowData._id,
        field,
        newValue,
      });
      updateDatabaseData(data.path, data.uuid, rowData._id, field, newValue)
          .then(() => {
            console.log("Database updated successfully");
          })
          .catch((error) => {
            console.error("Failed to update database:", error);
          });
  };

  const onDeleteRow = (rowData) => {
    const { _id } = rowData;

    console.log("Deleting row with _id:", _id);

    deleteDatabaseData(data.path, data.uuid, _id)
        .then(() => {
          console.log("Row deleted successfully");
        })
        .catch((error) => {
          console.error("Failed to delete row:", error);
        });
  };

  const textEditor = (options) => {
    return (
        <InputText
            type="text"
            value={options.value}
            onChange={(e) => options.editorCallback(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
        />
    );
  };

  return (
      <>
        {innerData.length === 0 && <p>No data available</p>}
        <DataTable
            value={innerData}
            editMode="cell"
            size="small"
            scrollable
            height={"100%"}
            width={"100%"}
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50, 100]}
            {...tablePropsData}
        >
          {/* Delete column */}
          <Column
              field="delete"
              body={(rowData) => (
                  <Button
                      icon="pi pi-trash"
                      className="p-button-rounded p-button-danger"
                      onClick={() => onDeleteRow(rowData)}
                  />
              )}/>
          {/* Columns rendering */}
          {columns.length > 0
              ? columns.map((col) => (
                  <Column
                      key={col.field}
                      field={col.field}
                      header={col.header}
                      editor={(options) => textEditor(options)}
                      onCellEditComplete={onCellEditComplete}
                  />
              ))
              : getColumnsFromData(innerData)}
        </DataTable>
      </>
  );
};

export default DataTableFromDB;


