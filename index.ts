#!/usr/local/bin/node

import { homedir } from "node:os";
import * as process from "node:process";
import * as fs from "node:fs/promises";
import { exec } from "node:child_process";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getMacOsInfoPlist(engine, bucketName: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>NSServices</key>
	<array>
		<dict>
			<key>NSMenuItem</key>
			<dict>
				<key>default</key>
				<string>Upload to ${engine} - ${bucketName}</string>
			</dict>
			<key>NSMessage</key>
			<string>runWorkflowAsService</string>
			<key>NSSendFileTypes</key>
			<array>
				<string>public.item</string>
			</array>
		</dict>
	</array>
</dict>
</plist>
`;
}

function getMacOsDocumentWflow(endpoint: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>AMApplicationVersion</key>
    <string>2.8</string>
    <key>AMDocumentVersion</key>
    <string>2</string>
    <key>actions</key>
    <array>
        <dict>
            <key>action</key>
            <dict>
                <key>AMAccepts</key>
                <dict>
                    <key>Container</key>
                    <string>List</string>
                    <key>Optional</key>
                    <true/>
                    <key>Types</key>
                    <array>
                        <string>com.apple.cocoa.string</string>
                    </array>
                </dict>
                <key>AMActionVersion</key>
                <string>2.0.3</string>
                <key>ActionBundlePath</key>
                <string>/System/Library/Automator/Run Shell Script.action</string>
                <key>ActionName</key>
                <string>Run Shell Script</string>
                <key>ActionParameters</key>
                  <dict>
                    <key>COMMAND_STRING</key>
                    <string>
                    #!/usr/bin/env bash
                    export PATH="/usr/local/bin:$PATH"
                    /usr/local/bin/npx straight-up ship '${endpoint}' "$@"
                    </string>
                    <key>CheckedForUserDefaultShell</key>
                    <true/>
                    <key>inputMethod</key>
                    <integer>1</integer>
                    <key>shell</key>
                    <string>/bin/bash</string>
                    <key>source</key>
                    <string></string>
                </dict>
                <key>BundleIdentifier</key>
                <string>com.apple.RunShellScript</string>
                <key>Class Name</key>
                <string>RunShellScriptAction</string>
            </dict>
        </dict>
    </array>
    <key>connectors</key>
    <dict/>
    <key>workflowMetaData</key>
    <dict>
      <key>serviceInputTypeIdentifier</key>
      <string>com.apple.Automator.fileSystemObject</string>
      <key>serviceOutputTypeIdentifier</key>
      <string>com.apple.Automator.nothing</string>
      <key>serviceProcessesInput</key>
      <integer>0</integer>
      <key>workflowTypeIdentifier</key>
      <string>com.apple.Automator.servicesMenu</string>
    </dict>
</dict>
</plist>`;
}

// deno-lint-ignore require-await
async function main() {
  const [operation, endpoint] = process.argv.slice(2);
  const bucketName = endpoint.replace("s3://", "");

  if (operation === "setup") {
    if (!endpoint) {
      console.error("usage: straightup setup s3://bucket-name");
      return;
    }

    if (!endpoint.startsWith("s3://")) {
      console.error("The endpoint must be an S3 bucket");
      return;
    }

    const outputDirectory = `${homedir()}/Library/Services`;
    const getInfoPlist = getMacOsInfoPlist("s3", bucketName);
    const getDocumentWflow = getMacOsDocumentWflow(endpoint);

    const workflowDir =
      `${outputDirectory}/Upload to S3 - ${bucketName}!.workflow/Contents`;

    await fs.mkdir(workflowDir, { recursive: true });

    await fs.writeFile(`${workflowDir}/Info.plist`, getInfoPlist);
    await fs.writeFile(`${workflowDir}/document.wflow`, getDocumentWflow);
    console.log("Service Created:");
    console.log("right-click on a file -> Services ->");
    console.log(`Upload to S3 - ${bucketName}!`);
  } else if (operation === "ship") {
    const aws_region = process.env.AWS_REGION || "us-east-1";

    const [_operation, _endpoint, filePath] = process.argv.slice(2);

    const s3 = new S3Client({
      region: aws_region,
    });

    const Key = filePath.split("/").pop()!;

    try {
      const content = await fs.readFile(filePath);

      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key,
        Body: content,
      });

      await s3.send(putCommand);
    } catch (e) {
      console.error(e);
    }

    const osastr =
      `osascript -e 'display notification "s3://${bucketName}/${Key}" with title "Upload Complete!"'`;
    exec(osastr);
  }
}
main();
