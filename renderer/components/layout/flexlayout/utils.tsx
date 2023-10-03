export class Utils {
    /**
     * Downloads a file from a url in an async manner
     * @param downloadUrl the url to download from
     * @param onSuccess the callback when the download is successful
     * @param onError the callback when the download fails
     * @category Static
     * @example
     * ```tsx
     * Utils.downloadFile("https://www.google.com", (text) => {
     *      console.log(text)
     *    }, (error) => {
     *      console.log(error)
     *  })
     * ```
     */
    static downloadFile(downloadUrl: any, onSuccess: any, onError: any) {
        console.log("DownloadFile: " + downloadUrl);
        if (downloadUrl) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', downloadUrl);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    onSuccess(xhr.responseText);
                }
                else {
                    onError(xhr.status + " " + xhr.statusText);
                }
            };
            xhr.onerror = function (e) {
                console.log(e);
                onError(e);
            };
            xhr.send();
        }
    }

    /**
     * Gets the query parameters from the current url
     * @returns A string of the current url's query parameters
     * @category Static
     * @example
     * ```tsx
     * Utils.getQueryParams()
     * ```
     */
    static getQueryParams() {
        var a = window.location.search.substr(1);
        if (a == "") return {};
        var params = a.split('&');
        var b: any = {};
        for (var i = 0; i < params.length; ++i) {
            var p = params[i].split('=', 2);
            if (p.length == 1)
                b[p[0]] = "";
            else
                b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    }
}
