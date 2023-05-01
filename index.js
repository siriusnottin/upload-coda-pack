const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    const packPath = core.getInput('packPath');
    const codaApiToken = core.getInput('codaApiToken');

    if (!codaApiToken) {
      throw new Error('Missing Coda API token');
    }

    core.info(`Uploading ${packPath} to Coda`);

    let codaOutput = '';
    let codaError = '';
    const options = {
      listeners: {
        stdout: (data) => {
          codaOutput += data.toString();
        },
        stderr: (data) => {
          codaError += data.toString();
        },
      },
    };

    await exec.exec('npx', ['coda', 'upload', 'packPath', '--apiToken', codaApiToken], options);

    if (codaError) {
      throw new Error(`Coda upload failed with error: ${codaError}`);
    }

    const match = codaOutput.match(/version is (\d+)/m);
    const packVersion = (match && match[1]) || 'unknown';
    if (packVersion) {
      core.setOutput('packVersion', packVersion);
      core.info(`Pack v${packVersion} uploaded successfully`);
    } else {
      core.warning('Unable to determine pack version from Coda output');
    }

  } catch (error) {
    core.setFailed(`Action failed with error ${error} `);
  }
}

run();
