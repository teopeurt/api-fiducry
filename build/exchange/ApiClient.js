"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const map_1 = __importDefault(require("lodash/map"));
class ApiClient {
  constructor(options = {}) {
    this.fetch = (path, method, data, headersData) => {
      let body;
      let modifiedPath;
      if (method === "GET" && data && Object.keys(data).length !== 0) {
        modifiedPath = `${path}?${this.constructQueryString(data)}`;
      } else if (method === "POST" || method === "PUT") {
        body = JSON.stringify(data);
      }
      // Construct headers
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "fiducry",
        ...headersData
      };
      // Handle request promises and return a new promise
      let statusCode = null;
      let statusText = null;
      return new Promise((resolve, reject) => {
        fetch(this.baseUrl + (modifiedPath || path), {
          method,
          body,
          headers,
          redirect: "follow"
        })
          .then(response => {
            const json = response.json();
            statusCode = response.status;
            statusText = response.statusText;
            console.log("response " + JSON.stringify(response));
            // Handle successful responses
            if (response.status >= 200 && response.status < 300) {
              return json;
            }
            return json.then(Promise.reject.bind(Promise));
          })
          .then(json => {
            resolve(json);
          })
          .catch(err => {
            reject(err);
          });
      });
    };
    this.get = (path, data, headers = {}) => {
      return this.fetch(path, "GET", data, headers);
    };
    this.constructQueryString = data => {
      return map_1
        .default(data, (v, k) => {
          return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
        })
        .join("&");
    };
    this.baseUrl = options.baseUrl;
  }
}
exports.default = ApiClient;
//# sourceMappingURL=ApiClient.js.map
