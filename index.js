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

    let codaError = '';
    await exec.exec(`npx coda upload ${packPath} -t "${codaApiToken}"`, [], {
      listeners: {
        stdout: (data) => {
          const output = data.toString();
          const match = output.match(/version is (\d+)/m);
          const packVersion = (match) ? match[1] : null;
          core.setOutput('packVersion', packVersion);
        },
        stderr: (data) => {
          codaError += data.toString();
        },
      },
    });

    if (codaError) {
      throw new Error(codaError);
    }

    core.info('Pack uploaded successfully');

  } catch (error) {
    core.setFailed(`Action failed with error ${error}`);
  }
}

run();
