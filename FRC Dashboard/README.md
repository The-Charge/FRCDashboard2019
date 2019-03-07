# FRC Dashboard
FRC Dashboard is team 2619's new driver station. 

## Installation
You'll need to install both node.js and npm, which you can do from [this link](https://nodejs.org/en/).

You can verify your npm and node installations by running `node --version` which should be `v10.15.1`, and `npm --version` which should be `6.4.1`.

Once you've installed npm and node you'll need to run the following line from the dashboard directory:

    npm install

If you're still having issues try running the following:

    npm install electron

### Camera feed
FRC Dashboard supports display of MJPG camera streams. Once you've created a stream update `style.css` to use the IP of your live camera feed. We've included a few plausable URLs to the camera already. If none of them work try using OutlineViewer and finding `CameraPublisher/cameraName/streams` to see all camera streams.

## Running
While in the dashboard directory, run:

    npm start

This will open the dashboard application. Note that you can refresh the page and client-side updates will take effect; reopening the whole application is usually unnecessary.

It is recommended that while using the dashboard on your driver station, you close the top panel of the FRC DriverStation to make room for the dashboard.

## Usage
The first step is to connect to your robot's network if you haven't already. This should be by default `10.26.19.2`, if it doesn't connect try `10.26.19.1`, or if you're connecting via usb try `172.22.11.2`.

To switch between the NetworkTables editor and the camera view hit the `tuning` button.

Some important keyboard shortcuts are `ctrl+r`: refresh, and `ctrl+shift+r`: force refresh. This will disconnect the robot and refresh the dashboard, so don't hit them by accident.