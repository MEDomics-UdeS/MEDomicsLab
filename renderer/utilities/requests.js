import { ipcRenderer } from "electron"
import axios from "axios"
import { toast } from "react-toastify"

/**
 * 
 * @param {Integer} port the port to send the request to
 * @param {String} topic the topic to send the request to
 * @param {Object} json2send the json to send
 * @param {Function} jsonReceivedCB extecuted when the json is received
 * 
 * @example
 * import { requestJson } from '/utilities/requests';

 <Button variant="primary" onClick={
    () => {
        requestJson(5000, "test", { test: "test" }, (jsonResponse) => {
            console.log(jsonResponse);
        });
    }
}>send test</Button> 
 */
export const requestJson = (port, topic, json2send, jsonReceivedCB, onError) => {
  try {
    ipcRenderer
      .invoke("request", {
        data: {
          json2send
        },
        method: "POST",
        url: "http://localhost:" + port + "/" + topic
      })
      .then((data) => {
        jsonReceivedCB(data["data"])
      })
      .catch((resp) => {
        console.log(resp)
        onError
          ? onError(resp)
          : () => {
              console.error("Error:", resp)
              toast.error("An error occured while using ipcRenderer.invoke")
            }
      })
  } catch (error) {
    console.error(error)
    toast.error("An error occured while using ipcRenderer.invoke")
    onError(error)
  }
}

export const requestJsonGo = (port, topic, json2send, jsonReceivedCB, onError) => {
  try {
    ipcRenderer
      .invoke("request", {
        data: {
          json2send
        },
        method: "POST",
        url: "http://localhost:" + port + "/" + topic
      })
      .then((data) => {
        jsonReceivedCB(data["data"])
      })
      .catch((resp) => {
        console.log(resp)
        onError
          ? onError(resp)
          : () => {
              console.error("Error:", resp)
              toast.error("An error occured while using ipcRenderer.invoke")
            }
      })
  } catch (error) {
    console.error(error)
    toast.error("An error occured while using ipcRenderer.invoke")
    onError(error)
  }
}

export const fetchGo = (port, topic, json2send, jsonReceivedCB, onError) => {
  fetch("http://localhost:" + port + "/" + topic, {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Set the content type to JSON
    },
    body: { message: json2send } // Send the JSON payload
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      return response.json() // Parse the response as JSON
    })
    .then((data) => {
      jsonReceivedCB(data)
      // Handle the JSON response from the server
      console.log("Server Response:", data)
    })
    .catch((error) => {
      onError
      console.error("Error:", error)
    })
}

export const axiosPostJsonGo = async (port, topic, json2send, jsonReceivedCB, onError) => {
  try {
    const response = await axios.post("http://localhost:" + port + topic, { message: JSON.stringify(json2send) }, { headers: { "Content-Type": "application/json" } })
    console.log(response.data)
    response.data.type == "toParse" ? jsonReceivedCB(JSON.parse(response.data.response_message)) : jsonReceivedCB(response.data.response_message)
    return response.data
  } catch (error) {
    console.error(error)
    onError(error)

    onError
      ? onError(error)
      : () => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Server Error:", error.response.data)
            console.error("Status Code:", error.response.status)
            console.error("Headers:", error.response.headers)
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser
            console.error("Request Error:", error.request)
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error:", error.message)
          }
        }
  }
}

export const axiosPostJson = async (jsonData, pathName) => {
  try {
    const response = await axios.post("http://localhost:5000/" + pathName, jsonData, { headers: { "Content-Type": "application/json" } })

    return response.data
  } catch (error) {
    console.error("ICIIIIIIIIIIIIIIIIII")
    console.error(error)
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server Error:", error.response.data)
      console.error("Status Code:", error.response.status)
      console.error("Headers:", error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      console.error("Request Error:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message)
    }
    throw error
  }
}

// example of use:
{
  /*

import { requestJson } from '/utilities/requests';

 <Button variant="primary" onClick={
    () => {
        requestJson(5000, "test", { test: "test" }, (jsonResponse) => {
            console.log(jsonResponse);
        }, function (err) {
            console.error(err);
        });
    }
}>send test</Button> 

*/
}

export const downloadFile = (downloadUrl, onSuccess, onError) => {
  console.log("DownloadFile: " + downloadUrl)
  if (downloadUrl) {
    var xhr = new XMLHttpRequest()
    xhr.open("GET", downloadUrl)
    xhr.onload = function () {
      if (xhr.status == 200) {
        onSuccess(xhr.responseText)
      } else {
        onError(xhr.status + " " + xhr.statusText)
      }
    }
    xhr.onerror = function (e) {
      console.log(e)
      onError(e)
    }
    xhr.send()
  }
}

export const getQueryParams = () => {
  var a = window.location.search.substr(1)
  if (a == "") return {}
  var params = a.split("&")
  var b = {}
  for (var i = 0; i < params.length; ++i) {
    var p = params[i].split("=", 2)
    if (p.length == 1) b[p[0]] = ""
    else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "))
  }
  return b
}
