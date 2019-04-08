// ---------- DEFINE UI ELEMENTS ---------- //





let ui = {
    timer: document.getElementById('timer'),
    robotState: document.getElementById('robot-state').firstChild,
    refreshButton: document.getElementById("refresh-button"),
    gyro: {
        container: document.getElementById('gyro'),
        val: 0,
        offset: 0,
        visualVal: 0,
        arm: document.getElementById('gyro-arm'),
        number: document.getElementById('gyro-number'),
    },
    robotDiagram: {
        arm: document.getElementById('robot-arm'),
        pickupLong: document.getElementById('pickup-long'),
        pickupShort: document.getElementById('pickup-short'),
        pickupStatus: document.getElementById('pickup-status'),
        hatch: document.getElementById('robot-hatch'),
        hatchText: document.getElementById('hatch-text'),
    },
    example: {
        button: document.getElementById('example-button'),
        readout: document.getElementById('example-readout').firstChild,
    },
    ball: {
        icon: document.getElementById('ball-icon'),
        text: document.getElementById('ball-text'),
    },
    line: {
        icon: document.getElementById('line-icon'),
        text: document.getElementById('line-text'),
    },
    input: {
        autoSelect: document.getElementById('auto-select'),
        armPosition: document.getElementById('arm-position'),
    },
    alert: {
        icon: document.getElementById('error-icon'),
        bang: document.getElementById('error-bang'),
        textL1: document.getElementById('error-text-l1'),
        textL2: document.getElementById('error-text-l2'),
    }
};

// ---------- KEY EVENT LISTENERS ---------- //





// Gyro rotation
let updateGyro = (key, value) => {
    ui.gyro.val = value;
    ui.gyro.visualVal = Math.floor(ui.gyro.val - ui.gyro.offset);
    ui.gyro.visualVal %= 360;
    if (ui.gyro.visualVal < 0) {
        ui.gyro.visualVal += 360;
    }
    ui.gyro.arm.style.transform = `rotate(${ui.gyro.visualVal}deg)`;
    ui.gyro.number.innerHTML = ui.gyro.visualVal + 'º';
};
NetworkTables.addKeyListener('/SmartDashboard/Yaw', updateGyro);

// Line Sensor
function updateLineFollow(key, value) {
    if(value == true) {
        ui.line.text.classList.remove('fill-off');
        ui.line.text.classList.add('fill-on');
        ui.line.text.innerHTML = "Found";
        ui.line.icon.classList.remove('fill-off');
        ui.line.icon.classList.add('fill-on');
        ui.line.icon.classList.remove('stroke-off');
        ui.line.icon.classList.add('stroke-on');
    }
    else {
        ui.line.text.classList.add('fill-off');
        ui.line.text.classList.remove('fill-on');
        ui.line.text.innerHTML = "None";
        ui.line.icon.classList.add('fill-off');
        ui.line.icon.classList.remove('fill-on');
        ui.line.icon.classList.add('stroke-off');
        ui.line.icon.classList.remove('stroke-on');
    }
}
NetworkTables.addKeyListener('/SmartDashboard/Any Sensor', updateLineFollow)

// Elevator Alert
NetworkTables.addKeyListener('/SmartDashboard/Elevator Alert', (key, value) => {
    if (value == true) { // Don't change this to if(value), sometimes it will come through as "true"
        ui.alert.icon.style.visibility = "visible";
        ui.alert.bang.style.visibility = "visible";
        ui.alert.textL1.style.visibility = "visible";
        ui.alert.textL2.style.visibility = "visible";
    }
    else {
        ui.alert.icon.style.visibility = "hidden";
        ui.alert.bang.style.visibility = "hidden";
        ui.alert.textL1.style.visibility = "hidden";
        ui.alert.textL2.style.visibility = "hidden";
    }
});

// Ball Sensor
NetworkTables.addKeyListener('/SmartDashboard/Ball Detected', (key, value) => {
    if(value == true) { // Don't change this to if(value), sometimes it will come through as "true"
        ui.ball.text.classList.remove('fill-off');
        ui.ball.text.classList.add('fill-on');
        ui.ball.text.innerHTML = "Ball";
        ui.ball.icon.classList.remove('fill-off');
        ui.ball.icon.classList.add('fill-on');
        ui.ball.icon.classList.remove('stroke-off');
        ui.ball.icon.classList.add('stroke-on');
    }
    else {
        ui.ball.text.classList.add('fill-off');
        ui.ball.text.classList.remove('fill-on');
        ui.ball.text.innerHTML = "None";
        ui.ball.icon.classList.add('fill-off');
        ui.ball.icon.classList.remove('fill-on');
        ui.ball.icon.classList.add('stroke-off');
        ui.ball.icon.classList.remove('stroke-on');
    }
});

// Listener for hatch grabber arm
NetworkTables.addKeyListener('/SmartDashboard/Hatch Up', (key, value) => {
    if(value == true) {
        ui.robotDiagram.hatch.style.transform='rotate(45deg)';
        ui.robotDiagram.hatch.classList.remove('stroke-on');
    }
    else {
        ui.robotDiagram.hatch.style.transform='rotate(0deg)';
        ui.robotDiagram.hatch.classList.add('stroke-on');
    }
});

// Listener for hatch grabber mechanizzzm
NetworkTables.addKeyListener('/SmartDashboard/Hatch Grab', (key, value) => {  //use NTV for has hatch
    if(value == true) {
        ui.robotDiagram.hatchText.innerHTML = "Grabbed";
        ui.robotDiagram.hatchText.classList.remove("fill-off");
        ui.robotDiagram.hatchText.classList.add("fill-on");
    }
    else {
        ui.robotDiagram.hatchText.innerHTML = "No Hatch";
        ui.robotDiagram.hatchText.classList.remove("fill-on");
        ui.robotDiagram.hatchText.classList.add("fill-off");
    }
});

// Listener for the elevator encoder
NetworkTables.addKeyListener('/SmartDashboard/Elevator Encoder', (key, value) => {
    // 0 is all the way back, 28000 is max elevation. We don't want it going past that.
    if (value > 28000) {
        value = 28000;
    }
    else if (value < 0) {
        value = 0;
    }
    // Calculate visual height of arm
    var height = 360 - (value / (140));    //Should scale the arm correctly
    // Raise/lower the arm in diagram to match real arm

    // Update guide-lines
    function updateGuide(value, test, level) {
        var line = document.getElementById(level + "-guide-line");
        var text = document.getElementById(level + "-guide-text");
        var error = 600;
        if (test - error < value && value < test + error) {
            line.classList.add("stroke-on");
            line.classList.remove("stroke-off");
            text.classList.add("fill-on");
            text.classList.remove("fill-off");
        }
        else {
            line.classList.add("stroke-off");
            line.classList.remove("stroke-on");
            text.classList.add("fill-off");
            text.classList.remove("fill-on");
        }
    }

    // Ball collect: 200 (cargo)
    // Mid rocket: 23500 (cargo)
    // Low rocket: 900
    // Cargo ship 15500

    updateGuide(value, 23500, "mid-rocket");
    updateGuide(value, 15500, "cargo-ship");
    updateGuide(value, 9000, "low-rocket");
    updateGuide(value, 200, "pickup");

    ui.robotDiagram.arm.style.y = String(height);
});

// Listener for the ball-pickup extension
NetworkTables.addKeyListener('/SmartDashboard/Extension Out', (key, value) => {
    // 0 is all the way back, 1200 is 45 degrees forward. We don't want it going past that.
    if (value || value == 'true') {
        ui.robotDiagram.pickupLong.style.x = String(50);
        ui.robotDiagram.pickupShort.style.x = String(50);

        ui.robotDiagram.pickupStatus.classList.add("fill-on");
        ui.robotDiagram.pickupStatus.classList.remove("fill-off");
        ui.robotDiagram.pickupStatus.innerHTML = "Out";
    }
    else {
        ui.robotDiagram.pickupLong.style.x = String(136);
        ui.robotDiagram.pickupShort.style.x = String(136);

        ui.robotDiagram.pickupStatus.classList.add("fill-off");
        ui.robotDiagram.pickupStatus.classList.remove("fill-on");
        ui.robotDiagram.pickupStatus.innerHTML = "In";
    }
});

// This button is just an example of triggering an event on the robot by clicking a button.
NetworkTables.addKeyListener('/SmartDashboard/example_variable', (key, value) => {
    // Set class active if value is true and unset it if it is false
    ui.example.button.classList.toggle('active', value);
    ui.example.readout.data = 'Value is ' + value;
});

// Match time listener
NetworkTables.addKeyListener('/SmartDashboard/Match Time', (key, value) => {
    // We assume here that value is an integer representing the number of seconds left.
    ui.timer.innerHTML = value < 0 ? '0:00' : Math.floor(value / 60) + ':' + (value % 60 < 10 ? '0' : '') + value % 60;
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/modes', (key, value) => {
    // Clear previous list
    while (ui.input.autoSelect.firstChild) {
        ui.input.autoSelect.removeChild(ui.input.autoSelect.firstChild);
    }
    // Make an option for each autonomous mode and put it in the selector
    for (let i = 0; i < value.length; i++) {
        var option = document.createElement('option');
        option.appendChild(document.createTextNode(value[i]));
        ui.input.autoSelect.appendChild(option);
    }
    // Set value to the already-selected mode. If there is none, nothing will happen.
    ui.input.autoSelect.value = NetworkTables.getValue('/SmartDashboard/currentlySelectedMode');
});

// Load list of prewritten autonomous modes
NetworkTables.addKeyListener('/SmartDashboard/autonomous/selected', (key, value) => {
    ui.input.autoSelect.value = value;
});





// ---------- UI ELEMENT CLICKS ---------- //





// Refresh the camera feed

function refreshCamera() {
    document.getElementById("test-data").innerHTML = "Camera refreshing...";
    document.getElementById("camera").style.backgroundImage = url('http://frcvision.local:1181/stream.mjpg');/*Change this IP too*/
    document.getElementById("test-data").innerHTML = "Reload Complete";
}
ui.refreshButton.onclick = refreshCamera;
setInterval(refreshCamera, 1000);

// The rest of the doc is listeners for UI elements being clicked on
// ui.example.button.onclick = function() {
//     // Set NetworkTables values to the opposite of whether button has active class.
//     NetworkTables.putValue('/SmartDashboard/example_variable', this.className != 'active');
// };
// Update NetworkTables when autonomous selector is changed
ui.input.autoSelect.onchange = function() {
    NetworkTables.putValue('/SmartDashboard/autonomous/selected', this.value);
};
// Get value of arm height slider when it's adjusted
ui.input.armPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/Elevator Encoder', parseInt(this.value));
};
// Get value of pickup position slider when it's adjusted
ui.pickupPosition.oninput = function() {
    NetworkTables.putValue('/SmartDashboard/pickup/encoder', this.className != 'active');
};
// Add some error listener
addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
});