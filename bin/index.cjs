#!/usr/local/bin/node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_os_1 = require("node:os");
var process = require("node:process");
var fs = require("node:fs/promises");
var node_child_process_1 = require("node:child_process");
var client_s3_1 = require("@aws-sdk/client-s3");
function getMacOsInfoPlist(engine, bucketName) {
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n\t<key>NSServices</key>\n\t<array>\n\t\t<dict>\n\t\t\t<key>NSMenuItem</key>\n\t\t\t<dict>\n\t\t\t\t<key>default</key>\n\t\t\t\t<string>Upload to ".concat(engine, " - ").concat(bucketName, "</string>\n\t\t\t</dict>\n\t\t\t<key>NSMessage</key>\n\t\t\t<string>runWorkflowAsService</string>\n\t\t\t<key>NSSendFileTypes</key>\n\t\t\t<array>\n\t\t\t\t<string>public.item</string>\n\t\t\t</array>\n\t\t</dict>\n\t</array>\n</dict>\n</plist>\n");
}
function getMacOsDocumentWflow(endpoint) {
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n<plist version=\"1.0\">\n<dict>\n    <key>AMApplicationVersion</key>\n    <string>2.8</string>\n    <key>AMDocumentVersion</key>\n    <string>2</string>\n    <key>actions</key>\n    <array>\n        <dict>\n            <key>action</key>\n            <dict>\n                <key>AMAccepts</key>\n                <dict>\n                    <key>Container</key>\n                    <string>List</string>\n                    <key>Optional</key>\n                    <true/>\n                    <key>Types</key>\n                    <array>\n                        <string>com.apple.cocoa.string</string>\n                    </array>\n                </dict>\n                <key>AMActionVersion</key>\n                <string>2.0.3</string>\n                <key>ActionBundlePath</key>\n                <string>/System/Library/Automator/Run Shell Script.action</string>\n                <key>ActionName</key>\n                <string>Run Shell Script</string>\n                <key>ActionParameters</key>\n                  <dict>\n                    <key>COMMAND_STRING</key>\n                    <string>\n                    #!/usr/bin/env bash\n                    export PATH=\"/usr/local/bin:$PATH\"\n                    /usr/local/bin/npx straight-up ship '".concat(endpoint, "' \"$@\"\n                    </string>\n                    <key>CheckedForUserDefaultShell</key>\n                    <true/>\n                    <key>inputMethod</key>\n                    <integer>1</integer>\n                    <key>shell</key>\n                    <string>/bin/bash</string>\n                    <key>source</key>\n                    <string></string>\n                </dict>\n                <key>BundleIdentifier</key>\n                <string>com.apple.RunShellScript</string>\n                <key>Class Name</key>\n                <string>RunShellScriptAction</string>\n            </dict>\n        </dict>\n    </array>\n</dict>\n</plist>");
}
// deno-lint-ignore require-await
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, operation, endpoint, bucketName, outputDirectory, getInfoPlist, getDocumentWflow, workflowDir, aws_region, _b, _operation, _endpoint, filePath, s3, Key, content, putCommand, e_1, osastr;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = process.argv.slice(2), operation = _a[0], endpoint = _a[1];
                    bucketName = endpoint.replace("s3://", "");
                    if (!(operation === "setup")) return [3 /*break*/, 4];
                    if (!endpoint) {
                        console.error("usage: straightup setup s3://bucket-name");
                        return [2 /*return*/];
                    }
                    if (!endpoint.startsWith("s3://")) {
                        console.error("The endpoint must be an S3 bucket");
                        return [2 /*return*/];
                    }
                    outputDirectory = "".concat((0, node_os_1.homedir)(), "/Library/Services");
                    getInfoPlist = getMacOsInfoPlist("s3", bucketName);
                    getDocumentWflow = getMacOsDocumentWflow(endpoint);
                    workflowDir = "".concat(outputDirectory, "/Upload to S3 - ").concat(bucketName, "!.workflow/Contents");
                    return [4 /*yield*/, fs.mkdir(workflowDir, { recursive: true })];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, fs.writeFile("".concat(workflowDir, "/Info.plist"), getInfoPlist)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, fs.writeFile("".concat(workflowDir, "/document.wflow"), getDocumentWflow)];
                case 3:
                    _c.sent();
                    console.log("Service Created:");
                    console.log("right-click on a file -> Services ->");
                    console.log("Upload to S3 - ".concat(bucketName, "!"));
                    return [3 /*break*/, 10];
                case 4:
                    if (!(operation === "ship")) return [3 /*break*/, 10];
                    aws_region = process.env.AWS_REGION || "us-east-1";
                    _b = process.argv.slice(2), _operation = _b[0], _endpoint = _b[1], filePath = _b[2];
                    s3 = new client_s3_1.S3Client({
                        region: aws_region,
                    });
                    Key = filePath.split("/").pop();
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, fs.readFile(filePath)];
                case 6:
                    content = _c.sent();
                    putCommand = new client_s3_1.PutObjectCommand({
                        Bucket: bucketName,
                        Key: Key,
                        Body: content,
                    });
                    return [4 /*yield*/, s3.send(putCommand)];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _c.sent();
                    console.error(e_1);
                    return [3 /*break*/, 9];
                case 9:
                    osastr = "osascript -e 'display notification \"s3://".concat(bucketName, "/").concat(Key, "\" with title \"Upload Complete!\"'");
                    (0, node_child_process_1.exec)(osastr);
                    _c.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
main();
