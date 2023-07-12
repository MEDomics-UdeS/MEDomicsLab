import { ipcRenderer } from "electron";
import axios from "axios";

export const requestJson = (
  port,
  topic,
  json2send,
  jsonReceivedCB,
  errorCB
) => {
  ipcRenderer
    .invoke("request", {
      data: {
        json2send,
      },
      method: "POST",
      url: "http://127.0.0.1:" + port + "/" + topic,
    })
    .then((data) => {
      jsonReceivedCB(data["data"]);
      return true;
    })
    .catch((resp) => errorCB(resp));
};

export const axiosPostJson = async (jsonData, pathName) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/" + pathName,
      jsonData
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

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
  console.log("DownloadFile: " + downloadUrl);
  if (downloadUrl) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", downloadUrl);
    xhr.onload = function () {
      if (xhr.status == 200) {
        onSuccess(xhr.responseText);
      } else {
        onError(xhr.status + " " + xhr.statusText);
      }
    };
    xhr.onerror = function (e) {
      console.log(e);
      onError(e);
    };
    xhr.send();
  }
};

export const getQueryParams = () => {
  var a = window.location.search.substr(1);
  if (a == "") return {};
  var params = a.split("&");
  var b = {};
  for (var i = 0; i < params.length; ++i) {
    var p = params[i].split("=", 2);
    if (p.length == 1) b[p[0]] = "";
    else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
};
